// Mock pg module before requiring db
const mockQuery = jest.fn();
const mockOn = jest.fn();

jest.mock("pg", () => {
  return {
    Pool: jest.fn().mockImplementation(() => ({
      query: mockQuery,
      on: mockOn,
    })),
  };
});

const db = require("../db");

describe("Database Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("query function", () => {
    it("should execute a query successfully", async () => {
      const mockResult = {
        rows: [{ id: 1, name: "Test" }],
        rowCount: 1,
      };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await db.query("SELECT * FROM test WHERE id = $1", [1]);

      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM test WHERE id = $1", [1]);
      expect(result).toEqual(mockResult);
    });

    it("should handle query errors", async () => {
      const mockError = new Error("Database query failed");
      mockQuery.mockRejectedValueOnce(mockError);

      await expect(db.query("SELECT * FROM invalid_table")).rejects.toThrow("Database query failed");
    });

    it("should execute query without parameters", async () => {
      const mockResult = {
        rows: [{ now: new Date() }],
        rowCount: 1,
      };

      mockQuery.mockResolvedValueOnce(mockResult);

      const result = await db.query("SELECT NOW()");

      expect(mockQuery).toHaveBeenCalledWith("SELECT NOW()", undefined);
      expect(result).toEqual(mockResult);
    });

    it("should log query execution time", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const mockResult = {
        rows: [],
        rowCount: 0,
      };

      mockQuery.mockResolvedValueOnce(mockResult);

      await db.query("SELECT * FROM test");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Wykonano zapytanie:",
        expect.objectContaining({
          text: "SELECT * FROM test",
          rows: 0,
        })
      );

      consoleSpy.mockRestore();
    });

    it("should log query errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = new Error("Query error");

      mockQuery.mockRejectedValueOnce(mockError);

      await expect(db.query("INVALID SQL")).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith("Błąd zapytania:", mockError);

      consoleErrorSpy.mockRestore();
    });
  });

  describe("testConnection function", () => {
    it("should test database connection successfully", async () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation();

      const mockResult = {
        rows: [{ now: new Date() }],
        rowCount: 1,
      };

      mockQuery.mockResolvedValueOnce(mockResult);

      await db.testConnection();

      expect(mockQuery).toHaveBeenCalledWith("SELECT NOW()", undefined);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Połączenie z bazą danych działa poprawnie")
      );

      consoleSpy.mockRestore();
    });

    it("should handle connection test failure", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      const mockError = new Error("Connection failed");

      mockQuery.mockRejectedValueOnce(mockError);

      await expect(db.testConnection()).rejects.toThrow("Connection failed");

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("pool configuration", () => {
    it("should export pool instance", () => {
      expect(db.pool).toBeDefined();
    });

    it("should export query function", () => {
      expect(db.query).toBeDefined();
      expect(typeof db.query).toBe("function");
    });

    it("should export testConnection function", () => {
      expect(db.testConnection).toBeDefined();
      expect(typeof db.testConnection).toBe("function");
    });
  });
});

