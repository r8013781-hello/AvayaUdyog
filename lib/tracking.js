/**
 * GA4 + Google Ads event tracking utilities.
 *
 * Every function is a no-op when gtag.js hasn't loaded (e.g. locally
 * without a GA_MEASUREMENT_ID, or when the script is blocked by an
 * ad-blocker). This means calling code never needs to guard — fire
 * and forget.
 */

function gtag(...args) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

/* ---- Core ---- */

export function trackEvent(name, params = {}) {
  gtag("event", name, params);
}

/* ---- Conversion events ---- */

export function trackPhoneClick(linkLocation) {
  trackEvent("phone_click", { link_location: linkLocation });

  // Fire a Google Ads conversion for phone clicks if configured.
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_CALL_CONVERSION_LABEL;
  if (adsId && label) {
    gtag("event", "conversion", { send_to: `${adsId}/${label}` });
  }
}

export function trackWhatsAppClick(linkLocation) {
  trackEvent("whatsapp_click", { link_location: linkLocation });
}

export function trackEmailClick(linkLocation) {
  trackEvent("email_click", { link_location: linkLocation });
}

export function trackConsultationOpen(triggerSource) {
  trackEvent("consultation_form_open", { trigger_source: triggerSource });
}

export function trackConsultationSubmit(formLocation, extraParams = {}) {
  trackEvent("consultation_form_submit", {
    form_location: formLocation,
    ...extraParams,
  });

  // Fire a Google Ads conversion for form submissions if configured.
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_FORM_CONVERSION_LABEL;
  if (adsId && label) {
    gtag("event", "conversion", { send_to: `${adsId}/${label}` });
  }
}

export function trackConsultationError(formLocation, errorType) {
  trackEvent("consultation_form_error", {
    form_location: formLocation,
    error_type: errorType,
  });
}

export function trackCTAClick(ctaText, ctaSection) {
  trackEvent("cta_click", { cta_text: ctaText, cta_section: ctaSection });
}

/**
 * Records an outbound click to the business's official Google review form.
 * The event intentionally includes only page/CTA context — never customer or
 * review information — because GA4 must not receive personally identifiable
 * data from this flow.
 */
export function trackGoogleReviewClick({ sourceSection, pagePath, ctaType }) {
  trackEvent("google_review_click", {
    source_section: sourceSection,
    page_path: pagePath,
    cta_type: ctaType,
  });
}

export function trackGalleryOpen(projectTitle, projectCategory) {
  trackEvent("gallery_lightbox_open", {
    project_title: projectTitle,
    project_category: projectCategory,
  });
}
