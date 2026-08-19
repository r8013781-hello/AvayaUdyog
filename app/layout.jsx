import "./globals.css";

const SITE_URL = "https://avayaudyog.com";

// Only what's genuinely shared by every route (marketing and /portal
// alike) lives here — icons, manifest, theme-color, fonts. Title,
// description, canonical, Open Graph, Twitter metadata, and the business
// JSON-LD are marketing-specific and live in app/(marketing)/layout.jsx
// instead, so /portal (a sibling route, not a descendant of that layout)
// never inherits them. metadataBase stays here since it's a general
// base-URL setting, not marketing content on its own.
export const metadata = {
  metadataBase: new URL(SITE_URL),
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
            parse anything. Both the marketing site and /portal use these
            fonts, so this stays shared. The App Router hoists <link>/<meta>
            rendered here into the document <head> automatically. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..800;1,9..144,400..700&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..600&display=swap"
          rel="stylesheet"
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
