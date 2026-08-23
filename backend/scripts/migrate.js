#!/usr/bin/env node
"use strict";

/**
 * Migration runner.
 *
 * Until now this project had none: migrations 001-010 were applied by hand,
 * and nothing recorded which of them had run. That is the actual reason
 * "just run the migrations" was not a one-line answer.
 *
 * Usage (from backend/, with DATABASE_URL set):
 *
 *   npm run migrate:status     show what has run and what is pending
 *   npm run migrate            apply every pending migration
 *   npm run migrate:baseline   mark existing migrations as applied WITHOUT
 *                              running them
 *
 * About baseline — read this before pointing the runner at a live database.
 * 008_add_admin_roles.sql and 009_add_quotation_item_groups.sql use bare
 * `ADD COLUMN` with no IF NOT EXISTS guard. On a database where they have
 * already been applied by hand, re-running them raises "column already
 * exists" and the run aborts. So on an existing database, baseline first up
 * to the last migration you know was applied, then migrate. On an empty
 * database, just migrate.
 *
 * Each migration runs inside its own transaction: a failure rolls that file
 * back completely rather than leaving the schema half-changed.
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { pool } = require("../lib/db");

const DIR = path.join(__dirname, "..", "migrations");

function migrationFiles() {
  return fs
    .readdirSync(DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort(); // zero-padded numeric prefixes, so lexical order is run order
}

async function ensureTrackingTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename    VARCHAR(255) PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function appliedSet(client) {
  const result = await client.query("SELECT filename FROM schema_migrations");
  return new Set(result.rows.map((row) => row.filename));
}

/**
 * Which files a baseline should mark. Seeds are excluded from a bare baseline:
 * marking a seed as "applied" without running it would silently skip inserting
 * the rows it exists to insert.
 */
function baselineTargets(files, upTo) {
  return upTo
    ? files.filter((f) => f <= upTo)
    : files.filter((f) => !f.includes("seed"));
}

async function main() {
  const command = process.argv[2] || "migrate";
  const upTo = process.argv[3];

  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set.\n\n" +
        "backend/.env currently holds the old SQL Server / ODBC settings; lib/db.js\n" +
        "connects to PostgreSQL and needs a connection string:\n\n" +
        "  DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres\n",
    );
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    await ensureTrackingTable(client);
    const done = await appliedSet(client);
    const files = migrationFiles();
    const pending = files.filter((f) => !done.has(f));

    if (command === "status") {
      console.log(`\nDatabase: ${new URL(process.env.DATABASE_URL).hostname}\n`);
      files.forEach((f) => console.log(`  ${done.has(f) ? "applied" : "PENDING"}  ${f}`));
      console.log(`\n${done.size} applied, ${pending.length} pending.\n`);
      return;
    }

    if (command === "baseline") {
      // Records migrations as applied without executing them, for a database
      // whose schema already contains them.
      const target = baselineTargets(files, upTo);
      let marked = 0;
      for (const file of target) {
        if (done.has(file)) continue;
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING",
          [file],
        );
        console.log(`  baselined (not run)  ${file}`);
        marked += 1;
      }
      console.log(`\n${marked} marked as applied. Nothing was executed.\n`);
      return;
    }

    if (!pending.length) {
      console.log("\nNothing to do — every migration has been applied.\n");
      return;
    }

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(DIR, file), "utf8");
      process.stdout.write(`  running  ${file} ... `);
      try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (filename) VALUES ($1)",
          [file],
        );
        await client.query("COMMIT");
        console.log("ok");
      } catch (err) {
        await client.query("ROLLBACK");
        console.log("FAILED");
        console.error(`\n${file} was rolled back. Nothing from it was applied.\n`);
        console.error(err.message);
        if (/already exists/i.test(err.message)) {
          console.error(
            "\nThis usually means the migration was already applied by hand.\n" +
              `Mark the ones already in place as applied, then run again:\n\n` +
              `  npm run migrate:baseline ${file}\n`,
          );
        }
        process.exitCode = 1;
        return;
      }
    }
    console.log(`\n${pending.length} migration(s) applied.\n`);
  } finally {
    client.release();
    await pool.end();
  }
}

// Only run when invoked directly, so the helpers above can be unit tested.
if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { migrationFiles, baselineTargets };
