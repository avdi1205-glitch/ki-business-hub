"use client";

import { useState } from "react";

type AffiliateButtonProps = {
  toolId: number;
  toolName: string;
  toolUrl: string;
  articleSlug?: string;
  buttonText?: string;
};

export default function OptimizedAffiliateButton({
  toolId,
  toolName,
  toolUrl,
  articleSlug,
  buttonText = "Jetzt ansehen",
}: AffiliateButtonProps) {
  const [clicked, setClicked] = useState(false);

  const handleClick = async () => {
    // Track the click
    try {
      await fetch("/api/track-affiliate-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateLinkId: toolId,
          articleSlug,
        }),
      });
    } catch (error) {
      console.error("Click tracking failed:", error);
    }

    setClicked(true);
    // Redirect after a short delay
    setTimeout(() => {
      window.open(toolUrl, "_blank");
    }, 200);
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold transition-all ${
        clicked
          ? "bg-green-500/30 text-green-300"
          : "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600"
      }`}
    >
      {clicked ? "✅ Weiterleitung..." : `🔗 ${buttonText} → ${toolName}`}
    </button>
  );
}
