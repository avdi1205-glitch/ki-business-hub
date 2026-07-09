"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { hasConsent } from "../../lib/cookie-consent";

export default function AnalyticsScripts({ gaId }: { gaId: string }) {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    setConsentGiven(hasConsent("analytics"));
  }, []);

  if (!consentGiven) return null;

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', {
  'anonymize_ip': true,
  'cookie_flags': 'SameSite=None;Secure'
});`}
      </Script>
    </>
  );
}
