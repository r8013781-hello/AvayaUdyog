"use strict";

const { Pool } = require("pg");

/**
 * PostgreSQL connection pool for Supabase.
 *
 * Required environment variable:
 *   DATABASE_URL
 *
 * Supabase provides this connection string from:
 * Project Settings → Database → Connection string
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Supabase requires SSL for external database connections.
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : process.env.DB_SSL === "false"
        ? false
        : { rejectUnauthorized: false },

  max: Number.parseInt(process.env.DB_POOL_MAX || "10", 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000,
});

/**
 * Execute a parameterized PostgreSQL query.
 *
 * params is an array:
 *   query("SELECT * FROM employees WHERE id = $1", [id])
 *
 * Returns a result object compatible with the parts of the
 * existing application that use result.rows.
 */
async function query(text, params = []) {
  return pool.query(text, params);
}

/**
 * Get the shared PostgreSQL pool.
 */
function getPool() {
  return pool;
}

/**
 * Test the database connection.
 */
async function testConnection() {
  const client = await pool.connect();

  try {
    await client.query("SELECT 1");
    return true;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  getPool,
  query,
  testConnection,
};