const express = require("express");
const Joi = require("joi");
const { query } = require("../lib/db");
const { requireAuth, requirePermission } = require("../middleware/auth");
const { amountInWords } = require("../lib/amountInWords");

const router = express.Router();

const PAYMENT_MODES = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Other"];

const receiptSchema = Joi.object({
  customerId: Joi.number().integer().allow(null),
  projectId: Joi.number().integer().allow(null),
  quotationId: Joi.number().integer().allow(null),
  customerName: Joi.string().trim().max(100).required(),
  projectName: Joi.string().trim().allow("", null).max(150),
  amount: Joi.number().positive().precision(2).required(),
  paymentMode: Joi.string().trim().valid(...PAYMENT_MODES).required(),
  referenceNo: Joi.string().trim().allow("", null).max(80),
  receivedOn: Joi.date().iso().required(),
  towards: Joi.string().trim().allow("", null).max(500),
  notes: Joi.string().trim().allow("", null).max(1000),
});

const statusSchema = Joi.object({
  status: Joi.string().valid("Active", "Cancelled").required(),
});

const RECEIPT_COLUMNS = `r.id, r.receipt_no AS "receiptNo", r.customer_id AS "customerId",
  r.project_id AS "projectId", r.quotation_id AS "quotationId",
  r.customer_name AS "customerName", r.project_name AS "projectName",
  r.amount, r.amount_in_words AS "amountInWords", r.payment_mode AS "paymentMode",
  r.reference_no AS "referenceNo", r.received_on AS "receivedOn", r.towards, r.notes,
  r.status, e.name AS "createdBy", r.created_at AS "createdAt", r.updated_at AS "updatedAt"`;

const withEmployee = `FROM money_receipts r LEFT JOIN employees e ON e.id = r.created_by`;

/** Numbers a receipt AU-RCPT-YYYY-000001, continuing the series per calendar year. */
async function nextReceiptNo() {
  const year = new Date().getFullYear();
  const prefix = `AU-RCPT-${year}-`;
  const result = await query(
    `SELECT receipt_no FROM money_receipts
      WHERE receipt_no LIKE $1
      ORDER BY id DESC LIMIT 1`,
    [`${prefix}%`],
  );
  const lastSeq = result.rows.length ? Number(result.rows[0].receipt_no.slice(prefix.length)) : 0;
  return `${prefix}${String(lastSeq + 1).padStart(6, "0")}`;
}

router.get("/", requireAuth, requirePermission("receipts", "read"), async (req, res, next) => {
  try {
    const result = await query(`SELECT ${RECEIPT_COLUMNS} ${withEmployee} ORDER BY r.created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, requirePermission("receipts", "read"), async (req, res, next) => {
  try {
    const result = await query(`SELECT ${RECEIPT_COLUMNS} ${withEmployee} WHERE r.id = $1`, [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Receipt not found." });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requirePermission("receipts", "create"), async (req, res, next) => {
  try {
    const { error, value } = receiptSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Retry once on the vanishingly rare chance two receipts race for the same
    // number — the UNIQUE constraint is the real guard, this just avoids
    // surfacing a 409 for a collision the server can resolve itself.
    let inserted;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const receiptNo = await nextReceiptNo();
      try {
        inserted = await query(
          `INSERT INTO money_receipts
             (receipt_no, customer_id, project_id, quotation_id, customer_name, project_name,
              amount, amount_in_words, payment_mode, reference_no, received_on, towards, notes, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
           RETURNING id`,
          [
            receiptNo,
            value.customerId || null,
            value.projectId || null,
            value.quotationId || null,
            value.customerName,
            value.projectName || null,
            value.amount,
            amountInWords(value.amount),
            value.paymentMode,
            value.referenceNo || null,
            value.receivedOn,
            value.towards || null,
            value.notes || null,
            req.employee.id,
          ],
        );
        break;
      } catch (err) {
        if (err.code === "23505" && attempt === 0) continue;
        throw err;
      }
    }

    const created = await query(`SELECT ${RECEIPT_COLUMNS} ${withEmployee} WHERE r.id = $1`, [inserted.rows[0].id]);
    res.status(201).json(created.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", requireAuth, requirePermission("receipts", "update"), async (req, res, next) => {
  try {
    const { error, value } = receiptSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const existing = await query("SELECT status FROM money_receipts WHERE id = $1", [req.params.id]);
    if (!existing.rows.length) return res.status(404).json({ error: "Receipt not found." });
    if (existing.rows[0].status === "Cancelled") {
      return res.status(409).json({ error: "A cancelled receipt can't be edited." });
    }

    await query(
      `UPDATE money_receipts SET
         customer_id = $1, project_id = $2, quotation_id = $3, customer_name = $4, project_name = $5,
         amount = $6, amount_in_words = $7, payment_mode = $8, reference_no = $9, received_on = $10,
         towards = $11, notes = $12, updated_at = CURRENT_TIMESTAMP
       WHERE id = $13`,
      [
        value.customerId || null,
        value.projectId || null,
        value.quotationId || null,
        value.customerName,
        value.projectName || null,
        value.amount,
        amountInWords(value.amount),
        value.paymentMode,
        value.referenceNo || null,
        value.receivedOn,
        value.towards || null,
        value.notes || null,
        req.params.id,
      ],
    );

    const updated = await query(`SELECT ${RECEIPT_COLUMNS} ${withEmployee} WHERE r.id = $1`, [req.params.id]);
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

/** Soft-cancel / reinstate — keeps the number and the audit trail. */
router.patch("/:id/status", requireAuth, requirePermission("receipts", "update"), async (req, res, next) => {
  try {
    const { error, value } = statusSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await query(
      `UPDATE money_receipts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id`,
      [value.status, req.params.id],
    );
    if (!result.rows.length) return res.status(404).json({ error: "Receipt not found." });

    const updated = await query(`SELECT ${RECEIPT_COLUMNS} ${withEmployee} WHERE r.id = $1`, [req.params.id]);
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requirePermission("receipts", "delete"), async (req, res, next) => {
  try {
    const result = await query("DELETE FROM money_receipts WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Receipt not found." });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
