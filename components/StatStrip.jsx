/**
 * The three figures the business has confirmed as accurate.
 *
 * No "use client" — this is static markup, so it costs the page nothing.
 *
 * These values are pinned by __tests__/claims.test.js. They were confirmed by
 * the site owner on 2026-08-23; changing one should take a fresh confirmation
 * rather than an edit here, which is what that test enforces.
 *
 * Kept in one component rather than pasted into each landing page so the three
 * pages can never end up quoting three different numbers.
 */

const STATS = [
  { value: "35+", label: "Years of experience" },
  { value: "700+", label: "Spaces designed" },
  { value: "100%", label: "Client satisfaction" },
];

export default function StatStrip({ className = "" }) {
  return (
    <dl className={`grid grid-cols-3 gap-4 border-y border-line py-10 text-center ${className}`}>
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
  );
}
