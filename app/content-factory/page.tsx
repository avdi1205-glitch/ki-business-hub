"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import ContentStrategist from "../components/ContentStrategist";
import CheckoutCtaButton from "../components/CheckoutCtaButton";
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
  const t = useTranslations("contentFactory");
  const locale = useLocale();
  const isEn = locale === "en";
  const [category, setCategory] = useState(isEn ? "AI tools" : "KI Tools");
  const [count, setCount] = useState("1");
  const [words, setWords] = useState("1500");
  const [style, setStyle] = useState(isEn ? "Professional" : "Professionell");
  const [audience, setAudience] = useState(isEn ? "Beginners" : "Anfänger");
  const [affiliateTool, setAffiliateTool] = useState(isEn ? "Automatic" : "Automatisch");
  const [seoStrength, setSeoStrength] = useState(isEn ? "Strong" : "Stark");
  const [articleType, setArticleType] = useState(isEn ? "Guide" : "Ratgeber");

  const [status, setStatus] = useState(t("ready"));
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(t("ready"));
  const [logs, setLogs] = useState<string[]>([]);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [queue, setQueue] = useState<QueueItem[]>([]);

  function applyStrategy() {
    setCategory("Hosting");
    setCount("1");
    setWords("2000");
    setStyle(isEn ? "Professional" : "Professionell");
    setAudience(isEn ? "Beginners" : "Anfänger");
    setAffiliateTool("Hostinger");
    setSeoStrength(isEn ? "Maximum" : "Maximal");
    setArticleType(isEn ? "Review" : "Testbericht");
  }

  async function startFactory() {
    setLoading(true);
    setArticles([]);
    setLogs([]);
    setProgress(0);

    setQueue([
      {
        title: t("queuePreparing", { category }),
        progress: 10,
        status: "In Arbeit",
      },
    ]);

    setStep(`🤖 ${t("stepAnalyzing")}`);
    setStatus(`⏳ ${t("running")}`);
    setLogs([`🤖 ${t("stepAnalyzing")}`]);

    setProgress(10);
    await new Promise((r) => setTimeout(r, 400));

    setStep(`📝 ${t("stepSeo")}`);
    setLogs((prev) => [...prev, `📝 ${t("stepSeoDone")}`]);
    setProgress(30);
    setQueue((prev) =>
      prev.map((item) => ({ ...item, progress: 30 }))
    );

    await new Promise((r) => setTimeout(r, 400));

    setStep(`📄 ${t("stepWriting")}`);
    setLogs((prev) => [...prev, `📄 ${t("stepWriting")}`]);
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

    setStep(`💾 ${t("stepSaving")}`);
    setLogs((prev) => [...prev, `💾 ${t("stepSaving")}`]);
    setProgress(90);
    setQueue((prev) =>
      prev.map((item) => ({ ...item, progress: 90 }))
    );

    const data = await res.json();

    setLoading(false);
    setProgress(100);

    if (data.success) {
      setStatus(t("createdCount", { count: data.created }));
      setArticles(data.articles || []);
      setStep(`🎉 ${t("finished")}`);
      setStatsRefreshKey((prev) => prev + 1);
      setLogs((prev) => [...prev, `✅ ${t("finished")}`]);

      setQueue(
        (data.articles || []).map((article: Article) => ({
          title: article.title,
          progress: 100,
          status: "Fertig",
        }))
      );
    } else {
      setStatus(`❌ ${data.error}`);
      setStep(t("error"));
      setLogs((prev) => [...prev, `❌ ${t("errorOccurred")}`]);
      setQueue((prev) =>
        prev.map((item) => ({ ...item, status: "Wartend" }))
      );
    }
  }

  return (
    <main style={{ background: "#0f172a", minHeight: "100vh", color: "#f1f5f9" }}>
      <section className="mx-auto max-w-6xl px-6 py-16" style={{ background: "#0f172a" }}>
        <h1 className="mb-10 text-5xl font-bold" style={{ color: "#f1f5f9" }}>🤖 {t("title")}</h1>

        <ContentStrategist onApply={applyStrategy} />

        <div className="mb-8 rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/12 to-cyan-500/8 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300/80">{t("offerEyebrow")}</p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">{t("offerTitle")}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{t("offerSubtitle")}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:w-[40rem]">
              <Link
                href="/content-factory"
                className="rounded-2xl border border-emerald-300/20 bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-center font-black text-white shadow-[0_18px_40px_rgba(16,185,129,0.22)] transition-all duration-300 hover:-translate-y-1"
              >
                🚀 {t("offerFreeCta")}
              </Link>
              <CheckoutCtaButton
                href="/api/checkout?plan=pro"
                ctaKey="factory-pro"
                variantA={{
                  label: `💎 ${t("offerProA")}`,
                  sourceSuffix: "variant-a",
                  className: "rounded-2xl border border-sky-300/20 bg-sky-500/10 px-4 py-3 text-center font-black text-sky-100 transition-all duration-300 hover:-translate-y-1 hover:bg-sky-500/20",
                }}
                variantB={{
                  label: `⚡ ${t("offerProB")}`,
                  sourceSuffix: "variant-b",
                  className: "rounded-2xl border border-sky-300/20 bg-sky-500/10 px-4 py-3 text-center font-black text-sky-100 transition-all duration-300 hover:-translate-y-1 hover:bg-sky-500/20",
                }}
              />
              <CheckoutCtaButton
                href="/api/checkout?plan=agency"
                ctaKey="factory-agency"
                variantA={{
                  label: `👑 ${t("offerAgencyA")}`,
                  sourceSuffix: "variant-a",
                  className: "rounded-2xl border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-center font-black text-amber-100 transition-all duration-300 hover:-translate-y-1 hover:bg-amber-500/20",
                }}
                variantB={{
                  label: `🏢 ${t("offerAgencyB")}`,
                  sourceSuffix: "variant-b",
                  className: "rounded-2xl border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-center font-black text-amber-100 transition-all duration-300 hover:-translate-y-1 hover:bg-amber-500/20",
                }}
              />
            </div>
          </div>
        </div>

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

          <div className="rounded-2xl border border-white/10 p-8" style={{ background: "#1e293b", color: "#f1f5f9" }}>
            <h2 className="mb-5 text-2xl font-bold" style={{ color: "#f1f5f9" }}>{t("statusTitle")}</h2>

            <div className="mb-4 rounded-xl bg-black/30 p-4" style={{ color: "#f1f5f9" }}>{status}</div>

            <div className="mb-4">
              <div className="mb-2 flex justify-between text-sm" style={{ color: "#cbd5e1" }}>
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
                <h3 className="mb-4 mt-6 font-bold" style={{ color: "#f1f5f9" }}>{t("createdArticlesTitle")}</h3>

                <div className="space-y-3">
                  {articles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/blog/${article.slug}`}
                      className="block rounded-xl bg-slate-900 p-4 hover:bg-slate-800"
                    >
                      <p className="font-bold" style={{ color: "#f1f5f9" }}>{article.title}</p>
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