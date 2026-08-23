"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Star, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import useReveal from "../hooks/useReveal";
import { api } from "../lib/api";
import { trackGoogleReviewClick } from "../lib/tracking";

const GOOGLE_REVIEW_URL = "https://g.page/r/CcWI3rhXDzjpEAE/review";

/**
 * Client reviews, sourced from Google.
 *
 * The site never talks to Google directly. Reviews are synced into the CRM,
 * a super admin approves the ones that should be public, and this component
 * reads only those approved rows from our own backend
 * (GET /api/reviews/public).
 *
 * There is deliberately NO hardcoded fallback: if nothing has been approved,
 * or the request fails, the section renders nothing rather than showing
 * placeholder quotes. A testimonial with no verifiable source is worse than
 * no testimonial.
 *
 * The carousel behaves identically at every screen size — one horizontal,
 * scroll-snapped, swipeable track, never a grid on desktop and a slider on
 * mobile.
 */
export default function Testimonials() {
  const ref = useReveal();
  const trackRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [state, setState] = useState("loading");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .getPublicReviews()
      .then((data) => {
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        setReviews(rows);
        setState(rows.length ? "ready" : "empty");
      })
      .catch(() => {
        if (!cancelled) setState("empty");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  /* Keep the dots/arrows in sync with wherever the user has swiped to. */
  const syncIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-card]");
    if (!card) return;
    const step = card.offsetWidth + 20; /* card + gap-5 */
    setIndex(Math.round(track.scrollLeft / step));
  }, []);

  const scrollTo = (target) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("[data-card]");
    if (!card) return;
    const step = card.offsetWidth + 20;
    const clamped = Math.max(0, Math.min(target, reviews.length - 1));
    track.scrollTo({
      left: clamped * step,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  /* The cards need approved reviews; the "Review us on Google" CTA below
     does not. Gate only the carousel on this so the ask stays reachable
     when nothing has been approved yet, or when the reviews API is
     temporarily unavailable — which is exactly when we most need reviews.
     Still no placeholder quotes: no approved review, no card. */
  const hasReviews = state === "ready" && reviews.length > 0;

  const atStart = index <= 0;
  const atEnd = index >= reviews.length - 1;

  const trackReviewClick = () => {
    trackGoogleReviewClick({
      sourceSection: "testimonials",
      pagePath: window.location.pathname,
      ctaType: "outbound_link",
    });
  };

  return (
    <section id="testimonials" className="section bg-sage-900">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] [background-size:28px_28px]" />
        <div className="absolute left-1/4 -top-20 h-96 w-96 rounded-full bg-sage-500/25 blur-[130px]" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-gold/[0.12] blur-[120px]" />
      </div>

      <div ref={ref} className="shell relative">
        {/* The className on a .reveal element must never change across a
            re-render. useReveal adds .is-visible imperatively and then
            unobserves the node, so React rewriting this attribute later
            strips that class and the element is stuck at opacity 0 forever.
            Anything conditional goes on the inner wrapper instead. */}
        <div className="reveal flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          {/* With cards below, the heading promises what follows. With none,
              that promise has nothing under it and the section reads broken —
              so the empty state says what it actually is: an invitation. Same
              section, honest copy, still no invented quotes. */}
          <div className={hasReviews ? "" : "mx-auto max-w-2xl text-center"}>
            <span className="eyebrow !text-gold-light">Client Stories</span>
            {hasReviews ? (
              <h2 className="display mt-6 text-[2.6rem] text-white sm:text-5xl">
                Trusted by the people
                <br />
                <span className="accent text-gold-light">who live in our work.</span>
              </h2>
            ) : (
              <h2 className="display mt-6 text-[2.6rem] text-white sm:text-5xl">
                The next review here
                <br />
                <span className="accent text-gold-light">could be yours.</span>
              </h2>
            )}
          </div>

          {/* Arrows sit with the heading so the track itself stays edge-to-edge. */}
          {hasReviews && (
          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => scrollTo(index - 1)}
              disabled={atStart}
              aria-label="Previous review"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-all duration-300 hover:border-gold/60 hover:text-gold-light disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollTo(index + 1)}
              disabled={atEnd}
              aria-label="Next review"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-white transition-all duration-300 hover:border-gold/60 hover:text-gold-light disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          )}
        </div>

        {/* One scroll-snapped track at every breakpoint — native swipe on
            touch, arrows/keyboard elsewhere. `no-scrollbar` hides the bar
            without disabling the scrolling itself. */}
        {hasReviews && (
        <div
          ref={trackRef}
          onScroll={syncIndex}
          tabIndex={0}
          role="group"
          aria-label="Client reviews"
          className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 focus:outline-none"
        >
          {reviews.map((review) => (
            <figure
              key={review.id}
              data-card
              className="group relative flex w-[85%] shrink-0 snap-start flex-col rounded-[1.75rem] bg-white p-8 shadow-float sm:w-[47%] lg:w-[31.5%]"
            >
              <span
                className="absolute right-7 top-4 font-display text-[4rem] leading-none text-sage-900/[0.07]"
                aria-hidden="true"
              >
                &rdquo;
              </span>

              {/* Stars only when there is a real rating. A written testimonial
                  has none, and rendering five empty stars for it would read as
                  a zero-star review — worse than showing nothing. */}
              {typeof review.rating === "number" && (
                <div
                  className="relative flex gap-1 text-gold"
                  aria-label={`${review.rating} out of 5 stars`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={14}
                      className={n <= review.rating ? "fill-current" : "opacity-25"}
                    />
                  ))}
                </div>
              )}

              <blockquote
                className={`relative flex-1 text-[0.98rem] leading-[1.85] text-ink-soft ${
                  typeof review.rating === "number" ? "mt-6" : "mt-2"
                }`}
              >
                {review.text}
              </blockquote>

              <figcaption className="mt-8 flex items-center gap-4 border-t border-line pt-6">
                <span
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sage-100 font-display text-lg text-sage-700 ring-1 ring-line-strong"
                  aria-hidden="true"
                >
                  {review.authorName?.[0] || "·"}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-[1.05rem] font-semibold text-ink">
                    {review.authorName}
                  </p>
                  {/* Never label a transcribed testimonial a Google review.
                      "Google review" means Google verified it; these did not
                      come from there, so they say what they actually are. */}
                  <p className="mt-0.5 text-[0.58rem] font-bold uppercase tracking-label text-sage-600">
                    {review.source === "google"
                      ? "Google review"
                      : review.authorRole || "Client testimonial"}
                  </p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
        )}

        {/* Progress dots double as direct navigation. */}
        {hasReviews && reviews.length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {reviews.map((review, i) => (
              <button
                key={review.id}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Go to review ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-7 bg-gold-light" : "w-1.5 bg-white/30 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}

        <div className="reveal mt-10 flex flex-col items-center gap-4 text-center" data-reveal-delay="0.1s">
          <p className="max-w-xl text-[0.94rem] leading-[1.75] text-sage-100/80">
            Worked with Avaya Udyog? We&apos;d value an honest review of your experience.
          </p>
          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={trackReviewClick}
            className="btn border border-gold-light/55 bg-transparent px-6 py-3 text-gold-light transition hover:-translate-y-0.5 hover:border-gold-light hover:bg-white/10"
          >
            Review us on Google
          </a>
        </div>

        <div
          className="reveal mx-auto mt-12 flex max-w-2xl items-center justify-center gap-3.5 rounded-full border border-white/15 bg-white/[0.06] px-7 py-4 backdrop-blur-sm"
          data-reveal-delay="0.2s"
        >
          <ShieldCheck size={18} className="flex-shrink-0 text-gold-light" />
          <p className="text-center text-[0.9rem] leading-[1.7] text-sage-100/80">
            Every client receives the same promise —{" "}
            <span className="font-semibold text-white">homely atmosphere, home-like care</span>, and
            100% satisfaction.
          </p>
        </div>
      </div>
    </section>
  );
}
