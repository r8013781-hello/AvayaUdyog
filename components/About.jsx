"use client";

import { PenTool, Home, Sparkles, ArrowUpRight } from "lucide-react";
import useReveal from "../hooks/useReveal";
import { handleImageError } from "../lib/imageFallback";
import { imageSize } from "../lib/imageDimensions";
import { useContactModal } from "./ContactModalProvider";

const PRINCIPLES = [
  {
    icon: PenTool,
    title: "Timeless Aesthetics",
    text: "We harmonise inherited design wisdom with contemporary innovation, crafting rooms that stay relevant and captivating for generations.",
  },
  {
    icon: Home,
    title: "Personalised Approach",
    text: "Your story shapes our design. We listen deeply and turn your aspirations and lifestyle into spaces that are practical and breathtaking.",
  },
  {
    icon: Sparkles,
    title: "Uncompromising Quality",
    text: "From premium materials to expert craftsmanship, we hold every project to the most rigorous standards of excellence.",
  },
];

export default function About() {
  const ref = useReveal();
  const openContactModal = useContactModal();

  return (
    <section id="about" className="section relative overflow-hidden bg-sage-950">
      {/* ---------- Background photo ---------- */}
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src="/about/living-space.webp"
          {...imageSize("/about/living-space.webp")}
          alt=""
          loading="lazy"
          decoding="async"
          onError={handleImageError}
          className="h-full w-full object-cover"
        />
        {/* Scrim: near-opaque on the left where the copy sits, sheer on the
            right so the room itself stays legible — same device as the hero,
            tinted sage instead of neutral black to stay on-brand. */}
        <div className="absolute inset-0 bg-gradient-to-r from-sage-950 via-sage-950/85 to-sage-950/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-sage-950/70 via-transparent to-sage-950/20" />
      </div>

      <div ref={ref} className="shell relative">
        <div className="max-w-2xl">
          <span className="eyebrow reveal [&::before]:bg-gold-light/70 text-gold-light">
            About Avaya Udyog
          </span>

          <h2
            className="display reveal mt-6 text-[2rem] text-white sm:text-[2.5rem] md:text-6xl lg:text-[4.25rem]"
            data-reveal-delay="0.08s"
          >
            Where vision meets
            <br />
            <span className="accent text-gold-light">craftsmanship.</span>
          </h2>

          <p
            className="reveal mt-6 max-w-prose2 text-[1.02rem] leading-[1.85] text-white/80"
            data-reveal-delay="0.16s"
          >
            For over three decades, Avaya Udyog has been at the forefront of
            innovative interior design — combining meticulous planning,
            premium materials, and expressive detailing to create spaces that
            feel grand, warm, and deeply personal.
          </p>

          {/* Principles as a hairline-divided list rather than stacked cards. */}
          <ul className="mt-11 divide-y divide-white/15 border-y border-white/15">
            {PRINCIPLES.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className="reveal group flex items-start gap-5 py-6 transition-colors duration-500"
                data-reveal-delay={`${0.22 + index * 0.09}s`}
              >
                <span className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/10 text-gold-light backdrop-blur-sm transition-all duration-500 ease-smooth group-hover:border-gold-light/60 group-hover:bg-white/20">
                  <Icon size={18} strokeWidth={1.6} />
                </span>
                <div>
                  <h3 className="font-display text-[1.28rem] font-semibold text-white">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-[0.92rem] leading-[1.8] text-white/70">
                    {text}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={() => openContactModal("about_cta")}
            className="reveal group mt-10 inline-flex items-center gap-2.5 text-[0.9rem] font-bold uppercase tracking-label text-white transition-colors hover:text-gold-light"
            data-reveal-delay="0.5s"
          >
            Know more about us
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 transition-all duration-300 group-hover:border-gold-light/60 group-hover:bg-white/10">
              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
