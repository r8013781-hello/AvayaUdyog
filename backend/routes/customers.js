const express = require("express");
const Joi = require("joi");
const { query } = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const schema = Joi.object({ name: Joi.string().trim().max(100).required(), phone: Joi.string().trim().max(30).required(), email: Joi.string().email().allow("").max(255), address: Joi.string().allow("").max(255), city: Joi.string().allow("").max(100), companyName: Joi.string().allow("").max(150), gstin: Joi.string().allow("").max(20) });

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT c.id, c.name, c.project, c.phase, c.value, c.owner_id AS [ownerId], e.name AS owner,
              c.lead_id AS [leadId], c.created_at AS [createdAt]
       FROM customers c
       LEFT JOIN employees e ON e.id = c.owner_id
       ORDER BY c.created_at DESC`,
    );
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => { try { const { error, value } = schema.validate(req.body); if (error) return res.status(400).json({ error: error.details[0].message }); const result = await query("INSERT INTO customers (name, phone, email, address, city, company_name, gstin, project, phase, owner_id) OUTPUT INSERTED.id VALUES (@name, @phone, @email, @address, @city, @companyName, @gstin, 'Not assigned', 'Registration', @ownerId)", { ...value, ownerId: req.employee.id }); const created = await query("SELECT id, name, phone, email, address, city, company_name AS [companyName], gstin, project, phase, status FROM customers WHERE id = @id", { id: result.recordset[0].id }); res.status(201).json(created.recordset[0]); } catch (err) { next(err); } });

module.exports = router;
