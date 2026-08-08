const express = require("express");
const Joi = require("joi");
const { query } = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const followupSchema = Joi.object({
  contact: Joi.string().trim().max(100).required(),
  type: Joi.string().trim().max(50).required(),
  dueDate: Joi.date().iso().required(),
  dueTime: Joi.string().trim().allow("").max(20),
  note: Joi.string().trim().allow("").max(4000),
});

const FOLLOWUP_COLUMNS = `id, contact, type, due_date AS [dueDate], due_time AS [dueTime], note, done, created_at AS [createdAt]`;

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ${FOLLOWUP_COLUMNS} FROM followups ORDER BY done ASC, due_date ASC`,
    );
    res.json(result.recordset);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { error, value } = followupSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await query(
      `INSERT INTO followups (contact, type, due_date, due_time, note)
       OUTPUT INSERTED.id
       VALUES (@contact, @type, @dueDate, @dueTime, @note)`,
      value,
    );

    const created = await query(`SELECT ${FOLLOWUP_COLUMNS} FROM followups WHERE id = @id`, {
      id: result.recordset[0].id,
    });
    res.status(201).json(created.recordset[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const done = req.body?.done;
    if (typeof done !== "boolean") return res.status(400).json({ error: "'done' must be a boolean." });

    await query("UPDATE followups SET done = @done WHERE id = @id", { done, id: req.params.id });

    const updated = await query(`SELECT ${FOLLOWUP_COLUMNS} FROM followups WHERE id = @id`, {
      id: req.params.id,
    });
    if (!updated.recordset.length) return res.status(404).json({ error: "Follow-up not found." });
    res.json(updated.recordset[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
