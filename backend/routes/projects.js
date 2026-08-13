const express = require("express");
const Joi = require("joi");
const { query, getPool } = require("../lib/db");
const { requireAuth, requirePermission } = require("../middleware/auth");
const router = express.Router();

const schema = Joi.object({
  customerId: Joi.number().integer().required(),
  name: Joi.string().trim().max(150).required(),
  projectType: Joi.string().trim().max(80).required(),
  siteAddress: Joi.string().trim().max(255).required(),
  city: Joi.string().allow("").max(100),
  areaSqft: Joi.number().positive().allow(null),
  budget: Joi.number().min(0).allow(null),
  startDate: Joi.date().iso().allow(null),
  targetDate: Joi.date().iso().allow(null),
  scope: Joi.string().allow("").max(4000),
});

const paymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  paymentDate: Joi.date().iso().required(),
  paymentMode: Joi.string().trim().max(40).required(),
  referenceNo: Joi.string().allow("").max(80),
  notes: Joi.string().allow("").max(500),
});

const PROJECT_COLUMNS = `p.id, p.project_code AS "projectCode", p.name, p.project_type AS "projectType",
  p.site_address AS "siteAddress", p.city, p.area_sqft AS "areaSqft", p.budget, p.stage,
  p.start_date AS "startDate", p.target_date AS "targetDate", p.scope, p.total_quoted AS "totalQuoted",
  c.id AS "customerId", c.name AS "customerName", c.phone AS "customerPhone", c.email AS "customerEmail",
  COALESCE(pay.total_paid, 0) AS "totalPaid"`;

router.get("/", requireAuth, requirePermission("projects", "read"), async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ${PROJECT_COLUMNS}
       FROM projects p
       JOIN customers c ON c.id = p.customer_id
       LEFT JOIN (SELECT project_id, SUM(amount) AS total_paid FROM project_payments GROUP BY project_id) pay
         ON pay.project_id = p.id
       ORDER BY p.created_at DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post("/", requireAuth, requirePermission("projects", "create"), async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const code = `PRJ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const inserted = await query(
      `INSERT INTO projects (project_code, customer_id, name, project_type, site_address, city, area_sqft, budget, start_date, target_date, scope, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [code, value.customerId, value.name, value.projectType, value.siteAddress, value.city, value.areaSqft, value.budget, value.startDate, value.targetDate, value.scope, req.employee.id],
    );
    const created = await query(
      `SELECT ${PROJECT_COLUMNS}
       FROM projects p
       JOIN customers c ON c.id = p.customer_id
       LEFT JOIN (SELECT project_id, SUM(amount) AS total_paid FROM project_payments GROUP BY project_id) pay
         ON pay.project_id = p.id
       WHERE p.id = $1`,
      [inserted.rows[0].id],
    );
    res.status(201).json(created.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/payments", requireAuth, requirePermission("projects", "update"), async (req, res, next) => {
  try {
    const { error, value } = paymentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const project = await query("SELECT id FROM projects WHERE id = $1", [req.params.id]);
    if (!project.rows.length) return res.status(404).json({ error: "Project not found." });

    await query(
      `INSERT INTO project_payments (project_id, amount, payment_date, payment_mode, reference_no, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [req.params.id, value.amount, value.paymentDate, value.paymentMode, value.referenceNo, value.notes, req.employee.id],
    );

    const created = await query(
      `SELECT ${PROJECT_COLUMNS}
       FROM projects p
       JOIN customers c ON c.id = p.customer_id
       LEFT JOIN (SELECT project_id, SUM(amount) AS total_paid FROM project_payments GROUP BY project_id) pay
         ON pay.project_id = p.id
       WHERE p.id = $1`,
      [req.params.id],
    );
    res.status(201).json(created.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requirePermission("projects", "delete"), async (req, res, next) => {
  try {
    const linkedQuotes = await query(
      "SELECT quotation_no FROM quotations WHERE project_id = $1 ORDER BY created_at DESC",
      [req.params.id],
    );
    if (linkedQuotes.rows.length) {
      const names = linkedQuotes.rows.map((r) => r.quotation_no).slice(0, 3).join(", ");
      const suffix = linkedQuotes.rows.length > 3 ? ` and ${linkedQuotes.rows.length - 3} more` : "";
      return res.status(409).json({
        error: `This project has ${linkedQuotes.rows.length} quotation${linkedQuotes.rows.length === 1 ? "" : "s"} linked to it (${names}${suffix}). Delete those quotations first, then try again.`,
      });
    }

    const result = await query("DELETE FROM projects WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Project not found." });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
