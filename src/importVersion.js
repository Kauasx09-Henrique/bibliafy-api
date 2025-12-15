const fs = require("fs");
const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function importVersion(jsonFile) {
  try {
    const rawData = fs.readFileSync(jsonFile, "utf8");
    const data = JSON.parse(rawData);

    console.log(`Importando ${data.length} versículos...`);

    for (const v of data) {
      await pool.query(
        `INSERT INTO verses (book_id, chapter, verse, text, version_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [v.book_id, v.chapter, v.verse, v.text, v.version_id]
      );
    }

    console.log("Importação concluída com sucesso!");
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    await pool.end();
    process.exit();
  }
}

if (process.argv.length < 3) {
  console.log("Uso: node import.js <arquivo.json>");
  process.exit(1);
}

importVersion(process.argv[2]);