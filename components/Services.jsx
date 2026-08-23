"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import useReveal from "../hooks/useReveal";
import { handleImageError } from "../lib/imageFallback";
import { useContactModal } from "./ContactModalProvider";

/* Editorial, alternating image/text blocks rather than an icon-grid of
   cards — the photography carries each service instead of a generic glyph. */
const SERVICES = [
  {
    title: "Residential Interiors",
    tag: "Homes",
    text: "Warm, modern homes shaped around your lifestyle — thoughtful layouts, curated finishes, and elevated details that make every day feel special.",
    src: "/services/s1-residential.webp",
    alt: "Bright, gallery-walled modern living room — residential interior design",
  },
  {
    title: "Commercial Spaces",
    tag: "Workplaces",
    text: "Brand-first offices and retail environments designed to impress clients and keep teams inspired, productive, and proud of where they work.",
    src: "/services/s2-commercial.webp",
    alt: "Glass-walled modern office corridor — commercial interior design",
  },
  {
    title: "Design Consultation",
    tag: "Guidance",
    text: "Concept development, material guidance, and clear design direction that turn rough ideas into a refined, buildable vision.",
    src: "/services/s3-consultation.webp",
    alt: "Designer hand-drafting architectural interior plans during a consultation",
  },
  {
    title: "Turnkey Execution",
    tag: "End-to-end",
    text: "From first sketch to final styling, we manage every detail so your project feels effortless from start to finish.",
    src: "/services/s4-execution.webp",
    alt: "An interior project site during turnkey execution",
  },
];

export default function Services() {
  const ref = useReveal();
  const openContactModal = useContactModal();

  return (
    <section id="services" className="section bg-canvas">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="dot-paper absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_50%_0%,#000,transparent_65%)]" />
      </div>

      <div ref={ref} className="shell relative">
        <div className="reveal flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">Our Services</span>
            <h2 className="display mt-6 text-[2.6rem] text-ink sm:text-5xl">
              Crafted for living
              <br />
              <span className="accent text-sage-600">beautifully.</span>
            </h2>
          </div>
          <p className="max-w-xs text-[0.94rem] leading-[1.8] text-ink-muted md:pb-2">
            Every service is delivered with the same promise — homely
            atmosphere, home-like care, and an uncompromising eye for detail.{" "}
            <Link
              href="/interior-designer-kolkata"
              className="font-semibold text-sage-700 underline underline-offset-2 transition-colors hover:text-sage-900"
            >
              See how we work as an interior designer in Kolkata.
            </Link>
          </p>
        </div>

        {/* ---------- Alternating editorial blocks ---------- */}
        <div className="mt-6">
          {SERVICES.map(({ title, tag, text, src, alt }, index) => {
            const reversed = index % 2 === 1;
            return (
              <div
                key={title}
                className="reveal grid items-center gap-10 border-t border-line py-14 first:border-t-0 lg:grid-cols-2 lg:gap-16 lg:py-16"
                data-reveal-delay={`${index * 0.08}s`}
              >
                {/* Image — always first on mobile, alternates sides on desktop. */}
                <figure
                  className={`group relative order-1 overflow-hidden rounded-[1.25rem] bg-sage-100 shadow-soft ${
                    reversed ? "lg:order-2" : "lg:order-1"
                  }`}
                >
                  <img
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                    className="h-[20rem] w-full object-cover transition-transform duration-[1200ms] ease-smooth group-hover:scale-105 sm:h-[24rem] lg:h-[26rem]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sage-950/20 via-transparent to-transparent" />
                </figure>

                {/* Copy */}
                <div
                  className={`order-2 ${reversed ? "lg:order-1 lg:pr-6" : "lg:order-2 lg:pl-6"}`}
                >
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-9 items-center rounded-full border border-line-strong px-3.5 font-display text-[0.8rem] font-semibold text-sage-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[0.62rem] font-bold uppercase tracking-label text-gold-deep">
                      {tag}
                    </span>
                  </div>

                  <h3 className="display mt-6 text-[2rem] leading-[1.1] text-ink sm:text-[2.35rem]">
                    {title}
                  </h3>
                  <p className="mt-4 max-w-md text-[0.98rem] leading-[1.85] text-ink-muted">
                    {text}
                  </p>

                  <button
                    onClick={() => openContactModal("service_cta")}
                    className="group/link mt-7 inline-flex items-center gap-2 text-[0.72rem] font-bold uppercase tracking-label text-sage-700 transition-colors hover:text-sage-900"
                  >
                    <span className="relative">
                      Explore {tag}
                      <span className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-sage-700 transition-transform duration-300 ease-smooth group-hover/link:scale-x-100" />
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-0.5"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ---------- CTA band: the one deep-green moment in this section ---------- */}
        <div className="reveal relative mt-4 overflow-hidden rounded-[2rem] bg-sage-900 px-8 py-12 shadow-lift md:px-14">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.10)_1px,transparent_0)] [background-size:26px_26px]" />
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-sage-500/25 blur-[100px]" />
            <div className="absolute -bottom-24 right-1/4 h-56 w-56 rounded-full bg-gold/[0.14] blur-[90px]" />
          </div>

          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div>
              <h3 className="display text-[2rem] text-white sm:text-[2.4rem]">
                Have a space in mind?{" "}
                <span className="accent text-gold-light">Let&apos;s design it.</span>
              </h3>
              <p className="mt-3 max-w-md text-[0.94rem] leading-[1.8] text-sage-100/75">
                Share your vision with us and receive a personalised
                consultation from our design team.
              </p>
            </div>

            <button
              onClick={() => openContactModal("service_cta")}
              className="btn group shrink-0 bg-white px-7 py-3.5 text-sage-900 shadow-soft hover:-translate-y-0.5 hover:shadow-lift"
            >
              Start Your Project
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
