const express = require("express");
const Joi = require("joi");
const { getPool } = require("../lib/db");
const { requireAuth, requirePermission } = require("../middleware/auth");

const router = express.Router();
const itemSchema = Joi.object({
  itemName: Joi.string().trim().max(150).required(),
  groupName: Joi.string().trim().max(150).required(),
  subgroupName: Joi.string().trim().allow("").max(150),
  quantity: Joi.number().positive().required(),
  unit: Joi.string().trim().max(30).required(),
  unitPrice: Joi.number().min(0).required(),
});
const quoteSchema = Joi.object({ customerId: Joi.number().integer().allow(null), projectId: Joi.number().integer().allow(null), customerName: Joi.string().trim().max(100).required(), projectName: Joi.string().trim().max(150).required(), projectAddress: Joi.string().allow("").max(255), validUntil: Joi.date().iso().allow(null, ""), discount: Joi.number().min(0).default(0), taxRate: Joi.number().min(0).max(100).default(18), notes: Joi.string().allow("").max(4000), items: Joi.array().items(itemSchema).min(1).required() });

const QUOTATION_COLUMNS = `id, quotation_no AS "quotationNo", customer_id AS "customerId", project_id AS "projectId",
  customer_name AS "customerName", project_name AS "projectName", project_address AS "projectAddress",
  status, valid_until AS "validUntil", subtotal, discount, tax_rate AS "taxRate", tax_amount AS "taxAmount",
  grand_total AS "grandTotal", notes, created_at AS "createdAt"`;

router.get("/", requireAuth, requirePermission("quotations", "read"), async (req, res, next) => {
  try {
    const result = await getPool().query(
      `SELECT ${QUOTATION_COLUMNS} FROM quotations ORDER BY created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, requirePermission("quotations", "read"), async (req, res, next) => {
  try {
    const quoteResult = await getPool().query(`SELECT ${QUOTATION_COLUMNS} FROM quotations WHERE id = $1`, [req.params.id]);
    if (!quoteResult.rows.length) return res.status(404).json({ error: "Quotation not found." });

    const itemsResult = await getPool().query(
      `SELECT id, item_name AS "itemName", group_name AS "groupName", subgroup_name AS "subgroupName",
              quantity, unit, unit_price AS "unitPrice", line_total AS "lineTotal", sort_order AS "sortOrder"
       FROM quotation_items WHERE quotation_id = $1 ORDER BY sort_order ASC`,
      [req.params.id],
    );

    res.json({ ...quoteResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requirePermission("quotations", "create"), async (req, res, next) => {
  const { error, value } = quoteSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const subtotal = value.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  const taxable = Math.max(0, subtotal - value.discount);
  const taxAmount = taxable * (value.taxRate / 100);
  const grandTotal = taxable + taxAmount;

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const quoteNo = `AU-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const quoteResult = await client.query(
      `INSERT INTO quotations (quotation_no, customer_id, project_id, customer_name, project_name, project_address, valid_until, subtotal, discount, tax_rate, tax_amount, grand_total, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id`,
      [quoteNo, value.customerId || null, value.projectId || null, value.customerName, value.projectName, value.projectAddress, value.validUntil || null, subtotal, value.discount, value.taxRate, taxAmount, grandTotal, value.notes, req.employee.id],
    );
    const quoteId = quoteResult.rows[0].id;

    for (let index = 0; index < value.items.length; index += 1) {
      const item = value.items[index];
      await client.query(
        `INSERT INTO quotation_items (quotation_id, item_name, group_name, subgroup_name, quantity, unit, unit_price, line_total, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [quoteId, item.itemName, item.groupName, item.subgroupName || "", item.quantity, item.unit, item.unitPrice, item.quantity * item.unitPrice, index],
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ id: quoteId, quotationNo: quoteNo, customerName: value.customerName, projectName: value.projectName, status: "Draft", grandTotal });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

router.patch("/:id", requireAuth, requirePermission("quotations", "update"), async (req, res, next) => {
  const { error, value } = quoteSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const subtotal = value.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  const taxable = Math.max(0, subtotal - value.discount);
  const taxAmount = taxable * (value.taxRate / 100);
  const grandTotal = taxable + taxAmount;

  const client = await getPool().connect();
  try {
    const existing = await client.query("SELECT status FROM quotations WHERE id = $1", [req.params.id]);
    if (!existing.rows.length) {
      client.release();
      return res.status(404).json({ error: "Quotation not found." });
    }
    if (existing.rows[0].status !== "Draft") {
      client.release();
      return res.status(409).json({ error: "Only draft quotations can be edited. Duplicate it into a new draft instead." });
    }

    await client.query("BEGIN");
    await client.query(
      `UPDATE quotations SET customer_id = $1, project_id = $2, customer_name = $3, project_name = $4, project_address = $5,
         valid_until = $6, subtotal = $7, discount = $8, tax_rate = $9, tax_amount = $10, grand_total = $11, notes = $12,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $13`,
      [value.customerId || null, value.projectId || null, value.customerName, value.projectName, value.projectAddress, value.validUntil || null, subtotal, value.discount, value.taxRate, taxAmount, grandTotal, value.notes, req.params.id],
    );
    await client.query("DELETE FROM quotation_items WHERE quotation_id = $1", [req.params.id]);

    for (let index = 0; index < value.items.length; index += 1) {
      const item = value.items[index];
      await client.query(
        `INSERT INTO quotation_items (quotation_id, item_name, group_name, subgroup_name, quantity, unit, unit_price, line_total, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [req.params.id, item.itemName, item.groupName, item.subgroupName || "", item.quantity, item.unit, item.unitPrice, item.quantity * item.unitPrice, index],
      );
    }

    await client.query("COMMIT");
    const updated = await getPool().query(`SELECT ${QUOTATION_COLUMNS} FROM quotations WHERE id = $1`, [req.params.id]);
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

router.delete("/:id", requireAuth, requirePermission("quotations", "delete"), async (req, res, next) => {
  try {
    const result = await getPool().query("DELETE FROM quotations WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Quotation not found." });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
