const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { query } = require("../lib/db");

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
      "SELECT id, employee_code, name, role, password_hash FROM employees WHERE employee_code = @employeeCode",
      { employeeCode },
    );

    const employee = result.recordset[0];
    const genericError = "The employee ID or password is incorrect.";
    if (!employee) return res.status(401).json({ error: genericError });

    const valid = await bcrypt.compare(value.password, employee.password_hash);
    if (!valid) return res.status(401).json({ error: genericError });

    const token = jwt.sign(
      { id: employee.id, employeeCode: employee.employee_code, name: employee.name, role: employee.role },
      process.env.JWT_SECRET,
      { expiresIn: "12h" },
    );

    res.json({
      token,
      employee: { id: employee.id, employeeCode: employee.employee_code, name: employee.name, role: employee.role },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Authentication required." });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query(
      "SELECT id, employee_code AS employeeCode, name, role FROM employees WHERE id = @id",
      { id: payload.id },
    );
    if (!result.recordset.length) return res.status(401).json({ error: "Session is no longer valid." });
    res.json(result.recordset[0]);
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") return res.status(401).json({ error: "Session expired." });
    next(err);
  }
});

module.exports = router;
