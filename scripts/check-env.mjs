#!/usr/bin/env node
/**
 * Build-time environment guard. Wired to npm's `prebuild`, so it runs
 * automatically before `npm run build` and there is no way to forget it.
 *
 * ── What it prevents ───────────────────────────────────────────────────────
 * Next inlines NEXT_PUBLIC_* into the static bundle at build time. If the
 * variable is unset on the host, the old code fell back to
 * http://localhost:3001/api and baked that into the output. The deploy
 * succeeded, every page rendered, and the enquiry form posted to the visitor's
 * own machine. No error, no log, no monitor — just every lead lost until
 * somebody happened to test the form.
 *
 * ── Why here rather than inside lib/apiConfig.js ───────────────────────────
 * Two reasons, both concrete:
 *
 *   1. The failure is legible. Throwing from a module that Next evaluates
 *      during prerender produces eighteen "Error occurred prerendering page"
 *      stack traces with the real message buried in each. This prints one
 *      message and exits 1, before Next starts.
 *
 *   2. Nothing ships. A runtime guard would put the loopback regex, the
 *      localhost fallback and both error strings into every visitor's browser,
 *      and would leave "localhost" scattered through out/ where it defeats the
 *      grep that verifies the very thing the guard exists for.
 *
 * The rule itself lives in lib/apiConfig.js and is unit-tested there
 * (__tests__/apiConfig.test.js) — this file is only the place it is enforced,
 * so the two can never disagree.
 */
// CommonJS module — no named ESM exports, hence the default import.
import nextEnv from "@next/env";
import { resolveApiBaseUrl } from "../lib/apiConfig.js";

/**
 * Load .env / .env.local / .env.production exactly as `next build` will.
 *
 * Without this the script sees only the shell environment, and a developer
 * whose .env.local already holds the real backend URL would be blocked by a
 * guard complaining the variable is unset — a false failure, and the fastest
 * possible way to get a guard deleted. Using Next's own loader rather than
 * dotenv means the precedence rules cannot drift from what the build sees.
 *
 * `dev: false` selects the production file order, which is the case being
 * checked.
 */
nextEnv.loadEnvConfig(process.cwd(), false, { info: () => {}, error: console.error });

/**
 * `next build` sets NODE_ENV=production itself, but it does so inside its own
 * process — this script runs before that, so NODE_ENV here is usually
 * undefined. `prebuild` only ever precedes a production build, so that is what
 * is checked.
 */
const NODE_ENV = "production";

try {
  const resolved = resolveApiBaseUrl({ nodeEnv: NODE_ENV });
  console.log(`✓ NEXT_PUBLIC_API_BASE_URL = ${resolved}`);
} catch (error) {
  console.error("\n✗ Production build stopped.\n");
  console.error(`  ${error.message}\n`);
  console.error("  Set it on the host (Render → Environment), or for a local");
  console.error("  production build run one of:\n");
  console.error("    NEXT_PUBLIC_API_BASE_URL=https://avayaudyog.onrender.com/api npm run build");
  console.error("    ALLOW_LOCALHOST_API=true npm run build   # never deploy this output\n");
  process.exit(1);
}

/**
 * Analytics is optional by design — Analytics.jsx renders nothing without it
 * and local builds must stay zero-config. But a production build with no GA4
 * ID is almost always a host that lost the variable, not a deliberate choice,
 * and it is invisible until someone notices a week of missing sessions. Warn,
 * never fail.
 */
if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
  console.warn(
    "⚠ NEXT_PUBLIC_GA_MEASUREMENT_ID is not set — this build will ship with no\n" +
      "  GA4 tag. Intentional for a preview build; almost certainly not for production.",
  );
}
