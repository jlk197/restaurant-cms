const request = require("supertest");
const express = require("express");
const bcrypt = require("bcrypt");
const { query } = require("../db");
const { authenticateToken, generateToken } = require("../authMiddleware");

// Mock database
jest.mock("../db");

// Create a minimal Express app for testing
const app = express();
app.use(express.json());

// Mock endpoints (simplified versions from index.js)
app.get("/api/administrators", async (req, res) => {
  try {
    const result = await query("SELECT id, name, surname, email, is_active FROM administrator");
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/administrators/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(
      "SELECT id, name, surname, email, is_active FROM administrator WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Administrator not found" });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/administrators", authenticateToken, async (req, res) => {
  try {
    const { name, surname, email, password } = req.body;
    
    if (!name || !surname || !email || !password) {
      return res.status(400).json({ success: false, error: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      "INSERT INTO administrator (name, surname, email, password) VALUES ($1, $2, $3, $4) RETURNING id, name, surname, email",
      [name, surname, email, hashedPassword]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/api/administrators/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, surname, email, is_active } = req.body;
    
    const result = await query(
      "UPDATE administrator SET name = $1, surname = $2, email = $3, is_active = $4 WHERE id = $5 RETURNING id, name, surname, email, is_active",
      [name, surname, email, is_active, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Administrator not found" });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete("/api/administrators/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query("DELETE FROM administrator WHERE id = $1 RETURNING id", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Administrator not found" });
    }
    
    res.json({ success: true, message: "Administrator deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

describe("Administrator Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/administrators", () => {
    it("should return all administrators", async () => {
      const mockAdmins = [
        { id: 1, name: "Jan", surname: "Kowalski", email: "jan@test.com", is_active: true },
        { id: 2, name: "Anna", surname: "Nowak", email: "anna@test.com", is_active: true }
      ];
      
      query.mockResolvedValue({ rows: mockAdmins });

      const response = await request(app).get("/api/administrators");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockAdmins);
      expect(query).toHaveBeenCalledWith("SELECT id, name, surname, email, is_active FROM administrator");
    });

    it("should handle database errors", async () => {
      query.mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/administrators");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /api/administrators/:id", () => {
    it("should return a single administrator by ID", async () => {
      const mockAdmin = { id: 1, name: "Jan", surname: "Kowalski", email: "jan@test.com", is_active: true };
      query.mockResolvedValue({ rows: [mockAdmin] });

      const response = await request(app).get("/api/administrators/1");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockAdmin);
    });

    it("should return 404 if administrator not found", async () => {
      query.mockResolvedValue({ rows: [] });

      const response = await request(app).get("/api/administrators/999");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/administrators", () => {
    it("should create a new administrator with valid data", async () => {
      const newAdmin = {
        name: "Piotr",
        surname: "Wiśniewski",
        email: "piotr@test.com",
        password: "securePassword123"
      };

      const mockCreatedAdmin = {
        id: 3,
        name: "Piotr",
        surname: "Wiśniewski",
        email: "piotr@test.com"
      };

      query.mockResolvedValue({ rows: [mockCreatedAdmin] });

      // Mock authentication middleware
      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .post("/api/administrators")
        .set("Authorization", `Bearer ${token}`)
        .send(newAdmin);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockCreatedAdmin);
    });

    it("should return 400 if required fields are missing", async () => {
      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .post("/api/administrators")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Jan" }); // Missing surname, email, password

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("PUT /api/administrators/:id", () => {
    it("should update an administrator", async () => {
      const updatedData = {
        name: "Jan",
        surname: "Kowalski Updated",
        email: "jan.updated@test.com",
        is_active: false
      };

      const mockUpdatedAdmin = {
        id: 1,
        ...updatedData
      };

      query.mockResolvedValue({ rows: [mockUpdatedAdmin] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .put("/api/administrators/1")
        .set("Authorization", `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUpdatedAdmin);
    });

    it("should return 404 if administrator to update not found", async () => {
      query.mockResolvedValue({ rows: [] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .put("/api/administrators/999")
        .set("Authorization", `Bearer ${token}`)
        .send({ name: "Test", surname: "User", email: "test@test.com", is_active: true });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/administrators/:id", () => {
    it("should delete an administrator", async () => {
      query.mockResolvedValue({ rows: [{ id: 1 }] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .delete("/api/administrators/1")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Administrator deleted");
    });

    it("should return 404 if administrator to delete not found", async () => {
      query.mockResolvedValue({ rows: [] });

      const token = generateToken({ id: 1, email: "admin@test.com" });
      const response = await request(app)
        .delete("/api/administrators/999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});

