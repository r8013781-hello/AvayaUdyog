"use client";

/* Shared helpers for generateQuotationPdf.js and generateReceiptPdf.js so both
   documents render from the exact same letterhead assets and footer icons —
   see public/quotation-template.jpeg and public/money-reciept-template.jpeg,
   the actual printed forms this business uses. */

const cache = new Map();

/**
 * Fetches a same-origin image from /public and returns its data URL plus
 * aspect ratio, so callers can addImage() it into a jsPDF doc at any size
 * without distorting it. Returns null if the image can't be loaded (e.g.
 * during server-side rendering, where there is no `window`/`Image`).
 */
export async function loadImageAsDataUrl(src) {
  if (typeof window === "undefined") return null;
  if (cache.has(src)) return cache.get(src);

  const promise = new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve({
        dataUrl: canvas.toDataURL("image/jpeg", 0.95),
        aspect: img.naturalWidth / img.naturalHeight,
      });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });

  cache.set(src, promise);
  return promise;
}

/* Simplified handset glyph: a diagonal bar with rounded ends, filled solid —
   reads clearly at footer-icon size without needing an icon font. */
export function drawPhoneIcon(doc, x, y, size, color) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const w = size * 0.85;
  const h = size * 0.36;
  const angle = (-45 * Math.PI) / 180;
  const rotate = ([px, py]) => [
    cx + px * Math.cos(angle) - py * Math.sin(angle),
    cy + px * Math.sin(angle) + py * Math.cos(angle),
  ];
  const corners = [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ].map(rotate);

  doc.setFillColor(...color);
  doc.setDrawColor(...color);
  doc.lines(
    [
      [corners[1][0] - corners[0][0], corners[1][1] - corners[0][1]],
      [corners[2][0] - corners[1][0], corners[2][1] - corners[1][1]],
      [corners[3][0] - corners[2][0], corners[3][1] - corners[2][1]],
      [corners[0][0] - corners[3][0], corners[0][1] - corners[3][1]],
    ],
    corners[0][0],
    corners[0][1],
    [1, 1],
    "F",
    true,
  );
  doc.circle(corners[0][0], corners[0][1], size * 0.16, "F");
  doc.circle(corners[2][0], corners[2][1], size * 0.16, "F");
}

/* Outlined envelope: rectangle plus a chevron flap, matching the red-outline
   mail icon in the printed letterhead's footer. */
export function drawMailIcon(doc, x, y, size, color) {
  const h = size * 0.72;
  doc.setDrawColor(...color);
  doc.setLineWidth(0.8);
  doc.rect(x, y + (size - h) / 2, size, h);
  doc.line(x, y + (size - h) / 2, x + size / 2, y + (size - h) / 2 + h * 0.55);
  doc.line(x + size, y + (size - h) / 2, x + size / 2, y + (size - h) / 2 + h * 0.55);
}

/* Vector ₹ glyph — jsPDF's built-in Helvetica has no rupee glyph (it renders
   as a tofu box), so the money receipt's prominent "₹" mark is hand-drawn
   instead of relying on a font that doesn't have it. */
export function drawRupeeGlyph(doc, x, y, size, color) {
  doc.setDrawColor(...color);
  doc.setLineWidth(size * 0.1);
  const w = size * 0.62;
  doc.line(x, y, x + w, y);
  doc.line(x, y + size * 0.26, x + w, y + size * 0.26);
  doc.line(x, y, x, y + size * 0.26);
  doc.line(x + w * 0.12, y + size * 0.26, x + w * 0.85, y + size);
}

/* Globe: circle with an equator and one meridian ellipse. */
export function drawGlobeIcon(doc, x, y, size, color) {
  const cx = x + size / 2;
  const cy = y + size / 2;
  const r = size / 2;
  doc.setDrawColor(...color);
  doc.setLineWidth(0.7);
  doc.circle(cx, cy, r, "S");
  doc.line(x, cy, x + size, cy);
  doc.ellipse(cx, cy, r * 0.42, r, "S");
}
