const request = require("supertest");
const express = require("express");
const { query } = require("../db");
const { authenticateToken, generateToken } = require("../authMiddleware");

// Mock database
jest.mock("../db");

// Create a minimal Express app for testing
const app = express();
app.use(express.json());

// Mock configuration endpoints
app.get("/api/configuration", async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*,
        a1.name || ' ' || a1.surname as creator_name,
        a2.name || ' ' || a2.surname as modificator_name
      FROM configuration c
      LEFT JOIN administrator a1 ON c.creator_id = a1.id
      LEFT JOIN administrator a2 ON c.last_modificator_id = a2.id
      ORDER BY c.creation_time
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/configuration/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const result = await query(
      "SELECT * FROM configuration WHERE key = $1",
      [key]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Configuration not found" });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/configuration", authenticateToken, async (req, res) => {
  try {
    const { key, value, type, description } = req.body;
    const adminId = req.user.id;

    if (!key || !value || !type) {
      return res.status(400).json({ success: false, error: "Key, value, and type are required" });
    }

    const result = await query(
      `INSERT INTO configuration (key, value, type, description, creator_id, last_modificator_id, creation_time, modification_time)
       VALUES ($1, $2, $3, $4, $5, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
      [key, value, type, description || '', adminId]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/configuration/:key", authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    const { value, type, description } = req.body;
    const adminId = req.user.id;

    const result = await query(
      `UPDATE configuration 
       SET value = $1, type = $2, description = $3, last_modificator_id = $4, modification_time = CURRENT_TIMESTAMP
       WHERE key = $5 RETURNING *`,
      [value, type, description, adminId, key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Configuration not found" });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/configuration/:key", authenticateToken, async (req, res) => {
  try {
    const { key } = req.params;
    
    const result = await query("DELETE FROM configuration WHERE key = $1 RETURNING key", [key]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Configuration not found" });
    }

    res.json({ success: true, message: "Configuration deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

describe("Configuration Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/configuration", () => {
    it("should return all configuration items with creator/modificator names", async () => {
      const mockConfig = [
        {
          key: "site_title",
          value: "My Restaurant",
          type: "text",
          description: "Website title",
          creator_id: 1,
          last_modificator_id: 1,
          creator_name: "Admin User",
          modificator_name: "Admin User",
          creation_time: "2024-01-01T00:00:00Z",
          modification_time: "2024-01-01T00:00:00Z"
        },
        {
          key: "contact_email",
          value: "contact@restaurant.com",
          type: "email",
          description: "Contact email address",
          creator_id: 1,
          last_modificator_id: 2,
          creator_name: "Admin User",
          modificator_name: "John Doe",
          creation_time: "2024-01-01T00:00:00Z",
          modification_time: "2024-01-02T00:00:00Z"
        }
      ];

      query.mockResolvedValue({ rows: mockConfig });

      const response = await request(app).get("/api/configuration");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockConfig);
      expect(response.body.data).toHaveLength(2);
    });

    it("should handle database errors", async () => {
      query.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/configuration");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/configuration/:key", () => {
    it("should return a single configuration by key", async () => {
      const mockConfig = {
        key: "site_title",
        value: "My Restaurant",
        type: "text",
        description: "Website title",
        creator_id: 1,
        last_modificator_id: 1,
        creation_time: "2024-01-01T00:00:00Z",
        modification_time: "2024-01-01T00:00:00Z"
      };

      query.mockResolvedValue({ rows: [mockConfig] });

      const response = await request(app).get("/api/configuration/site_title");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockConfig);
    });

    it("should return 404 if configuration key not found", async () => {
      query.mockResolvedValue({ rows: [] });

      const response = await request(app).get("/api/configuration/nonexistent_key");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/configuration", () => {
    it("should create a new configuration item", async () => {
      const newConfig = {
        key: "footer_text",
        value: "© 2024 My Restaurant",
        type: "text",
        description: "Footer copyright text"
      };

      const mockCreatedConfig = {
        ...newConfig,
        creator_id: 1,
        last_modificator_id: 1,
        creation_time: "2024-01-01T00:00:00Z",
        modification_time: "2024-01-01T00:00:00Z"
      };

      query.mockResolvedValue({ rows: [mockCreatedConfig] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .post("/api/configuration")
        .set("Authorization", `Bearer ${token}`)
        .send(newConfig);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.key).toBe("footer_text");
      expect(response.body.data.value).toBe("© 2024 My Restaurant");
    });

    it("should return 400 if required fields are missing", async () => {
      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .post("/api/configuration")
        .set("Authorization", `Bearer ${token}`)
        .send({ key: "test_key" }); // Missing value and type

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Key, value, and type are required");
    });
  });

  describe("PUT /api/configuration/:key", () => {
    it("should update an existing configuration item", async () => {
      const updatedConfig = {
        value: "Updated Restaurant Name",
        type: "text",
        description: "Updated description"
      };

      const mockUpdatedConfig = {
        key: "site_title",
        ...updatedConfig,
        creator_id: 1,
        last_modificator_id: 2,
        creation_time: "2024-01-01T00:00:00Z",
        modification_time: "2024-01-03T00:00:00Z"
      };

      query.mockResolvedValue({ rows: [mockUpdatedConfig] });

      const token = generateToken({ id: 2, email: "admin2@test.com" });
      const response = await request(app)
        .put("/api/configuration/site_title")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedConfig);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.value).toBe("Updated Restaurant Name");
      expect(response.body.data.last_modificator_id).toBe(2);
    });

    it("should return 404 if configuration to update not found", async () => {
      query.mockResolvedValue({ rows: [] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .put("/api/configuration/nonexistent_key")
        .set("Authorization", `Bearer ${token}`)
        .send({ value: "test", type: "text", description: "test" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/configuration/:key", () => {
    it("should delete a configuration item", async () => {
      query.mockResolvedValue({ rows: [{ key: "old_config" }] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .delete("/api/configuration/old_config")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Configuration deleted");
    });

    it("should return 404 if configuration to delete not found", async () => {
      query.mockResolvedValue({ rows: [] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .delete("/api/configuration/nonexistent_key")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
