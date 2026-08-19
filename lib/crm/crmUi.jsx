import React from "react";

export const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export const stageClasses = {
  New: "bg-blue-50 text-blue-700 ring-blue-200",
  Qualified: "bg-violet-50 text-violet-700 ring-violet-200",
  Consultation: "bg-amber-50 text-amber-700 ring-amber-200",
  Proposal: "bg-orange-50 text-orange-700 ring-orange-200",
  Enquiry: "bg-blue-50 text-blue-700 ring-blue-200",
  Execution: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Design approval": "bg-sage-100 text-sage-700 ring-sage-200",
  Handover: "bg-teal-50 text-teal-700 ring-teal-200",
  Won: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Lost: "bg-red-50 text-red-700 ring-red-200",
};

export function Badge({ children, type = "New" }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-bold ring-1 ring-inset ${stageClasses[type] || stageClasses.New}`}>{children}</span>;
}

export function Stat({ label, value, hint, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-hair">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[0.62rem] font-bold uppercase tracking-label text-ink-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
        </div>
        <span className="rounded-xl bg-sage-50 p-2.5 text-sage-600"><Icon size={18} /></span>
      </div>
      {hint && <p className="mt-3 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

const AVATAR_HUES = ["bg-sage-100 text-sage-700", "bg-gold-soft text-gold-deep", "bg-blue-50 text-blue-700", "bg-violet-50 text-violet-700", "bg-amber-50 text-amber-700", "bg-teal-50 text-teal-700"];

export function avatarHue(name) {
  const sum = [...(name || "?")].reduce((s, c) => s + c.charCodeAt(0), 0);
  return AVATAR_HUES[sum % AVATAR_HUES.length];
}

export function Avatar({ name, size = 10 }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-semibold ${avatarHue(name)}`}
      style={{ height: `${size * 0.25}rem`, width: `${size * 0.25}rem`, fontSize: size >= 10 ? "0.95rem" : "0.8rem" }}
    >
      {(name || "?").slice(0, 1).toUpperCase()}
    </span>
  );
}
