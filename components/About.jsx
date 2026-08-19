"use client";

import { PenTool, Home, Sparkles, ArrowUpRight } from "lucide-react";
import useReveal from "../hooks/useReveal";
import { handleImageError } from "../lib/imageFallback";
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
    <section id="about" className="section bg-canvas">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-sage-100/70 blur-[130px]" />
      </div>

      <div ref={ref} className="shell relative">
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          {/* ---------- Image ---------- */}
          <div className="reveal relative order-2 lg:order-1">
            <div className="relative">
              {/* Corner brackets — a drafting detail, in gold. */}
              <span
                className="absolute -left-4 -top-4 h-24 w-24 border-l border-t border-gold/45"
                aria-hidden="true"
              />
              <span
                className="absolute -bottom-4 -right-4 h-24 w-24 border-b border-r border-gold/45"
                aria-hidden="true"
              />

              <figure className="relative overflow-hidden rounded-[2rem] bg-sage-100 shadow-lift">
                <img
                  src="/about/living-space.webp"
                  alt="A refined modern living space designed by Avaya Udyog"
                  loading="lazy"
                  decoding="async"
                  onError={handleImageError}
                  className="h-[30rem] w-full object-cover transition-transform duration-[1200ms] ease-smooth hover:scale-[1.04] lg:h-[34rem]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sage-950/40 via-transparent to-transparent" />
                <figcaption className="absolute inset-x-5 bottom-5">
                  <span className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/15 px-4 py-2 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-light" />
                    <span className="text-[0.6rem] font-bold uppercase tracking-label text-white">
                      Est. with a legacy
                    </span>
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>

          {/* ---------- Copy ---------- */}
          <div className="order-1 lg:order-2">
            <span className="eyebrow reveal">About Avaya Udyog</span>

            <h2
              className="display reveal mt-6 text-[2.6rem] text-ink sm:text-5xl"
              data-reveal-delay="0.08s"
            >
              Where vision meets
              <br />
              <span className="accent text-sage-600">craftsmanship.</span>
            </h2>

            <p
              className="reveal mt-6 max-w-prose2 text-[1.02rem] leading-[1.85] text-ink-soft"
              data-reveal-delay="0.16s"
            >
              For over three decades, Avaya Udyog has been at the forefront of
              innovative interior design — combining meticulous planning,
              premium materials, and expressive detailing to create spaces that
              feel grand, warm, and deeply personal.
            </p>

            {/* Principles as a hairline-divided list rather than stacked cards. */}
            <ul className="mt-11 divide-y divide-line border-y border-line">
              {PRINCIPLES.map(({ icon: Icon, title, text }, index) => (
                <li
                  key={title}
                  className="reveal group flex items-start gap-5 py-6 transition-colors duration-500"
                  data-reveal-delay={`${0.22 + index * 0.09}s`}
                >
                  <span className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-line-strong bg-sage-50 text-sage-600 transition-all duration-500 ease-smooth group-hover:border-gold/40 group-hover:bg-white group-hover:text-sage-700">
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  <div>
                    <h3 className="font-display text-[1.28rem] font-semibold text-ink">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-[0.92rem] leading-[1.8] text-ink-muted">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={openContactModal}
              className="reveal group mt-10 inline-flex items-center gap-2.5 text-[0.78rem] font-bold uppercase tracking-label text-sage-700 transition-colors hover:text-sage-900"
              data-reveal-delay="0.5s"
            >
              Know more about us
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line-strong transition-all duration-300 group-hover:border-sage-400 group-hover:bg-sage-50">
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
