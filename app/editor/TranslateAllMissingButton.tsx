"use client";

import { useState } from "react";

export default function TranslateAllMissingButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);

  async function handleTranslateAll() {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/translate-article/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ limit }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Bulk translation failed");
      }

      setMessage(`Created ${data.created} translation(s) (limit ${data.limit}), remaining missing: ${data.remainingMissing}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bulk translation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-6 flex flex-col gap-2">
      <label className="text-sm text-slate-300" htmlFor="translate-limit">
        Batch size (1-50)
      </label>
      <input
        id="translate-limit"
        type="number"
        min={1}
        max={50}
        value={limit}
        onChange={(event) => setLimit(Math.min(Math.max(Number(event.target.value) || 1, 1), 50))}
        className="w-32 rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-slate-100"
      />
      <button
        onClick={handleTranslateAll}
        disabled={loading}
        className="w-fit rounded-xl bg-emerald-500 px-5 py-3 font-bold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Translating all..." : "Translate all missing"}
      </button>
      {message && <p className="text-sm text-slate-300">{message}</p>}
    </div>
  );
}