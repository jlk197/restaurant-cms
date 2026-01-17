const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
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
      "SELECT id, name, surname, email FROM administrator WHERE is_active = true ORDER BY id"
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

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@$!%*?&)"
      });
    }

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
// SOFT DELETE administrator
app.put(
  "/api/administrators/delete/:id",
  authenticateToken,
  async (req, res) => {
    try {
      const adminIdToDeactivate = parseInt(req.params.id, 10);
      const loggedAdminId = req.user.id;

      // 1. Nie można dezaktywować samego siebie
      if (adminIdToDeactivate === loggedAdminId) {
        return res.status(400).json({
          success: false,
          error: "Cannot deactivate your own account",
        });
      }

      // 2. Sprawdź ilu jest AKTYWNYCH administratorów
      const countResult = await query(
        "SELECT COUNT(*) FROM administrator WHERE is_active = true"
      );
      const activeAdminCount = parseInt(countResult.rows[0].count, 10);

      if (activeAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: "At least one active administrator must remain",
        });
      }

      // 3. Dezaktywuj administratora (soft delete)
      const result = await query(
        `
      UPDATE administrator
      SET
        is_active = false,
        email = ''
      WHERE id = $1
        AND is_active = true
      RETURNING id
      `,
        [adminIdToDeactivate]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Administrator not found or already inactive",
        });
      }

      res.json({
        success: true,
        message: "Administrator deactivated successfully",
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// Configure email transporter
console.log("📧 Email configuration:");
console.log("  SMTP_HOST:", process.env.SMTP_HOST);
console.log("  SMTP_PORT:", process.env.SMTP_PORT);
console.log("  SMTP_USER:", process.env.SMTP_USER);
console.log("  SMTP_PASS:", process.env.SMTP_PASS ? "***SET***" : "NOT SET");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
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

// Forgot password - send reset email
app.post("/api/administrators/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    // Check if administrator exists
    const adminResult = await query(
      "SELECT id, name, email FROM administrator WHERE email = $1 AND is_active = true",
      [email]
    );

    // Always return success to prevent email enumeration
    if (adminResult.rows.length === 0) {
      return res.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    const admin = adminResult.rows[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in administrator table
    await query(
      "UPDATE administrator SET password_reset_token = $1, password_reset_token_expires_at = $2 WHERE id = $3",
      [resetToken, expiresAt, admin.id]
    );

    // Create reset URL
    const resetUrl = `${process.env.ADMIN_PANEL_URL || "http://localhost:3001"}/admin/reset-password?token=${resetToken}`;

    console.log("📧 Attempting to send password reset email...");
    console.log("  To:", email);
    console.log("  Reset URL:", resetUrl);

    // Send email
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Restaurant CMS" <noreply@restaurant-cms.local>',
        to: email,
        subject: "Password Reset Request",
        html: `
          <h2>Password Reset Request</h2>
          <p>Hello ${admin.name},</p>
          <p>You requested to reset your password. Click the link below to reset it:</p>
          <p><a href="${resetUrl}">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <br>
          <p>Best regards,<br>Restaurant CMS Team</p>
        `,
      });
      console.log("✅ Email sent successfully!");
      console.log("  Message ID:", info.messageId);
      console.log("  Preview URL:", nodemailer.getTestMessageUrl(info));
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      // Don't expose email errors to user
    }

    res.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ success: false, error: "An error occurred. Please try again later." });
  }
});

// Reset password with token
app.post("/api/administrators/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: "Token and new password are required" });
    }

    // Validate password strength (same as admin creation)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@$!%*?&)"
      });
    }

    // Hash new password first
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Use a single UPDATE query that validates token and updates password atomically
    // This ensures the token can only be used once (one-time use)
    const updateResult = await query(
      `UPDATE administrator
       SET password = $1,
           password_reset_token = NULL,
           password_reset_token_expires_at = NULL
       WHERE password_reset_token = $2
         AND password_reset_token_expires_at > NOW()
       RETURNING id`,
      [hashedPassword, token]
    );

    // If no rows were updated, token was invalid, expired, or already used
    if (updateResult.rows.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid or expired reset token" });
    }

    res.json({
      success: true,
      message: "Password has been reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, error: "An error occurred. Please try again later." });
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

app.get("/api/content", async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        pc.id, 
        pc.item_type, 
        pc.image_url, 
        pc.is_active, 
        pc.position, 
        pc.creation_time,
        -- Sprytne łączenie nazwy w jedną kolumnę 'display_name' zależnie od tabeli
        COALESCE(
            m.name, 
            pi.title, 
            (c.name || ' ' || c.surname)
        ) as display_name,
        -- Dodatkowe info (opcjonalnie)
        COALESCE(m.price::text, pi.type, c.specialization) as info_label
      FROM page_content pc
      LEFT JOIN menu_item m ON pc.id = m.id
      LEFT JOIN page_item pi ON pc.id = pi.id
      LEFT JOIN chef_item c ON pc.id = c.id
      ORDER BY pc.position ASC, pc.creation_time DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Błąd pobierania contentu:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. SZYBKA EDYCJA (TYLKO POSITION I ACTIVE)
app.put("/api/content/:id/settings", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { position, is_active } = req.body;

    const result = await query(
      `UPDATE page_content 
       SET position = $1, is_active = $2 
       WHERE id = $3 
       RETURNING *`,
      [position, is_active, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, error: "Nie znaleziono" });

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
          // --- POPRAWKA: Dodano LEFT JOIN do page_item i pobranie tytułu ---
          const contents = await query(`
            SELECT pc.item_type, 
                   ci.name as chef_name, ci.surname as chef_surname,
                   mi.name as menu_name,
                   pi.title as page_item_title  -- <--- Pobieramy tytuł Page Item
            FROM page_content pc
            LEFT JOIN chef_item ci ON pc.id = ci.id
            LEFT JOIN menu_item mi ON pc.id = mi.id
            LEFT JOIN page_item pi ON pc.id = pi.id -- <--- Łączymy z tabelą page_item
            WHERE pc.id = ANY($1::int[])
          `, [contentIds]);

          contentPreviews = contents.rows.map(row => {
              // 1. Kucharz
              if (row.chef_name) return `👨‍🍳 ${row.chef_name} ${row.chef_surname}`;
              // 2. Menu
              if (row.menu_name) return `🍽️ ${row.menu_name}`;
              // 3. Page Item (Promocje/Info) - TU JEST IKONA DLA PAGE ITEM
              if (row.page_item_title) return `📄 ${row.page_item_title}`; 
              
              return row.item_type; // Fallback
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

// Get pages content by slug
app.get("/api/pages/slug/:slug", async (req, res) => {
  const { slug } = req.params;
  console.log(`[API] Szukam strony: "${slug}"`);

  try {
    const cleanSlug = slug.replace(/^\//, "").trim().toLowerCase();
    
    // 1. Znajdź stronę
    const allPages = await query("SELECT * FROM page");
    const page = allPages.rows.find(p => (p.slug || "").replace(/^\//, "").trim().toLowerCase() === cleanSlug);

    if (!page) return res.status(404).json({ success: false, error: "Page not found" });

    let meta = page.meta_data;
    try { meta = typeof meta === 'string' ? JSON.parse(meta) : meta || {}; } catch (e) { meta = {}; }
    const contentIds = meta.content_ids || [];

    let chefs = [];
    let menu_items = [];
    let page_items = [];

    if (Array.isArray(contentIds) && contentIds.length > 0) {
        const contents = await query(`
            SELECT 
                pc.item_type,
                pc.image_url as content_image,
                pc.is_active,  -- <--- POBIERAMY STATUS Z PAGE_CONTENT

                -- Kucharz
                ci.id as chef_id, ci.name as chef_name, ci.surname as chef_surname, 
                ci.specialization, ci.facebook_link, ci.twitter_link, ci.instagram_link,

                -- Menu
                mi.id as menu_id, mi.name as menu_name, mi.description as menu_desc,
                mi.price, 
                
                -- Page Item
                pi.id as item_id, 
                pi.title as item_title, 
                pi.description as item_desc, 
                pi.type as item_type_db

            FROM page_content pc
            LEFT JOIN chef_item ci ON pc.id = ci.id
            LEFT JOIN menu_item mi ON pc.id = mi.id
            LEFT JOIN page_item pi ON pc.id = pi.id
            WHERE pc.id = ANY($1::int[])
        `, [contentIds]);

        contents.rows.forEach(row => {
            const type = (row.item_type || "").toLowerCase();
            
            // Wspólny status dla wszystkich typów (pobrany z page_content)
            const isActiveStatus = row.is_active; 

            // 1. Kucharze
            if (type.includes('chef') && row.chef_name) {
                chefs.push({
                    id: row.chef_id, 
                    name: row.chef_name, surname: row.chef_surname, specialization: row.specialization, 
                    image_url: row.content_image, 
                    facebook_link: row.facebook_link, twitter_link: row.twitter_link, instagram_link: row.instagram_link,
                    is_active: isActiveStatus // <--- Przypisanie
                });
            } 
            // 2. Menu
            else if (type.includes('menu') && row.menu_name) {
                menu_items.push({
                    id: row.menu_id, 
                    name: row.menu_name, description: row.menu_desc, price: row.price, currency_code: "$", 
                    image_url: row.content_image,
                    is_active: isActiveStatus // <--- Przypisanie
                });
            } 
            // 3. Page Items
            else if (type.includes('page_item') || row.item_title) {
                page_items.push({
                    id: row.item_id, 
                    title: row.item_title, 
                    description: row.item_desc,
                    type: row.item_type_db,
                    image_url: row.content_image,
                    is_active: isActiveStatus // <--- Przypisanie
                });
            }
        });
    }

    res.json({ success: true, data: { ...page, chefs, menu_items, page_items } });

  } catch (error) {
    console.error(`Błąd:`, error);
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
        .json({ success: false, error: "Page not found" });
    }
    res.json({ success: true, message: "Page deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTS FOR MENU ===

// GET Menu Items
app.get("/api/menu-items", async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        m.*, 
        pc.image_url, pc.is_active, pc.is_visible_in_menu, pc.position, pc.creation_time,
        c.code as currency_code, c.name as currency_name
      FROM menu_item m
      JOIN page_content pc ON m.id = pc.id 
      LEFT JOIN currency c ON m.currency_id = c.id
      ORDER BY pc.position ASC, pc.creation_time DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Błąd pobierania menu:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. CREATE NEW MENU ITEM (Musi najpierw utworzyć page_content!)
// CREATE Menu Item
app.post("/api/menu-items", authenticateToken, async (req, res) => {
  try {
    const { 
        name, description, price, currency_id, 
        image_url, position, is_active, is_visible_in_menu 
    } = req.body;

    // KROK 1: Wstawiamy do page_content (dodano is_visible_in_menu)
    const contentResult = await query(
      `INSERT INTO page_content (item_type, image_url, is_active, is_visible_in_menu, position, creation_time) 
       VALUES ('Menu_Item', $1, $2, $3, $4, CURRENT_TIMESTAMP) 
       RETURNING id`,
      [
        image_url || '', 
        is_active !== undefined ? is_active : true,
        is_visible_in_menu !== undefined ? is_visible_in_menu : false, // Domyślnie false
        position || 0
      ]
    );
    
    const newId = contentResult.rows[0].id;

    // KROK 2: Wstawiamy do menu_item
    const menuResult = await query(
      `INSERT INTO menu_item (id, name, description, price, currency_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [newId, name, description, price, currency_id || 1]
    );

    res.status(201).json({ 
        success: true, 
        data: { 
            ...menuResult.rows[0], 
            image_url, 
            is_active, 
            is_visible_in_menu, // Zwracamy nowe pole
            position: position || 0 
        } 
    });

  } catch (error) {
    console.error("Błąd dodawania dania:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE Menu Item
app.put("/api/menu-items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, description, price, currency_id, 
      image_url, position, is_active, is_visible_in_menu 
    } = req.body;

    // Aktualizacja page_content (dodano is_visible_in_menu)
    await query(
      `UPDATE page_content 
       SET image_url = $1, is_active = $2, position = $3, is_visible_in_menu = $4, last_modification_time = CURRENT_TIMESTAMP 
       WHERE id = $5`,
      [
        image_url, 
        is_active,
        position || 0,
        is_visible_in_menu, // Aktualizacja nowego pola
        id
      ]
    );

    // Aktualizacja menu_item
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

    res.json({ 
        success: true, 
        data: { 
            ...result.rows[0], 
            image_url, 
            position, 
            is_active,
            is_visible_in_menu 
        } 
    });

  } catch (error) {
    console.error("Błąd aktualizacji dania:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/menu-items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM menu_item WHERE id = $1", [id]);
    const result = await query(
      "DELETE FROM page_content WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Menu item not found or already deleted" });
    }
    
    res.json({ success: true, message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTS FOR ChefY (CHEFS) ===
console.log("--> REJESTRACJA ENDPOINTÓW CHEFS...");

// GET Chefs
app.get("/api/chefs", async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, p.image_url, p.position, p.is_active, p.is_visible_in_menu
      FROM chef_item c
      LEFT JOIN page_content p ON c.id = p.id
      ORDER BY p.position ASC, c.id ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE Chef
app.post("/api/chefs", authenticateToken, async (req, res) => {
  try {
    const {
      name, surname, specialization, facebook_link, instagram_link, twitter_link,
      image_url, 
      position = 0, 
      is_active = true,
      is_visible_in_menu = false // Nowe pole
    } = req.body;

    if (!name || !surname) {
      return res.status(400).json({ success: false, error: "Imie i nazwisko są wymagane!" });
    }

    // KROK 1: page_content (dodano is_visible_in_menu)
    const contentResult = await query(
      `INSERT INTO page_content 
        (item_type, image_url, position, is_active, is_visible_in_menu, creation_time) 
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) 
        RETURNING id`,
      [
          'Chef', 
          image_url || '', 
          position, 
          is_active,
          is_visible_in_menu
      ]
    );

    const newId = contentResult.rows[0].id;

    // KROK 2: chef_item
    const chefResult = await query(
      `INSERT INTO chef_item 
        (id, name, surname, specialization, facebook_link, instagram_link, twitter_link) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`,
      [newId, name, surname, specialization, facebook_link, instagram_link, twitter_link]
    );

    // KROK 3: Response
    const fullData = {
        ...chefResult.rows[0],
        image_url,
        position,
        is_active,
        is_visible_in_menu,
        item_type: 'Chef'
    };

    res.status(201).json({ success: true, data: fullData });

  } catch (error) {
    console.error("Błąd dodawania kucharza:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE Chef
app.put("/api/chefs/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const {
      name, surname, specialization, facebook_link, instagram_link, twitter_link,
      image_url, position, is_active, is_visible_in_menu
    } = req.body;

    const safeImageUrl = image_url || ""; 

    await query(
      `UPDATE chef_item SET 
        name = $1, surname = $2, specialization = $3, 
        facebook_link = $4, instagram_link = $5, twitter_link = $6
      WHERE id = $7`,
      [name, surname, specialization, facebook_link, instagram_link, twitter_link, id]
    );

    // 2. Aktualizacja parent (page_content)
    await query(
      `UPDATE page_content SET 
        image_url = $1,
        position = $2,
        is_active = $3,
        is_visible_in_menu = $4,
        last_modification_time = CURRENT_TIMESTAMP
      WHERE id = $5`,
      [safeImageUrl, position || 0, is_active, is_visible_in_menu, id]
    );

    const result = await query(
      `SELECT c.*, p.image_url, p.position, p.is_active, p.is_visible_in_menu
       FROM chef_item c
       JOIN page_content p ON c.id = p.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Chef not found" });
    }

    res.json({ success: true, data: result.rows[0] });

  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. DELETE CHEF (Naprawione: usuwa dziecko ORAZ rodzica)
app.delete("/api/chefs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query("DELETE FROM chef_item WHERE id = $1", [id]);

    const result = await query(
        "DELETE FROM page_content WHERE id = $1 RETURNING id", 
        [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Chef not found" });
    }

    res.json({ success: true, message: "Chef deleted successfully" });
  } catch (error) {
    console.error("Delete Chef Error:", error);
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
    const {
      title,
      position,
      url,
      link_type,
      is_active,
      navigation_id,
      creator_id,
    } = req.body;
    const result = await query(
      "INSERT INTO navigation (title, position, url, link_type, is_active, navigation_id, creator_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [
        title,
        position,
        url,
        link_type || "internal",
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
      link_type,
      is_active,
      navigation_id,
      last_modificator_id,
    } = req.body;
    const result = await query(
      "UPDATE navigation SET title = $1, position = $2, url = $3, link_type = $4, is_active = $5, navigation_id = $6, last_modificator_id = $7, last_modification_time = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *",
      [
        title,
        position,
        url,
        link_type,
        is_active,
        navigation_id,
        last_modificator_id,
        id,
      ]
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
    const result = await query("SELECT * FROM currency ORDER BY id");
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

// 3. DELETE CURRENCY
app.delete("/api/currencies/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    // Sprawdzamy czy waluta jest używana? Na razie zakładamy proste usunięcie.
    // Jeśli jest używana w menu, baza wyrzuci błąd (foreign key), co jest dobrym zabezpieczeniem.
    await query("DELETE FROM currency WHERE id = $1", [id]);
    res.json({ success: true, message: "Waluta usunięta" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Nie można usunąć waluty (prawdopodobnie jest przypisana do dań)." });
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
    const { value, icon_url, creator_id } = req.body;
    const result = await query(
      "INSERT INTO contact_type (value, icon_url, creator_id) VALUES ($1, $2, $3) RETURNING *",
      [value, icon_url, creator_id]
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
    const { value, icon_url, last_modificator_id } = req.body;

    // Aktualizacja rekordu
    const result = await query(
      `UPDATE contact_type
       SET value = $1,
           icon_url = $2,
           last_modificator_id = $3,
           last_modification_time = NOW()
       WHERE id = $4
       RETURNING *`,
      [value, icon_url, last_modificator_id, id]
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
        ct.icon_url as contact_type_icon_url,
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
