"use client";

import { useLocale, useTranslations } from "next-intl";

type Props = {
  category: string;
  setCategory: (value: string) => void;

  count: string;
  setCount: (value: string) => void;

  words: string;
  setWords: (value: string) => void;

  style: string;
  setStyle: (value: string) => void;

  audience: string;
  setAudience: (value: string) => void;

  affiliateTool: string;
  setAffiliateTool: (value: string) => void;

  seoStrength: string;
  setSeoStrength: (value: string) => void;

  articleType: string;
  setArticleType: (value: string) => void;

  loading: boolean;

  startFactory: () => void;
};

export default function FactoryForm({
  category,
  setCategory,

  count,
  setCount,

  words,
  setWords,

  style,
  setStyle,

  audience,
  setAudience,

  affiliateTool,
  setAffiliateTool,

  seoStrength,
  setSeoStrength,

  articleType,
  setArticleType,

  loading,

  startFactory,
}: Props) {
  const t = useTranslations("home.contentFactory");
  const locale = useLocale();
  const isEn = locale === "en";

  return (
    <div className="rounded-2xl border border-white/10 p-8" style={{ background: "#1e293b", color: "#f1f5f9" }}>

      <div className="grid gap-5 md:grid-cols-2">

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl bg-slate-900 p-4 text-slate-100"
        >
          <option>{t("categoryAi")}</option>
          <option>{t("categoryHosting")}</option>
          <option>{t("categoryVpn")}</option>
          <option>{t("categoryAutomation")}</option>
          <option>{t("categoryAffiliate")}</option>
        </select>

        <select
          value={count}
          onChange={(e) => setCount(e.target.value)}
          className="rounded-xl bg-slate-900 p-4 text-slate-100"
        >
          <option>1</option>
          <option>3</option>
          <option>5</option>
          <option>10</option>
        </select>

        <select
          value={words}
          onChange={(e) => setWords(e.target.value)}
          className="rounded-xl bg-slate-900 p-4 text-slate-100"
        >
          <option>1000</option>
          <option>1500</option>
          <option>2000</option>
          <option>3000</option>
        </select>

        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="rounded-xl bg-slate-900 p-4 text-slate-100"
        >
          <option>{isEn ? "Professional" : "Professionell"}</option>
          <option>{isEn ? "Casual" : "Locker"}</option>
          <option>{isEn ? "Expert" : "Experte"}</option>
        </select>

        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="rounded-xl bg-slate-900 p-4 text-slate-100"
        >
          <option>{t("audienceBeginners")}</option>
          <option>{t("audienceEntrepreneurs")}</option>
          <option>{t("audienceAgencies")}</option>
        </select>

        <select
          value={affiliateTool}
          onChange={(e) => setAffiliateTool(e.target.value)}
          className="rounded-xl bg-slate-900 p-4 text-slate-100"
        >
          <option>{t("affiliateAuto")}</option>
          <option>Hostinger</option>
          <option>ChatGPT Plus</option>
          <option>NordVPN</option>
          <option>Zapier</option>
          <option>Make</option>
          <option>n8n</option>
        </select>

        <select
          value={seoStrength}
          onChange={(e) => setSeoStrength(e.target.value)}
          className="rounded-xl bg-slate-900 p-4 text-slate-100"
        >
          <option>{t("seoStandard")}</option>
          <option>{t("seoStrong")}</option>
          <option>{t("seoMax")}</option>
        </select>

        <select
          value={articleType}
          onChange={(e) => setArticleType(e.target.value)}
          className="rounded-xl bg-slate-900 p-4 text-slate-100"
        >
          <option>{t("articleGuide")}</option>
          <option>{t("articleComparison")}</option>
          <option>{t("articleReview")}</option>
          <option>{t("articleList")}</option>
        </select>

      </div>

      <button
        disabled={loading}
        onClick={startFactory}
        className="mt-8 rounded-xl bg-green-600 px-8 py-4 font-bold hover:bg-green-700 disabled:opacity-50"
      >
        {loading
          ? t("generating")
          : `🚀 ${t("startFactory")}`}
      </button>

    </div>
  );
}