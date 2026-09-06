/**
 * Google Business Profile review ingestion.
 *
 * This is the ONLY place the system talks to Google. Reviews fetched here are
 * written to the `reviews` table as `pending` and stay invisible to the public
 * website until a super admin approves them.
 *
 * Access requirements (none of which this code can create for you — see
 * docs/google-reviews-setup.md for the click-path):
 *   1. A verified Google Business Profile for the business.
 *   2. A Google Cloud project with the Business Profile APIs enabled.
 *   3. Approved access — Google gates these APIs behind an application form,
 *      which can take days to weeks. Until it is granted, requests 403.
 *   4. An OAuth2 refresh token for an account that manages the profile
 *      (obtain it with `npm run google:auth`).
 *
 * Because (3) can block for a long time, `isConfigured()` lets the API layer
 * report a clear, actionable state instead of failing obscurely, and the CRM
 * keeps a manual-entry path so real reviews can be published in the meantime.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";

// The reviews collection still lives on the legacy v4 host; the newer
// mybusiness* services never took it over.
const REVIEWS_HOST = "https://mybusiness.googleapis.com/v4";

// v4 caps pageSize at 50 for the reviews collection.
const PAGE_SIZE = 50;

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

/** A tagged error so the route layer can map each failure to the right HTTP status. */
function syncError(message, code, extra = {}) {
  const error = new Error(message);
  error.code = code;
  Object.assign(error, extra);
  return error;
}

/**
 * Google error bodies are JSON: { error: { code, message, status, details } }.
 * Fall back to raw text (trimmed) when the body isn't the shape we expect.
 */
async function readGoogleError(response) {
  const raw = await response.text().catch(() => "");
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.error && parsed.error.message) {
      return { message: parsed.error.message, status: parsed.error.status || null };
    }
  } catch {
    /* not JSON — fall through */
  }
  return { message: raw.slice(0, 300) || response.statusText, status: null };
}

/** Exchange the long-lived refresh token for a short-lived access token. */
async function getAccessToken() {
  const { clientId, clientSecret, refreshToken } = config();

  let response;
  try {
    response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
  } catch (err) {
    throw syncError(`Could not reach Google to refresh the access token: ${err.message}`, "NETWORK");
  }

  if (!response.ok) {
    const { message } = await readGoogleError(response);
    // invalid_grant means the refresh token was revoked, expired (unused for
    // 6 months), or the OAuth client changed — re-running google:auth fixes it.
    const revoked = /invalid_grant/i.test(message);
    throw syncError(
      revoked
        ? "Google rejected the saved refresh token (revoked or expired). Re-run `npm run google:auth` and update GOOGLE_REFRESH_TOKEN."
        : `Google token exchange failed (${response.status}). ${message}`,
      revoked ? "TOKEN_REVOKED" : "AUTH_FAILED",
    );
  }

  const data = await response.json();
  return data.access_token;
}

const STAR_WORDS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

/** Google returns starRating as a word enum; the table stores 1–5. */
function toRating(starRating) {
  return STAR_WORDS[starRating] || null;
}

/** Shape one v4 review resource into a row for the `reviews` table. */
function toRow(review) {
  const rating = toRating(review.starRating);
  return {
    externalId: review.reviewId,
    authorName: review.reviewer?.displayName || "Google user",
    authorPhotoUrl: review.reviewer?.profilePhotoUrl || null,
    rating,
    // v4 nests the reply, if any, under review.reviewReply — we only ingest
    // the customer's words, never the owner's response.
    text: review.comment || null,
    // NOT review.name. That field is a resource path
    // ("accounts/{a}/locations/{l}/reviews/{r}"), not a URL — storing it here
    // produced a relative href that resolved to a broken path inside the CRM.
    // The v4 reviews collection does not return a public review URL at all, so
    // the honest value is null; review.reviewId is kept in external_id if the
    // resource path is ever needed again.
    reviewUrl: null,
    // createTime is when the customer wrote it. updateTime moves when the
    // owner replies, which would wrongly reorder the review — so use createTime.
    reviewedAt: review.createTime || null,
  };
}

/**
 * Fetches every review for the configured location, following pagination.
 * Returns rows already shaped for the `reviews` table — no DB access here,
 * so this stays independently testable.
 *
 * Throws a tagged error (err.code) on every failure mode so the route can
 * answer with a specific, actionable message:
 *   NOT_CONFIGURED  — a required GOOGLE_* var is unset
 *   TOKEN_REVOKED   — refresh token no longer valid; re-run google:auth
 *   AUTH_FAILED     — OAuth client id/secret wrong
 *   ACCESS_DENIED   — 403; Business Profile API access not approved for the project
 *   RATE_LIMITED    — 429; Google's per-minute quota hit, retry shortly
 *   NOT_FOUND       — 404; the account/location id pair doesn't resolve
 *   REQUEST_FAILED  — any other non-2xx from Google
 *   NETWORK         — the request never reached Google
 */
async function fetchReviews() {
  if (!isConfigured()) {
    throw syncError("Google Business Profile is not configured.", "NOT_CONFIGURED", {
      missing: missingConfig(),
    });
  }

  const { accountId, locationId } = config();
  const accessToken = await getAccessToken();
  const collected = [];
  let pageToken;

  do {
    const url = new URL(`${REVIEWS_HOST}/accounts/${accountId}/locations/${locationId}/reviews`);
    url.searchParams.set("pageSize", String(PAGE_SIZE));
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    let response;
    try {
      response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    } catch (err) {
      throw syncError(`Could not reach Google to fetch reviews: ${err.message}`, "NETWORK");
    }

    if (!response.ok) {
      const { message, status } = await readGoogleError(response);
      const codeByStatus = {
        401: "TOKEN_REVOKED",
        403: "ACCESS_DENIED",
        404: "NOT_FOUND",
        429: "RATE_LIMITED",
      };
      throw syncError(
        `Google reviews request failed (${response.status}${status ? ` ${status}` : ""}). ${message}`,
        codeByStatus[response.status] || "REQUEST_FAILED",
      );
    }

    const data = await response.json();
    for (const review of data.reviews || []) {
      const row = toRow(review);
      // A review with no usable star rating would violate the table's CHECK
      // constraint — skip rather than coerce it into a number Google didn't send.
      if (!row.rating) continue;
      collected.push(row);
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return collected;
}

module.exports = { fetchReviews, isConfigured, missingConfig, toRow, toRating };
