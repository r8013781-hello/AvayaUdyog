"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Heart, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import useReveal from "../hooks/useReveal";
import { handleImageError } from "../lib/imageFallback";
import { imageSize } from "../lib/imageDimensions";

const FAVORITES_KEY = "gallery-favorites";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "residential", label: "Residential" },
  { id: "commercial", label: "Commercial" },
];

// Self-hosted under public/gallery/ — served from the site root under
// static export, same as the Vite app (no basePath configured).
const IMAGES = [
  {
    id: "t1",
    title: "Warm Modern Living Room",
    alt: "Warm modern living room with curated finishes and layered warm lighting",
    category: "residential",
    src: "/gallery/g1-1505693416388.webp",
    meta: "Curated finishes · warm lighting",
  },
  {
    id: "t2",
    title: "Luxury Lounge Styling",
    alt: "Luxury lounge interior styling with layered textures and a contemporary design theme",
    category: "residential",
    src: "/gallery/g2-1494526585095.webp",
    meta: "Layered textures · contemporary",
  },
  {
    id: "t3",
    title: "Calm Bedroom Retreat",
    alt: "Calm bedroom interior with soft neutral tones and inviting natural light",
    category: "residential",
    src: "/gallery/g3-1540518614846.webp",
    meta: "Soft neutrals · inviting light",
  },
  {
    id: "t4",
    title: "Contemporary Bedroom",
    alt: "Contemporary bedroom interior with plush textures and warm wood finishes",
    category: "residential",
    src: "/gallery/g4-1484154218962.webp",
    meta: "Plush textures · warm wood",
  },
  {
    id: "t5",
    title: "Open-Plan Kitchen",
    alt: "Open-plan modular kitchen with a wood island and minimalist cabinetry",
    category: "residential",
    src: "/gallery/g5-1556911220.webp",
    meta: "Wood island · minimalist",
  },
  {
    id: "t6",
    title: "Signature Office Workspace",
    alt: "Modern office workspace interior with natural light and a premium build finish",
    category: "commercial",
    src: "/gallery/g6-1497366754035.webp",
    meta: "Natural light · premium build",
  },
  {
    id: "t7",
    title: "Retail Showroom Experience",
    alt: "Retail showroom interior with an elegant product display and strong brand presence",
    category: "commercial",
    src: "/gallery/g7-1524758631624.webp",
    meta: "Elegant display · strong brand",
  },
  {
    id: "t8",
    title: "Refined Dining Room",
    alt: "Refined dining room interior with statement pendant lighting and gold accents",
    category: "residential",
    src: "/gallery/g8-dining-refined.webp",
    meta: "Statement lighting · gold accents",
  },
  {
    id: "t9",
    title: "Modern Boutique Hotel Lounge",
    alt: "Modern boutique hotel lounge with a bespoke hospitality interior",
    category: "commercial",
    src: "/gallery/g9-1560448204.webp",
    meta: "Hospitality interiors · bespoke",
  },
];

/* Editorial rhythm: every fourth tile runs wide. `grid-flow-dense` backfills
   the gaps a wide tile would otherwise leave at the end of a row. */
const spanFor = (index) => (index % 4 === 0 ? "sm:col-span-2" : "");

export default function Gallery() {
  const ref = useReveal();
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const visibleImages = useMemo(
    () =>
      activeCategory === "all"
        ? IMAGES
        : IMAGES.filter((img) => img.category === activeCategory),
    [activeCategory],
  );

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id],
    );
  };

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const stepLightbox = useCallback((dir) => {
    setLightboxIndex((current) => {
      if (current === null) return current;
      const next = current + dir;
      if (next < 0) return visibleImages.length - 1;
      if (next >= visibleImages.length) return 0;
      return next;
    });
  }, [visibleImages.length]);

  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight") stepLightbox(1);
      if (event.key === "ArrowLeft") stepLightbox(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, closeLightbox, stepLightbox]);

  const active = lightboxIndex !== null ? visibleImages[lightboxIndex] : null;

  return (
    <section id="gallery" className="section scroll-mt-24 bg-canvas md:scroll-mt-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -right-40 top-1/4 h-[30rem] w-[30rem] rounded-full bg-sage-100/60 blur-[140px]" />
      </div>

      <div ref={ref} className="shell relative">
        <div className="reveal text-center">
          <span className="eyebrow-center">Design Gallery</span>
          <h2 className="display mt-6 text-[2.6rem] text-ink sm:text-5xl">
            The interiors{" "}
            <span className="accent text-sage-600">we design.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[0.96rem] leading-[1.85] text-ink-muted">
            A sense of the material palette, lighting and detailing our work is
            built around — every interior we take on is tailored to its people,
            location and budget, with Avaya Udyog&apos;s signature warmth and
            detail.
          </p>
        </div>

        {/* Filters — a segmented pill rail. */}
        <div
          className="reveal mt-11 flex justify-center"
          data-reveal-delay="0.1s"
        >
          <div className="inline-flex gap-1 rounded-full border border-line bg-sage-50/70 p-1.5">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`rounded-full px-6 py-2.5 text-[0.72rem] font-bold uppercase tracking-label transition-all duration-300 ease-smooth ${
                    isActive
                      ? "bg-sage-800 text-white shadow-soft"
                      : "text-ink-muted hover:text-sage-700"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-14 grid grid-flow-dense grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleImages.map((img, index) => {
            const isFavorite = favorites.includes(img.id);
            return (
              <figure
                key={img.id}
                className={`reveal group relative overflow-hidden rounded-[1.5rem] bg-sage-100 shadow-soft transition-all duration-500 ease-smooth hover:shadow-lift ${spanFor(
                  index,
                )}`}
                data-reveal-delay={`${(index % 3) * 0.08}s`}
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="relative block h-full w-full cursor-zoom-in text-left"
                  aria-label={`View ${img.title}`}
                >
                  <img
                    src={img.src}
                    {...imageSize(img.src)}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                    className="h-72 w-full object-cover transition-transform duration-[1100ms] ease-smooth group-hover:scale-[1.06] sm:h-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sage-950/80 via-sage-950/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

                  <span className="absolute left-4 top-4 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white opacity-0 backdrop-blur-md transition-all duration-500 ease-smooth group-hover:translate-y-0 group-hover:opacity-100">
                    <Maximize2 size={14} />
                  </span>

                  <figcaption className="absolute inset-x-0 bottom-0 p-5">
                    <span className="block text-[0.56rem] font-bold uppercase tracking-label text-gold-light">
                      {img.meta}
                    </span>
                    <span className="mt-2 block font-display text-[1.2rem] font-semibold leading-tight text-white">
                      {img.title}
                    </span>
                  </figcaption>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFavorite(img.id)}
                  aria-label={
                    isFavorite
                      ? `Remove ${img.title} from favorites`
                      : `Add ${img.title} to favorites`
                  }
                  aria-pressed={isFavorite}
                  className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                    isFavorite
                      ? "border-gold/60 bg-gold text-sage-950"
                      : "border-white/25 bg-white/15 text-white opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Heart size={15} className={isFavorite ? "fill-current" : ""} />
                </button>
              </figure>
            );
          })}
        </div>

        <p className="reveal mt-14 text-center text-[0.62rem] font-semibold uppercase tracking-label text-ink-faint">
          Full walkthroughs, drawings and material boards are shared during
          consultation.
        </p>
      </div>

      {/* ---------- Lightbox ---------- */}
      {active && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-sage-950/92 p-4 backdrop-blur-md sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-6">
              <div>
                <span className="block text-[0.58rem] font-bold uppercase tracking-label text-gold-light">
                  {active.meta}
                </span>
                <h3 className="mt-1.5 font-display text-2xl font-semibold text-white">
                  {active.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeLightbox}
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/20 text-white transition-all duration-300 hover:rotate-90 hover:border-gold/60 hover:text-gold-light"
                aria-label="Close image viewer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10">
              <img
                src={active.src}
                {...imageSize(active.src)}
                alt={active.title}
                decoding="async"
                onError={handleImageError}
                className="max-h-[70vh] w-full object-contain"
              />
              <button
                type="button"
                onClick={() => stepLightbox(-1)}
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-sage-950/60 text-white backdrop-blur-md transition-colors hover:border-gold/60 hover:text-gold-light"
                aria-label="Previous image"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                type="button"
                onClick={() => stepLightbox(1)}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-sage-950/60 text-white backdrop-blur-md transition-colors hover:border-gold/60 hover:text-gold-light"
                aria-label="Next image"
              >
                <ChevronRight size={19} />
              </button>
            </div>

            <p className="mt-4 text-center text-[0.6rem] font-semibold uppercase tracking-label text-white/40">
              {lightboxIndex + 1} / {visibleImages.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
