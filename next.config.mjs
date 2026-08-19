/** @type {import('next').NextConfig} */
const nextConfig = {
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
