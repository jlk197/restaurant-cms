const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
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

// Middleware do parsowania JSON
app.use(express.json());

// Test połączenia z bazą danych przy starcie
testConnection().catch((err) => {
  console.error("Nie udało się połączyć z bazą danych:", err);
});

// Przykładowa trasa API
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from CMS backend!" });
});

// === ENDPOINTY DLA ADMINISTRATORÓW ===

// Pobierz wszystkich administratorów
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

// Pobierz administratora po ID
app.get("/api/administrators/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "SELECT id, name, surname, email FROM administrator WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Administrator nie znaleziony" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nowego administratora (wymaga tokena)
app.post("/api/administrators", authenticateToken, async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;

    // Hashuj hasło przed zapisaniem
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

// Zaktualizuj administratora (wymaga tokena)
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
        .json({ success: false, error: "Administrator nie znaleziony" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń administratora (wymaga tokena)
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
        .json({ success: false, error: "Administrator nie znaleziony" });
    }
    res.json({ success: true, message: "Administrator został usunięty" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Logowanie administratora
app.post("/api/administrators/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Pobierz administratora po emailu
    const result = await query(
      "SELECT id, name, surname, email, password FROM administrator WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Nieprawidłowy email lub hasło" });
    }

    const admin = result.rows[0];

    // Sprawdź hasło
    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Nieprawidłowy email lub hasło" });
    }

    // Wygeneruj JWT token
    const { password: _, ...adminData } = admin;
    const token = generateToken(adminData);

    // Zwróć token i dane administratora (bez hasła)
    res.json({
      success: true,
      message: "Zalogowano pomyślnie",
      token: token,
      data: adminData,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTY DLA STRON (PAGES) ===

// Pobierz wszystkie strony
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

// Pobierz stronę po ID
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
      return res
        .status(404)
        .json({ success: false, error: "Strona nie znaleziona" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nową stronę (wymaga tokena)
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

// Zaktualizuj stronę (wymaga tokena)
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
      return res
        .status(404)
        .json({ success: false, error: "Strona nie znaleziona" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń stronę (wymaga tokena)
app.delete("/api/pages/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM page WHERE id = $1 RETURNING id", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Strona nie znaleziona" });
    }
    res.json({ success: true, message: "Strona została usunięta" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTY DLA MENU ===

// Pobierz wszystkie pozycje menu
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

// Utwórz nową pozycję menu (wymaga tokena)
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

// Zaktualizuj pozycję menu (wymaga tokena)
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
        .json({ success: false, error: "Pozycja menu nie znaleziona" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń pozycję menu (wymaga tokena)
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
        .json({ success: false, error: "Pozycja menu nie znaleziona" });
    }
    res.json({ success: true, message: "Pozycja menu została usunięta" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTY DLA KUCHARZY (CHEFS) ===

// Pobierz wszystkich kucharzy
app.get("/api/chefs", async (req, res) => {
  try {
    const result = await query("SELECT * FROM chef_item ORDER BY id");
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nowego kucharza (wymaga tokena)
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

// Zaktualizuj kucharza (wymaga tokena)
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
      return res
        .status(404)
        .json({ success: false, error: "Kucharz nie znaleziony" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń kucharza (wymaga tokena)
app.delete("/api/chefs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "DELETE FROM chef_item WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Kucharz nie znaleziony" });
    }
    res.json({ success: true, message: "Kucharz został usunięty" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTY DLA NAWIGACJI ===

// Pobierz wszystkie elementy nawigacji
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

// Utwórz nowy element nawigacji (wymaga tokena)
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

// Zaktualizuj element nawigacji (wymaga tokena)
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
        .json({ success: false, error: "Element nawigacji nie znaleziony" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń element nawigacji (wymaga tokena)
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
        .json({ success: false, error: "Element nawigacji nie znaleziony" });
    }
    res.json({ success: true, message: "Element nawigacji został usunięty" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTY DLA SLIDERÓW ===

// Pobierz wszystkie obrazy slidera
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

// Utwórz nowy obraz slidera (wymaga tokena)
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

// Zaktualizuj obraz slidera (wymaga tokena)
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
        .json({ success: false, error: "Obraz slidera nie znaleziony" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń obraz slidera (wymaga tokena)
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
        .json({ success: false, error: "Obraz slidera nie znaleziony" });
    }
    res.json({ success: true, message: "Obraz slidera został usunięty" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTY DLA KONFIGURACJI ===

// Pobierz wszystkie ustawienia konfiguracji
app.get("/api/configuration", async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*,
        a1.name || ' ' || a1.surname as creator_name,
        a2.name || ' ' || a2.surname as modificator_name
      FROM configuration c
      LEFT JOIN administrator a1 ON c.creator_id = a1.id
      LEFT JOIN administrator a2 ON c.last_modificator_id = a2.id
      WHERE c.is_active = true
      ORDER BY c.key
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pobierz ustawienie po kluczu
app.get("/api/configuration/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const result = await query("SELECT * FROM configuration WHERE key = $1", [
      key,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Ustawienie nie znalezione" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nowe ustawienie (wymaga tokena)
app.post("/api/configuration", authenticateToken, async (req, res) => {
  try {
    const { key, value, description, is_active, creator_id } = req.body;
    const result = await query(
      "INSERT INTO configuration (key, value, description, is_active, creator_id) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        key,
        value,
        description,
        is_active !== undefined ? is_active : true,
        creator_id,
      ]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Zaktualizuj ustawienie (wymaga tokena)
app.put("/api/configuration/:key", authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description, is_active, last_modificator_id } = req.body;
    const result = await query(
      "UPDATE configuration SET value = $1, description = $2, is_active = $3, last_modificator_id = $4, last_modification_time = CURRENT_TIMESTAMP WHERE key = $5 RETURNING *",
      [value, description, is_active, last_modificator_id, key]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Ustawienie nie znalezione" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń ustawienie (wymaga tokena)
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
        .json({ success: false, error: "Ustawienie nie znalezione" });
    }
    res.json({ success: true, message: "Ustawienie zostało usunięte" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// === ENDPOINTY DLA WALUT ===

// Pobierz wszystkie waluty
app.get("/api/currencies", async (req, res) => {
  try {
    const result = await query("SELECT * FROM currency ORDER BY code");
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Utwórz nową walutę (wymaga tokena)
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

// === ENDPOINTY DLA TYPÓW KONTAKTU ===

// Pobierz wszystkie typy kontaktu
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

// Utwórz nowy typ kontaktu (wymaga tokena)
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

// === ENDPOINTY DLA ELEMENTÓW KONTAKTU ===

// Pobierz wszystkie elementy kontaktu
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

// Utwórz nowy element kontaktu (wymaga tokena)
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

// Zaktualizuj element kontaktu (wymaga tokena)
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
        .json({ success: false, error: "Element kontaktu nie znaleziony" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Usuń element kontaktu (wymaga tokena)
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
        .json({ success: false, error: "Element kontaktu nie znaleziony" });
    }
    res.json({ success: true, message: "Element kontaktu został usunięty" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start serwera
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
