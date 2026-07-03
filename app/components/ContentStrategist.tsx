"use client";

import { useEffect, useState } from "react";

type Idea = {
  id: number;
  title: string;
  category: string;
  priority: number;
  searchVolume?: number | null;
  difficulty?: number | null;
  affiliateTool?: string | null;
};

export default function ContentStrategist({ onApply }: { onApply: () => void }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);

  useEffect(() => {
    async function loadIdeas() {
      const res = await fetch("/api/content-ideas");
      const data = await res.json();

      if (data.success) {
        setIdeas(data.ideas || []);
      }
    }

    loadIdeas();
  }, []);

  const topIdea =
    ideas[0] || {
      id: 0,
      title: "Hostinger Erfahrungen 2026",
      category: "Hosting",
      priority: 95,
      searchVolume: 12000,
      difficulty: 45,
      affiliateTool: "Hostinger",
    };

  return (
    <div className="mb-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-8">
      <p className="mb-3 font-bold text-cyan-300">🧠 KI Content Strategist</p>

      <h2 className="mb-4 text-3xl font-bold">
        Heute empfohlen: {topIdea.title}
      </h2>

      <p className="mb-6 text-gray-300">
        Diese Idee hat aktuell die höchste Priorität für KI Business Hub.
      </p>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl bg-black/30 p-4">
          <p className="text-sm text-gray-400">Kategorie</p>
          <p className="mt-1 font-bold">{topIdea.category}</p>
        </div>

        <div className="rounded-xl bg-black/30 p-4">
          <p className="text-sm text-gray-400">Priorität</p>
          <p className="mt-1 font-bold text-green-400">{topIdea.priority}%</p>
        </div>

        <div className="rounded-xl bg-black/30 p-4">
          <p className="text-sm text-gray-400">Suchvolumen</p>
          <p className="mt-1 font-bold">{topIdea.searchVolume || "—"}</p>
        </div>

        <div className="rounded-xl bg-black/30 p-4">
          <p className="text-sm text-gray-400">Affiliate</p>
          <p className="mt-1 font-bold text-cyan-300">
            {topIdea.affiliateTool || "Automatisch"}
          </p>
        </div>
      </div>

      <button
        onClick={onApply}
        className="mt-6 rounded-xl bg-cyan-500 px-6 py-4 font-bold hover:bg-cyan-600"
      >
        🚀 Empfehlung übernehmen
      </button>
    </div>
  );
}