"use strict";
require("dotenv").config();
const fs   = require("fs");
const path = require("path");
const { Pool } = require("pg");

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set.\n" +
      "Copy backend/.env.example to backend/.env and fill in your Supabase connection string."
    );
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    // Create the migration tracking table if it does not already exist.
    await client.query(`
      CREATE TABLE IF NOT EXISTS __migrations (
        name       VARCHAR(255) NOT NULL PRIMARY KEY,
        applied_at TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Load the set of already-applied migration names.
    const { rows } = await client.query("SELECT name FROM __migrations");
    const applied = new Set(rows.map((r) => r.name));

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`skip  ${file} (already applied)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      console.log(`apply ${file}`);

      // Run each migration inside a transaction so a partial failure
      // does not leave the schema in an inconsistent state.
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO __migrations (name) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${file} failed: ${err.message}`);
      }
    }

    console.log("Migrations complete.");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
