"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function CreateArticle() {
  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [category, setCategory] = useState("KI Tools");
  const [article, setArticle] = useState("");

  async function generateArticle() {
    setArticle("⏳ KI schreibt Artikel...");

    const res = await fetch("/api/generate-article", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        idea,
        category,
      }),
    });

    const text = await res.text();

    try {
      const data = JSON.parse(text);
      setArticle(data.article || data.error);
    } catch {
      setArticle("API Fehler: " + text);
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-white p-10">
      <div className="max-w-4xl mx-auto bg-white/10 p-8 rounded-xl">
        <h1 className="text-5xl font-bold mb-4">
          🚀 KI Artikel erstellen
        </h1>

        <p className="text-gray-300 mb-8">
          Erstelle neue Inhalte für deinen Business Blog.
        </p>

        <div className="space-y-6">
          <div>
            <label className="font-bold block mb-2">
              Titel
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600"
              placeholder="Titel eingeben"
            />
          </div>

          <div>
            <label className="font-bold block mb-2">
              Artikel Idee
            </label>

            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600 h-40"
              placeholder="Beschreibe deine Idee..."
            />
          </div>

          <div>
            <label className="font-bold block mb-2">
              Kategorie
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-800 text-white border border-slate-600"
            >
              <option>KI Tools</option>
              <option>Hosting</option>
              <option>VPN</option>
              <option>Affiliate</option>
              <option>Automation</option>
            </select>
          </div>

          <button
            onClick={generateArticle}
            className="bg-cyan-500 hover:bg-cyan-600 px-6 py-3 rounded-xl"
          >
            🤖 Artikel generieren
          </button>
        </div>

        {article && (
          <div className="mt-10 bg-white/10 p-6 rounded-xl">
            <ReactMarkdown>
              {article}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </main>
  );
}