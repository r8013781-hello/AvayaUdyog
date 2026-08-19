import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// A standalone Vitest config, separate from next.config.mjs — Next.js
// doesn't run the app's tests, this does. Mirrors the root Vite app's
// vite.config.js test block (jsdom, globals, the same setup file pattern).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./setupTests.js",
    globals: true,
    // backend/ has its own test runner (Jest, see backend/package.json) —
    // without this, Vitest's default glob picks up backend/__tests__/*.js
    // too and fails on `jest is not defined`, since that's Jest syntax.
    exclude: ["**/node_modules/**", "backend/**"],
  },
});
