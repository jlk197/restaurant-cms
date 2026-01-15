const request = require("supertest");
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { authenticateToken, generateToken } = require("../authMiddleware");

// Create a minimal Express app for testing
const app = express();
app.use(express.json());

// Mock multer storage for testing
const storage = multer.memoryStorage(); // Use memory storage for tests

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

// Mock upload endpoint
app.post("/api/upload", authenticateToken, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    // In real app, file would be saved to disk
    // For testing, we just return a mock URL
    const fileUrl = `/uploads/${req.file.originalname}`;
    res.json({
      success: true,
      url: fileUrl,
      filename: req.file.originalname,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

describe("File Upload Endpoint", () => {
  describe("POST /api/upload", () => {
    it("should upload an image file successfully", async () => {
      const token = generateToken({ id: 1, email: "admin@test.com" });

      // Create a mock image buffer
      const imageBuffer = Buffer.from("fake-image-data");

      const response = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("image", imageBuffer, "test-image.jpg");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.url).toBeDefined();
      expect(response.body.filename).toBe("test-image.jpg");
    });

    it("should accept different image formats", async () => {
      const token = generateToken({ id: 1, email: "admin@test.com" });
      const imageFormats = ["test.jpg", "test.jpeg", "test.png", "test.gif", "test.webp"];

      for (const filename of imageFormats) {
        const imageBuffer = Buffer.from("fake-image-data");
        const response = await request(app)
          .post("/api/upload")
          .set("Authorization", `Bearer ${token}`)
          .attach("image", imageBuffer, filename);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      }
    });

    it("should return 400 if no file is uploaded", async () => {
      const token = generateToken({ id: 1, email: "admin@test.com" });

      const response = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("No file uploaded");
    });

    it("should reject non-image files", async () => {
      const token = generateToken({ id: 1, email: "admin@test.com" });
      const textBuffer = Buffer.from("This is a text file");

      const response = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("image", textBuffer, "document.txt");

      // Multer will reject this before it reaches our handler
      expect(response.status).toBe(500);
    });

    it("should reject files that are too large", async () => {
      const token = generateToken({ id: 1, email: "admin@test.com" });

      // Create a buffer larger than 5MB
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB

      const response = await request(app)
        .post("/api/upload")
        .set("Authorization", `Bearer ${token}`)
        .attach("image", largeBuffer, "large-image.jpg");

      // Multer will reject this with 500 error
      expect(response.status).toBe(500);
    });

    it("should require authentication", async () => {
      const imageBuffer = Buffer.from("fake-image-data");

      const response = await request(app)
        .post("/api/upload")
        .attach("image", imageBuffer, "test-image.jpg");

      expect(response.status).toBe(401);
    });

    it("should reject invalid authentication token", async () => {
      const imageBuffer = Buffer.from("fake-image-data");

      const response = await request(app)
        .post("/api/upload")
        .set("Authorization", "Bearer invalid-token")
        .attach("image", imageBuffer, "test-image.jpg");

      expect(response.status).toBe(403);
    });
  });
});

