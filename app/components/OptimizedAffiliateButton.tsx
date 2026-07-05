"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";

type AffiliateButtonProps = {
  toolId: number;
  toolName: string;
  toolUrl: string;
  articleSlug?: string;
  clickSource?: string;
  buttonText?: string;
};

export default function OptimizedAffiliateButton({
  toolId,
  toolName,
  toolUrl,
  articleSlug,
  clickSource,
  buttonText,
}: AffiliateButtonProps) {
  const locale = useLocale();
  const [clicked, setClicked] = useState(false);
  const [activeTestId, setActiveTestId] = useState<number | null>(null);
  const [assignedVariant, setAssignedVariant] = useState<"A" | "B" | null>(null);
  const [activeText, setActiveText] = useState(buttonText || (locale === "en" ? "View now" : "Jetzt ansehen"));

  const storageKey = useMemo(() => (activeTestId ? `ab-test-${activeTestId}` : null), [activeTestId]);

  useEffect(() => {
    let cancelled = false;

    const loadTest = async () => {
      try {
        const response = await fetch(`/api/ab-testing?affiliateLinkId=${toolId}`);
        const data = await response.json();

        if (!response.ok || !data.success || !data.test || cancelled) {
          return;
        }

        const test = data.test;
        setActiveTestId(test.id);

        const storedVariant = window.localStorage.getItem(`ab-test-${test.id}`) as "A" | "B" | null;
        const variant = storedVariant === "A" || storedVariant === "B"
          ? storedVariant
          : Math.random() >= 0.5
            ? "A"
            : "B";

        window.localStorage.setItem(`ab-test-${test.id}`, variant);
        setAssignedVariant(variant);
        setActiveText(variant === "A" ? test.variantA : test.variantB);

        await fetch("/api/ab-testing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "track-interaction", testId: test.id, variant, type: "impression" }),
          keepalive: true,
        });
      } catch {
        // Leave the default CTA text in place if the test cannot be loaded.
      }
    };

    loadTest();

    return () => {
      cancelled = true;
    };
  }, [toolId, buttonText]);

  const handleClick = async () => {
    setClicked(true);

    try {
      await Promise.all([
        fetch("/api/track-affiliate-click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            affiliateLinkId: toolId,
            articleSlug,
            source: clickSource,
          }),
          keepalive: true,
        }),
        activeTestId && assignedVariant
          ? fetch("/api/ab-testing", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "track-interaction", testId: activeTestId, variant: assignedVariant, type: "click" }),
              keepalive: true,
            })
          : Promise.resolve(),
      ]);
    } catch (error) {
      console.error("Click tracking failed:", error);
    }
  };

  return (
    <a
      href={toolUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold transition-all ${
        clicked
          ? "bg-green-500/30 text-green-300"
          : "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600"
      }`}
    >
      {clicked ? (locale === "en" ? "✅ Redirecting..." : "✅ Weiterleitung...") : `🔗 ${activeText} → ${toolName}`}
    </a>
  );
}
