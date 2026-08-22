-- Track which marketing channel or campaign drove each website lead.
-- These columns are populated by the frontend, which reads UTM parameters
-- and Google Click ID (gclid) from the URL on page load and attaches
-- them to the POST /api/enquiries request body.

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS utm_source    VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS utm_medium    VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS utm_campaign  VARCHAR(200) NULL,
  ADD COLUMN IF NOT EXISTS utm_content   VARCHAR(200) NULL,
  ADD COLUMN IF NOT EXISTS utm_term      VARCHAR(200) NULL,
  ADD COLUMN IF NOT EXISTS gclid         VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS landing_page  VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS referrer      VARCHAR(500) NULL;
