/**
 * Google Business Profile review ingestion.
 *
 * This is the ONLY place the system talks to Google. Reviews fetched here are
 * written to the `reviews` table as `pending` and stay invisible to the public
 * website until a super admin approves them.
 *
 * Access requirements (none of which this code can create for you):
 *   1. A verified Google Business Profile for the business.
 *   2. A Google Cloud project with the Business Profile APIs enabled.
 *   3. Approved access — Google gates these APIs behind an application form,
 *      which can take weeks. Until it is granted, requests 403.
 *   4. An OAuth2 refresh token for an account that manages the profile.
 *
 * Because (3) can block for a long time, `isConfigured()` lets the API layer
 * report a clear, actionable state instead of failing obscurely, and the CRM
 * keeps a manual-entry path so real reviews can be published in the meantime.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";

// The reviews collection still lives on the legacy v4 host; the newer
// mybusiness* services never took it over.
const REVIEWS_HOST = "https://mybusiness.googleapis.com/v4";

function config() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    accountId: process.env.GOOGLE_BUSINESS_ACCOUNT_ID,
    locationId: process.env.GOOGLE_BUSINESS_LOCATION_ID,
  };
}

/** True only when every credential needed for a real sync is present. */
function isConfigured() {
  return Object.values(config()).every(Boolean);
}

/** Which specific pieces are missing — surfaced to the admin, not guessed at. */
function missingConfig() {
  const names = {
    clientId: "GOOGLE_CLIENT_ID",
    clientSecret: "GOOGLE_CLIENT_SECRET",
    refreshToken: "GOOGLE_REFRESH_TOKEN",
    accountId: "GOOGLE_BUSINESS_ACCOUNT_ID",
    locationId: "GOOGLE_BUSINESS_LOCATION_ID",
  };
  return Object.entries(config())
    .filter(([, value]) => !value)
    .map(([key]) => names[key]);
}

async function getAccessToken() {
  const { clientId, clientSecret, refreshToken } = config();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Google token exchange failed (${response.status}). ${detail.slice(0, 200)}`);
  }
  const data = await response.json();
  return data.access_token;
}

const STAR_WORDS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

/** Google returns starRating as a word enum; the table stores 1–5. */
function toRating(starRating) {
  return STAR_WORDS[starRating] || null;
}

/**
 * Fetches every review for the configured location, following pagination.
 * Returns rows already shaped for the `reviews` table — no DB access here,
 * so this stays independently testable.
 */
async function fetchReviews() {
  if (!isConfigured()) {
    const error = new Error("Google Business Profile is not configured.");
    error.code = "NOT_CONFIGURED";
    error.missing = missingConfig();
    throw error;
  }

  const { accountId, locationId } = config();
  const accessToken = await getAccessToken();
  const collected = [];
  let pageToken;

  do {
    const url = new URL(`${REVIEWS_HOST}/accounts/${accountId}/locations/${locationId}/reviews`);
    url.searchParams.set("pageSize", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      const error = new Error(
        `Google reviews request failed (${response.status}). ${detail.slice(0, 200)}`,
      );
      error.code = response.status === 403 ? "ACCESS_DENIED" : "REQUEST_FAILED";
      throw error;
    }

    const data = await response.json();
    for (const review of data.reviews || []) {
      const rating = toRating(review.starRating);
      // A review with no usable star rating would violate the table's CHECK
      // constraint — skip rather than coerce it into a number Google didn't send.
      if (!rating) continue;

      collected.push({
        externalId: review.reviewId,
        authorName: review.reviewer?.displayName || "Google user",
        authorPhotoUrl: review.reviewer?.profilePhotoUrl || null,
        rating,
        text: review.comment || null,
        reviewUrl: review.name || null,
        reviewedAt: review.createTime || null,
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return collected;
}

module.exports = { fetchReviews, isConfigured, missingConfig };
