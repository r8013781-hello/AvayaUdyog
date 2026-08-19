import "./globals.css";
import { localBusinessSchema } from "../lib/schema";

const SITE_URL = "https://avayaudyog.com";
const TITLE = "Avaya Udyog | Premium Interior Designer in Kolkata";
const DESCRIPTION =
  "Looking for the best interior designer in Kolkata? Avaya Udyog delivers luxury interiors with 35+ years of expertise. Book a free consultation today.";
const OG_IMAGE = `${SITE_URL}/hero/exterior.webp`;

// Ported 1:1 from index.html's <head> — same title/description/canonical/
// OG/Twitter values verified in an earlier audit pass, not rewritten here.
// metadataBase lets every relative URL below (icons, OG image) resolve
// against the real production host instead of wherever the build runs.
export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    type: "website",
    siteName: "Avaya Udyog",
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/`,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  other: {
    "theme-color": "#14271b",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="mask-icon" href="/favicon.svg" color="#2b4f36" />

        {/* Same reasoning as the Vite app: a <link rel="stylesheet"> next to
            the preconnects, not an @import inside globals.css, so the
            browser discovers and fetches the fonts before the CSSOM has to
            parse anything. The App Router hoists <link>/<meta> rendered
            here into the document <head> automatically. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..800;1,9..144,400..700&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..600&display=swap"
          rel="stylesheet"
        />

        {/* Static export still ships a client-rendered slideshow (see
            HeroSlideshow.jsx) — this preload is what lets the browser start
            fetching the first hero image in parallel with the JS bundle
            instead of waiting for it to mount. */}
        <link rel="preload" as="image" href="/hero/exterior.webp" fetchPriority="high" />

        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
      </head>
      {/* Marketing chrome (Navbar/Footer/WhatsappButton/ContactModalProvider)
          lives in app/(marketing)/layout.jsx, not here — this root layout
          is shared by both the marketing site and /portal (the CRM), and
          the CRM has never had that chrome. Keeping it here would bleed
          the marketing navbar/footer/WhatsApp button onto every CRM
          screen, which is exactly the bug this split avoids. */}
      <body className="min-h-screen bg-canvas text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
