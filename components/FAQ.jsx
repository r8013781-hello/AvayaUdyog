"use client";

import { Plus } from "lucide-react";
import useReveal from "../hooks/useReveal";
import { FAQS } from "../lib/faqs";

/**
 * Rendered as native <details>/<summary>: the open/closed state, keyboard
 * behaviour and screen-reader semantics all come from the browser, so there
 * is no accordion state to write or get wrong. Content lives in lib/faqs.js,
 * shared with the page's FAQPage JSON-LD.
 */
export default function FAQ() {
  const ref = useReveal();

  return (
    <section id="faq" className="section">
      <div ref={ref} className="shell relative">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="reveal lg:sticky lg:top-32 lg:self-start">
            <span className="eyebrow">Questions</span>
            <h2 className="display mt-6 text-[2.6rem] text-ink sm:text-[3rem]">
              Before you
              <br />
              <span className="accent text-sage-600">get in touch.</span>
            </h2>
            <p className="mt-6 max-w-sm text-[1.02rem] leading-[1.85] text-ink-soft">
              The things people usually want to know first. If yours isn&apos;t here,
              ask — a straight answer costs nothing.
            </p>
            <a
              href="tel:+917980640714"
              className="mt-8 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-sage-700 underline underline-offset-4 transition-colors hover:text-sage-900"
            >
              +91 79806 40714
            </a>
          </div>

          {/* Not a <dl>: <details> is not a permitted child of a description
              list, and the question/answer relationship is already carried by
              <summary> and its disclosure semantics. */}
          <div className="reveal divide-y divide-line border-y border-line" data-reveal-delay="0.12s">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-[1.12rem] font-semibold leading-snug text-ink transition-colors group-hover:text-sage-700 sm:text-[1.2rem]">
                    {q}
                  </h3>
                  <span
                    className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-line-strong text-sage-600 transition-all duration-300 group-open:rotate-45 group-open:border-sage-400 group-open:bg-sage-50"
                    aria-hidden="true"
                  >
                    <Plus size={14} />
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 pr-12 text-[0.95rem] leading-[1.85] text-ink-muted">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
