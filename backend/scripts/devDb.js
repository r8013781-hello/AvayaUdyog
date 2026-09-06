#!/usr/bin/env node
"use strict";

/**
 * Local development database.
 *
 * There is no system PostgreSQL on the dev machines (no Homebrew, no Docker),
 * and production runs on Supabase whose credentials are deliberately not in the
 * repo. This boots a self-contained PostgreSQL from the `embedded-postgres`
 * package — a portable binary under node_modules, no install, no sudo, and
 * nothing that can reach the production database.
 *
 * Usage:
 *
 *   npm run dev:db          start it (stays in the foreground; Ctrl+C to stop)
 *
 * It listens on 127.0.0.1:5433 with postgres/postgres and a database named
 * `avaya`, which is exactly the DATABASE_URL in .env.example's local section.
 * Data persists in backend/.pgdata (gitignored). Run `npm run migrate` once
 * while it is up to create the schema.
 */

const fs = require("fs");
const path = require("path");
const EmbeddedPostgres = require("embedded-postgres").default;

const DATA_DIR = path.join(__dirname, "..", ".pgdata");
const PORT = Number(process.env.DEV_DB_PORT || 5433);
const DB_NAME = process.env.DEV_DB_NAME || "avaya";

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "postgres",
  password: "postgres",
  port: PORT,
  persistent: true,
});

function alreadyInitialised() {
  return fs.existsSync(path.join(DATA_DIR, "PG_VERSION"));
}

async function main() {
  if (!alreadyInitialised()) {
    process.stdout.write("Initialising data directory ... ");
    await pg.initialise();
    console.log("done");
  }

  await pg.start();
  console.log(`PostgreSQL is up on 127.0.0.1:${PORT}`);

  try {
    await pg.createDatabase(DB_NAME);
    console.log(`Created database "${DB_NAME}"`);
  } catch (err) {
    if (/already exists/i.test(err.message)) {
      console.log(`Database "${DB_NAME}" already exists`);
    } else {
      throw err;
    }
  }

  console.log(
    `\nDATABASE_URL=postgresql://postgres:postgres@127.0.0.1:${PORT}/${DB_NAME}` +
      "\nLeave this running. In another terminal: npm run migrate, then npm run dev.\n",
  );

  const shutdown = async () => {
    console.log("\nStopping PostgreSQL ...");
    try {
      await pg.stop();
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
