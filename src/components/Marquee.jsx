import React from "react";

/**
 * A quiet band between the hero and the story — restates what the studio does
 * as a slow-scrolling ribbon. Purely decorative, so it is hidden from AT.
 */
const ITEMS = [
  "Residential Interiors",
  "Commercial Spaces",
  "Design Consultation",
  "Turnkey Execution",
  "Bespoke Furniture",
  "Material Curation",
];

function Track() {
  return (
    <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
      {ITEMS.map((item) => (
        <span key={item} className="flex shrink-0 items-center gap-10">
          <span className="whitespace-nowrap font-display text-lg font-medium italic text-sage-700/85">
            {item}
          </span>
          <span className="h-1 w-1 shrink-0 rotate-45 bg-gold/60" />
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div
      className="relative border-y border-line bg-sage-50/60 py-5"
      aria-hidden="true"
    >
      {/* Two identical tracks translating a full width apart — seamless loop. */}
      <div className="fade-x flex overflow-hidden">
        <Track />
        <Track />
      </div>
    </div>
  );
}
