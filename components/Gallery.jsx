"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Heart, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import useReveal from "../hooks/useReveal";
import { handleImageError } from "../lib/imageFallback";
import { imageSize } from "../lib/imageDimensions";
import { IMAGES } from "../lib/galleryImages";

const FAVORITES_KEY = "gallery-favorites";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "residential", label: "Residential" },
  { id: "commercial", label: "Commercial" },
];


/* Editorial rhythm: every fourth tile runs wide. `grid-flow-dense` backfills
   the gaps a wide tile would otherwise leave at the end of a row. */
const spanFor = (index) => (index % 4 === 0 ? "sm:col-span-2" : "");

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleLimit, setVisibleLimit] = useState(6);
  const ref = useReveal([activeCategory, visibleLimit]);
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

  const filteredImages = useMemo(
    () =>
      activeCategory === "all"
        ? IMAGES
        : IMAGES.filter((img) => img.category === activeCategory),
    [activeCategory],
  );

  const visibleImages = useMemo(() => filteredImages.slice(0, visibleLimit), [filteredImages, visibleLimit]);

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
                  onClick={() => { setActiveCategory(cat.id); setVisibleLimit(6); }}
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

        <div className="reveal mt-20 flex justify-center">
          <p className="max-w-xl text-center text-lg font-medium leading-relaxed text-ink-dark">
            Every space we design is custom-tailored to our clients&apos; unique vision and lifestyle.
          </p>
        </div>
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
