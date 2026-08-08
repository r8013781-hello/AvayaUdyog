"use strict";
const express = require("express");
const Joi     = require("joi");
const { query } = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const followupSchema = Joi.object({
  contact: Joi.string().trim().max(100).required(),
  type:    Joi.string().trim().max(50).required(),
  dueDate: Joi.date().iso().required(),
  dueTime: Joi.string().trim().allow("").max(20),
  note:    Joi.string().trim().allow("").max(4000),
});

// Shared column list — double-quoted aliases preserve camelCase.
const FOLLOWUP_COLUMNS = `
  id, contact, type,
  due_date  AS "dueDate",
  due_time  AS "dueTime",
  note, done,
  created_at AS "createdAt"
`;

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ${FOLLOWUP_COLUMNS} FROM followups ORDER BY done ASC, due_date ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { error, value } = followupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const insertResult = await query(
      `INSERT INTO followups (contact, type, due_date, due_time, note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [value.contact, value.type, value.dueDate, value.dueTime || null, value.note || null],
    );

    const created = await query(
      `SELECT ${FOLLOWUP_COLUMNS} FROM followups WHERE id = $1`,
      [insertResult.rows[0].id],
    );
    res.status(201).json(created.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const done = req.body?.done;
    if (typeof done !== "boolean") return res.status(400).json({ error: "'done' must be a boolean." });

    await query("UPDATE followups SET done = $1 WHERE id = $2", [done, req.params.id]);

    const updated = await query(
      `SELECT ${FOLLOWUP_COLUMNS} FROM followups WHERE id = $1`,
      [req.params.id],
    );
    if (!updated.rows.length) return res.status(404).json({ error: "Follow-up not found." });
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
