const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const { query, testConnection } = require("./db");
const { authenticateToken, generateToken } = require("./authMiddleware");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware CORS - pozwala na żądania z admin-panel
app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3000"],
    credentials: true,
  })
);

// Middleware for parsing JSON
app.use(express.json());

// Serve static files from public folder
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Test database connection on startup
testConnection().catch((err) => {
  console.error("Failed to connect to database:", err);
});

// Example API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from CMS backend!" });
});

// === FILE UPLOAD ENDPOINT ===
app.post(
  "/api/upload",
  authenticateToken,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "No file uploaded" });
      }

      // Return URL to uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        url: fileUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// === ADMINISTRATOR ENDPOINTS ===

// Get all administrators
app.get("/api/administrators", async (req, res) => {
  try {
    const result = await query(
      "SELECT id, name, surname, email FROM administrator ORDER BY id"
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get currently logged in administrator
app.get("/api/administrators/me", authenticateToken, async (req, res) => {
  try {
    const result = await query(
      "SELECT id, name, surname, email FROM administrator WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Administrator not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new administrator (requires token)
app.post("/api/administrators", authenticateToken, async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;

    // Hash password before saving
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await query(
      "INSERT INTO administrator (name, surname, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, surname, email",
      [name, surname, email, hashedPassword]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update administratora (requires token)
app.put("/api/administrators/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, email } = req.body;
    const result = await query(
      "UPDATE administrator SET name = $1, surname = $2, email = $3 WHERE id = $4 RETURNING id, name, surname, email",
      [name, surname, email, id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Administrator not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete administrator (requires token)
app.delete("/api/administrators/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "DELETE FROM administrator WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Administrator not found" });
    }
    res.json({ success: true, message: "Administrator deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Administrator login
app.post("/api/administrators/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get administrator by email
    const result = await query(
      "SELECT id, name, surname, email, password FROM administrator WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const admin = result.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    // Generate JWT token
    const { password: _, ...adminData } = admin;
    const token = generateToken(adminData);

    // Return token and administrator data (without password)
    res.json({
      success: true,
      message: "Logged in successfully",
      token: token,
      data: adminData,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === PAGE ENDPOINTS ===

// Get all pages
app.get("/api/pages", async (req, res) => {
  try {
    const result = await query(`
      SELECT p.*,
        a1.name || ' ' || a1.surname as creator_name,
        a2.name || ' ' || a2.surname as modificator_name
      FROM page p
      LEFT JOIN administrator a1 ON p.creator_id = a1.id
      LEFT JOIN administrator a2 ON p.last_modificator_id = a2.id
      ORDER BY p.creation_time DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get stronę po ID
app.get("/api/pages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      `SELECT p.*,
        a1.name || ' ' || a1.surname as creator_name,
        a2.name || ' ' || a2.surname as modificator_name
      FROM page p
      LEFT JOIN administrator a1 ON p.creator_id = a1.id
      LEFT JOIN administrator a2 ON p.last_modificator_id = a2.id
      WHERE p.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Page not founda" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nową stronę (requires token)
app.post("/api/pages", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      header_image_url,
      slug,
      meta_data,
      creator_id,
    } = req.body;
    const result = await query(
      "INSERT INTO page (title, description, header_image_url, slug, meta_data, creator_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title, description, header_image_url, slug, meta_data, creator_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update stronę (requires token)
app.put("/api/pages/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      header_image_url,
      slug,
      meta_data,
      last_modificator_id,
    } = req.body;
    const result = await query(
      "UPDATE page SET title = $1, description = $2, header_image_url = $3, slug = $4, meta_data = $5, last_modificator_id = $6, last_modification_time = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
      [
        title,
        description,
        header_image_url,
        slug,
        meta_data,
        last_modificator_id,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Page not founda" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń stronę (requires token)
app.delete("/api/pages/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM page WHERE id = $1 RETURNING id", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Page not founda" });
    }
    res.json({ success: true, message: "Page została usunięta" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTS FOR MENU ===

// Get wszystkie pozycje menu
app.get("/api/menu-items", async (req, res) => {
  try {
    const result = await query(`
      SELECT m.*, c.code as currency_code, c.name as currency_name
      FROM menu_item m
      LEFT JOIN currency c ON m.currency_id = c.id
      ORDER BY m.id
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nową pozycję menu (requires token)
app.post("/api/menu-items", authenticateToken, async (req, res) => {
  try {
    const { name, description, price, currency_id } = req.body;
    const result = await query(
      "INSERT INTO menu_item (name, description, price, currency_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, description, price, currency_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update pozycję menu (requires token)
app.put("/api/menu-items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, currency_id } = req.body;
    const result = await query(
      "UPDATE menu_item SET name = $1, description = $2, price = $3, currency_id = $4 WHERE id = $5 RETURNING *",
      [name, description, price, currency_id, id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Menu item not founda" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń pozycję menu (requires token)
app.delete("/api/menu-items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "DELETE FROM menu_item WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Menu item not founda" });
    }
    res.json({ success: true, message: "Menu item została usunięta" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTS FOR ChefY (CHEFS) ===

// Get wszystkich Chefy
app.get("/api/chefs", async (req, res) => {
  try {
    const result = await query("SELECT * FROM chef_item ORDER BY id");
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nowego Chefa (requires token)
app.post("/api/chefs", authenticateToken, async (req, res) => {
  try {
    const {
      name,
      surname,
      specialization,
      facebook_link,
      instagram_link,
      twitter_link,
    } = req.body;
    const result = await query(
      "INSERT INTO chef_item (name, surname, specialization, facebook_link, instagram_link, twitter_link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        name,
        surname,
        specialization,
        facebook_link,
        instagram_link,
        twitter_link,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Chefa (requires token)
app.put("/api/chefs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      surname,
      specialization,
      facebook_link,
      instagram_link,
      twitter_link,
    } = req.body;
    const result = await query(
      "UPDATE chef_item SET name = $1, surname = $2, specialization = $3, facebook_link = $4, instagram_link = $5, twitter_link = $6 WHERE id = $7 RETURNING *",
      [
        name,
        surname,
        specialization,
        facebook_link,
        instagram_link,
        twitter_link,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Chef not foundy" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń Chefa (requires token)
app.delete("/api/chefs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "DELETE FROM chef_item WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Chef not foundy" });
    }
    res.json({ success: true, message: "Chef został usunięty" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTS FOR NAWIGACJI ===

// Get wszystkie elementy nawigacji
app.get("/api/navigation", async (req, res) => {
  try {
    const result = await query(`
      SELECT n.*,
        a1.name || ' ' || a1.surname as creator_name,
        a2.name || ' ' || a2.surname as modificator_name
      FROM navigation n
      LEFT JOIN administrator a1 ON n.creator_id = a1.id
      LEFT JOIN administrator a2 ON n.last_modificator_id = a2.id
      ORDER BY n.position
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nowy Navigation item (requires token)
app.post("/api/navigation", authenticateToken, async (req, res) => {
  try {
    const { title, position, url, is_active, navigation_id, creator_id } =
      req.body;
    const result = await query(
      "INSERT INTO navigation (title, position, url, is_active, navigation_id, creator_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [
        title,
        position,
        url,
        is_active !== undefined ? is_active : true,
        navigation_id,
        creator_id,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Navigation item (requires token)
app.put("/api/navigation/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      position,
      url,
      is_active,
      navigation_id,
      last_modificator_id,
    } = req.body;
    const result = await query(
      "UPDATE navigation SET title = $1, position = $2, url = $3, is_active = $4, navigation_id = $5, last_modificator_id = $6, last_modification_time = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *",
      [title, position, url, is_active, navigation_id, last_modificator_id, id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Navigation item not foundy" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń Navigation item (requires token)
app.delete("/api/navigation/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "DELETE FROM navigation WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Navigation item not foundy" });
    }
    res.json({ success: true, message: "Navigation item został usunięty" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTS FOR SLIDERÓW ===

// Get wszystkie obrazy slidera
app.get("/api/slider-images", async (req, res) => {
  try {
    const result = await query(`
      SELECT s.*,
        a1.name || ' ' || a1.surname as creator_name,
        a2.name || ' ' || a2.surname as modificator_name
      FROM slider_image s
      LEFT JOIN administrator a1 ON s.creator_id = a1.id
      LEFT JOIN administrator a2 ON s.last_modificator_id = a2.id
      ORDER BY s.creation_time DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nowy Slider image (requires token)
app.post("/api/slider-images", authenticateToken, async (req, res) => {
  try {
    const { image_url, is_active, creator_id } = req.body;
    const result = await query(
      "INSERT INTO slider_image (image_url, is_active, creator_id) VALUES ($1, $2, $3) RETURNING *",
      [image_url, is_active !== undefined ? is_active : true, creator_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Slider image (requires token)
app.put("/api/slider-images/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { image_url, is_active, last_modificator_id } = req.body;
    const result = await query(
      "UPDATE slider_image SET image_url = $1, is_active = $2, last_modificator_id = $3, last_modification_time = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *",
      [image_url, is_active, last_modificator_id, id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Slider image not foundy" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń Slider image (requires token)
app.delete("/api/slider-images/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "DELETE FROM slider_image WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Slider image not foundy" });
    }
    res.json({ success: true, message: "Slider image został usunięty" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTS FOR KONFIGURACJI ===

// Get wszystkie ustawienia konfiguracji
app.get("/api/configuration", async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*,
        a1.name || ' ' || a1.surname as creator_name,
        a2.name || ' ' || a2.surname as modificator_name
      FROM configuration c
      LEFT JOIN administrator a1 ON c.creator_id = a1.id
      LEFT JOIN administrator a2 ON c.last_modificator_id = a2.id
      ORDER BY c.key
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Setting po kluczu
app.get("/api/configuration/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const result = await query("SELECT * FROM configuration WHERE key = $1", [
      key,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Setting not founde" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nowe Setting (requires token)
app.post("/api/configuration", authenticateToken, async (req, res) => {
  try {
    const { key, value, description, type } = req.body;
    const userId = req.user.id;
    const result = await query(
      "INSERT INTO configuration (key, value, description, type, creator_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [key, value, description, type || "text", userId]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update wiele ustawień naraz (requires token)
app.put("/api/configuration", authenticateToken, async (req, res) => {
  try {
    const { configurations } = req.body;
    const userId = req.user.id; // ID z tokena JWT

    if (!configurations || !Array.isArray(configurations)) {
      return res.status(400).json({
        success: false,
        error: "Missing configuration array",
      });
    }

    // Aktualizuj każdą konfigurację
    const updatePromises = configurations.map((config) =>
      query(
        "UPDATE configuration SET value = $1, last_modificator_id = $2, last_modification_time = CURRENT_TIMESTAMP WHERE key = $3 RETURNING *",
        [config.value, userId, config.key]
      )
    );

    const results = await Promise.all(updatePromises);
    const updatedConfigs = results.map((r) => r.rows[0]);

    res.json({ success: true, data: updatedConfigs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Setting (requires token)
app.put("/api/configuration/:key", authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description, type } = req.body;
    const userId = req.user.id;
    const result = await query(
      "UPDATE configuration SET value = $1, description = $2, type = $3, last_modificator_id = $4, last_modification_time = CURRENT_TIMESTAMP WHERE key = $5 RETURNING *",
      [value, description, type, userId, key]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Setting not founde" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń Setting (requires token)
app.delete("/api/configuration/:key", authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const result = await query(
      "DELETE FROM configuration WHERE key = $1 RETURNING key",
      [key]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Setting not founde" });
    }
    res.json({ success: true, message: "Setting zostało usunięte" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTS FOR WALUT ===

// Get wszystkie waluty
app.get("/api/currencies", async (req, res) => {
  try {
    const result = await query("SELECT * FROM currency ORDER BY code");
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nową walutę (requires token)
app.post("/api/currencies", authenticateToken, async (req, res) => {
  try {
    const { code, name } = req.body;
    const result = await query(
      "INSERT INTO currency (code, name) VALUES ($1, $2) RETURNING *",
      [code, name]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// === ENDPOINTS FOR TYPÓW KONTAKTU ===

// Get wszystkie typy kontaktu
app.get("/api/contact-types", async (req, res) => {
  try {
    const result = await query(`
      SELECT ct.*,
        a1.name || ' ' || a1.surname as creator_name,
        a2.name || ' ' || a2.surname as modificator_name
      FROM contact_type ct
      LEFT JOIN administrator a1 ON ct.creator_id = a1.id
      LEFT JOIN administrator a2 ON ct.last_modificator_id = a2.id
      ORDER BY ct.value
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nowy typ kontaktu
app.post("/api/contact-types", authenticateToken, async (req, res) => {
  try {
    const { value, creator_id } = req.body;
    const result = await query(
      "INSERT INTO contact_type (value, creator_id) VALUES ($1, $2) RETURNING *",
      [value, creator_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń typ kontaktu po ID (requires token)
app.delete("/api/contact-types/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "DELETE FROM contact_type WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Contact type not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Aktualizuj typ kontaktu po ID
app.put("/api/contact-types/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { value, last_modificator_id } = req.body;

    // Aktualizacja rekordu
    const result = await query(
      `UPDATE contact_type
       SET value = $1,
           last_modificator_id = $2,
           last_modification_time = NOW()
       WHERE id = $3
       RETURNING *`,
      [value, last_modificator_id, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Contact type not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTS FOR ELEMENTÓW KONTAKTU ===

// Get wszystkie elementy kontaktu
app.get("/api/contact-items", async (req, res) => {
  try {
    const result = await query(`
      SELECT ci.*,
        ct.value as contact_type_value,
        a1.name || ' ' || a1.surname as creator_name,
        a2.name || ' ' || a2.surname as modificator_name
      FROM contact_item ci
      LEFT JOIN contact_type ct ON ci.contact_type_id = ct.id
      LEFT JOIN administrator a1 ON ci.creator_id = a1.id
      LEFT JOIN administrator a2 ON ci.last_modificator_id = a2.id
      ORDER BY ci.creation_time DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nowy Contact item (requires token)
app.post("/api/contact-items", authenticateToken, async (req, res) => {
  try {
    const { value, contact_type_id, is_active, creator_id } = req.body;
    const result = await query(
      "INSERT INTO contact_item (value, contact_type_id, is_active, creator_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [
        value,
        contact_type_id,
        is_active !== undefined ? is_active : true,
        creator_id,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update Contact item (requires token)
app.put("/api/contact-items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { value, contact_type_id, is_active, last_modificator_id } = req.body;
    const result = await query(
      "UPDATE contact_item SET value = $1, contact_type_id = $2, is_active = $3, last_modificator_id = $4, last_modification_time = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *",
      [value, contact_type_id, is_active, last_modificator_id, id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Contact item not foundy" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń Contact item (requires token)
app.delete("/api/contact-items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "DELETE FROM contact_item WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Contact item not foundy" });
    }
    res.json({ success: true, message: "Contact item został usunięty" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
