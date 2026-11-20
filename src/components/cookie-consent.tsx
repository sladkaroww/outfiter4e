"use client";

import { useEffect, useState } from "react";
import { AppButton } from "./ui";

const CONSENT_KEY = "outfiter-consent";
type Consent = "granted" | "denied" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void Promise.resolve().then(() => {
      try {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (stored === "granted" || stored === "denied") setConsent(stored);
      } catch {
        // Storage blocked: keep the banner available.
      } finally {
        setReady(true);
      }
    });
  }, []);

  function choose(value: Exclude<Consent, null>) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      // Ignore storage failures; analytics stays off.
    }
    setConsent(value);
    window.dispatchEvent(new Event("outfiter:consent"));
  }

  if (!ready || consent) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent" aria-live="polite">
      <p>
        We use essential cookies to keep you signed in. With your permission we also
        collect anonymous usage analytics. Read the <a href="/privacy">privacy policy</a>.
      </p>
      <div>
        <AppButton size="sm" onClick={() => choose("granted")}>Accept all</AppButton>
        <AppButton size="sm" variant="secondary" onClick={() => choose("denied")}>
          Essential only
        </AppButton>
      </div>
    </div>
  );
}
