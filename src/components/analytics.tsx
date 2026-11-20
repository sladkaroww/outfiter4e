"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const CONSENT_KEY = "outfiter-consent";

/**
 * Consent-gated analytics. Set NEXT_PUBLIC_ANALYTICS_SRC (and optionally
 * NEXT_PUBLIC_ANALYTICS_DOMAIN) to a privacy-friendly provider such as
 * Plausible or Umami; nothing loads until the visitor accepts.
 */
export function Analytics() {
  const [enabled, setEnabled] = useState(false);
  const src = process.env.NEXT_PUBLIC_ANALYTICS_SRC;
  const domain = process.env.NEXT_PUBLIC_ANALYTICS_DOMAIN;

  useEffect(() => {
    function read() {
      try {
        setEnabled(localStorage.getItem(CONSENT_KEY) === "granted");
      } catch {
        setEnabled(false);
      }
    }
    read();
    window.addEventListener("outfiter:consent", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("outfiter:consent", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  // Keep SSR output stable: only render the script after consent is known.
  if (!enabled || !src) return null;

  return <Script src={src} data-domain={domain} strategy="afterInteractive" />;
}
