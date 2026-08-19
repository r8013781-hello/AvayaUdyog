# Avaya Udyog

One Next.js App Router app, static export, one domain (`avayaudyog.com`):

- **`/`** — the public marketing site.
- **`/portal`** — the employee CRM (`?view=leads`, `?view=customers`,
  `?view=projects`, `?view=quotations`, etc. — same in-app navigation it
  always had). Reuses the existing CRM React components, see
  `components/crm/` and `lib/crm/`.

There is no separate CRM app, no `portal.avayaudyog.com` subdomain, and
no second deployment.

`backend/` is a separate Express + Supabase API, deployed independently,
unchanged by anything in this directory.

## Why the marketing site is static export

Client-side-only rendering means the HTML a crawler first receives is an
empty shell, with all real content injected after the JS bundle downloads
and executes. Static export fixes that — every route (`/`, `/portal`,
and future marketing pages) is real HTML at build time (`output: 'export'`
in `next.config.mjs`), so `curl`ing any of them returns complete,
crawlable content with zero JS execution required.

## Why `/portal` is a route here, not SEO-driven

No SEO reason — the CRM is authenticated and explicitly excluded from
indexing (`robots.txt` disallow + a page-level `noindex`). It's a route
in this same app purely so there's one deployment, one domain, and one
build to maintain. `/portal` is a Client Component; under static export
it's a static shell that mounts and behaves like a normal SPA once JS
loads — same `?view=` navigation, same JWT-in-`localStorage` auth, same
API client the CRM always had.

## Local development

```bash
cp .env.example .env.local   # then fill in real values
npm install
npm run dev                  # http://localhost:3000
```

## Build (static export)

```bash
npm run build
```

Output lands in `out/` — pure static files, deployable to any static host.
No Node server required at runtime.

## Tests

```bash
npx vitest run
```

## Backend

See `backend/README.md` (if present) or `backend/server.js` — a separate
Express API backed by Supabase Postgres, deployed on its own Render
service. Set `NEXT_PUBLIC_API_BASE_URL` to wherever it's reachable.
