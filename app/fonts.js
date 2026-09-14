import { Syne, Manrope } from "next/font/google";

// Self-hosted at build time by next/font instead of the render-blocking
// <link rel="stylesheet"> to fonts.googleapis.com that used to sit in
// app/layout.jsx. That link cost a DNS lookup + connection + stylesheet
// round-trip to a third-party origin before any text could paint; these
// files are emitted into the static export and served from our own origin.
//
// Both faces expose CSS variables consumed by tailwind.config.js
// (fontFamily.display / fontFamily.sans), so every existing `font-display`
// and `font-sans` utility keeps working untouched.
//
// Syne + Manrope replaced Fraunces + Plus Jakarta Sans — chosen to echo the
// sharp, geometric character of the real logo mark (see public/logo-lockup-
// dark-text.png) instead of the softer serif/humanist pairing that shipped
// before. Neither face has an italic cut, unlike Fraunces, so the accent
// treatment in globals.css (`.accent`) switched from an italic weight to a
// bold + gold-tinted one — see the comment there.

export const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

export const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});
