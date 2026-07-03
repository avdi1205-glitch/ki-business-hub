"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    try {
      // Push ads config
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, [slot]);

  if (!process.env.NEXT_PUBLIC_ADSENSE_ENABLED) {
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
        data-ad-client={`ca-${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
