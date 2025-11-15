const { Pool } = require("pg");

// Konfiguracja połączenia z bazą danych PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "cms_user",
  password: process.env.DB_PASSWORD || "cms_password",
  database: process.env.DB_NAME || "cms_db",
});

// Test połączenia
pool.on("connect", () => {
  console.log("✅ Połączono z bazą danych PostgreSQL");
});

pool.on("error", (err) => {
  console.error("❌ Błąd połączenia z bazą danych:", err);
});

// Funkcja do wykonywania zapytań
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Wykonano zapytanie:", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Błąd zapytania:", error);
    throw error;
  }
};

// Test połączenia z bazą danych
const testConnection = async () => {
  try {
    await query("SELECT NOW()");
    console.log("✅ Połączenie z bazą danych działa poprawnie");
  } catch (error) {
    console.error("❌ Błąd połączenia z bazą danych:", error);
    throw error;
  }
};

module.exports = {
  query,
  pool,
  testConnection,
};
