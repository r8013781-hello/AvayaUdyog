const express = require("express");
const Joi = require("joi");
const { query } = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

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
  l.value, l.stage, l.owner_id AS [ownerId], e.name AS owner, l.next_action_date AS [nextActionDate],
  l.created_at AS [createdAt]`;

router.post("/enquiries", async (req, res, next) => {
  try {
    const { error, value } = enquirySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await query(
      `INSERT INTO leads (name, phone, email, city, address, message, source, stage)
       OUTPUT INSERTED.id, INSERTED.name, INSERTED.created_at AS [createdAt]
       VALUES (@name, @phone, @email, @city, @address, @message, 'Website', 'New')`,
      value,
    );

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/leads", requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ${LEAD_COLUMNS} FROM leads l LEFT JOIN employees e ON e.id = l.owner_id ORDER BY l.created_at DESC`,
    );
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

router.post("/leads", requireAuth, async (req, res, next) => {
  try {
    const { error, value } = leadSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await query(
      `INSERT INTO leads (name, phone, project, source, value, stage, owner_id, next_action_date)
       OUTPUT INSERTED.id
       VALUES (@name, @phone, @project, @source, @value, 'New', @ownerId, @nextActionDate)`,
      { ...value, ownerId: req.employee.id },
    );

    const created = await query(
      `SELECT ${LEAD_COLUMNS} FROM leads l LEFT JOIN employees e ON e.id = l.owner_id WHERE l.id = @id`,
      { id: result.recordset[0].id },
    );
    res.status(201).json(created.recordset[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/leads/:id", requireAuth, async (req, res, next) => {
  try {
    const { error, value } = leadUpdateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const setClauses = [];
    const params = { id: req.params.id };
    const columnByField = {
      stage: "stage",
      project: "project",
      value: "value",
      nextActionDate: "next_action_date",
      ownerId: "owner_id",
    };
    for (const [field, column] of Object.entries(columnByField)) {
      if (value[field] !== undefined) {
        setClauses.push(`${column} = @${field}`);
        params[field] = value[field];
      }
    }

    await query(
      `UPDATE leads SET ${setClauses.join(", ")}, updated_at = SYSUTCDATETIME() WHERE id = @id`,
      params,
    );

    const updated = await query(
      `SELECT ${LEAD_COLUMNS} FROM leads l LEFT JOIN employees e ON e.id = l.owner_id WHERE l.id = @id`,
      { id: req.params.id },
    );
    if (!updated.recordset.length) return res.status(404).json({ error: "Lead not found." });
    res.json(updated.recordset[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
