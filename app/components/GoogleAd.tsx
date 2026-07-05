"use client";

import { useEffect } from "react";
import { isAdSenseEnabled, toAdClientId } from "../../lib/adsense";

type AdSize = "responsive" | "728x90" | "300x250" | "160x600" | "300x600";

interface GoogleAdProps {
  slot: string;
  size?: AdSize;
  className?: string;
}

export default function GoogleAd({
  slot,
  size = "responsive",
  className = "",
}: GoogleAdProps) {
  const adClientId = toAdClientId(process.env.NEXT_PUBLIC_ADSENSE_ID);
  const adsEnabled = isAdSenseEnabled(process.env.NEXT_PUBLIC_ADSENSE_ENABLED);

  useEffect(() => {
    if (!adsEnabled || !adClientId) return;

    try {
      const googleAds = window as Window & {
        adsbygoogle?: Array<Record<string, unknown>>;
      };

      if (!document.getElementById("adsense-loader")) {
        const loader = document.createElement("script");
        loader.id = "adsense-loader";
        loader.async = true;
        loader.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClientId}`;
        loader.crossOrigin = "anonymous";
        document.body.appendChild(loader);
      }

      // Push ads config
      googleAds.adsbygoogle = googleAds.adsbygoogle || [];
      googleAds.adsbygoogle.push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, [adsEnabled, adClientId, slot]);

  if (!adsEnabled || !adClientId) {
    return null;
  }

  const sizeClass = {
    responsive: "w-full",
    "728x90": "w-full max-w-screen-sm",
    "300x250": "w-full max-w-xs",
    "160x600": "w-40",
    "300x600": "w-full max-w-sm",
  }[size];

  const styleSize =
    size === "responsive"
      ? { width: "100%", height: "auto" }
      : { width: "100%", maxWidth: "100%" };

  return (
    <div className={`flex justify-center ${className}`}>
      <ins
        className={`adsbygoogle ${sizeClass}`}
        style={{
          display: "block",
          ...styleSize,
        }}
        data-ad-client={adClientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
