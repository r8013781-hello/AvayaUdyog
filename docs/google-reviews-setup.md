# Connecting Google reviews

The CRM can pull reviews straight from the Avaya Udyog Google Business Profile
into **Portal → Reviews**, where a super admin approves each one before it
appears on the website. Until this is connected, the same screen still works —
reviews are added by hand with **+ Add manually**.

Connecting it is a one-time job. The code is finished; what remains is Google's
side, which only someone who **manages the Avaya Udyog Business Profile** and has
a **Google Cloud** account can do.

---

## What you end up with

Five values in `backend/.env`:

| Variable | Where it comes from |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Google Cloud console — OAuth client |
| `GOOGLE_CLIENT_SECRET` | Google Cloud console — OAuth client |
| `GOOGLE_REFRESH_TOKEN` | `npm run google:auth` |
| `GOOGLE_BUSINESS_ACCOUNT_ID` | `npm run google:auth -- --locations` |
| `GOOGLE_BUSINESS_LOCATION_ID` | `npm run google:auth -- --locations` |

Once all five are set, **Sync from Google** in the CRM works and the
"Google isn't connected yet" banner disappears.

---

## Step 1 — Request Business Profile API access (do this first; it takes days)

Google gates the reviews API behind an application form. Approval is not
instant — it is usually a few days, sometimes weeks — so start here.

1. Create (or pick) a project at <https://console.cloud.google.com/>.
2. Enable these APIs (APIs & Services → Library):
   - **Google My Business API** (this is the legacy v4 API that serves reviews)
   - **My Business Account Management API**
   - **My Business Business Information API**
   - "Google My Business API" will not appear in the Library until access is
     granted — that is expected. Enable the other two now.
3. Fill in the access request:
   <https://developers.google.com/my-business/content/prereqs> → "Request access".
   Use the same Cloud project number. Google emails you when it is approved.

You can do Steps 2–4 below while you wait, but **Sync from Google** will return
*"Business Profile API access is not approved for this project yet"* until the
email arrives. That is the code working correctly, not a bug.

## Step 2 — OAuth consent screen

APIs & Services → **OAuth consent screen**:

- User type **External**, publishing status can stay **Testing**.
- Add the Google account that manages the Business Profile as a **Test user**.
- Add the scope `https://www.googleapis.com/auth/business.manage`.

## Step 3 — OAuth client

APIs & Services → **Credentials** → Create credentials → **OAuth client ID**:

- Application type: **Desktop app** (name it anything).
- Create, then copy the **Client ID** and **Client secret** into `backend/.env`:

  ```
  GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=xxxxxxxx
  ```

  > Prefer a "Web application" client? That works too — add
  > `http://localhost:4599/oauth2callback` as an authorised redirect URI
  > (or set `GOOGLE_OAUTH_PORT` and match it).

## Step 4 — Get the refresh token and the ids

From `backend/`:

```
npm run google:auth -- --locations
```

- A browser tab opens Google's sign-in. Sign in as the account that **manages
  the Business Profile** and approve. (If you see "Google hasn't verified this
  app", that is the Testing-mode consent screen — continue.)
- The script catches the redirect, prints `GOOGLE_REFRESH_TOKEN`, then lists
  every business account and location that account manages.
- If there is exactly one location, it prints a ready-to-paste block:

  ```
  --- paste into backend/.env ---
  GOOGLE_REFRESH_TOKEN=1//0g...
  GOOGLE_BUSINESS_ACCOUNT_ID=1234567890
  GOOGLE_BUSINESS_LOCATION_ID=0987654321
  -------------------------------
  ```

Paste those in, restart the backend, and click **Sync from Google**.

> `--locations` needs the Step 1 approval. If it 403s, the refresh token it
> already printed is still good — save that now and re-run `--locations` after
> approval, or read the two ids from the API Explorer once access is granted.

Plain `npm run google:auth` (no `--locations`) only does the sign-in and prints
the refresh token — useful later if the token is ever revoked.

---

## How the pipeline works

```
Google Business Profile
   │  POST /api/reviews/sync   (super admin clicks "Sync from Google")
   ▼
reviews table   ── new rows land as display_status = 'pending'
   │  super admin approves in Portal → Reviews
   ▼
GET /api/reviews/public   ── serves display_status = 'approved' only
   ▼
marketing site testimonials section
```

- The **marketing site never talks to Google.** It only reads approved rows
  from our own backend, so nothing is published that a super admin has not
  chosen.
- Re-syncing is safe: rows upsert on `(source, external_id)`. It refreshes the
  text/rating of an existing review and never flips an approved one back to
  pending or resurrects one that was hidden.
- Manual entries (`source = 'manual'`) are never touched by a sync. The public
  API returns `source` on every row so the site can label a transcribed
  testimonial differently from a verified Google review.

## If a sync fails

The CRM shows a specific message. What each means:

| Message | Fix |
| --- | --- |
| *…is not connected yet* | A `GOOGLE_*` var is unset — the banner lists which. |
| *rejected the saved sign-in* / *refresh token…revoked* | Run `npm run google:auth`, update `GOOGLE_REFRESH_TOKEN`. Refresh tokens die if unused for 6 months or if the consent screen stays in Testing and expires. |
| *rejected the OAuth client* | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` wrong. |
| *access is not approved for this project yet* | Step 1 approval hasn't landed. Wait for the email. |
| *could not find that business location* | `GOOGLE_BUSINESS_ACCOUNT_ID` / `GOOGLE_BUSINESS_LOCATION_ID` wrong — re-run `--locations`. |
| *rate-limiting the sync* | Wait a minute, click again. |

## Production

Set the same five variables in the Render (or host) environment. Never commit
`backend/.env`. `GOOGLE_REFRESH_TOKEN` is a long-lived credential — treat it
like a password; rotate it by re-running `google:auth` if it leaks.
