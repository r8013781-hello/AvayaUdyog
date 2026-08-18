import React from "react";
import { Star, ShieldCheck } from "lucide-react";
import useReveal from "../hooks/useReveal";

// No stock photos of "clients" here on purpose — a random Unsplash face next
// to a name reads as fabricated social proof. Initials only, always.
const TESTIMONIALS = [
  {
    id: 1,
    name: "Mr. Rakesh Tanwani",
    role: "Homeowner",
    content:
      "Avaya Udyog transformed our apartment into a visionary space. Their meticulous focus and thoughtful design surpassed everything we had hoped for.",
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Business Owner",
    content:
      "The office transformation was executed flawlessly, on schedule and within scope. Our team is energised by the new environment every single day.",
  },
  {
    id: 3,
    name: "Anita Patel",
    role: "Interior Designer",
    content:
      "Collaborating with Avaya Udyog is an absolute delight. The artistry, warmth, and design acumen are genuinely extraordinary.",
  },
];

/**
 * The one deep-green room on the page. Everything else is paper, so this
 * section carries the weight — white cards float on forest.
 */
export default function Testimonials() {
  const ref = useReveal();

  return (
    <section id="testimonials" className="section bg-sage-900">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="absolute left-1/4 -top-20 h-96 w-96 rounded-full bg-sage-500/25 blur-[130px]" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-gold/[0.12] blur-[120px]" />
      </div>

      <div ref={ref} className="shell relative">
        <div className="reveal text-center">
          <span className="eyebrow-center !text-gold-light">
            Client Stories
          </span>
          <h2 className="display mt-6 text-[2.6rem] text-white sm:text-5xl">
            Trusted by the people
            <br />
            <span className="accent text-gold-light">
              who live in our work.
            </span>
          </h2>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <figure
              key={testimonial.id}
              className="reveal group relative flex flex-col rounded-[1.75rem] bg-white p-8 shadow-float transition-transform duration-500 ease-smooth hover:-translate-y-1.5"
              data-reveal-delay={`${index * 0.1}s`}
            >
              <span
                className="absolute right-7 top-4 font-display text-[4rem] leading-none text-sage-900/[0.07]"
                aria-hidden="true"
              >
                &rdquo;
              </span>

              <div className="relative flex gap-1 text-gold">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Star key={star} size={14} className="fill-current" />
                ))}
              </div>

              <blockquote className="relative mt-6 flex-1 text-[0.98rem] leading-[1.85] text-ink-soft">
                {testimonial.content}
              </blockquote>

              <figcaption className="mt-8 flex items-center gap-4 border-t border-line pt-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-100 font-display text-lg text-sage-700 ring-1 ring-line-strong" aria-hidden="true">
                  {testimonial.name[0]}
                </span>
                <div>
                  <p className="font-display text-[1.05rem] font-semibold text-ink">
                    {testimonial.name}
                  </p>
                  <p className="mt-0.5 text-[0.58rem] font-bold uppercase tracking-label text-sage-600">
                    {testimonial.role}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div
          className="reveal mx-auto mt-14 flex max-w-2xl items-center justify-center gap-3.5 rounded-full border border-white/15 bg-white/[0.06] px-7 py-4 backdrop-blur-sm"
          data-reveal-delay="0.2s"
        >
          <ShieldCheck size={18} className="flex-shrink-0 text-gold-light" />
          <p className="text-center text-[0.9rem] leading-[1.7] text-sage-100/80">
            Every client receives the same promise —{" "}
            <span className="font-semibold text-white">
              homely atmosphere, home-like care
            </span>
            , and 100% satisfaction.
          </p>
        </div>
      </div>
    </section>
  );
}
