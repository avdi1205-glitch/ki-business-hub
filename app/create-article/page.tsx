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
    <main style={{ background: "var(--background)", minHeight: "100vh" }} className="p-6">
      <div className="max-w-4xl mx-auto rounded-xl p-8 card">
        <h1 className="text-5xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
          🚀 KI Artikel erstellen
        </h1>

        <p className="mb-8" style={{ color: "var(--text-light)" }}>
          Erstelle neue Inhalte für deinen Business Blog.
        </p>

        <div className="space-y-6">
          <div>
            <label className="font-bold block mb-2" style={{ color: "var(--text-dark)" }}>
              Titel
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg font-medium"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-dark)",
                background: "var(--background-alt)",
              }}
              placeholder="Titel eingeben"
            />
          </div>

          <div>
            <label className="font-bold block mb-2" style={{ color: "var(--text-dark)" }}>
              Artikel Idee
            </label>

            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full p-3 rounded-lg font-medium h-40"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-dark)",
                background: "var(--background-alt)",
              }}
              placeholder="Beschreibe deine Idee..."
            />
          </div>

          <div>
            <label className="font-bold block mb-2" style={{ color: "var(--text-dark)" }}>
              Kategorie
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 rounded-lg font-medium"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-dark)",
                background: "var(--background-alt)",
              }}
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
            className="btn-primary font-bold rounded-lg"
            style={{
              background: "linear-gradient(135deg, var(--success) 0%, var(--success-light) 100%)",
            }}
          >
            🤖 Artikel generieren
          </button>
        </div>

        {article && (
          <div className="mt-10 rounded-lg p-6 card" style={{ background: "var(--background-alt)" }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
              📄 Generierter Artikel
            </h2>
            <div style={{ color: "var(--text-light)" }}>
              <ReactMarkdown>
                {article}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}