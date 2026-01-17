const request = require("supertest");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query } = require("../db");
const { authenticateToken, generateToken } = require("../authMiddleware");

// Mock database
jest.mock("../db");

// Create a minimal Express app for testing
const app = express();
app.use(express.json());

// Mock login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    const result = await query(
      "SELECT id, name, surname, email, password, is_active FROM administrator WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const admin = result.rows[0];

    if (!admin.is_active) {
      return res.status(403).json({ success: false, error: "Account is inactive" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const token = generateToken({ id: admin.id, email: admin.email });

    res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        name: admin.name,
        surname: admin.surname,
        email: admin.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mock password reset request endpoint
app.post("/api/password-reset/request", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const result = await query(
      "SELECT id FROM administrator WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if email exists or not for security
      return res.json({ success: true, message: "If email exists, reset link will be sent" });
    }

    const adminId = result.rows[0].id;
    const resetToken = require("crypto").randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await query(
      "UPDATE administrator SET password_reset_token = $1, password_reset_token_expires_at = $2 WHERE id = $3",
      [resetToken, expiresAt, adminId]
    );

    res.json({ success: true, message: "If email exists, reset link will be sent", token: resetToken });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mock password reset endpoint
app.post("/api/password-reset/reset", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: "Token and new password are required" });
    }

    const result = await query(
      "SELECT id, password_reset_token_expires_at FROM administrator WHERE password_reset_token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, error: "Invalid or expired token" });
    }

    const admin = result.rows[0];

    if (new Date() > new Date(admin.password_reset_token_expires_at)) {
      return res.status(400).json({ success: false, error: "Token has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query(
      "UPDATE administrator SET password = $1, password_reset_token = NULL, password_reset_token_expires_at = NULL WHERE id = $2",
      [hashedPassword, admin.id]
    );

    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Protected endpoint for testing authentication
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

describe("Authentication Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/login", () => {
    it("should login successfully with valid credentials", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const mockAdmin = {
        id: 1,
        name: "Jan",
        surname: "Kowalski",
        email: "jan@test.com",
        password: hashedPassword,
        is_active: true
      };

      query.mockResolvedValue({ rows: [mockAdmin] });

      const response = await request(app)
        .post("/api/login")
        .send({ email: "jan@test.com", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toEqual({
        id: 1,
        name: "Jan",
        surname: "Kowalski",
        email: "jan@test.com"
      });
    });

    it("should return 401 with invalid password", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const mockAdmin = {
        id: 1,
        name: "Jan",
        surname: "Kowalski",
        email: "jan@test.com",
        password: hashedPassword,
        is_active: true
      };

      query.mockResolvedValue({ rows: [mockAdmin] });

      const response = await request(app)
        .post("/api/login")
        .send({ email: "jan@test.com", password: "wrongpassword" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid credentials");
    });

    it("should return 401 with non-existent email", async () => {
      query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post("/api/login")
        .send({ email: "nonexistent@test.com", password: "password123" });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid credentials");
    });

    it("should return 403 for inactive account", async () => {
      const hashedPassword = await bcrypt.hash("password123", 10);
      const mockAdmin = {
        id: 1,
        name: "Jan",
        surname: "Kowalski",
        email: "jan@test.com",
        password: hashedPassword,
        is_active: false
      };

      query.mockResolvedValue({ rows: [mockAdmin] });

      const response = await request(app)
        .post("/api/login")
        .send({ email: "jan@test.com", password: "password123" });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Account is inactive");
    });

    it("should return 400 if email or password is missing", async () => {
      const response = await request(app)
        .post("/api/login")
        .send({ email: "jan@test.com" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/password-reset/request", () => {
    it("should create password reset token for valid email", async () => {
      query
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // SELECT admin
        .mockResolvedValueOnce({ rows: [{ token: "reset-token-123" }] }); // INSERT token

      const response = await request(app)
        .post("/api/password-reset/request")
        .send({ email: "jan@test.com" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it("should return success even for non-existent email (security)", async () => {
      query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post("/api/password-reset/request")
        .send({ email: "nonexistent@test.com" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post("/api/password-reset/request")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/password-reset/reset", () => {
    it("should reset password with valid token", async () => {
      const futureDate = new Date(Date.now() + 3600000);
      query
        .mockResolvedValueOnce({
          rows: [{ id: 1, password_reset_token_expires_at: futureDate }]
        }) // SELECT admin with token
        .mockResolvedValueOnce({ rows: [] }); // UPDATE password and clear token

      const response = await request(app)
        .post("/api/password-reset/reset")
        .send({ token: "valid-token", newPassword: "newPassword123" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Password reset successful");
    });

    it("should return 400 with invalid token", async () => {
      query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .post("/api/password-reset/reset")
        .send({ token: "invalid-token", newPassword: "newPassword123" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Invalid or expired token");
    });

    it("should return 400 with expired token", async () => {
      const pastDate = new Date(Date.now() - 3600000);
      query.mockResolvedValue({
        rows: [{ id: 1, password_reset_token_expires_at: pastDate }]
      });

      const response = await request(app)
        .post("/api/password-reset/reset")
        .send({ token: "expired-token", newPassword: "newPassword123" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Token has expired");
    });

    it("should return 400 if token or password is missing", async () => {
      const response = await request(app)
        .post("/api/password-reset/reset")
        .send({ token: "some-token" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Protected Routes", () => {
    it("should allow access with valid JWT token", async () => {
      const token = generateToken({ id: 1, email: "jan@test.com" });

      const response = await request(app)
        .get("/api/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
    });

    it("should deny access without token", async () => {
      const response = await request(app).get("/api/protected");

      expect(response.status).toBe(401);
    });

    it("should deny access with invalid token", async () => {
      const response = await request(app)
        .get("/api/protected")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(403);
    });
  });
});

