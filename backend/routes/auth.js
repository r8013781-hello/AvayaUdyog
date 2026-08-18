const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { query } = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const loginSchema = Joi.object({
  employeeId: Joi.string().trim().max(20).required(),
  password: Joi.string().max(200).required(),
});

router.post("/login", async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: "Employee ID and password are required." });

    const employeeCode = value.employeeId.toUpperCase();
    const result = await query(
      "SELECT id, employee_code, name, role, password_hash, is_super_admin, permissions, status FROM employees WHERE employee_code = $1",
      [employeeCode],
    );

    const employee = result.rows[0];
    const genericError = "The employee ID or password is incorrect.";

    // Always run bcrypt, even for an employee ID that doesn't exist, using a
    // fixed dummy hash — otherwise a missing account returns instantly while
    // a wrong password takes bcrypt's ~100ms, letting an attacker enumerate
    // valid employee IDs purely by timing the response.
    const hashToCheck = employee?.password_hash || "$2a$10$CwTycUXWue0Thq9StjUM0uJ8yb/D8vsFa7YxfmT5V2Kk4XKQ5UPGe";
    const valid = await bcrypt.compare(value.password, hashToCheck);
    if (!employee || !valid) return res.status(401).json({ error: genericError });

    if (employee.status !== "Active") return res.status(403).json({ error: "This account has been disabled. Contact your administrator." });

    const token = jwt.sign(
      { id: employee.id, employeeCode: employee.employee_code, name: employee.name, role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    res.json({
      token,
      employee: {
        id: employee.id,
        employeeCode: employee.employee_code,
        name: employee.name,
        role: employee.role,
        isSuperAdmin: employee.is_super_admin,
        permissions: employee.permissions || {},
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({
    id: req.employee.id,
    employeeCode: req.employee.employeeCode,
    name: req.employee.name,
    role: req.employee.role,
    isSuperAdmin: req.employee.isSuperAdmin,
    permissions: req.employee.permissions,
  });
});

module.exports = router;
