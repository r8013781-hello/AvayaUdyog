require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { getPool } = require("../lib/db");

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set (see backend/.env.example)");
  }

  const pool = getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS __migrations (
      name VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const applied = new Set((await pool.query("SELECT name FROM __migrations")).rows.map((r) => r.name));

  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip  ${file} (already applied)`);
      continue;
    }
    const text = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    console.log(`apply ${file}`);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(text);
      await client.query("INSERT INTO __migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  await pool.end();
  console.log("Migrations complete.");
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
