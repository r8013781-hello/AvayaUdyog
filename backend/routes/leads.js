const express = require("express");
const Joi = require("joi");
const { query } = require("../lib/db");
const { requireAuth, requirePermission } = require("../middleware/auth");

const router = express.Router();

const STAGES = ["New", "Qualified", "Consultation", "Proposal", "Execution", "Won", "Lost"];

const enquirySchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  phone: Joi.string().trim().max(30).required(),
  email: Joi.string().trim().email().allow("").max(255),
  city: Joi.string().trim().allow("").max(100),
  address: Joi.string().trim().allow("").max(255),
  message: Joi.string().trim().allow("").max(4000),
});

const leadSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  phone: Joi.string().trim().max(30).required(),
  project: Joi.string().trim().allow("").max(150),
  source: Joi.string().trim().max(50).required(),
  value: Joi.number().min(0).allow(null),
  nextActionDate: Joi.date().iso().allow(null),
});

const leadUpdateSchema = Joi.object({
  stage: Joi.string().valid(...STAGES),
  project: Joi.string().trim().allow("").max(150),
  value: Joi.number().min(0),
  nextActionDate: Joi.date().iso(),
  ownerId: Joi.number().integer(),
}).min(1);

const LEAD_COLUMNS = `l.id, l.name, l.phone, l.email, l.city, l.address, l.project, l.message, l.source,
  l.value, l.stage, l.owner_id AS "ownerId", e.name AS owner, l.next_action_date AS "nextActionDate",
  l.created_at AS "createdAt"`;

router.post("/enquiries", async (req, res, next) => {
  try {
    const { error, value } = enquirySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await query(
      `INSERT INTO leads (name, phone, email, city, address, message, source, stage)
       VALUES ($1, $2, $3, $4, $5, $6, 'Website', 'New')
       RETURNING id, name, created_at AS "createdAt"`,
      [value.name, value.phone, value.email, value.city, value.address, value.message],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/leads", requireAuth, requirePermission("leads", "read"), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ${LEAD_COLUMNS} FROM leads l LEFT JOIN employees e ON e.id = l.owner_id ORDER BY l.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post("/leads", requireAuth, requirePermission("leads", "create"), async (req, res, next) => {
  try {
    const { error, value } = leadSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const inserted = await query(
      `INSERT INTO leads (name, phone, project, source, value, stage, owner_id, next_action_date)
       VALUES ($1, $2, $3, $4, $5, 'New', $6, $7)
       RETURNING id`,
      [value.name, value.phone, value.project, value.source, value.value, req.employee.id, value.nextActionDate],
    );

    const created = await query(
      `SELECT ${LEAD_COLUMNS} FROM leads l LEFT JOIN employees e ON e.id = l.owner_id WHERE l.id = $1`,
      [inserted.rows[0].id],
    );
    res.status(201).json(created.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/leads/:id", requireAuth, requirePermission("leads", "update"), async (req, res, next) => {
  try {
    const { error, value } = leadUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const setClauses = [];
    const params = [];
    const columnByField = {
      stage: "stage",
      project: "project",
      value: "value",
      nextActionDate: "next_action_date",
      ownerId: "owner_id",
    };
    for (const [field, column] of Object.entries(columnByField)) {
      if (value[field] !== undefined) {
        params.push(value[field]);
        setClauses.push(`${column} = $${params.length}`);
      }
    }

    params.push(req.params.id);
    await query(
      `UPDATE leads SET ${setClauses.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${params.length}`,
      params,
    );

    const updated = await query(
      `SELECT ${LEAD_COLUMNS} FROM leads l LEFT JOIN employees e ON e.id = l.owner_id WHERE l.id = $1`,
      [req.params.id],
    );
    if (!updated.rows.length) return res.status(404).json({ error: "Lead not found." });
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/leads/:id", requireAuth, requirePermission("leads", "delete"), async (req, res, next) => {
  try {
    const result = await query("DELETE FROM leads WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Lead not found." });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
