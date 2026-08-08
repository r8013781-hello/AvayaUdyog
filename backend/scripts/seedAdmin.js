require("dotenv").config();
const bcrypt = require("bcryptjs");
const { getPool, sql } = require("../lib/db");

async function run() {
  const employeeCode = (process.env.ADMIN_EMPLOYEE_CODE || "RAHUL").toUpperCase();
  const name = process.env.ADMIN_NAME || "Rahul";
  // Test-only default. Set ADMIN_PASSWORD to a strong secret before deployment.
  const password = process.env.ADMIN_PASSWORD || "rahul";

  const passwordHash = await bcrypt.hash(password, 10);
  const pool = await getPool();

  const existing = await pool
    .request()
    .input("employeeCode", sql.NVarChar, employeeCode)
    .query("SELECT id FROM employees WHERE employee_code = @employeeCode");

  if (existing.recordset.length) {
    await pool
      .request()
      .input("employeeCode", sql.NVarChar, employeeCode)
      .input("passwordHash", sql.NVarChar, passwordHash)
      .input("name", sql.NVarChar, name)
      .query(
        "UPDATE employees SET password_hash = @passwordHash, name = @name WHERE employee_code = @employeeCode",
      );
    console.log(`Updated existing employee ${employeeCode}.`);
  } else {
    await pool
      .request()
      .input("employeeCode", sql.NVarChar, employeeCode)
      .input("name", sql.NVarChar, name)
      .input("passwordHash", sql.NVarChar, passwordHash)
      .query(
        "INSERT INTO employees (employee_code, name, password_hash) VALUES (@employeeCode, @name, @passwordHash)",
      );
    console.log(`Created employee ${employeeCode}.`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
