/** @type {import('next').NextConfig} */
const nextConfig = {
  // Verification builds can be pointed at a separate directory so they never
  // clobber the .next/ a running `next dev` is using — deleting that out from
  // under a dev server leaves it serving 500s until it is restarted.
  //   NEXT_DIST_DIR=.next-verify npm run build
  //
  // Note it moves the STATIC EXPORT too: with distDir set, the exported HTML
  // lands inside that directory rather than in out/. Deploys leave the
  // variable unset, so the publish path stays out/ exactly as the host
  // expects — this is a local-verification switch only.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // Static export: every route is written to disk as real HTML at build
  // time. No Node server, no SSR runtime, no middleware, no ISR — the
  // output directory is plain static files, deployable anywhere.
  output: "export",

  // next/image's built-in optimizer needs a running server to resize
  // images on request, which static export doesn't have. The site's
  // WebP assets are already pre-sized/compressed, so `unoptimized` keeps
  // next/image's markup benefits (explicit width/height, lazy loading)
  // without requiring an image server.
  images: {
    unoptimized: true,
  },

  // Match the current production host, which serves at the domain root
  // with no sub-path.
  trailingSlash: false,
};

export default nextConfig;
