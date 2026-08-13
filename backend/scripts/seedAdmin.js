require("dotenv").config();
const bcrypt = require("bcryptjs");
const { getPool } = require("../lib/db");

async function run() {
  const employeeCode = (process.env.ADMIN_EMPLOYEE_CODE || "RAHUL").toUpperCase();
  const name = process.env.ADMIN_NAME || "Rahul";
  // Test-only default. Set ADMIN_PASSWORD to a strong secret before deployment.
  const password = process.env.ADMIN_PASSWORD || "rahul";

  const passwordHash = await bcrypt.hash(password, 10);
  const pool = getPool();

  const existing = await pool.query("SELECT id FROM employees WHERE employee_code = $1", [employeeCode]);

  if (existing.rows.length) {
    await pool.query(
      "UPDATE employees SET password_hash = $1, name = $2, is_super_admin = TRUE, status = 'Active' WHERE employee_code = $3",
      [passwordHash, name, employeeCode],
    );
    console.log(`Updated existing employee ${employeeCode} (super admin).`);
  } else {
    await pool.query(
      "INSERT INTO employees (employee_code, name, password_hash, role, is_super_admin) VALUES ($1, $2, $3, 'Super Admin', TRUE)",
      [employeeCode, name, passwordHash],
    );
    console.log(`Created employee ${employeeCode} (super admin).`);
  }

  await pool.end();
  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
