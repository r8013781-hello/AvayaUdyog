#!/usr/bin/env node
"use strict";

/**
 * Google Business Profile — one-time connection helper.
 *
 * Getting the five GOOGLE_* values into backend/.env is the whole difficulty
 * of turning review sync on. Two of them (client id / secret) you copy from
 * the Google Cloud console; this script produces the other three.
 *
 *   npm run google:auth
 *       Opens the Google sign-in flow, catches the redirect on localhost, and
 *       prints GOOGLE_REFRESH_TOKEN.
 *
 *   npm run google:auth -- --locations
 *       Also calls Google and prints every GOOGLE_BUSINESS_ACCOUNT_ID /
 *       GOOGLE_BUSINESS_LOCATION_ID you manage, then a ready-to-paste .env block.
 *       Reuses GOOGLE_REFRESH_TOKEN from .env if it's already set; otherwise
 *       runs the sign-in flow first.
 *
 * Prerequisites (see docs/google-reviews-setup.md for the click-path):
 *   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET set in backend/.env, from an
 *     OAuth client of type "Desktop app" (or "Web application" whose authorised
 *     redirect URI is exactly http://localhost:4599/oauth2callback).
 *   - The Google account you sign in with must manage the business's profile.
 *   - "Google Business Profile API" access approved for the Cloud project
 *     (only needed for --locations and for the sync itself, not for the token).
 */

require("dotenv").config();
const http = require("http");
const crypto = require("crypto");
const { URL } = require("url");

const SCOPE = "https://www.googleapis.com/auth/business.manage";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const ACCOUNTS_URL = "https://mybusinessaccountmanagement.googleapis.com/v1/accounts";
const LOCATIONS_HOST = "https://mybusinessbusinessinformation.googleapis.com/v1";

const PORT = Number(process.env.GOOGLE_OAUTH_PORT || 4599);
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

function need(name) {
  const value = process.env[name];
  if (!value) {
    console.error(
      `\n${name} is not set in backend/.env.\n` +
        "Create an OAuth client (Desktop app) in the Google Cloud console and copy\n" +
        "its id and secret in first. See docs/google-reviews-setup.md.\n",
    );
    process.exit(1);
  }
  return value;
}

/** Build the consent URL. `state` is verified on the way back (CSRF guard). */
function buildAuthUrl(clientId, state) {
  const url = new URL(AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPE);
  // offline + consent guarantees a refresh_token comes back every run, even if
  // this Google account has authorised the client before.
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);
  return url.toString();
}

/** Run a tiny one-shot HTTP server, hand back the ?code from the redirect. */
function waitForCode(expectedState) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
      if (reqUrl.pathname !== "/oauth2callback") {
        res.writeHead(404).end("Not found");
        return;
      }

      const error = reqUrl.searchParams.get("error");
      const code = reqUrl.searchParams.get("code");
      const state = reqUrl.searchParams.get("state");

      const done = (heading, detail) => {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          `<!doctype html><meta charset="utf-8"><title>Google connection</title>` +
            `<body style="font:16px/1.5 system-ui;margin:15vh auto;max-width:28rem;text-align:center">` +
            `<h1 style="font-size:1.25rem">${heading}</h1><p style="color:#555">${detail}</p>` +
            `<p style="color:#999">You can close this tab and return to the terminal.</p>`,
        );
      };

      if (error) {
        done("Connection cancelled", `Google returned: ${error}`);
        server.close(() => reject(new Error(`Google returned "${error}".`)));
        return;
      }
      if (state !== expectedState) {
        done("Connection failed", "State mismatch — start the command again.");
        server.close(() => reject(new Error("OAuth state mismatch — possible CSRF, aborted.")));
        return;
      }
      if (!code) {
        done("Connection failed", "No authorisation code in the response.");
        server.close(() => reject(new Error("No authorisation code returned.")));
        return;
      }

      done("Connected", "Google sign-in complete.");
      server.close(() => resolve(code));
    });

    server.on("error", (err) =>
      reject(
        err.code === "EADDRINUSE"
          ? new Error(
              `Port ${PORT} is in use. Set GOOGLE_OAUTH_PORT to a free port (and match the OAuth client's redirect URI if it's a Web client).`,
            )
          : err,
      ),
    );
    server.listen(PORT);
  });
}

async function exchangeCode(clientId, clientSecret, code) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      `Token exchange failed (${response.status}). ${data.error_description || data.error || ""}`,
    );
  }
  if (!data.refresh_token) {
    throw new Error(
      "Google did not return a refresh token. Revoke the app's access at " +
        "https://myaccount.google.com/permissions and run this again.",
    );
  }
  return data;
}

/** Do the interactive browser dance and return a refresh token. */
async function obtainRefreshToken() {
  const clientId = need("GOOGLE_CLIENT_ID");
  const clientSecret = need("GOOGLE_CLIENT_SECRET");
  const state = crypto.randomBytes(16).toString("hex");
  const authUrl = buildAuthUrl(clientId, state);

  console.log(
    "\nOpen this URL in a browser signed in as the Google account that manages\n" +
      "the Avaya Udyog Business Profile, and approve access:\n\n" +
      `  ${authUrl}\n\n` +
      `Waiting for the redirect on ${REDIRECT_URI} ...`,
  );
  await tryOpen(authUrl);

  const code = await waitForCode(state);
  const token = await exchangeCode(clientId, clientSecret, code);
  console.log("\n✓ Refresh token obtained.\n");
  return token.refresh_token;
}

/** Best-effort "open in browser". Never fatal — the URL is already printed. */
async function tryOpen(url) {
  const opener =
    process.platform === "darwin" ? "open" : process.platform === "win32" ? "start" : "xdg-open";
  try {
    const { spawn } = require("child_process");
    spawn(opener, [url], { stdio: "ignore", detached: true, shell: process.platform === "win32" });
  } catch {
    /* ignore — user can copy the URL */
  }
}

async function googleGet(url, accessToken) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = data.error?.message || response.statusText;
    if (response.status === 403) {
      throw new Error(
        `Google refused the request (403). ${msg}\n\n` +
          "This endpoint needs 'Google Business Profile API' access approved for the\n" +
          "Cloud project. The refresh token above is still valid — save it now; you\n" +
          "can look up the account/location ids later (or from the API once approved).",
      );
    }
    throw new Error(`Request to ${url} failed (${response.status}). ${msg}`);
  }
  return data;
}

async function accessTokenFrom(refreshToken) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: need("GOOGLE_CLIENT_ID"),
      client_secret: need("GOOGLE_CLIENT_SECRET"),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Could not get an access token (${response.status}). ${data.error || ""}`);
  }
  return data.access_token;
}

async function listLocations(refreshToken) {
  const accessToken = await accessTokenFrom(refreshToken);

  const accounts = [];
  let pageToken;
  do {
    const url = new URL(ACCOUNTS_URL);
    url.searchParams.set("pageSize", "20");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    const data = await googleGet(url.toString(), accessToken);
    accounts.push(...(data.accounts || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  if (!accounts.length) {
    console.log("\nNo Business Profile accounts are visible to this Google user.\n");
    return;
  }

  const pairs = [];
  for (const account of accounts) {
    const accountId = account.name.split("/")[1];
    console.log(`\nAccount ${accountId}  —  ${account.accountName || account.type || "(no name)"}`);

    let locPageToken;
    do {
      const url = new URL(`${LOCATIONS_HOST}/${account.name}/locations`);
      url.searchParams.set("readMask", "name,title,storefrontAddress");
      url.searchParams.set("pageSize", "100");
      if (locPageToken) url.searchParams.set("pageToken", locPageToken);
      const data = await googleGet(url.toString(), accessToken);
      for (const loc of data.locations || []) {
        const locationId = loc.name.split("/")[1];
        const city = loc.storefrontAddress?.locality || loc.storefrontAddress?.administrativeArea || "";
        console.log(`    location ${locationId}  —  ${loc.title || "(no title)"}${city ? `, ${city}` : ""}`);
        pairs.push({ accountId, locationId, title: loc.title });
      }
      locPageToken = data.nextPageToken;
    } while (locPageToken);
  }

  if (pairs.length === 1) {
    const { accountId, locationId } = pairs[0];
    console.log(
      "\n--- paste into backend/.env ---\n" +
        `GOOGLE_REFRESH_TOKEN=${refreshToken}\n` +
        `GOOGLE_BUSINESS_ACCOUNT_ID=${accountId}\n` +
        `GOOGLE_BUSINESS_LOCATION_ID=${locationId}\n` +
        "-------------------------------\n",
    );
  } else if (pairs.length > 1) {
    console.log(
      `\nFound ${pairs.length} locations. Put GOOGLE_REFRESH_TOKEN plus the ` +
        "account/location id of the one you want into backend/.env.\n",
    );
  }
}

async function main() {
  const wantsLocations = process.argv.slice(2).includes("--locations");

  let refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (refreshToken && wantsLocations) {
    console.log("Using the GOOGLE_REFRESH_TOKEN already in backend/.env.");
  } else {
    refreshToken = await obtainRefreshToken();
    console.log("--- paste into backend/.env ---");
    console.log(`GOOGLE_REFRESH_TOKEN=${refreshToken}`);
    console.log("-------------------------------");
  }

  if (wantsLocations) await listLocations(refreshToken);
}

// Only run when invoked directly, so the pure helpers can be unit-tested.
if (require.main === module) {
  main().catch((err) => {
    console.error(`\n${err.message}\n`);
    process.exit(1);
  });
}

module.exports = { buildAuthUrl, REDIRECT_URI, SCOPE };
