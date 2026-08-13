const express = require("express");
const Joi = require("joi");
const { query } = require("../lib/db");
const { requireAuth, requirePermission } = require("../middleware/auth");

const router = express.Router();
const schema = Joi.object({ name: Joi.string().trim().max(100).required(), phone: Joi.string().trim().max(30).required(), email: Joi.string().email().allow("").max(255), address: Joi.string().allow("").max(255), city: Joi.string().allow("").max(100), companyName: Joi.string().allow("").max(150), gstin: Joi.string().allow("").max(20) });

router.get("/", requireAuth, requirePermission("customers", "read"), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.id, c.name, c.project, c.phase, c.value, c.owner_id AS "ownerId", e.name AS owner,
              c.lead_id AS "leadId", c.created_at AS "createdAt"
       FROM customers c
       LEFT JOIN employees e ON e.id = c.owner_id
       ORDER BY c.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requirePermission("customers", "create"), async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const result = await query(
      `INSERT INTO customers (name, phone, email, address, city, company_name, gstin, project, phase, owner_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Not assigned', 'Registration', $8)
       RETURNING id, name, phone, email, address, city, company_name AS "companyName", gstin, project, phase, status`,
      [value.name, value.phone, value.email, value.address, value.city, value.companyName, value.gstin, req.employee.id],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requirePermission("customers", "delete"), async (req, res, next) => {
  try {
    const result = await query("DELETE FROM customers WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Customer not found." });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
