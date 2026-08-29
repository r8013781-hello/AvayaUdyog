"use client";

import { Award, Building2, HeartHandshake, ArrowUpRight } from "lucide-react";
import useReveal from "../hooks/useReveal";
import { handleImageError } from "../lib/imageFallback";
import { imageSize } from "../lib/imageDimensions";
import { useContactModal } from "./ContactModalProvider";

const STATS = [
  { value: "35+", label: "Years of experience" },
  { value: "700+", label: "Spaces delivered" },
  { value: "100%", label: "Client satisfaction" },
];

const HIGHLIGHTS = [
  {
    icon: Award,
    title: "A Legacy of Craft",
    text: "Three and a half decades of design leadership, built on trust, taste, and timeless execution.",
  },
  {
    icon: Building2,
    title: "Luxury, Defined",
    text: "Premium residential and commercial interiors with an elegant, function-first approach.",
  },
  {
    icon: HeartHandshake,
    title: "Home-Like Service",
    text: "Warmth, care, and a personal commitment to every client — homely atmosphere, every time.",
  },
];

export default function AboutCompany() {
  const ref = useReveal();
  const openContactModal = useContactModal();

  return (
    <section id="founder" className="section scroll-mt-24 bg-sage-50/50 md:scroll-mt-28">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 bottom-0 h-[26rem] w-[26rem] rounded-full bg-gold/[0.07] blur-[130px]" />
      </div>

      <div ref={ref} className="shell relative">
        <div className="reveal text-center">
          <span className="eyebrow-center">The Founder</span>
          <h2 className="display mt-6 text-[2.6rem] text-ink sm:text-5xl">
            The hand behind
            <br />
            <span className="accent text-sage-600">every signature space.</span>
          </h2>
        </div>

        <div className="mt-16 grid items-start gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          {/* ---------- Portrait: same framed-photograph language as the
              About section above — rounded frame, gold corner brackets,
              caption baked into the gradient. Consistency, not novelty. ---------- */}
          <div className="reveal horizontal relative mx-auto w-full max-w-[26rem] lg:sticky lg:top-28">


            <figure className="relative overflow-hidden rounded-[1.5rem] bg-sage-50 shadow-2xl ring-1 ring-black/5">
              <img
                src="/BISWANATH.jpeg"
                {...imageSize("/BISWANATH.jpeg")}
                alt="Mr. Biswanath Adhikari, Founder & Director of Avaya Udyog"
                className="h-[30rem] w-full object-cover object-top sm:h-[34rem]"
                loading="lazy"
                decoding="async"
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sage-950/85 via-sage-950/15 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-[1.6rem] font-semibold leading-tight text-white">
                  Mr. Biswanath Adhikari
                </p>
                <div className="mt-2.5 h-px w-12 bg-gold-hair" />
                <p className="mt-2.5 text-[0.58rem] font-bold uppercase tracking-label text-gold-light">
                  Founder &amp; Director · Avaya Udyog
                </p>
              </figcaption>
            </figure>
          </div>

          {/* ---------- Copy ---------- */}
          <div>
            <blockquote className="reveal relative">
              <div className="absolute -left-4 top-0 h-full w-1 rounded-full bg-gold/40" aria-hidden="true" />
              <p className="relative pl-6 font-serif text-[1.35rem] font-medium italic leading-[1.6] text-ink-dark sm:text-[1.6rem]">
                Every space we design carries a simple promise — it should feel
                like home the moment you step in, and feel like heirloom for
                years to come.
              </p>
            </blockquote>

            <p
              className="reveal mt-8 text-[1rem] leading-[1.85] text-ink-soft"
              data-reveal-delay="0.1s"
            >
              With over 35 years of industry experience, Mr. Biswanath Adhikari
              has built Avaya Udyog on thoughtful design, exquisite decoration, reliable
              craftsmanship, and a deeply personal approach to every project.
              His guidance shapes every home and commercial space into something
              warm, beautifully styled, and luxurious in equal measure.
            </p>

            {/* Stats */}
            <div className="reveal mt-12 border-t border-sage-200/60 pt-8" data-reveal-delay="0.18s">
              <dl className="grid grid-cols-3 divide-x divide-sage-200/60 text-center">
                {STATS.map((stat) => (
                  <div key={stat.label} className="px-2">
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <span className="block font-display text-[2.2rem] font-semibold leading-none tracking-[-0.03em] text-sage-700">
                        {stat.value}
                      </span>
                      <span className="mt-2.5 block text-[0.58rem] font-bold uppercase tracking-label text-ink-muted">
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <ul className="mt-11 space-y-3">
              {HIGHLIGHTS.map(({ icon: Icon, title, text }, index) => (
                <li
                  key={title}
                  className="card card-hover reveal group flex items-start gap-4 p-5"
                  data-reveal-delay={`${0.24 + index * 0.08}s`}
                >
                  <span className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-sage-50 text-sage-600 transition-colors duration-500 group-hover:bg-sage-800 group-hover:text-white">
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  <div>
                    <h3 className="font-display text-[1.15rem] font-semibold text-ink">
                      {title}
                    </h3>
                    <p className="mt-1 text-[0.9rem] leading-[1.75] text-ink-muted">
                      {text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={() => openContactModal("founder_cta")}
              className="btn-primary reveal group mt-10"
              data-reveal-delay="0.4s"
            >
              Book a Design Consultation
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
