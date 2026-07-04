"use client";

import { useEffect, useState } from "react";

type Props = {
  id: number;
  url: string;
  text?: string;
  articleSlug?: string;
  clickSource?: string;
};

export default function AffiliateButton({
  id,
  url,
  text = "🚀 Angebot ansehen",
  articleSlug,
  clickSource,
}: Props) {
  const [clicked, setClicked] = useState(false);
  const [activeTestId, setActiveTestId] = useState<number | null>(null);
  const [assignedVariant, setAssignedVariant] = useState<"A" | "B" | null>(null);
  const [activeText, setActiveText] = useState(text);

  useEffect(() => {
    let cancelled = false;

    const loadTest = async () => {
      try {
        const response = await fetch(`/api/ab-testing?affiliateLinkId=${id}`);
        const data = await response.json();

        if (!response.ok || !data.success || !data.test || cancelled) return;

        const variant = (window.localStorage.getItem(`ab-test-${data.test.id}`) as "A" | "B" | null) || (Math.random() >= 0.5 ? "A" : "B");
        window.localStorage.setItem(`ab-test-${data.test.id}`, variant);

        setActiveTestId(data.test.id);
        setAssignedVariant(variant);
        setActiveText(variant === "A" ? data.test.variantA : data.test.variantB);

        await fetch("/api/ab-testing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "track-interaction", testId: data.test.id, variant, type: "impression" }),
          keepalive: true,
        });
      } catch {
        // Keep default text if test loading fails.
      }
    };

    loadTest();

    return () => {
      cancelled = true;
    };
  }, [id, text]);

  async function handleClick() {
    setClicked(true);

    try {
      await Promise.all([
        fetch("/api/track-affiliate-click", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ affiliateLinkId: id, articleSlug, source: clickSource }),
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
      console.error(error);
    }
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={`block w-full rounded-xl px-6 py-3 text-center font-bold transition ${
        clicked ? "bg-green-500/30 text-green-300" : "bg-green-600 hover:bg-green-700 text-white"
      }`}
      style={{ color: clicked ? "#bbf7d0" : "#f8fafc", textShadow: clicked ? "none" : "0 1px 1px rgba(0,0,0,0.25)" }}
    >
      {clicked ? "✅ Wird geöffnet..." : activeText}
    </a>
  );
}