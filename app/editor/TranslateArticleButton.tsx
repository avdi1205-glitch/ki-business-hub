"use client";

import { useState } from "react";

type Props = {
  articleId: number;
};

export default function TranslateArticleButton({ articleId }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleTranslate() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/translate-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ articleId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Translation failed");
      }

      setMessage(data.skipped ? "Translation already exists" : "Translation created");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Translation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleTranslate}
        disabled={loading}
        className="rounded-xl bg-violet-500 px-4 py-2 font-bold hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Translating..." : "Create translation"}
      </button>
      {message && <p className="text-xs text-slate-300">{message}</p>}
    </div>
  );
}