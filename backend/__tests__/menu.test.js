const request = require("supertest");
const express = require("express");
const { query } = require("../db");
const { authenticateToken, generateToken } = require("../authMiddleware");

// Mock database
jest.mock("../db");

// Create a minimal Express app for testing
const app = express();
app.use(express.json());

// Mock menu endpoints
app.get("/api/menu-items", async (req, res) => {
  try {
    const result = await query(`
      SELECT m.*, p.image_url, p.position, p.is_active, c.symbol as currency_symbol
      FROM menu_item m
      LEFT JOIN page_content p ON m.id = p.id
      LEFT JOIN currency c ON m.currency_id = c.id
      ORDER BY p.position ASC, m.id ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/menu-items", authenticateToken, async (req, res) => {
  try {
    const {
      name, description, price, currency_id,
      image_url, position = 0, is_active = true
    } = req.body;

    if (!name || !price || !currency_id) {
      return res.status(400).json({ success: false, error: "Name, price, and currency are required" });
    }

    // Insert into page_content first
    const contentResult = await query(
      `INSERT INTO page_content (item_type, image_url, position, is_active, creation_time) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id`,
      ['Menu', image_url || '', position, is_active]
    );

    const contentId = contentResult.rows[0].id;

    // Insert into menu_item
    const menuResult = await query(
      `INSERT INTO menu_item (id, name, description, price, currency_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [contentId, name, description || '', price, currency_id]
    );

    res.status(201).json({ success: true, data: menuResult.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/menu-items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, price, currency_id,
      image_url, position, is_active
    } = req.body;

    // Update page_content
    await query(
      `UPDATE page_content SET image_url = $1, position = $2, is_active = $3 WHERE id = $4`,
      [image_url, position, is_active, id]
    );

    // Update menu_item
    const result = await query(
      `UPDATE menu_item SET name = $1, description = $2, price = $3, currency_id = $4 
       WHERE id = $5 RETURNING *`,
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

app.delete("/api/menu-items/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query("DELETE FROM menu_item WHERE id = $1 RETURNING id", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Menu item not found" });
    }

    res.json({ success: true, message: "Menu item deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

describe("Menu Items Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/menu-items", () => {
    it("should return all menu items with currency and page_content data", async () => {
      const mockMenuItems = [
        {
          id: 1,
          name: "Spaghetti Carbonara",
          description: "Classic Italian pasta",
          price: 45.00,
          currency_id: 1,
          currency_symbol: "PLN",
          image_url: "/uploads/carbonara.jpg",
          position: 1,
          is_active: true
        },
        {
          id: 2,
          name: "Margherita Pizza",
          description: "Traditional pizza with tomato and mozzarella",
          price: 35.00,
          currency_id: 1,
          currency_symbol: "PLN",
          image_url: "/uploads/pizza.jpg",
          position: 2,
          is_active: true
        }
      ];

      query.mockResolvedValue({ rows: mockMenuItems });

      const response = await request(app).get("/api/menu-items");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockMenuItems);
      expect(response.body.data).toHaveLength(2);
    });

    it("should handle database errors", async () => {
      query.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/menu-items");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/menu-items", () => {
    it("should create a new menu item with valid data", async () => {
      const newMenuItem = {
        name: "Tiramisu",
        description: "Italian dessert",
        price: 25.00,
        currency_id: 1,
        image_url: "/uploads/tiramisu.jpg",
        position: 3,
        is_active: true
      };

      query
        .mockResolvedValueOnce({ rows: [{ id: 3 }] }) // page_content insert
        .mockResolvedValueOnce({ rows: [{ id: 3, ...newMenuItem }] }); // menu_item insert

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .post("/api/menu-items")
        .set("Authorization", `Bearer ${token}`)
        .send(newMenuItem);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Tiramisu");
      expect(response.body.data.price).toBe(25.00);
    });

    it("should return 400 if required fields are missing", async () => {
      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .post("/api/menu-items")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test Dish" }); // Missing price and currency_id

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Name, price, and currency are required");
    });

    it("should create menu item with default values for optional fields", async () => {
      const minimalMenuItem = {
        name: "Simple Dish",
        price: 20.00,
        currency_id: 1
      };

      query
        .mockResolvedValueOnce({ rows: [{ id: 4 }] })
        .mockResolvedValueOnce({ rows: [{ id: 4, ...minimalMenuItem, description: '' }] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .post("/api/menu-items")
        .set("Authorization", `Bearer ${token}`)
        .send(minimalMenuItem);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe("PUT /api/menu-items/:id", () => {
    it("should update an existing menu item", async () => {
      const updatedMenuItem = {
        name: "Spaghetti Carbonara Deluxe",
        description: "Premium Italian pasta with truffle",
        price: 65.00,
        currency_id: 1,
        image_url: "/uploads/carbonara-deluxe.jpg",
        position: 1,
        is_active: true
      };

      query
        .mockResolvedValueOnce({ rows: [] }) // page_content update
        .mockResolvedValueOnce({ rows: [{ id: 1, ...updatedMenuItem }] }); // menu_item update

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .put("/api/menu-items/1")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedMenuItem);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Spaghetti Carbonara Deluxe");
      expect(response.body.data.price).toBe(65.00);
    });

    it("should return 404 if menu item not found", async () => {
      query
        .mockResolvedValueOnce({ rows: [] }) // page_content update
        .mockResolvedValueOnce({ rows: [] }); // menu_item update returns empty

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .put("/api/menu-items/999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test",
          description: "Test",
          price: 10.00,
          currency_id: 1,
          image_url: "",
          position: 0,
          is_active: true
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/menu-items/:id", () => {
    it("should delete a menu item", async () => {
      query.mockResolvedValue({ rows: [{ id: 1 }] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .delete("/api/menu-items/1")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Menu item deleted");
    });

    it("should return 404 if menu item to delete not found", async () => {
      query.mockResolvedValue({ rows: [] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .delete("/api/menu-items/999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
