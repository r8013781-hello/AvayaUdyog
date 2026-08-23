const express = require("express");
const Joi = require("joi");
const { query } = require("../lib/db");
const { requireAuth, requireSuperAdmin } = require("../middleware/auth");
const { fetchReviews, isConfigured, missingConfig } = require("../lib/googleReviews");

const router = express.Router();

const ADMIN_COLUMNS = `r.id, r.source, r.external_id AS "externalId", r.author_name AS "authorName",
  r.author_role AS "authorRole",
  r.author_photo_url AS "authorPhotoUrl", r.rating, r.text, r.review_url AS "reviewUrl",
  r.reviewed_at AS "reviewedAt", r.display_status AS "displayStatus",
  r.display_order AS "displayOrder", r.moderated_at AS "moderatedAt",
  e.name AS "moderatedBy", r.synced_at AS "syncedAt", r.created_at AS "createdAt"`;

/* -------------------------------------------------------------------------
 * PUBLIC — the only reviews endpoint the marketing site may call.
 *
 * Returns approved rows only. Moderation state, internal ids and the
 * moderator's identity are deliberately not exposed. No auth, because the
 * marketing site is a static export with no session of its own.
 * ---------------------------------------------------------------------- */
router.get("/public", async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, author_name AS "authorName", author_role AS "authorRole",
              author_photo_url AS "authorPhotoUrl",
              rating, text, review_url AS "reviewUrl", reviewed_at AS "reviewedAt", source
         FROM reviews
        WHERE display_status = 'approved'
        ORDER BY display_order ASC, reviewed_at DESC NULLS LAST, id DESC`,
    );
    // Cached briefly at the edge/CDN if one is in front of the API — approval
    // changes should show up quickly, but every visitor need not hit the DB.
    res.set("Cache-Control", "public, max-age=300");
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

/* -------------------------------------------------------------------------
 * Everything below is super-admin only, per the moderation requirement.
 * ---------------------------------------------------------------------- */

router.get("/", requireAuth, requireSuperAdmin, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT ${ADMIN_COLUMNS} FROM reviews r
         LEFT JOIN employees e ON e.id = r.moderated_by
        ORDER BY r.display_status = 'pending' DESC, r.display_order ASC,
                 r.reviewed_at DESC NULLS LAST, r.id DESC`,
    );
    res.json({
      reviews: result.rows,
      google: { configured: isConfigured(), missing: missingConfig() },
    });
  } catch (err) {
    next(err);
  }
});

const updateSchema = Joi.object({
  displayStatus: Joi.string().valid("pending", "approved", "hidden"),
  displayOrder: Joi.number().integer().min(0),
}).min(1);

router.patch("/:id", requireAuth, requireSuperAdmin, async (req, res, next) => {
  try {
    const { error, value } = updateSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const sets = [];
    const params = [];
    if (value.displayStatus !== undefined) {
      params.push(value.displayStatus);
      sets.push(`display_status = $${params.length}`);
    }
    if (value.displayOrder !== undefined) {
      params.push(value.displayOrder);
      sets.push(`display_order = $${params.length}`);
    }
    params.push(req.employee.id);
    sets.push(`moderated_by = $${params.length}`);
    params.push(req.params.id);

    const result = await query(
      `UPDATE reviews SET ${sets.join(", ")}, moderated_at = CURRENT_TIMESTAMP,
              updated_at = CURRENT_TIMESTAMP
        WHERE id = $${params.length}
        RETURNING id`,
      params,
    );
    if (!result.rows.length) return res.status(404).json({ error: "Review not found." });

    const updated = await query(
      `SELECT ${ADMIN_COLUMNS} FROM reviews r
         LEFT JOIN employees e ON e.id = r.moderated_by WHERE r.id = $1`,
      [req.params.id],
    );
    res.json(updated.rows[0]);
  } catch (err) {
    next(err);
  }
});

/**
 * Manual entry. Exists because Business Profile API access can take weeks to
 * be granted — this lets a super admin publish a genuine review in the
 * meantime. Stored with source='manual' so its provenance is never confused
 * with an API-verified one.
 */
const manualSchema = Joi.object({
  authorName: Joi.string().trim().max(150).required(),
  authorRole: Joi.string().trim().allow("", null).max(100),
  // Optional: a transcribed Google review has a star rating, a written
  // testimonial does not. Requiring one here would force whoever enters a
  // testimonial to make a number up.
  rating: Joi.number().integer().min(1).max(5).allow(null),
  text: Joi.string().trim().allow("").max(4000),
  reviewUrl: Joi.string().trim().uri().allow("").max(500),
  reviewedAt: Joi.date().iso().allow(null),
});

router.post("/", requireAuth, requireSuperAdmin, async (req, res, next) => {
  try {
    const { error, value } = manualSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const result = await query(
      `INSERT INTO reviews (source, author_name, author_role, rating, text, review_url,
                            reviewed_at, display_status, moderated_by, moderated_at)
       VALUES ('manual', $1, $2, $3, $4, $5, $6, 'pending', $7, CURRENT_TIMESTAMP)
       RETURNING id`,
      [
        value.authorName,
        value.authorRole || null,
        value.rating ?? null,
        value.text || null,
        value.reviewUrl || null,
        value.reviewedAt || null,
        req.employee.id,
      ],
    );

    const created = await query(
      `SELECT ${ADMIN_COLUMNS} FROM reviews r
         LEFT JOIN employees e ON e.id = r.moderated_by WHERE r.id = $1`,
      [result.rows[0].id],
    );
    res.status(201).json(created.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, requireSuperAdmin, async (req, res, next) => {
  try {
    const result = await query("DELETE FROM reviews WHERE id = $1 RETURNING id", [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: "Review not found." });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

/**
 * Pull from Google. Upserts on (source, external_id) so re-syncing refreshes
 * existing rows without resurrecting anything a super admin already hid, and
 * without ever flipping an approved review back to pending.
 */
router.post("/sync", requireAuth, requireSuperAdmin, async (req, res, next) => {
  try {
    const incoming = await fetchReviews();
    let inserted = 0;
    let updated = 0;

    for (const review of incoming) {
      const result = await query(
        `INSERT INTO reviews (source, external_id, author_name, author_photo_url, rating,
                              text, review_url, reviewed_at, synced_at)
         VALUES ('google', $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         ON CONFLICT (source, external_id) WHERE external_id IS NOT NULL
         DO UPDATE SET author_name = EXCLUDED.author_name,
                       author_photo_url = EXCLUDED.author_photo_url,
                       rating = EXCLUDED.rating,
                       text = EXCLUDED.text,
                       reviewed_at = EXCLUDED.reviewed_at,
                       synced_at = CURRENT_TIMESTAMP,
                       updated_at = CURRENT_TIMESTAMP
         RETURNING (xmax = 0) AS "isInsert"`,
        [
          review.externalId,
          review.authorName,
          review.authorPhotoUrl,
          review.rating,
          review.text,
          review.reviewUrl,
          review.reviewedAt,
        ],
      );
      if (result.rows[0]?.isInsert) inserted += 1;
      else updated += 1;
    }

    res.json({ synced: incoming.length, inserted, updated });
  } catch (err) {
    if (err.code === "NOT_CONFIGURED") {
      return res.status(503).json({
        error: "Google Business Profile is not connected yet.",
        missing: err.missing,
      });
    }
    if (err.code === "ACCESS_DENIED") {
      return res.status(502).json({
        error:
          "Google refused the request. Business Profile API access may not be approved for this project yet.",
      });
    }
    next(err);
  }
});

module.exports = router;
