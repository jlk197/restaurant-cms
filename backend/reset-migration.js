const { query } = require("./db");

async function resetDatabase() {
  try {
    console.log("🗑️  Usuwanie wszystkich tabel...");

    // Usuń tabele w odpowiedniej kolejności (ze względu na FK)
    const tables = [
      "page_to_content",
      "slider_image",
      "page_item",
      "chef_item",
      "menu_item",
      "navigation",
      "page_content",
      "page",
      "contact_item",
      "configuration",
      "contact_type",
      "currency",
      "administrator",
    ];

    for (const table of tables) {
      try {
        await query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`  ✅ Usunięto tabelę: ${table}`);
      } catch (err) {
        console.log(`  ⚠️  Nie można usunąć tabeli ${table}: ${err.message}`);
      }
    }

    // Usuń typ enum jeśli istnieje
    try {
      await query("DROP TYPE IF EXISTS configuration_type CASCADE");
      console.log("  ✅ Usunięto typ: configuration_type");
    } catch (err) {
      console.log(`  ⚠️  Nie można usunąć typu: ${err.message}`);
    }

    // Usuń wpis z migracji
    await query(
      "DELETE FROM pgmigrations WHERE name = '1762970525234_initial-schema'"
    );
    console.log("✅ Usunięto wpis z pgmigrations");

    console.log(
      "\n✅ Baza danych zresetowana! Teraz uruchom: npm run migrate:up"
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Błąd:", error.message);
    process.exit(1);
  }
}

resetDatabase();
