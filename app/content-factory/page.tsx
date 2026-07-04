"use client";

import Link from "next/link";
import { useState } from "react";
import ContentStrategist from "../components/ContentStrategist";
import FactoryForm from "../components/FactoryForm";
import FactoryStats from "../components/FactoryStats";
import FactoryLog from "../components/FactoryLog";
import FactoryQueue from "../components/FactoryQueue";

type Article = {
  id: number;
  title: string;
  slug: string;
  category: string;
};

type QueueItem = {
  title: string;
  progress: number;
  status: "Wartend" | "In Arbeit" | "Fertig";
};

export default function ContentFactoryPage() {
  const [category, setCategory] = useState("KI Tools");
  const [count, setCount] = useState("1");
  const [words, setWords] = useState("1500");
  const [style, setStyle] = useState("Professionell");
  const [audience, setAudience] = useState("Anfänger");
  const [affiliateTool, setAffiliateTool] = useState("Automatisch");
  const [seoStrength, setSeoStrength] = useState("Stark");
  const [articleType, setArticleType] = useState("Ratgeber");

  const [status, setStatus] = useState("Bereit");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("Bereit");
  const [logs, setLogs] = useState<string[]>([]);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  function applyStrategy() {
    setCategory("Hosting");
    setCount("1");
    setWords("2000");
    setStyle("Professionell");
    setAudience("Anfänger");
    setAffiliateTool("Hostinger");
    setSeoStrength("Maximal");
    setArticleType("Testbericht");
  }

  async function startFactory() {
    setLoading(true);
    setArticles([]);
    setLogs([]);
    setProgress(0);

    setQueue([
      {
        title: `${category} Artikel wird vorbereitet`,
        progress: 10,
        status: "In Arbeit",
      },
    ]);

    setStep("🤖 KI analysiert Thema...");
    setStatus("⏳ Content Factory läuft...");
    setLogs(["🤖 KI analysiert Thema..."]);

    setProgress(10);
    await new Promise((r) => setTimeout(r, 400));

    setStep("📝 SEO-Struktur wird vorbereitet...");
    setLogs((prev) => [...prev, "📝 SEO-Struktur vorbereitet"]);
    setProgress(30);
    setQueue((prev) =>
      prev.map((item) => ({ ...item, progress: 30 }))
    );

    await new Promise((r) => setTimeout(r, 400));

    setStep("📄 Artikel werden geschrieben...");
    setLogs((prev) => [...prev, "📄 Artikel werden geschrieben"]);
    setProgress(60);
    setQueue((prev) =>
      prev.map((item) => ({ ...item, progress: 60 }))
    );

    const res = await fetch("/api/content-factory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category,
        count: Number(count),
        words,
        style,
        audience,
        affiliateTool,
        seoStrength,
        articleType,
      }),
    });

    setStep("💾 Speichere Artikel...");
    setLogs((prev) => [...prev, "💾 Artikel werden gespeichert"]);
    setProgress(90);
    setQueue((prev) =>
      prev.map((item) => ({ ...item, progress: 90 }))
    );

    const data = await res.json();

    setLoading(false);
    setProgress(100);

    if (data.success) {
      setStatus(`✅ ${data.created} Artikel erstellt.`);
      setArticles(data.articles || []);
      setStep("🎉 Fertig");
      setStatsRefreshKey((prev) => prev + 1);
      setLogs((prev) => [...prev, "✅ Fertig"]);

      setQueue(
        (data.articles || []).map((article: Article) => ({
          title: article.title,
          progress: 100,
          status: "Fertig",
        }))
      );
    } else {
      setStatus(`❌ ${data.error}`);
      setStep("Fehler");
      setLogs((prev) => [...prev, "❌ Fehler aufgetreten"]);
      setQueue((prev) =>
        prev.map((item) => ({ ...item, status: "Wartend" }))
      );
    }
  }

  return (
    <main style={{ background: "var(--background)" }}>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="mb-10 text-5xl font-bold">🤖 Content Factory</h1>

        <ContentStrategist onApply={applyStrategy} />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <FactoryForm
              category={category}
              setCategory={setCategory}
              count={count}
              setCount={setCount}
              words={words}
              setWords={setWords}
              style={style}
              setStyle={setStyle}
              audience={audience}
              setAudience={setAudience}
              affiliateTool={affiliateTool}
              setAffiliateTool={setAffiliateTool}
              seoStrength={seoStrength}
              setSeoStrength={setSeoStrength}
              articleType={articleType}
              setArticleType={setArticleType}
              loading={loading}
              startFactory={startFactory}
            />

            <FactoryQueue queue={queue} />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 p-8">
            <h2 className="mb-5 text-2xl font-bold">Status</h2>

            <div className="mb-4 rounded-xl bg-black/30 p-4">{status}</div>

            <div className="mb-4">
              <div className="mb-2 flex justify-between text-sm text-gray-300">
                <span>{step}</span>
                <span>{progress}%</span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {articles.length > 0 && (
              <>
                <h3 className="mb-4 mt-6 font-bold">Erstellte Artikel</h3>

                <div className="space-y-3">
                  {articles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/blog/${article.slug}`}
                      className="block rounded-xl bg-slate-900 p-4 hover:bg-slate-800"
                    >
                      <p className="font-bold">{article.title}</p>
                      <p className="text-sm text-gray-400">
                        {article.category}
                      </p>
                    </Link>
                  ))}
                </div>
              </>
            )}

            <FactoryStats refreshKey={statsRefreshKey} />
            <FactoryLog logs={logs} />
          </div>
        </div>
      </section>
    </main>
  );
}