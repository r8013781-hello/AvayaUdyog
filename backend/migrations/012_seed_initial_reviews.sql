-- Seeds the reviews table with the three client testimonials this site
-- already published, so the Testimonials section is not empty while Google
-- Business Profile API access is still pending.
--
-- PROVENANCE — this matters, so it is written down rather than assumed:
--
-- These are NOT invented, and they are NOT Google reviews. They are the exact
-- quotes that ran on avayaudyog.com until they were removed while the reviews
-- pipeline was being built; recovered verbatim from components/Testimonials.jsx
-- at commit c53ef30. Names, roles and wording are unchanged.
--
-- They are therefore stored with source = 'manual', never 'google'. The public
-- endpoint returns `source` alongside each row, so the website can always tell
-- a transcribed testimonial from a verified Google review and must never
-- present one as the other.
--
-- No rating is set. These were written testimonials, not star ratings — the
-- clients never gave a score, so inventing 5 would be fabricating the single
-- number a visitor is most likely to trust. The column is nullable for exactly
-- this case and the site renders no stars when a rating is absent.
--
-- IF ANY OF THESE ARE NOT REAL CLIENTS: hide them in the CRM (Reviews ->
-- Hidden). One click, no deploy. Nothing here should stay published that the
-- business cannot stand behind.
--
-- Idempotent: re-running this changes nothing, and it will not resurrect a
-- review an admin has since hidden or deleted.

INSERT INTO reviews (source, author_name, author_role, rating, text, display_status, display_order)
SELECT v.source, v.author_name, v.author_role, v.rating, v.text, v.display_status, v.display_order
  FROM (VALUES
    ('manual', 'Mr. Rakesh Tanwani', 'Homeowner', NULL::SMALLINT,
     'Avaya Udyog transformed our apartment into a visionary space. Their meticulous focus and thoughtful design surpassed everything we had hoped for.',
     'approved', 1),
    ('manual', 'Rajesh Kumar', 'Business Owner', NULL::SMALLINT,
     'The office transformation was executed flawlessly, on schedule and within scope. Our team is energised by the new environment every single day.',
     'approved', 2),
    ('manual', 'Anita Patel', 'Interior Designer', NULL::SMALLINT,
     'Collaborating with Avaya Udyog is an absolute delight. The artistry, warmth, and design acumen are genuinely extraordinary.',
     'approved', 3)
  ) AS v(source, author_name, author_role, rating, text, display_status, display_order)
 WHERE NOT EXISTS (
   SELECT 1 FROM reviews r
    WHERE r.source = 'manual'
      AND r.author_name = v.author_name
 );
