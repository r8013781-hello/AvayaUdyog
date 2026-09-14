"use client";

import Script from "next/script";
import { useEffect } from "react";
import { captureTrackingParams } from "../lib/trackingParams";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

/**
 * Loads the Google Analytics 4 and Google Ads global site tags, and
 * captures UTM / gclid parameters from the URL on first mount.
 *
 * Renders nothing visible — drop it anywhere in the marketing layout.
 * When GA_ID is unset (local dev without credentials) the component
 * returns null and no external scripts are loaded, keeping dev builds
 * fast and free of console noise.
 */
export default function Analytics() {
  useEffect(() => {
    captureTrackingParams();
  }, []);

  if (!GA_ID) return null;

  const adsConfigLine = ADS_ID ? `gtag('config','${ADS_ID}');` : "";

  return (
    <>
      {/* lazyOnload, not afterInteractive: the latter makes next/script emit
          a <link rel="preload"> for the gtag.js request, but the script
          itself still doesn't run until hydration finishes — the gap between
          the two is exactly what trips Chrome's "preloaded but not used
          within a few seconds" warning. lazyOnload skips the preload hint,
          which is fine here since analytics has no first-paint deadline. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="gtag-init" strategy="lazyOnload">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');${adsConfigLine}`}
      </Script>
    </>
  );
}
