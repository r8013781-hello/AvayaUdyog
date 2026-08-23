import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";

// Self-hosted at build time by next/font instead of the render-blocking
// <link rel="stylesheet"> to fonts.googleapis.com that used to sit in
// app/layout.jsx. That link cost a DNS lookup + connection + stylesheet
// round-trip to a third-party origin before any text could paint; these
// files are emitted into the static export and served from our own origin.
//
// Both faces expose CSS variables consumed by tailwind.config.js
// (fontFamily.display / fontFamily.sans), so every existing `font-display`
// and `font-sans` utility keeps working untouched.

export const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  // SOFT and WONK are not loaded by default, but globals.css relies on both
  // (`font-variation-settings: "SOFT" 20, "WONK" 1` on headings, "SOFT" 60 on
  // .accent). Omitting them here would silently flatten the display face.
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-display",
});

export const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  variable: "--font-sans",
});
