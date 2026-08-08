"use strict";
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { query } = require("../lib/db");

async function run() {
  const employeeCode = (process.env.ADMIN_EMPLOYEE_CODE || "RAHUL").toUpperCase();
  const name         = process.env.ADMIN_NAME     || "Rahul";
  // Test-only default. Set ADMIN_PASSWORD to a strong secret before deployment.
  const password     = process.env.ADMIN_PASSWORD || "rahul";

  const passwordHash = await bcrypt.hash(password, 10);

  // Check whether this employee already exists.
  const existing = await query(
    "SELECT id FROM employees WHERE employee_code = $1",
    [employeeCode]
  );

  if (existing.rows.length) {
    await query(
      "UPDATE employees SET password_hash = $1, name = $2 WHERE employee_code = $3",
      [passwordHash, name, employeeCode]
    );
    console.log(`Updated existing employee ${employeeCode}.`);
  } else {
    await query(
      "INSERT INTO employees (employee_code, name, password_hash) VALUES ($1, $2, $3)",
      [employeeCode, name, passwordHash]
    );
    console.log(`Created employee ${employeeCode}.`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
