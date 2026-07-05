"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type FactoryStatsProps = {
  refreshKey?: number;
};

type Stats = {
  todayArticles: number;
  totalArticles: number;
  seoScore: number;
  averageSeconds: number;
};

export default function FactoryStats({
  refreshKey = 0,
}: FactoryStatsProps) {
  const t = useTranslations("contentFactory");
  const [stats, setStats] = useState<Stats>({
    todayArticles: 0,
    totalArticles: 0,
    seoScore: 0,
    averageSeconds: 0,
  });

  const [loading, setLoading] = useState(true);

  async function loadStats() {
    try {
      const res = await fetch("/api/content-factory/stats");

      if (!res.ok) return;

      const data = await res.json();

      if (data.success) {
        setStats({
          todayArticles: data.todayArticles ?? 0,
          totalArticles: data.totalArticles ?? 0,
          seoScore: data.seoScore ?? 0,
          averageSeconds: data.averageSeconds ?? 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-6">
        <p className="text-gray-400">{t("loadingStats")}</p>
      </div>
    );
  }

  return (
    <div className="mt-6 grid gap-4">

      <div className="rounded-xl border border-white/10 bg-black/30 p-5">
        <p className="text-sm text-gray-400">
          📊 {t("todayCreated")}
        </p>

        <p className="mt-2 text-4xl font-bold">
          {stats.todayArticles}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-5">
        <p className="text-sm text-gray-400">
          📄 {t("totalArticles")}
        </p>

        <p className="mt-2 text-4xl font-bold">
          {stats.totalArticles}
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-5">
        <p className="text-sm text-gray-400">
          🎯 {t("seoScore")}
        </p>

        <p className="mt-2 text-4xl font-bold text-green-400">
          {stats.seoScore}%
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/30 p-5">
        <p className="text-sm text-gray-400">
          ⚡ {t("average")}
        </p>

        <p className="mt-2 text-4xl font-bold text-cyan-300">
          {stats.averageSeconds}s
        </p>
      </div>

    </div>
  );
}