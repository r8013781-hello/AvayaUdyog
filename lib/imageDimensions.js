/**
 * Intrinsic pixel dimensions of every image in public/.
 *
 * ── Why a lookup table rather than attributes typed inline ────────────────
 * Nine gallery entries, four hero slides and four service images are declared
 * as data objects, not as JSX. Adding `width`/`height` to each entry by hand
 * means eighteen pairs of numbers that nobody can verify by reading, and that
 * silently go wrong the first time an image is re-exported at a new size — a
 * wrong pair is worse than no pair, because the browser reserves the wrong box
 * and CLS gets worse rather than better.
 *
 * This table is checked against the real files on disk by
 * __tests__/imageDimensions.test.js, which reads the actual WebP/JPEG headers.
 * Re-export an image at a different size and the test fails immediately.
 *
 * ── Why this does not move any layout ─────────────────────────────────────
 * Every consuming element already fixes BOTH axes in CSS (`h-72 w-full`,
 * `h-[24rem] w-full`, `absolute inset-0 h-full w-full`), and CSS beats the
 * presentation attributes. So the rendered geometry is byte-for-byte what it
 * was; what the attributes add is the aspect ratio the browser can use to
 * reserve the box BEFORE the stylesheet and the image have arrived.
 *
 * The one element whose height is not pinned in CSS is the gallery lightbox
 * (`max-h-[70vh] w-full object-contain`). There the attributes are a genuine
 * CLS improvement, not merely a hint: today that image has no reserved height
 * at all and the dialog resizes under the pointer when it loads.
 */
const DIMENSIONS = {
  "/BISWANATH.jpeg": { width: 629, height: 841 },
  "/about/living-space.webp": { width: 1100, height: 733 },

  "/gallery/g1-1505693416388.webp": { width: 900, height: 600 },
  "/gallery/g2-1494526585095.webp": { width: 900, height: 600 },
  "/gallery/g3-1540518614846.webp": { width: 900, height: 609 },
  "/gallery/g4-1484154218962.webp": { width: 900, height: 598 },
  "/gallery/g5-1556911220.webp": { width: 900, height: 539 },
  "/gallery/g6-1497366754035.webp": { width: 900, height: 601 },
  "/gallery/g7-1524758631624.webp": { width: 900, height: 600 },
  "/gallery/g8-dining-refined.webp": { width: 900, height: 506 },
  "/gallery/g9-1560448204.webp": { width: 900, height: 600 },

  "/hero/bath.webp": { width: 1600, height: 1067 },
  "/hero/bedroom.webp": { width: 1400, height: 1400 },
  "/hero/exterior.webp": { width: 1600, height: 1067 },
  "/hero/living.webp": { width: 1600, height: 844 },

  "/services/s1-residential.webp": { width: 1400, height: 1050 },
  "/services/s2-commercial.webp": { width: 1400, height: 935 },
  "/services/s3-consultation.webp": { width: 1400, height: 788 },
  "/services/s4-execution.webp": { width: 1400, height: 933 },
};

/**
 * Spread straight onto an <img>: `<img src={src} {...imageSize(src)} />`.
 *
 * Returns an empty object for an unknown path rather than throwing or
 * guessing. A missing pair costs the browser a hint; an invented one costs it
 * a correct layout, so silence is the right failure.
 */
export function imageSize(src) {
  return DIMENSIONS[src] ?? {};
}

export const IMAGE_DIMENSIONS = DIMENSIONS;
