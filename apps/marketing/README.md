# Avaya Udyog — Marketing Site

The public marketing site (`avayaudyog.com`), migrated from the root Vite
SPA to Next.js App Router with static export. This app is independently
deployable from the CRM/portal (which stays exactly where it is, in the
repo root — see `../../` and the migration report for the full context).

## Why this exists

The old Vite app was client-rendered only (CSR): the HTML Google and other
crawlers first receive is an empty `<div id="root">`, with all real content
injected after the JS bundle downloads and executes. This app fixes that —
every route is static HTML at build time (`output: 'export'` in
`next.config.mjs`), so `curl`ing any page returns complete, crawlable
content with zero JS execution required.

## What's NOT here

The CRM (leads, quotations, PDF export, employee auth, admin panel) is a
separate application and was deliberately **not** migrated — see the
migration report for the full reasoning. Nothing in this app imports
`framer-motion`, `jspdf`, `html2canvas`, or any CRM authentication code.

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
npm test
```
