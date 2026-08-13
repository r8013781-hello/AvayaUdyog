const express = require("express");
const Joi = require("joi");
const { query } = require("../lib/db");
const { requireAuth, requirePermission } = require("../middleware/auth");

const router = express.Router();

const followupSchema = Joi.object({
  contact: Joi.string().trim().max(100).required(),
  type: Joi.string().trim().max(50).required(),
  dueDate: Joi.date().iso().required(),
  dueTime: Joi.string().trim().allow("").max(20),
  note: Joi.string().trim().allow("").max(4000),
});

const FOLLOWUP_COLUMNS = `id, contact, type, due_date AS "dueDate", due_time AS "dueTime", note, done, created_at AS "createdAt"`;

router.get("/", requireAuth, requirePermission("followups", "read"), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ${FOLLOWUP_COLUMNS} FROM followups ORDER BY done ASC, due_date ASC`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requirePermission("followups", "create"), async (req, res, next) => {
  try {
    const { error, value } = followupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await query(
      `INSERT INTO followups (contact, type, due_date, due_time, note)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING ${FOLLOWUP_COLUMNS}`,
      [value.contact, value.type, value.dueDate, value.dueTime, value.note],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, requirePermission("followups", "update"), async (req, res, next) => {
  try {
    const done = req.body?.done;
    if (typeof done !== "boolean") return res.status(400).json({ error: "'done' must be a boolean." });

    const updated = await query(
      `UPDATE followups SET done = $1 WHERE id = $2 RETURNING ${FOLLOWUP_COLUMNS}`,
      [done, req.params.id],
    );
    if (!updated.rows.length) return res.status(404).json({ error: "Follow-up not found." });
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requirePermission("followups", "delete"), async (req, res, next) => {
  try {
    const result = await query("DELETE FROM followups WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Follow-up not found." });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
