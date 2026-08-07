import React from "react";
import { Award, Building2, HeartHandshake, ArrowUpRight } from "lucide-react";
import useReveal from "../hooks/useReveal";

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

export default function AboutCompany({ openContactModal }) {
  const ref = useReveal();

  return (
    <section id="founder" className="section bg-sage-50/50">
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
                src={`${import.meta.env.BASE_URL}BISWANATH.jpeg`}
                alt="Mr. Biswanath Adhikari, Founder & Director of Avaya Udyog"
                className="h-[30rem] w-full object-cover object-top sm:h-[34rem]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sage-950/85 via-sage-950/15 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-[1.6rem] font-semibold leading-tight text-white">
                  Shri Biswanath Adhikari
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
              <span
                className="absolute -left-1 -top-6 font-display text-[5rem] leading-none text-gold/25"
                aria-hidden="true"
              >
                &ldquo;
              </span>
              <p className="relative font-display text-[1.5rem] font-medium italic leading-[1.5] text-ink sm:text-[1.75rem]">
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
              has built Avaya Udyog on thoughtful design, reliable
              craftsmanship, and a deeply personal approach to every project.
              His guidance shapes every home and commercial space into something
              warm, functional, and luxurious in equal measure.
            </p>

            {/* Stats — gold hairline above, no box. */}
            <div className="reveal mt-10" data-reveal-delay="0.18s">
              <div className="hair-gold" />
              <dl className="grid grid-cols-3 gap-4 pt-7">
                {STATS.map((stat) => (
                  <div key={stat.label}>
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
              onClick={openContactModal}
              className="btn-primary reveal group mt-10"
              data-reveal-delay="0.4s"
            >
              Work With Our Founder&apos;s Team
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
