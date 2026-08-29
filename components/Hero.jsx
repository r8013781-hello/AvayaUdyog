"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import HeroSlideshow, { HERO_SLIDES, HERO_SLIDE_MS } from "./HeroSlideshow";
import { useContactModal } from "./ContactModalProvider";

const STATS = [
  { value: "35+", label: "Years of excellence" },
  { value: "700+", label: "Spaces designed" },
  { value: "100%", label: "Client satisfaction" },
];

export default function Hero() {
  const openContactModal = useContactModal();
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const paused = hovering || tabHidden;

  /* Restarting the timeout whenever `active` changes means a manual dash
     click resets the countdown instead of leaving a stale timer running. */
  useEffect(() => {
    if (paused || reducedMotionRef.current) return undefined;
    const timer = setTimeout(() => {
      setActive((i) => (i + 1) % HERO_SLIDES.length);
    }, HERO_SLIDE_MS);
    return () => clearTimeout(timer);
  }, [active, paused]);

  const goTo = useCallback((index) => setActive(index), []);
  const slide = HERO_SLIDES[active];

  const scrollToGallery = () =>
    document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });

  const enter = (delay) => ({ transitionDelay: loaded ? delay : "0ms" });
  const enterClass = `transition-all duration-1000 ease-smooth ${
    loaded ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
  }`;

  return (
    <section
      id="hero"
      className="min-h-hero relative isolate overflow-hidden bg-sage-950"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <HeroSlideshow active={active} className="absolute inset-0 -z-10" />

      <div className="min-h-hero shell relative flex flex-col">
        {/* ---------- Copy, overlaid directly on the photograph ---------- */}
        <div className="flex flex-1 flex-col justify-center pb-14 pt-32 md:pt-36">
          <div className="max-w-2xl">
            <div className={enterClass} style={enter("0ms")}>
              <span
                className="block h-px w-12 bg-gradient-to-r from-gold-light to-transparent"
                aria-hidden="true"
              />
              <h1 className="mt-4 font-display text-[1.15rem] italic font-semibold leading-snug tracking-[0.01em] text-gold-light [text-shadow:0_2px_18px_rgba(0,0,0,0.5)] sm:text-[1.5rem] lg:text-[1.75rem]">
                Luxury Interior Design
              </h1>
            </div>

            <p
              className={`display mt-8 text-[3.2rem] text-white sm:text-[4.4rem] lg:text-[5rem] ${enterClass}`}
              style={enter("90ms")}
            >
              Where every room
              <br />
              <span className="accent text-gold-light">feels like home</span>
            </p>

            <p
              className={`mt-7 max-w-prose2 text-[1.05rem] leading-[1.85] text-white/75 ${enterClass}`}
              style={enter("180ms")}
            >
              For over three decades,{" "}
              <span className="font-semibold text-white">Avaya Udyog</span> has
              shaped residential and commercial spaces with timeless
              craftsmanship, warm homely atmospheres, and a promise of complete
              client satisfaction.
            </p>

            <div
              className={`mt-10 flex flex-wrap items-center gap-3.5 ${enterClass}`}
              style={enter("270ms")}
            >
              <button
                onClick={() => openContactModal("hero_cta")}
                className="btn group bg-white px-7 py-3.5 text-sage-900 shadow-float hover:-translate-y-0.5 hover:bg-gold-soft"
              >
                Book a Consultation
                <ArrowUpRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
              <button
                onClick={scrollToGallery}
                className="btn border border-white/35 bg-white/5 px-7 py-3.5 text-white backdrop-blur-md hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10"
              >
                View Gallery
              </button>
            </div>

            {/* Stats */}
            <div
              className={`mt-12 max-w-lg ${enterClass}`}
              style={enter("400ms")}
            >
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gold-light/70 to-transparent" />
              <dl className="grid grid-cols-3 gap-4 pt-7">
                {STATS.map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <span className="block font-display text-[2.4rem] font-semibold leading-none tracking-[-0.03em] text-white">
                        {stat.value}
                      </span>
                      <span className="mt-2.5 block text-[0.6rem] font-bold uppercase tracking-label text-white/55">
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* ---------- Bottom ribbon: what's on screen, and how to skip it ---------- */}
        <div className="flex flex-col gap-6 pb-8 md:pb-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div
              key={slide.id}
              style={{ animation: "fade-in-soft 600ms ease-smooth both" }}
            >
              <p className="text-[0.58rem] font-bold uppercase tracking-label text-gold-light">
                {slide.eyebrow}
              </p>
              <p className="mt-1.5 font-display text-[1.1rem] font-medium text-white/90">
                {slide.title}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:w-64">
              {HERO_SLIDES.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Show slide ${index + 1}: ${item.eyebrow}`}
                  aria-current={index === active}
                  className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/20"
                >
                  <span
                    className={`absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white ${
                      index < active
                        ? "scale-x-100"
                        : index > active
                          ? "scale-x-0"
                          : ""
                    }`}
                    style={
                      index === active
                        ? reducedMotionRef.current
                          ? { transform: "scaleX(1)" }
                          : {
                              animation: `grow-x ${HERO_SLIDE_MS}ms linear forwards`,
                              animationPlayState: paused ? "paused" : "running",
                            }
                        : undefined
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={scrollToGallery}
            className="group mx-auto hidden flex-col items-center gap-2.5 lg:flex"
            aria-label="Scroll to gallery"
          >
            <span className="text-[0.56rem] font-bold uppercase tracking-wider2 text-white/50 transition-colors group-hover:text-white">
              Explore
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/70 transition-all duration-300 group-hover:border-white group-hover:text-white">
              <ArrowDown size={15} className="animate-float-soft" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
