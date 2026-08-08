const express = require("express");
const Joi = require("joi");
const { query, getPool, sql } = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const itemSchema = Joi.object({ itemName: Joi.string().trim().max(150).required(), description: Joi.string().allow("").max(500), quantity: Joi.number().positive().required(), unit: Joi.string().trim().max(30).required(), unitPrice: Joi.number().min(0).required() });
const quoteSchema = Joi.object({ customerId: Joi.number().integer().allow(null), projectId: Joi.number().integer().allow(null), customerName: Joi.string().trim().max(100).required(), projectName: Joi.string().trim().max(150).required(), projectAddress: Joi.string().allow("").max(255), validUntil: Joi.date().iso().allow(null), discount: Joi.number().min(0).default(0), taxRate: Joi.number().min(0).max(100).default(18), notes: Joi.string().allow("").max(4000), items: Joi.array().items(itemSchema).min(1).required() });

router.get("/", requireAuth, async (req, res, next) => { try { const result = await query("SELECT id, quotation_no AS [quotationNo], customer_name AS [customerName], project_name AS [projectName], status, valid_until AS [validUntil], grand_total AS [grandTotal], created_at AS [createdAt] FROM quotations ORDER BY created_at DESC"); res.json(result.recordset); } catch (err) { next(err); } });

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { error, value } = quoteSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const subtotal = value.items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
    const taxable = Math.max(0, subtotal - value.discount);
    const taxAmount = taxable * (value.taxRate / 100);
    const grandTotal = taxable + taxAmount;
    const pool = await getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const quoteNo = `AU-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const quoteResult = await new sql.Request(transaction).input("quotationNo", quoteNo).input("customerId", value.customerId || null).input("projectId", value.projectId || null).input("customerName", value.customerName).input("projectName", value.projectName).input("projectAddress", value.projectAddress).input("validUntil", value.validUntil || null).input("subtotal", subtotal).input("discount", value.discount).input("taxRate", value.taxRate).input("taxAmount", taxAmount).input("grandTotal", grandTotal).input("notes", value.notes).input("createdBy", req.employee.id).query("INSERT INTO quotations (quotation_no, customer_id, project_id, customer_name, project_name, project_address, valid_until, subtotal, discount, tax_rate, tax_amount, grand_total, notes, created_by) OUTPUT INSERTED.id VALUES (@quotationNo, @customerId, @projectId, @customerName, @projectName, @projectAddress, @validUntil, @subtotal, @discount, @taxRate, @taxAmount, @grandTotal, @notes, @createdBy)");
      const quoteId = quoteResult.recordset[0].id;
      for (let index = 0; index < value.items.length; index += 1) { const item = value.items[index]; await new sql.Request(transaction).input("quotationId", quoteId).input("itemName", item.itemName).input("description", item.description).input("quantity", item.quantity).input("unit", item.unit).input("unitPrice", item.unitPrice).input("lineTotal", item.quantity * item.unitPrice).input("sortOrder", index).query("INSERT INTO quotation_items (quotation_id, item_name, description, quantity, unit, unit_price, line_total, sort_order) VALUES (@quotationId, @itemName, @description, @quantity, @unit, @unitPrice, @lineTotal, @sortOrder)"); }
      await transaction.commit();
      res.status(201).json({ id: quoteId, quotationNo: quoteNo, customerName: value.customerName, projectName: value.projectName, status: "Draft", grandTotal });
    } catch (err) { await transaction.rollback(); throw err; }
  } catch (err) { next(err); }
});
module.exports = router;
