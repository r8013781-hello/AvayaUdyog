"use strict";

/**
 * backend/lib/db.js
 *
 * PostgreSQL connection pool using the `pg` package and Supabase DATABASE_URL.
 *
 * Required environment variable:
 *   DATABASE_URL  — Supabase connection string
 *                   e.g. postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres
 *
 * Optional environment variable:
 *   DB_SSL=false  — disable SSL (local PostgreSQL only; Supabase always needs SSL)
 */

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Supabase requires SSL. Allow DB_SSL=false only for local dev instances.
  ssl:
    process.env.DB_SSL === "false"
      ? false
      : { rejectUnauthorized: false },
});

/**
 * Execute a parameterised PostgreSQL query.
 *
 * @param {string} text   SQL string with $1, $2, … positional placeholders
 * @param {Array}  params Array of values matching the placeholders
 * @returns {Promise<import('pg').QueryResult>}
 *
 * Usage:
 *   const result = await query("SELECT * FROM employees WHERE id = $1", [id]);
 *   result.rows  // array of row objects
 */
async function query(text, params = []) {
  return pool.query(text, params);
}

/**
 * Return the shared pg Pool instance.
 * Use this when you need a dedicated client for a transaction:
 *
 *   const client = await getPool().connect();
 *   try {
 *     await client.query("BEGIN");
 *     …
 *     await client.query("COMMIT");
 *   } catch (err) {
 *     await client.query("ROLLBACK");
 *     throw err;
 *   } finally {
 *     client.release();
 *   }
 */
function getPool() {
  return pool;
}

module.exports = { pool, getPool, query };
