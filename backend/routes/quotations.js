"use strict";
const express = require("express");
const Joi     = require("joi");
const { query, getPool } = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const itemSchema = Joi.object({
  itemName:    Joi.string().trim().max(150).required(),
  description: Joi.string().allow("").max(500),
  quantity:    Joi.number().positive().required(),
  unit:        Joi.string().trim().max(30).required(),
  unitPrice:   Joi.number().min(0).required(),
});

const quoteSchema = Joi.object({
  customerId:     Joi.number().integer().allow(null),
  projectId:      Joi.number().integer().allow(null),
  customerName:   Joi.string().trim().max(100).required(),
  projectName:    Joi.string().trim().max(150).required(),
  projectAddress: Joi.string().allow("").max(255),
  validUntil:     Joi.date().iso().allow(null),
  discount:       Joi.number().min(0).default(0),
  taxRate:        Joi.number().min(0).max(100).default(18),
  notes:          Joi.string().allow("").max(4000),
  items:          Joi.array().items(itemSchema).min(1).required(),
});

// List all quotations (summary only — no items).
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
         id,
         quotation_no   AS "quotationNo",
         customer_name  AS "customerName",
         project_name   AS "projectName",
         status,
         valid_until    AS "validUntil",
         grand_total    AS "grandTotal",
         created_at     AS "createdAt"
       FROM quotations
       ORDER BY created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Create a quotation with its line items inside a single transaction.
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { error, value } = quoteSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Calculate financials in JavaScript (same logic as before).
    const subtotal  = value.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const taxable   = Math.max(0, subtotal - value.discount);
    const taxAmount = taxable * (value.taxRate / 100);
    const grandTotal = taxable + taxAmount;

    const quoteNo = `AU-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Acquire a dedicated client for the transaction.
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      // Insert the quotation header.
      const quoteResult = await client.query(
        `INSERT INTO quotations
           (quotation_no, customer_id, project_id, customer_name, project_name,
            project_address, valid_until, subtotal, discount, tax_rate,
            tax_amount, grand_total, notes, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING id`,
        [
          quoteNo,
          value.customerId   ?? null,
          value.projectId    ?? null,
          value.customerName,
          value.projectName,
          value.projectAddress ?? null,
          value.validUntil   ?? null,
          subtotal,
          value.discount,
          value.taxRate,
          taxAmount,
          grandTotal,
          value.notes        ?? null,
          req.employee.id,
        ],
      );

      const quoteId = quoteResult.rows[0].id;

      // Insert line items.
      for (let i = 0; i < value.items.length; i++) {
        const item = value.items[i];
        await client.query(
          `INSERT INTO quotation_items
             (quotation_id, item_name, description, quantity, unit, unit_price, line_total, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            quoteId,
            item.itemName,
            item.description ?? null,
            item.quantity,
            item.unit,
            item.unitPrice,
            item.quantity * item.unitPrice,
            i,
          ],
        );
      }

      await client.query("COMMIT");

      // Return the same shape the frontend expects.
      res.status(201).json({
        id:           quoteId,
        quotationNo:  quoteNo,
        customerName: value.customerName,
        projectName:  value.projectName,
        status:       "Draft",
        grandTotal,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
