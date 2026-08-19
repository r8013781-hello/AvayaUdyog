import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    globals: true,
    // apps/** is excluded because it holds independently-dependencied
    // sibling apps (the Next.js marketing site) — without this, Vitest's
    // default test glob picks up their *.test.jsx files too and runs them
    // against this project's React instance instead of theirs, which
    // produces real (if confusing) failures, not a true regression here.
    exclude: ['**/node_modules/**', 'backend/**', 'apps/**'],
  },
})
