const express = require("express");
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const { query } = require("../lib/db");
const { requireAuth, requireSuperAdmin, RESOURCES, ACTIONS } = require("../middleware/auth");

const router = express.Router();

const permissionsSchema = Joi.object(
  Object.fromEntries(RESOURCES.map((resource) => [resource, Joi.array().items(Joi.string().valid(...ACTIONS)).unique()])),
).default({});

const createSchema = Joi.object({
  employeeCode: Joi.string().trim().max(20).required(),
  name: Joi.string().trim().max(100).required(),
  password: Joi.string().min(8).max(200).required(),
  role: Joi.string().trim().max(100).default("CRM Team Member"),
  isSuperAdmin: Joi.boolean().default(false),
  permissions: permissionsSchema,
});

const updateSchema = Joi.object({
  name: Joi.string().trim().max(100),
  password: Joi.string().min(8).max(200).allow(""),
  role: Joi.string().trim().max(100),
  isSuperAdmin: Joi.boolean(),
  permissions: permissionsSchema,
  status: Joi.string().valid("Active", "Disabled"),
}).min(1);

const EMPLOYEE_COLUMNS = `id, employee_code AS "employeeCode", name, role, is_super_admin AS "isSuperAdmin", permissions, status, created_at AS "createdAt"`;

router.get("/", requireAuth, requireSuperAdmin, async (req, res, next) => {
  try {
    const result = await query(`SELECT ${EMPLOYEE_COLUMNS} FROM employees ORDER BY created_at ASC`);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requireSuperAdmin, async (req, res, next) => {
  try {
    const { error, value } = createSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const employeeCode = value.employeeCode.toUpperCase();
    const existing = await query("SELECT id FROM employees WHERE employee_code = $1", [employeeCode]);
    if (existing.rows.length) return res.status(409).json({ error: "An employee with that ID already exists." });

    const passwordHash = await bcrypt.hash(value.password, 10);
    const result = await query(
      `INSERT INTO employees (employee_code, name, password_hash, role, is_super_admin, permissions)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${EMPLOYEE_COLUMNS}`,
      [employeeCode, value.name, passwordHash, value.role, value.isSuperAdmin, JSON.stringify(value.permissions || {})],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, requireSuperAdmin, async (req, res, next) => {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const targetId = Number(req.params.id);
    const target = await query("SELECT id, is_super_admin FROM employees WHERE id = $1", [targetId]);
    if (!target.rows.length) return res.status(404).json({ error: "Employee not found." });

    // Guard against locking every super admin out: if this is the last active super
    // admin, block anything that would remove their super-admin status or disable them.
    const demotingOrDisabling =
      (value.isSuperAdmin === false && target.rows[0].is_super_admin) ||
      (value.status === "Disabled" && target.rows[0].is_super_admin);
    if (demotingOrDisabling) {
      const superAdminCount = await query(
        "SELECT COUNT(*)::int AS count FROM employees WHERE is_super_admin = TRUE AND status = 'Active' AND id != $1",
        [targetId],
      );
      if (superAdminCount.rows[0].count === 0) {
        return res.status(400).json({ error: "At least one active super admin must remain." });
      }
    }

    const setClauses = [];
    const params = [];
    const push = (column, val) => {
      params.push(val);
      setClauses.push(`${column} = $${params.length}`);
    };

    if (value.name !== undefined) push("name", value.name);
    if (value.role !== undefined) push("role", value.role);
    if (value.isSuperAdmin !== undefined) push("is_super_admin", value.isSuperAdmin);
    if (value.permissions !== undefined) push("permissions", JSON.stringify(value.permissions));
    if (value.status !== undefined) push("status", value.status);
    if (value.password) push("password_hash", await bcrypt.hash(value.password, 10));

    if (!setClauses.length) return res.status(400).json({ error: "No changes supplied." });

    params.push(targetId);
    const updated = await query(
      `UPDATE employees SET ${setClauses.join(", ")} WHERE id = $${params.length} RETURNING ${EMPLOYEE_COLUMNS}`,
      params,
    );
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requireSuperAdmin, async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);
    if (targetId === req.employee.id) return res.status(400).json({ error: "You cannot delete your own account." });

    const target = await query("SELECT id, is_super_admin FROM employees WHERE id = $1", [targetId]);
    if (!target.rows.length) return res.status(404).json({ error: "Employee not found." });

    if (target.rows[0].is_super_admin) {
      const superAdminCount = await query(
        "SELECT COUNT(*)::int AS count FROM employees WHERE is_super_admin = TRUE AND status = 'Active' AND id != $1",
        [targetId],
      );
      if (superAdminCount.rows[0].count === 0) {
        return res.status(400).json({ error: "At least one active super admin must remain." });
      }
    }

    await query("DELETE FROM employees WHERE id = $1", [targetId]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
