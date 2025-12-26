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
/*app.get("/api/pages", async (req, res) => {
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
});*/

// Get all content
app.get("/api/content/available", async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        pc.id, pc.item_type,
        c.name as chef_name, c.surname as chef_surname,
        m.name as menu_name
      FROM page_content pc
      LEFT JOIN chef_item c ON pc.id = c.id
      LEFT JOIN menu_item m ON pc.id = m.id
      ORDER BY pc.id DESC
    `);
    
    const formatted = result.rows.map(row => {
      let label = `ID: ${row.id} (${row.item_type})`;
      if (row.chef_name) label = `👨‍🍳 ${row.chef_name} ${row.chef_surname}`;
      else if (row.menu_name) label = `🍽️ ${row.menu_name}`;
      
      return {
        id: row.id,
        type: row.item_type,
        label: label
      };
    });

    res.json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pages with content
app.get("/api/pages", async (req, res) => {
  console.log("[API] Pobieranie listy stron...");
  try {
    const pagesResult = await query("SELECT * FROM page ORDER BY creation_time DESC");
  
    const pagesWithContent = await Promise.all(pagesResult.rows.map(async (page) => {
      
      let meta = page.meta_data;
      
      if (typeof meta === 'string') {
        try {
          meta = JSON.parse(meta);
        } catch (e) {
          console.error(`Błąd parsowania JSON dla strony ${page.id}`, e);
          meta = {}; 
        }
      } else if (!meta) {
        meta = {};
      }
      
      const contentIds = meta.content_ids || [];
      
      let contentPreviews = [];

      if (Array.isArray(contentIds) && contentIds.length > 0) {
        try {
          const contents = await query(`
            SELECT pc.item_type, 
                   ci.name as chef_name, ci.surname as chef_surname,
                   mi.name as menu_name
            FROM page_content pc
            LEFT JOIN chef_item ci ON pc.id = ci.id
            LEFT JOIN menu_item mi ON pc.id = mi.id
            WHERE pc.id = ANY($1::int[])
          `, [contentIds]);

          contentPreviews = contents.rows.map(row => {
              if (row.chef_name) return `👨‍🍳 ${row.chef_name} ${row.chef_surname}`;
              if (row.menu_name) return `🍽️ ${row.menu_name}`;
              return row.item_type; // Np. "menu_item" jeśli nie ma nazwy
          });
        } catch (err) {
          console.error(`Błąd SQL przy stronie ${page.id}:`, err);
        }
      }
      if (contentPreviews.length > 0) {
          console.log(`-> Strona "${page.title}" ma content:`, contentPreviews);
      }
      return { ...page, contentPreviews };
    }));

    res.json({ success: true, data: pagesWithContent });
  } catch (error) {
    console.error("Błąd globalny /api/pages:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- POBIERANIE JEDNEJ STRONY (Z naprawionym odczytem JSON) ---
app.get("/api/pages/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pageResult = await query("SELECT * FROM page WHERE id = $1", [id]);
    
    if (pageResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Page not found" });
    }

    const page = pageResult.rows[0];

    let meta = page.meta_data;
    if (typeof meta === 'string') {
        try { meta = JSON.parse(meta); } catch (e) { meta = {}; }
    }
    
    const contentIds = meta?.content_ids || [];
    let contents = [];

    if (Array.isArray(contentIds) && contentIds.length > 0) {
      const contentResult = await query(`
        SELECT id, item_type 
        FROM page_content 
        WHERE id = ANY($1::int[])
      `, [contentIds]);
      
      contents = contentResult.rows;
    }

    res.json({ 
      success: true, 
      data: { 
        ...page, 
        contents: contents 
      } 
    });

  } catch (error) {
    console.error("Błąd /api/pages/:id:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

//Create new page
app.post("/api/pages", authenticateToken, async (req, res) => {
  try {
    const { title, description, header_image_url, slug, contents } = req.body;
    const safeImageUrl = header_image_url || "";
    
    // Tworzymy JSON z IDkami contentu
    const metaData = { content_ids: contents || [] };

    const result = await query(
      `INSERT INTO page (title, description, header_image_url, slug, meta_data, creation_time) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
       RETURNING *`,
      [title, description, safeImageUrl, slug, JSON.stringify(metaData)]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

//Edit page
app.put("/api/pages/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log(`[PUT] Aktualizacja strony ID: ${id}`);
  
  try {
    // 1. Pobieramy 'contents' (tablica ID np. [10, 12]) z body
    const { title, description, header_image_url, slug, contents } = req.body;
    const safeImageUrl = header_image_url || "";

    // 2. Pakujemy to w JSON. To jest kluczowy moment!
    const metaData = {
      content_ids: contents || [] 
    };

    console.log("[PUT] Dane do zapisu:", JSON.stringify(metaData));

    // 3. Zapisujemy JSON do kolumny meta_data
    const pageResult = await query(
      `UPDATE page SET 
        title = $1, 
        description = $2, 
        header_image_url = $3, 
        slug = $4, 
        meta_data = $5,  -- Tutaj wlatuje nasz JSON
        last_modification_time = CURRENT_TIMESTAMP 
       WHERE id = $6 RETURNING *`,
      [title, description, safeImageUrl, slug, JSON.stringify(metaData), id]
    );

    if (pageResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Page not found" });
    }

    res.json({ success: true, data: pageResult.rows[0] });

  } catch (error) {
    console.error("Błąd zapisu:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

//Delete page
app.delete("/api/pages/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM page WHERE id = $1 RETURNING id", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Page not founda" });
    }
    res.json({ success: true, message: "Page została usunięta" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTS FOR MENU ===

app.get("/api/menu-items", async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        m.*, 
        pc.image_url, pc.is_active, pc.position, pc.creation_time,
        c.code as currency_code, c.name as currency_name
      FROM menu_item m
      JOIN page_content pc ON m.id = pc.id   -- KLUCZOWE ŁĄCZENIE
      LEFT JOIN currency c ON m.currency_id = c.id
      ORDER BY pc.creation_time DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Błąd pobierania menu:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. CREATE NEW MENU ITEM (Musi najpierw utworzyć page_content!)
app.post("/api/menu-items", authenticateToken, async (req, res) => {
  try {
    const { 
        name, description, price, currency_id, 
        image_url, is_active = true // Te pola idą do page_content
    } = req.body;

    // KROK A: Wstawiamy do tabeli-matki (Page Content)
    // To nam wygeneruje unikalne ID
    const contentResult = await query(
      `INSERT INTO page_content (item_type, image_url, is_active, creation_time) 
       VALUES ('Menu_Item', $1, $2, CURRENT_TIMESTAMP) 
       RETURNING id`,
      [image_url || '', is_active]
    );
    
    const newId = contentResult.rows[0].id;

    // KROK B: Wstawiamy do tabeli-dziecka (Menu Item) używając TEGO SAMEGO ID
    const menuResult = await query(
      `INSERT INTO menu_item (id, name, description, price, currency_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [newId, name, description, price, currency_id || 1] // Domyślnie waluta ID 1 (PLN)
    );

    // Zwracamy połączone dane
    res.status(201).json({ 
        success: true, 
        data: { ...menuResult.rows[0], image_url, is_active } 
    });

  } catch (error) {
    console.error("Błąd dodawania dania:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. UPDATE MENU ITEM (Musi aktualizować obie tabele)
app.put("/api/menu-items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, currency_id, image_url } = req.body;

    // Aktualizacja tabeli-matki (jeśli zmieniło się zdjęcie)
    await query("UPDATE page_content SET image_url = $1 WHERE id = $2", [image_url, id]);

    // Aktualizacja tabeli-dziecka (dane tekstowe)
    const result = await query(
      `UPDATE menu_item 
       SET name = $1, description = $2, price = $3, currency_id = $4 
       WHERE id = $5 
       RETURNING *`,
      [name, description, price, currency_id, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Menu item not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. DELETE MENU ITEM (Usuwamy rodzica, kaskada usunie dziecko)
app.delete("/api/menu-items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Usuwamy z page_content. Dzięki 'ON DELETE CASCADE' w bazie, 
    // rekord z menu_item zniknie automatycznie.
    const result = await query(
      "DELETE FROM page_content WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Menu item not found" });
    }
    
    res.json({ success: true, message: "Menu item deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTS FOR ChefY (CHEFS) ===
console.log("--> REJESTRACJA ENDPOINTÓW CHEFS...");

app.get("/api/chefs", async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, p.image_url 
      FROM chef_item c
      LEFT JOIN page_content p ON c.id = p.id
      ORDER BY c.id
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.put("/api/chefs/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  console.log(`[PUT] Aktualizacja Chefa ID: ${id}`);

  try {
    const {
      name,
      surname,
      specialization,
      facebook_link,
      instagram_link,
      twitter_link,
      image_url 
    } = req.body;

    const safeImageUrl = image_url || ""; 

    await query(
      `UPDATE chef_item SET 
        name = $1, surname = $2, specialization = $3, 
        facebook_link = $4, instagram_link = $5, twitter_link = $6
      WHERE id = $7`,
      [name, surname, specialization, facebook_link, instagram_link, twitter_link, id]
    );

    await query(
      `UPDATE page_content SET 
        image_url = $1,
        last_modification_time = CURRENT_TIMESTAMP
      WHERE id = $2`,
      [safeImageUrl, id]
    );

    const result = await query(
      `SELECT c.*, p.image_url 
       FROM chef_item c
       JOIN page_content p ON c.id = p.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Chef not found" });
    }

    console.log("[PUT] Sukces! Zapisano dane.");
    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error("Critical Update Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. CREATE NEW CHEF
app.post("/api/chefs", authenticateToken, async (req, res) => {
  try {
    const {
      name, surname, specialization, facebook_link, instagram_link, twitter_link,
      image_url, // To pole musi trafić do page_content!
      position = 0, is_active = true
    } = req.body;

    // Walidacja
    if (!name || !surname) {
      return res.status(400).json({ success: false, error: "Imie i nazwisko są wymagane!" });
    }

    // KROK 1: Wstawiamy dane do tabeli nadrzędnej (page_content)
    // Tu zapisujemy image_url oraz item_type
    const contentResult = await query(
      `INSERT INTO page_content 
       (item_type, image_url, position, is_active, creation_time) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) 
       RETURNING id`,
      ['Chef', image_url || '', position, is_active]
    );

    const newId = contentResult.rows[0].id; // Pobieramy wygenerowane ID

    // KROK 2: Wstawiamy dane szczegółowe do tabeli podrzędnej (chef_item)
    // Używamy tego samego ID (newId), co łączy obie tabele
    const chefResult = await query(
      `INSERT INTO chef_item 
       (id, name, surname, specialization, facebook_link, instagram_link, twitter_link) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [newId, name, surname, specialization, facebook_link, instagram_link, twitter_link]
    );

    // KROK 3: Sklejamy wynik, żeby frontend dostał kompletny obiekt od razu
    const fullData = {
        ...chefResult.rows[0], // Dane kucharza
        image_url: image_url,  // Dane z contentu
        item_type: 'Chef',
        is_active: is_active
    };

    res.status(201).json({ success: true, data: fullData });

  } catch (error) {
    console.error("Błąd dodawania kucharza:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. DELETE CHEF
app.delete("/api/chefs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM chef_item WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTS FOR NAWIGACJI ===

//Get navigation
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

//Create new navigation item
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

//Delete navigation item (requires token)
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
      WHERE s.is_active = true
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

// Utwórz nowy typ kontaktu (requires token)
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
      WHERE ci.is_active = true
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

app.get("/api/page-items", async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        pi.*, 
        pc.image_url, pc.is_active, pc.position, pc.creation_time
      FROM page_item pi
      JOIN page_content pc ON pi.id = pc.id
      ORDER BY pc.position ASC, pc.creation_time DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Błąd pobierania sekcji:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. CREATE NEW PAGE ITEM
app.post("/api/page-items", authenticateToken, async (req, res) => {
  try {
    const { title, description, type, image_url, is_active = true, position = 0 } = req.body;

    const contentResult = await query(
      `INSERT INTO page_content (item_type, image_url, is_active, position, creation_time) 
       VALUES ('Page_Item', $1, $2, $3, CURRENT_TIMESTAMP) 
       RETURNING id`,
      [image_url || '', is_active, position]
    );
    
    const newId = contentResult.rows[0].id;
    const itemResult = await query(
      `INSERT INTO page_item (id, title, description, type) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [newId, title, description, type]
    );

    res.status(201).json({ success: true, data: { ...itemResult.rows[0], image_url, is_active, position } });
  } catch (error) {
    console.error("Błąd tworzenia sekcji:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. UPDATE PAGE ITEM
app.put("/api/page-items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, image_url, is_active, position } = req.body;

    await query(
      "UPDATE page_content SET image_url = $1, is_active = $2, position = $3 WHERE id = $4", 
      [
        image_url, 
        is_active, 
        position !== undefined ? position : 0,
        id
      ]
    );

    const result = await query(
      `UPDATE page_item SET title = $1, description = $2, type = $3 WHERE id = $4 RETURNING *`,
      [title, description, type, id]
    );

    res.json({ 
        success: true, 
        data: { ...result.rows[0], image_url, is_active, position } 
    });

  } catch (error) {
    console.error("Błąd edycji sekcji:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/page-items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM page_item WHERE id = $1", [id]);
    const result = await query(
      "DELETE FROM page_content WHERE id = $1 RETURNING id", 
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Nie znaleziono elementu" });
    }

    res.json({ success: true, message: "Sekcja usunięta pomyślnie" });

  } catch (error) {
    console.error("Błąd usuwania sekcji:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
