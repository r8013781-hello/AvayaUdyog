# Security headers — what is in the repo, and what must be done on the host

## Confirmed hosting topology

Measured against production on 2026-08-24 (`curl -I https://avayaudyog.com/`):

```
server: cloudflare
cf-ray: a2fce0c2fa1017b4-MAA
rndr-id: 433e9081-6f26-4f6a      <- Render is the origin
cf-cache-status: HIT
x-content-type-options: nosniff  <- the ONLY security header currently set
```

So the stack is **Render (origin) behind a Cloudflare proxy**. That settles two
things that would otherwise be guesswork:

- **This is not Cloudflare Pages.** Cloudflare is proxying, not building, so
  `public/_headers` will **not** be read by anything. It ships as the canonical
  written record of the intended policy; it does nothing on its own.
- **Both layers are available.** Either Render's Headers setting or a
  Cloudflare Transform Rule will work. Cloudflare is the better choice here —
  it applies at the edge to cached responses too (`cf-cache-status: HIT` above
  shows responses are being served from Cloudflare's cache without reaching
  Render at all, so an origin-only header would be missing on cache hits until
  the cache turns over).

**Recommendation: set them as Cloudflare Transform Rules.**

Current state of the five headers in production: `X-Content-Type-Options` is
present. `Strict-Transport-Security`, `X-Frame-Options`, `Referrer-Policy`,
`Permissions-Policy` and any CSP are **all absent**.

## Summary

| Header | Status | Where it has to be applied |
|---|---|---|
| `Strict-Transport-Security` | Written, **not active** | Host |
| `X-Frame-Options` | Written, **not active** | Host |
| `Referrer-Policy` | Written, **not active** | Host |
| `Permissions-Policy` | Written, **not active** | Host |
| `X-Content-Type-Options` | **Already live** | — |
| `Content-Security-Policy` | Written as **Report-Only**, **not active** | Host |

Every one of these is a **host-side change**. Nothing in this repository can turn
them on, and the sections below say exactly why, and exactly what to click.

## Why the app cannot set these itself

Three independent reasons, all of them hard blockers:

1. **`next.config.mjs` sets `output: "export"`.** Next's `headers()` config key
   is explicitly unsupported under static export — it requires a Node server to
   attach headers at request time, and there is not one. Adding a `headers()`
   block would build without complaint and do nothing, which is worse than not
   adding it.
2. **There is no middleware.** Middleware is also unsupported under `export`.
3. **The output is plain files.** `out/` is HTML, CSS, JS and images. A file has
   no response headers; only the thing serving it does.

So the deliverable here is a correct, verified policy plus the exact host
configuration to apply it — not code that pretends to.

## What IS in the repo

`public/_headers` — the Cloudflare Pages / Netlify header format. `next build`
copies `public/` verbatim, so it lands at `out/_headers` on every build.

**For this deployment it is inert** — the origin is Render, which does not read
`_headers`, and Cloudflare is proxying rather than building. Keep it as the
single canonical source of the intended policy: copy the values out of it into
Cloudflare (or Render) and keep the two in step. It would become live
automatically if the site were ever moved to Cloudflare Pages or Netlify.

Read the comments in that file before changing anything; they record why each
CSP source is present.

## Cloudflare Transform Rules — the recommended route

Confirmed to be in the request path (see the topology section above).
Cloudflare adds the headers at the edge without touching the origin, and
crucially applies them to cached responses that never reach Render:
**Rules → Transform Rules → Modify Response Header → Create rule**, matching
`hostname eq "avayaudyog.com"`, with one *Set static* action per header above.

Two cautions:

- **Do not set the same header in both places.** Cloudflare *appends* by
  default, and two `Strict-Transport-Security` values in one response is
  undefined behaviour. Pick one layer and keep it there.
- **HSTS has its own Cloudflare toggle** (SSL/TLS → Edge Certificates → HTTP
  Strict Transport Security). Use either that or a Transform Rule, not both.

## Alternative: Render (Static Site)

Confirmed to be the origin. Render does not read `_headers`. Note that headers
set here are attached by the origin, so they are absent from any response
Cloudflare serves out of its own cache until that cache turns over — which is
the main reason the Cloudflare route above is preferred. Two options.

### Option A — dashboard

Render Dashboard → the static site → **Settings** → **Headers** → **Add
Header**. One entry per row; `Path` is `/*` for all of them.

| Path | Name | Value |
|---|---|---|
| `/*` | `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |
| `/*` | `X-Frame-Options` | `DENY` |
| `/*` | `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `/*` | `X-Content-Type-Options` | `nosniff` |
| `/*` | `Permissions-Policy` | `accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), usb=(), xr-spatial-tracking=()` |
| `/*` | `Content-Security-Policy-Report-Only` | *(the single-line value from `public/_headers`)* |

### Option B — `render.yaml`

Not committed here on purpose: adding an Infrastructure-as-Code file to a
service that is currently dashboard-managed makes the YAML authoritative for
**every** setting, and anything not restated in it can be reset — including the
build command, the publish directory, the custom domain and the environment
variables. That is a deploy-breaking side effect from a headers change, so it
is a decision for whoever owns the Render account, not a default.

If you do adopt it, the headers block is:

```yaml
services:
  - type: web
    runtime: static
    name: avaya-udyog
    buildCommand: npm ci && npm run build
    staticPublishPath: ./out
    envVars:
      # Required. The build now FAILS without it rather than silently
      # baking in http://localhost:3001/api — see lib/apiConfig.js.
      - key: NEXT_PUBLIC_API_BASE_URL
        value: https://avayaudyog.onrender.com/api
      - key: NEXT_PUBLIC_GA_MEASUREMENT_ID
        value: G-G6L9SPDM1P
    headers:
      - path: /*
        name: Strict-Transport-Security
        value: max-age=63072000; includeSubDomains
      - path: /*
        name: X-Frame-Options
        value: DENY
      - path: /*
        name: Referrer-Policy
        value: strict-origin-when-cross-origin
      - path: /*
        name: X-Content-Type-Options
        value: nosniff
      - path: /*
        name: Permissions-Policy
        value: "accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), usb=(), xr-spatial-tracking=()"
      # Value omitted for width — copy the single line from public/_headers.
      - path: /*
        name: Content-Security-Policy-Report-Only
        value: "…"
```

**Do not let this file replace existing redirects.** A `render.yaml` with a
`routes:` block replaces the dashboard's redirect rules wholesale. The old
keyword URLs (`/interior-designer-kolkata` and siblings) are 301s that must keep
working; if they are configured in the Render dashboard, they must be restated
in the YAML or they disappear.

## The CSP is Report-Only, deliberately

An enforced CSP that is 95% right takes down the enquiry form, and the failure
is invisible in a build: it happens in the visitor's browser, on production,
and nothing is logged anywhere you look.

So the policy ships in `Content-Security-Policy-Report-Only`, which evaluates
every rule and reports violations while **blocking nothing**.

### Promoting it to enforcing

1. Deploy it Report-Only.
2. With the browser console open, exercise: the homepage, a service page, an
   insights article, `/process`, the enquiry drawer (including an actual
   submission), the WhatsApp button, and `/portal` (log in, load a lead, and
   generate a quotation PDF — jsPDF is the least predictable consumer here).
3. Leave it for a week of real traffic. Mobile browsers, extensions and
   in-app webviews surface violations that a desktop pass never will.
4. Only if nothing is reported, rename the header to
   `Content-Security-Policy`.

### What was checked, and what to re-check when things change

Verified against the built `out/` directory:

- **Google Fonts is not used.** `app/fonts.js` self-hosts via `next/font`; the
  build emits `.woff2` under `/_next/static/media/`. There is no request to
  `fonts.googleapis.com` or `fonts.gstatic.com`, so `font-src 'self'` is
  correct and adding those hosts would be an unnecessary allowance.
- **GA4** loads from `www.googletagmanager.com` and posts to the
  `google-analytics.com` / `analytics.google.com` hosts. Both are allowed.
- **WhatsApp** needs no CSP entry: `wa.me` is a link the visitor clicks, and
  top-level navigation is not restricted by any directive in this policy.
- **`'unsafe-inline'` in `script-src` is unavoidable.** Static export has no
  server to mint a per-request nonce, and Next's hydration payload is inline.
  This is the single largest weakness in the policy and it is a property of the
  hosting model, not of this configuration.

Re-check the policy whenever:

- **`NEXT_PUBLIC_API_BASE_URL` changes.** `connect-src` names
  `https://avayaudyog.onrender.com` explicitly. Change one without the other
  and every enquiry submission fails with no server-side trace.
- **Google Ads is switched on.** The Ads hosts are already allowed, so this
  should be a no-op — confirm rather than assume.
- **Any third-party script is added** (chat widget, heatmap, pixel). Each one
  needs its own `script-src` and usually `connect-src` entry.

## What is explicitly NOT changed

- No redirect, rewrite or routing rule.
- No cache-control change.
- No change to GA4, UTM/GCLID capture, the CRM API, or `/portal`.
- `preload` is **not** on the HSTS header. Submitting to the preload list is
  effectively irreversible and needs a deliberate decision, not a default.
