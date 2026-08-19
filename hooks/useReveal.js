"use client";

import { useEffect, useRef } from "react";

/**
 * Adds .is-visible to elements with .reveal when they enter the viewport.
 * Attach the returned ref to a section/container; child elements with
 * .reveal (optionally with a style="--reveal-delay: 0.15s") animate in.
 */
export default function useReveal() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const targets = root.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );

    targets.forEach((el) => {
      const delay = el.dataset.revealDelay;
      if (delay) el.style.transitionDelay = delay;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return rootRef;
}
