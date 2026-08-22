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
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');${adsConfigLine}`}
      </Script>
    </>
  );
}
