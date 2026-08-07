import React from "react";

/* Four distinct spaces, chosen for real light/dark drama rather than a
   uniform bright-and-airy set — a dusk exterior, then three interiors that
   each lean into contrast (gold lamp light, deep navy, dark stone). */
export const HERO_SLIDES = [
  {
    id: "exterior",
    src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80",
    alt: "A signature Avaya Udyog residence at dusk, architecture glowing from within",
    eyebrow: "Signature Residences",
    title: "Where architecture meets atmosphere",
  },
  {
    id: "living",
    src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1920&q=80",
    alt: "A warm, considered living room designed by Avaya Udyog",
    eyebrow: "Living Spaces",
    title: "Warm textures, considered light",
  },
  {
    id: "bedroom",
    src: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1920&q=80",
    alt: "A calm, tailored bedroom in deep navy tones designed by Avaya Udyog",
    eyebrow: "Private Quarters",
    title: "Calm palettes, tailored comfort",
  },
  {
    id: "bath",
    src: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1920&q=80",
    alt: "A bold, dark-material wellness bathroom designed by Avaya Udyog",
    eyebrow: "Wellness Retreats",
    title: "Bold materials, quiet luxury",
  },
];

export const HERO_SLIDE_MS = 6000;

/**
 * Purely the visual background layer — image stack, zoom, contrast grade,
 * and scrim. State (active index, pause, timing) lives in Hero.jsx so the
 * caption/progress UI it renders elsewhere on the page never drifts out of
 * sync with what's actually on screen.
 */
export default function HeroSlideshow({ active, className = "" }) {
  return (
    <div
      className={`overflow-hidden bg-sage-950 ${className}`}
      aria-hidden="true"
    >
      {HERO_SLIDES.map((slide, index) => (
        <img
          key={slide.id}
          src={slide.src}
          alt=""
          loading={index === 0 ? "eager" : "lazy"}
          fetchpriority={index === 0 ? "high" : undefined}
          className={`animate-slow-zoom absolute inset-0 h-full w-full object-cover contrast-125 brightness-95 transition-opacity duration-[1600ms] ease-smooth ${
            index === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Brand-tint wash — ties four different photoshoots to one palette. */}
      <div className="absolute inset-0 bg-sage-950/10 mix-blend-multiply" />

      {/* Multi-directional scrim: dark left for the copy, dark bottom for the
          info ribbon, a soft top vignette so the transparent nav stays legible. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(20,39,27,0.60)_0%,rgba(20,39,27,0.16)_46%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(20,39,27,0.88)_0%,rgba(20,39,27,0.32)_26%,transparent_52%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(20,39,27,0.5)_0%,transparent_20%)]" />
    </div>
  );
}
