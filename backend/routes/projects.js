"use strict";
const express = require("express");
const Joi     = require("joi");
const { query } = require("../lib/db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const schema = Joi.object({
  customerId:  Joi.number().integer().required(),
  name:        Joi.string().trim().max(150).required(),
  projectType: Joi.string().trim().max(80).required(),
  siteAddress: Joi.string().trim().max(255).required(),
  city:        Joi.string().allow("").max(100),
  areaSqft:    Joi.number().positive().allow(null),
  budget:      Joi.number().min(0).allow(null),
  startDate:   Joi.date().iso().allow(null),
  targetDate:  Joi.date().iso().allow(null),
  scope:       Joi.string().allow("").max(4000),
});

const paymentSchema = Joi.object({
  amount:      Joi.number().positive().required(),
  paymentDate: Joi.date().iso().required(),
  paymentMode: Joi.string().trim().max(50).required(),
  referenceNo: Joi.string().allow("").max(100),
  notes:       Joi.string().allow("").max(500),
});

// List all projects with live financial totals.
router.get("/", requireAuth, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        p.id,
        p.project_code        AS "projectCode",
        p.name,
        p.project_type        AS "projectType",
        p.site_address        AS "siteAddress",
        p.city,
        p.area_sqft           AS "areaSqft",
        p.budget,
        p.stage,
        p.start_date          AS "startDate",
        p.target_date         AS "targetDate",
        p.scope,
        c.id                  AS "customerId",
        c.name                AS "customerName",
        c.phone               AS "customerPhone",
        c.email               AS "customerEmail",
        COALESCE(
          (SELECT SUM(grand_total) FROM quotations
           WHERE project_id = p.id AND status = 'Approved'), 0
        )                     AS "totalQuoted",
        COALESCE(
          (SELECT SUM(amount)  FROM project_payments
           WHERE project_id = p.id), 0
        )                     AS "totalPaid"
      FROM projects p
      JOIN customers c ON c.id = p.customer_id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Create a new project.
router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const code = `PRJ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const insertResult = await query(
      `INSERT INTO projects
         (project_code, customer_id, name, project_type, site_address, city,
          area_sqft, budget, start_date, target_date, scope, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [
        code,
        value.customerId,
        value.name,
        value.projectType,
        value.siteAddress,
        value.city        ?? null,
        value.areaSqft    ?? null,
        value.budget      ?? null,
        value.startDate   ?? null,
        value.targetDate  ?? null,
        value.scope       ?? null,
        req.employee.id,
      ],
    );

    const created = await query(
      `SELECT
         p.id,
         p.project_code  AS "projectCode",
         p.name,
         p.project_type  AS "projectType",
         p.site_address  AS "siteAddress",
         p.city,
         p.area_sqft     AS "areaSqft",
         p.budget,
         p.stage,
         c.id            AS "customerId",
         c.name          AS "customerName"
       FROM projects p
       JOIN customers c ON c.id = p.customer_id
       WHERE p.id = $1`,
      [insertResult.rows[0].id],
    );
    res.status(201).json(created.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Log a payment against a project.
router.post("/:id/payments", requireAuth, async (req, res, next) => {
  try {
    const { error, value } = paymentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const projectId = parseInt(req.params.id, 10);

    const result = await query(
      `INSERT INTO project_payments
         (project_id, amount, payment_date, payment_mode, reference_no, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        projectId,
        value.amount,
        value.paymentDate,
        value.paymentMode,
        value.referenceNo ?? null,
        value.notes       ?? null,
        req.employee.id,
      ],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
