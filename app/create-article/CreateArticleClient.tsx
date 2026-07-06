"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useLocale, useTranslations } from "next-intl";

export default function CreateArticleClient() {
  const t = useTranslations("createArticle");
  const locale = useLocale();
  const isEn = locale === "en";
  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [category, setCategory] = useState(isEn ? "AI tools" : "KI Tools");
  const [article, setArticle] = useState("");

  async function generateArticle() {
    setArticle(t("generating"));

    const res = await fetch("/api/generate-article", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        idea,
        category,
        locale,
      }),
    });

    const text = await res.text();

    try {
      const data = JSON.parse(text);
      setArticle(data.article || data.error);
    } catch {
      setArticle(`${t("apiError")}: ${text}`);
    }
  }

  return (
    <main style={{ background: "var(--background)", minHeight: "100vh" }} className="p-6">
      <div className="max-w-4xl mx-auto rounded-xl p-8 card">
        <h1 className="text-5xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
          🚀 {t("title")}
        </h1>

        <p className="mb-4 leading-7" style={{ color: "#e2e8f0" }}>
          {t("subtitle")}
        </p>

        <div className="mb-8 rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-200">{t("badge")}</p>
          <p className="mt-1 text-sm" style={{ color: "#e2e8f0" }}>
            {t("notice")}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="font-bold block mb-2" style={{ color: "var(--text-dark)" }}>
              {t("labelTitle")}
            </label>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg p-3 font-medium"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-dark)",
                background: "var(--background-alt)",
              }}
              placeholder={t("placeholderTitle")}
            />
          </div>

          <div>
            <label className="font-bold block mb-2" style={{ color: "var(--text-dark)" }}>
              {t("labelIdea")}
            </label>

            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="w-full h-40 rounded-lg p-3 font-medium"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-dark)",
                background: "var(--background-alt)",
              }}
              placeholder={t("placeholderIdea")}
            />
          </div>

          <div>
            <label className="font-bold block mb-2" style={{ color: "var(--text-dark)" }}>
              {t("labelCategory")}
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg p-3 font-medium"
              style={{
                borderColor: "var(--border)",
                color: "var(--text-dark)",
                background: "var(--background-alt)",
              }}
            >
              <option>{t("categoryAi")}</option>
              <option>{t("categorySeo")}</option>
              <option>{t("categoryHosting")}</option>
              <option>{t("categoryVpn")}</option>
              <option>{t("categoryAffiliate")}</option>
              <option>{t("categoryAutomation")}</option>
            </select>
          </div>

          <button
            onClick={generateArticle}
            className="btn-primary rounded-lg font-bold"
            style={{
              background: "linear-gradient(135deg, var(--success) 0%, var(--success-light) 100%)",
            }}
          >
            🤖 {t("cta")}
          </button>
        </div>

        {article && (
          <div className="mt-10 rounded-lg p-6 card" style={{ background: "var(--background-alt)" }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-dark)" }}>
              📄 {t("outputTitle")}
            </h2>
            <div style={{ color: "#e2e8f0" }}>
              <ReactMarkdown>{article}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
