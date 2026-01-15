const request = require("supertest");
const express = require("express");
const { query } = require("../db");
const { authenticateToken, generateToken } = require("../authMiddleware");

// Mock database
jest.mock("../db");

// Create a minimal Express app for testing
const app = express();
app.use(express.json());

// Mock chefs endpoints
app.get("/api/chefs", async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, p.image_url, p.position, p.is_active
      FROM chef_item c
      LEFT JOIN page_content p ON c.id = p.id
      ORDER BY p.position ASC, c.id ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/chefs", authenticateToken, async (req, res) => {
  try {
    const {
      name, surname, specialization, facebook_link, instagram_link, twitter_link,
      image_url, position = 0, is_active = true
    } = req.body;

    if (!name || !surname) {
      return res.status(400).json({ success: false, error: "Name and surname are required" });
    }

    // Insert into page_content first
    const contentResult = await query(
      `INSERT INTO page_content (item_type, image_url, position, is_active, creation_time) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING id`,
      ['Chef', image_url || '', position, is_active]
    );

    const contentId = contentResult.rows[0].id;

    // Insert into chef_item
    const chefResult = await query(
      `INSERT INTO chef_item (id, name, surname, specialization, facebook_link, instagram_link, twitter_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [contentId, name, surname, specialization || '', facebook_link || '', instagram_link || '', twitter_link || '']
    );

    res.status(201).json({ success: true, data: chefResult.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/chefs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, surname, specialization, facebook_link, instagram_link, twitter_link,
      image_url, position, is_active
    } = req.body;

    // Update page_content
    await query(
      `UPDATE page_content SET image_url = $1, position = $2, is_active = $3 WHERE id = $4`,
      [image_url, position, is_active, id]
    );

    // Update chef_item
    const result = await query(
      `UPDATE chef_item SET name = $1, surname = $2, specialization = $3, 
       facebook_link = $4, instagram_link = $5, twitter_link = $6 
       WHERE id = $7 RETURNING *`,
      [name, surname, specialization, facebook_link, instagram_link, twitter_link, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Chef not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/chefs/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete from chef_item (cascade will handle page_content)
    const result = await query("DELETE FROM chef_item WHERE id = $1 RETURNING id", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Chef not found" });
    }

    res.json({ success: true, message: "Chef deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

describe("Chefs Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/chefs", () => {
    it("should return all chefs with page_content data", async () => {
      const mockChefs = [
        {
          id: 1,
          name: "Gordon",
          surname: "Ramsay",
          specialization: "British Cuisine",
          facebook_link: "fb.com/gordon",
          instagram_link: "ig.com/gordon",
          twitter_link: "twitter.com/gordon",
          image_url: "/uploads/chef1.jpg",
          position: 1,
          is_active: true
        },
        {
          id: 2,
          name: "Jamie",
          surname: "Oliver",
          specialization: "Italian Cuisine",
          facebook_link: "",
          instagram_link: "",
          twitter_link: "",
          image_url: "/uploads/chef2.jpg",
          position: 2,
          is_active: true
        }
      ];

      query.mockResolvedValue({ rows: mockChefs });

      const response = await request(app).get("/api/chefs");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockChefs);
      expect(response.body.data).toHaveLength(2);
    });

    it("should handle database errors", async () => {
      query.mockRejectedValue(new Error("Database connection failed"));

      const response = await request(app).get("/api/chefs");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/chefs", () => {
    it("should create a new chef with valid data", async () => {
      const newChef = {
        name: "Marco",
        surname: "Pierre White",
        specialization: "French Cuisine",
        facebook_link: "fb.com/marco",
        instagram_link: "ig.com/marco",
        twitter_link: "twitter.com/marco",
        image_url: "/uploads/chef3.jpg",
        position: 3,
        is_active: true
      };

      query
        .mockResolvedValueOnce({ rows: [{ id: 3 }] }) // page_content insert
        .mockResolvedValueOnce({ rows: [{ id: 3, ...newChef }] }); // chef_item insert

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .post("/api/chefs")
        .set("Authorization", `Bearer ${token}`)
        .send(newChef);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe("Marco");
      expect(response.body.data.surname).toBe("Pierre White");
    });

    it("should return 400 if name or surname is missing", async () => {
      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .post("/api/chefs")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Marco" }); // Missing surname

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Name and surname are required");
    });

    it("should create chef with default values for optional fields", async () => {
      const minimalChef = {
        name: "Test",
        surname: "Chef"
      };

      query
        .mockResolvedValueOnce({ rows: [{ id: 4 }] })
        .mockResolvedValueOnce({ rows: [{ id: 4, ...minimalChef, specialization: '', facebook_link: '', instagram_link: '', twitter_link: '' }] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .post("/api/chefs")
        .set("Authorization", `Bearer ${token}`)
        .send(minimalChef);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe("PUT /api/chefs/:id", () => {
    it("should update an existing chef", async () => {
      const updatedChef = {
        name: "Gordon",
        surname: "Ramsay Updated",
        specialization: "Modern British",
        facebook_link: "fb.com/gordon-new",
        instagram_link: "ig.com/gordon-new",
        twitter_link: "twitter.com/gordon-new",
        image_url: "/uploads/chef1-new.jpg",
        position: 1,
        is_active: true
      };

      query
        .mockResolvedValueOnce({ rows: [] }) // page_content update
        .mockResolvedValueOnce({ rows: [{ id: 1, ...updatedChef }] }); // chef_item update

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .put("/api/chefs/1")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedChef);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.surname).toBe("Ramsay Updated");
    });

    it("should return 404 if chef not found", async () => {
      query
        .mockResolvedValueOnce({ rows: [] }) // page_content update
        .mockResolvedValueOnce({ rows: [] }); // chef_item update returns empty

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .put("/api/chefs/999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "Test",
          surname: "Chef",
          specialization: "Test",
          facebook_link: "",
          instagram_link: "",
          twitter_link: "",
          image_url: "",
          position: 0,
          is_active: true
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/chefs/:id", () => {
    it("should delete a chef", async () => {
      query.mockResolvedValue({ rows: [{ id: 1 }] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .delete("/api/chefs/1")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Chef deleted");
    });

    it("should return 404 if chef to delete not found", async () => {
      query.mockResolvedValue({ rows: [] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .delete("/api/chefs/999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
