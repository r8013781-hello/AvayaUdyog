"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Heart, X, ChevronLeft, ChevronRight, Maximize2, Plus, Instagram, ArrowUpRight } from "lucide-react";
import useReveal from "../hooks/useReveal";
import { handleImageError } from "../lib/imageFallback";
import { imageSize } from "../lib/imageDimensions";
import { IMAGES } from "../lib/galleryImages";
import { trackInstagramClick } from "../lib/tracking";

const FAVORITES_KEY = "gallery-favorites";
const PAGE_SIZE = 6;

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "residential", label: "Residential" },
  { id: "commercial", label: "Commercial" },
];


/* Editorial rhythm: one large featured tile per page of results, not a wide
   tile every four — the old "every fourth" rule produced a different number
   of wide tiles depending on how many results a filter returned, which is
   what made the grid look unbalanced rather than designed. A single hero
   tile at the top of each filtered set always reads as a deliberate choice. */
const spanFor = (index) =>
  index === 0 ? "sm:col-span-2 sm:row-span-2" : "";

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);
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
    <section
      id="gallery"
      className="section scroll-mt-16 bg-gradient-to-b from-canvas via-sage-50/40 to-canvas md:scroll-mt-20"
    >
      {/* A flat canvas background behind a photo grid read as an afterthought
          — the same dot-paper + blurred-blob treatment used on the other
          "quiet" sections (Services header, How We Work) instead, since a
          full photo background here would compete with the gallery's own
          images rather than support them. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="dot-paper absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_at_50%_0%,#000,transparent_70%)]" />
        <div className="absolute -right-40 top-1/4 h-[30rem] w-[30rem] rounded-full bg-sage-200/40 blur-[140px]" />
        <div className="absolute -left-32 bottom-0 h-[24rem] w-[24rem] rounded-full bg-gold/[0.14] blur-[130px]" />
      </div>

      <div ref={ref} className="shell relative">
        <div className="reveal text-center">
          <span className="eyebrow-center">Design Gallery</span>
          <h2 className="display display-fluid mt-6 text-ink">
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
          className="reveal mt-11 flex justify-center overflow-x-auto px-1 pb-1"
          data-reveal-delay="0.1s"
        >
          <div className="inline-flex shrink-0 gap-1 rounded-full border border-line bg-white/80 p-1.5 shadow-soft backdrop-blur-sm">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => { setActiveCategory(cat.id); setVisibleLimit(PAGE_SIZE); }}
                  className={`rounded-full px-4 py-2.5 text-[0.8rem] font-bold uppercase tracking-label transition-all duration-300 ease-smooth sm:px-6 sm:text-[0.84rem] ${
                    isActive
                      ? "bg-sage-800 text-white shadow-soft"
                      : "text-ink-muted hover:bg-sage-50 hover:text-sage-700"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:auto-rows-[19rem] sm:grid-cols-2 lg:grid-cols-3">
          {visibleImages.map((img, index) => {
            const isFavorite = favorites.includes(img.id);
            const isHero = index === 0;
            return (
              <figure
                key={img.id}
                className={`reveal group relative h-72 overflow-hidden rounded-[1.5rem] bg-sage-100 shadow-soft transition-all duration-500 ease-smooth hover:shadow-lift sm:h-auto ${spanFor(
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
                    className="h-full w-full object-cover transition-transform duration-[1100ms] ease-smooth group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sage-950/80 via-sage-950/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95" />

                  <span className="absolute left-4 top-4 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full border border-white/25 bg-white/15 text-white opacity-0 backdrop-blur-md transition-all duration-500 ease-smooth group-hover:translate-y-0 group-hover:opacity-100">
                    <Maximize2 size={14} />
                  </span>

                  <figcaption className="absolute inset-x-0 bottom-0 p-5">
                    <span className="block text-[0.7rem] font-bold uppercase tracking-label text-gold-light">
                      {img.meta}
                    </span>
                    <span
                      className={`mt-2 block font-display font-semibold leading-tight text-white ${isHero ? "text-[1.5rem]" : "text-[1.2rem]"}`}
                    >
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

        {/* Only shown once there's actually more to see — hidden as soon as
            a filter's results fit within one page. */}
        {visibleLimit < filteredImages.length && (
          <div className="reveal mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleLimit((n) => n + PAGE_SIZE)}
              className="group inline-flex items-center gap-2 rounded-full border border-line-strong bg-white px-7 py-3 text-[0.8rem] font-bold uppercase tracking-label text-sage-700 shadow-soft transition-all duration-300 hover:border-sage-400 hover:bg-sage-50"
            >
              View more
              <Plus size={14} className="transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>
        )}

        {/* text-ink-dark isn't a real token (see tailwind.config.js's ink
            scale) — it silently fell back to plain black, clashing with
            every deliberately-picked color around it. Framed properly now,
            with the gold hairline device used for closing statements
            elsewhere on the page. */}
        <div className="reveal mt-14 flex flex-col items-center gap-4 text-center">
          <span className="hair-gold w-16" aria-hidden="true" />
          <p className="max-w-xl font-display text-[1.3rem] font-medium leading-relaxed text-ink">
            Every space we design is{" "}
            <span className="text-sage-600">custom-tailored</span> to our
            clients&apos; unique vision and lifestyle.
          </p>
          <a
            href="https://www.instagram.com/avayaudyog/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackInstagramClick("gallery")}
            className="group mt-2 flex w-full max-w-xl items-center gap-4 rounded-[1.5rem] border border-line-strong bg-white p-4 text-left shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-sage-400 hover:shadow-lift sm:p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white shadow-soft">
              <Instagram size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.7rem] font-bold uppercase tracking-label text-sage-600">Follow our latest work</span>
              <span className="mt-1 block font-display text-[1.1rem] font-semibold text-ink">@avayaudyog on Instagram</span>
            </span>
            <ArrowUpRight size={18} className="shrink-0 text-sage-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
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
            <div className="mb-4 flex items-start justify-between gap-3 sm:gap-6">
              <div>
                <span className="block text-[0.72rem] font-bold uppercase tracking-label text-gold-light">
                  {active.meta}
                </span>
                <h3 className="mt-1.5 font-display text-xl font-semibold text-white sm:text-2xl">
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
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-sage-950/60 text-white backdrop-blur-md transition-colors hover:border-gold/60 hover:text-gold-light sm:left-4 sm:h-11 sm:w-11"
                aria-label="Previous image"
              >
                <ChevronLeft size={19} />
              </button>
              <button
                type="button"
                onClick={() => stepLightbox(1)}
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-sage-950/60 text-white backdrop-blur-md transition-colors hover:border-gold/60 hover:text-gold-light sm:right-4 sm:h-11 sm:w-11"
                aria-label="Next image"
              >
                <ChevronRight size={19} />
              </button>
            </div>

            <p className="mt-4 text-center text-[0.74rem] font-semibold uppercase tracking-label text-white/40">
              {lightboxIndex + 1} / {visibleImages.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
