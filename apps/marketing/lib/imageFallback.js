/**
 * Applied to every <img> that points at an external host (Unsplash, etc).
 * If the request is blocked, rate-limited, or just slow to the point of
 * failing, this hides the broken-image icon and lets the element's own
 * background (always a sage/gold tint in this design system) show through
 * instead of a jarring broken glyph.
 */
export function handleImageError(event) {
  event.currentTarget.style.display = "none";
}
