require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { sql, buildConnectionString } = require("../lib/db");

const MIGRATIONS_DIR = path.join(__dirname, "..", "migrations");

function connect(database) {
  return new sql.ConnectionPool({ connectionString: buildConnectionString(database) }).connect();
}

async function ensureDatabaseExists() {
  const pool = await connect("master");

  const dbName = process.env.DB_NAME;
  await pool
    .request()
    .query(`IF DB_ID('${dbName}') IS NULL CREATE DATABASE [${dbName}]`);
  await pool.close();
}

async function run() {
  if (!process.env.DB_SERVER || !process.env.DB_NAME) {
    throw new Error("DB_SERVER and DB_NAME must be set (see backend/.env.example)");
  }

  await ensureDatabaseExists();

  const pool = await connect(process.env.DB_NAME);

  await pool.request().query(`
    IF OBJECT_ID('__migrations', 'U') IS NULL
    CREATE TABLE __migrations (
      name NVARCHAR(255) PRIMARY KEY,
      applied_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    )
  `);

  const applied = new Set(
    (await pool.request().query("SELECT name FROM __migrations")).recordset.map((r) => r.name),
  );

  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`skip  ${file} (already applied)`);
      continue;
    }
    const text = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    console.log(`apply ${file}`);
    await pool.request().query(text);
    await pool.request().input("name", sql.NVarChar, file).query("INSERT INTO __migrations (name) VALUES (@name)");
  }

  await pool.close();
  console.log("Migrations complete.");
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
