"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import CheckoutCtaButton from "../components/CheckoutCtaButton";

type Plan = "starter" | "pro" | "agency";
type Focus = "affiliate" | "leadgen" | "ads" | "membership";

type Recommendation = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  why: string;
  action: string;
  estimatedMonthlyLift: number;
};

type PlaybookResponse = {
  success: boolean;
  locked?: boolean;
  message?: string;
  error?: string;
  plan?: Plan;
  summary?: string;
  projectedMonthlyLift?: number;
  recommendations?: Recommendation[];
  baseline?: {
    totalRevenue30Days: number;
    totalClicks30Days: number;
    epc: number;
    subscribers: number;
    activeTests: number;
    completedTests: number;
  };
  cached?: boolean;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function priorityBorder(priority: Recommendation["priority"]) {
  if (priority === "high") return "border-rose-400/30 bg-rose-500/10 text-rose-200";
  if (priority === "medium") return "border-amber-400/30 bg-amber-500/10 text-amber-100";
  return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
}

function starterRecommendations(focus: Focus, monthlyVisitors: number, newsletterSignups: number) {
  const baseLift = Math.max(18, Math.round(monthlyVisitors / 250) + newsletterSignups * 2);

  const focusMap: Record<Focus, { title: string; why: string; action: string }> = {
    affiliate: {
      title: "Affiliate-Cluster fuer Money Pages bauen",
      why: "Dein Fokus liegt auf Empfehlungen und Kaufabsicht.",
      action: "3 Vergleichsseiten, 1 Testbericht und 1 Alternatives-Guide priorisieren.",
    },
    leadgen: {
      title: "Lead-Magnet direkt vor den CTA setzen",
      why: "Du willst Kontaktanfragen und Anfragen statt nur Traffic.",
      action: "Ein kurzes PDF oder Checkliste als Upsell vor dem Haupt-CTA testen.",
    },
    ads: {
      title: "Evergreen-Content fuer hoehere Reichweite",
      why: "Ads funktionieren erst gut, wenn Sessions stabil wachsen.",
      action: "Artikel mit Suchintention und hoher Verweildauer nach oben ziehen.",
    },
    membership: {
      title: "Premium-Werkzeug als Wiederkehr-Modell aufbauen",
      why: "Wiederkehrende Einnahmen sind fuer die Zukunft am wertvollsten.",
      action: "Kostenlose Basis plus Premium-Reports, Vorlagen oder Alerts planen.",
    },
  };

  return {
    success: true,
    plan: "starter" as Plan,
    summary: `Starter-Scan: Du hast ein erstes Potenzial von bis zu ${formatCurrency(baseLift)} pro Monat, wenn du den naechsten Hebel sauber umsetzt.`,
    projectedMonthlyLift: baseLift,
    recommendations: [
      {
        id: `${focus}-starter-1`,
        priority: "high" as const,
        title: focusMap[focus].title,
        why: focusMap[focus].why,
        action: focusMap[focus].action,
        estimatedMonthlyLift: baseLift,
      },
      {
        id: `${focus}-starter-2`,
        priority: "medium" as const,
        title: "Messbaren CTA auf jede Geld-Seite setzen",
        why: "Ohne klare Handlungsaufforderung verlierst du Klicks und Leads.",
        action: "Pro Seite nur eine dominante Aktion: lesen, klicken oder anfragen.",
        estimatedMonthlyLift: Math.max(12, Math.round(baseLift * 0.55)),
      },
      {
        id: `${focus}-starter-3`,
        priority: "low" as const,
        title: "Newsletter als Wiederkehr-Kanal aktivieren",
        why: "E-Mail ist der guenstigste wiederholbare Umsatzhebel.",
        action: "An jedem relevanten Inhalt einen simplen Opt-in mit Nutzenversprechen platzieren.",
        estimatedMonthlyLift: Math.max(8, Math.round(baseLift * 0.4)),
      },
    ],
  };
}

export default function RevenueNavigatorStudio({ locale }: { locale: string }) {
  const isEn = locale === "en";
  const [plan, setPlan] = useState<Plan>("starter");
  const [focus, setFocus] = useState<Focus>("affiliate");
  const [monthlyVisitors, setMonthlyVisitors] = useState(8000);
  const [affiliateClicks, setAffiliateClicks] = useState(120);
  const [newsletterSignups, setNewsletterSignups] = useState(18);
  const [contentPieces, setContentPieces] = useState(8);
  const [teamSize, setTeamSize] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlaybookResponse | null>(null);

  const opportunityScore = useMemo(() => {
    const trafficScore = Math.min(monthlyVisitors / 150, 30);
    const clickScore = Math.min(affiliateClicks / 8, 25);
    const newsletterScore = Math.min(newsletterSignups * 1.8, 20);
    const contentScore = Math.min(contentPieces * 1.6, 15);
    const teamScore = teamSize >= 4 ? 10 : teamSize >= 2 ? 6 : 4;
    return Math.round(Math.min(100, trafficScore + clickScore + newsletterScore + contentScore + teamScore));
  }, [affiliateClicks, contentPieces, monthlyVisitors, newsletterSignups, teamSize]);

  const starterPreview = useMemo(() => starterRecommendations(focus, monthlyVisitors, newsletterSignups), [focus, monthlyVisitors, newsletterSignups]);

  const planCards = [
    {
      key: "starter",
      name: isEn ? "Starter" : "Starter",
      price: isEn ? "Free" : "Kostenlos",
      period: isEn ? "for ever" : "für immer",
      accent: "from-cyan-400 via-sky-400 to-emerald-400",
      tone: "border-white/10 bg-white/[0.03]",
      badge: isEn ? "Entry" : "Einstieg",
      summary: isEn
        ? "Ideal if you want a first scan before you invest."
        : "Ideal, wenn du zuerst einen schnellen Scan willst, bevor du investierst.",
      features: isEn
        ? ["1 free scan", "Starter recommendations", "Plan suggestion", "No weekly report"]
        : ["1 kostenloser Scan", "Starter-Empfehlungen", "Plan-Empfehlung", "Kein Wochenreport"],
      action: (
        <button
          type="button"
          onClick={() => {
            setPlan("starter");
            void generatePlaybook("starter");
          }}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
        >
          {isEn ? "Run Starter Scan" : "Starter-Scan starten"}
        </button>
      ),
    },
    {
      key: "pro",
      name: "Pro",
      price: "39 EUR",
      period: isEn ? "per month" : "pro Monat",
      accent: "from-cyan-300 via-cyan-400 to-emerald-300",
      tone: "border-cyan-400/35 bg-cyan-500/10",
      badge: isEn ? "Recommended" : "Empfohlen",
      summary: isEn
        ? "Weekly playbooks, priority actions and better growth visibility."
        : "Woechentliche Playbooks, priorisierte Hebel und bessere Sicht auf Wachstum.",
      features: isEn
        ? ["Weekly playbook", "Priority actions", "Revenue lift estimate", "Affiliate + lead focus"]
        : ["Woechentlicher Plan", "Priorisierte Aktionen", "Umsatz-Prognose", "Affiliate- und Lead-Fokus"],
      action: (
        <CheckoutCtaButton
          href="/api/checkout?plan=pro"
          ctaKey="revenue-navigator-pro"
          variantA={{
            label: isEn ? "Activate Pro" : "Pro aktivieren",
            sourceSuffix: "variant-a",
            className: "block w-full rounded-2xl bg-cyan-500 px-4 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-400",
          }}
          variantB={{
            label: isEn ? "See Pro" : "Pro ansehen",
            sourceSuffix: "variant-b",
            className: "block w-full rounded-2xl bg-cyan-500 px-4 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-400",
          }}
          showReminder={false}
        />
      ),
    },
    {
      key: "agency",
      name: "Agency",
      price: "149 EUR",
      period: isEn ? "per month" : "pro Monat",
      accent: "from-amber-300 via-orange-300 to-rose-300",
      tone: "border-amber-400/35 bg-amber-500/10",
      badge: isEn ? "Teams" : "Teams",
      summary: isEn
        ? "For teams that want multiple projects, reporting and deeper workflows."
        : "Fuer Teams mit mehreren Projekten, Reporting und tieferem Workflow.",
      features: isEn
        ? ["Multiple projects", "Agency playbooks", "More recommendations", "Growth ops support"]
        : ["Mehrere Projekte", "Agency-Playbooks", "Mehr Empfehlungen", "Growth-Ops-Unterstuetzung"],
      action: (
        <CheckoutCtaButton
          href="/api/checkout?plan=agency"
          ctaKey="revenue-navigator-agency"
          variantA={{
            label: isEn ? "Activate Agency" : "Agency aktivieren",
            sourceSuffix: "variant-a",
            className: "block w-full rounded-2xl bg-amber-500 px-4 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-amber-400",
          }}
          variantB={{
            label: isEn ? "See Agency" : "Agency ansehen",
            sourceSuffix: "variant-b",
            className: "block w-full rounded-2xl bg-amber-500 px-4 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-amber-400",
          }}
          showReminder={false}
        />
      ),
    },
  ];

  async function generatePlaybook(nextPlan = plan) {
    setLoading(true);
    setError(null);

    if (nextPlan === "starter") {
      setData(starterPreview);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/revenue-playbook?plan=${nextPlan}`, { cache: "no-store" });
      const json = (await res.json()) as PlaybookResponse;

      if (!res.ok && !json.locked) {
        throw new Error(json.error || (isEn ? "Could not load playbook." : "Playbook konnte nicht geladen werden."));
      }

      if (json.locked) {
        setError(json.message || (isEn ? "Upgrade needed for this view." : "Upgrade erforderlich fuer diese Ansicht."));
        setData(json);
      } else {
        setData(json);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : isEn ? "Could not load playbook." : "Playbook konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  const renderedRecommendations = data?.recommendations && data.recommendations.length > 0 ? data.recommendations : starterPreview.recommendations || [];
  const currentLift = data?.projectedMonthlyLift ?? starterPreview.projectedMonthlyLift ?? 0;
  const currentSummary = data?.summary || starterPreview.summary;

  return (
    <main className="min-h-screen bg-[#070b16] text-slate-100">
      <section className="relative overflow-hidden px-5 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.12),_transparent_28%),linear-gradient(180deg,_rgba(7,11,22,0.9),_rgba(7,11,22,1))]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                {isEn ? "Free scan first" : "Erst kostenlos scannen"}
              </p>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.02] sm:text-5xl lg:text-7xl">
                {isEn
                  ? "Revenue Navigator turns content into a real monetization system."
                  : "Revenue Navigator macht aus Content ein echtes Monetarisierungs-System."}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                {isEn
                  ? "Start with a free scan, see the strongest revenue lever, and upgrade to a weekly playbook when you want the next step automated."
                  : "Starte mit einem kostenlosen Scan, sieh den staerksten Umsatzhebel und upgrade auf einen Wochenplan, wenn du den naechsten Schritt automatisieren willst."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{isEn ? "Affiliate" : "Affiliate"}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{isEn ? "Leads" : "Leads"}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{isEn ? "Abo" : "Abo"}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{isEn ? "Newsletter" : "Newsletter"}</span>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
                {isEn ? "Opportunity score" : "Opportunity Score"}
              </p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-black text-white">{opportunityScore}</p>
                  <p className="mt-1 text-sm text-slate-400">{isEn ? "out of 100" : "von 100"}</p>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">{isEn ? "Potential" : "Potenzial"}</p>
                  <p className="text-xl font-black text-emerald-200">{formatCurrency(currentLift)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {isEn
                  ? "The better the combination of traffic, clicks, leads and content volume, the stronger the suggested plan."
                  : "Je besser die Mischung aus Traffic, Klicks, Leads und Content-Volumen, desto staerker die empfohlene Stufe."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{isEn ? "Scan" : "Scan"}</p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{isEn ? "Set the inputs" : "Werte setzen"}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                  {isEn
                    ? "Use realistic numbers. The tool is designed to give you a sharp next move, not a fake promise."
                    : "Nutze reale Werte. Das Tool soll dir die naechste klare Bewegung geben, nicht leere Versprechen."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void generatePlaybook(plan)}
                disabled={loading}
                className="rounded-2xl border border-cyan-400/20 bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (isEn ? "Scanning..." : "Scanne...") : plan === "starter" ? (isEn ? "Run free scan" : "Kostenlosen Scan starten") : (isEn ? "Generate" : "Generieren")}
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <span className="text-sm font-semibold text-slate-200">{isEn ? "Main focus" : "Hauptfokus"}</span>
                <select
                  value={focus}
                  onChange={(event) => setFocus(event.target.value as Focus)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  <option value="affiliate">Affiliate</option>
                  <option value="leadgen">Lead-Gen</option>
                  <option value="ads">Ads</option>
                  <option value="membership">Membership</option>
                </select>
              </label>

              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <span className="text-sm font-semibold text-slate-200">{isEn ? "Plan" : "Plan"}</span>
                <select
                  value={plan}
                  onChange={(event) => setPlan(event.target.value as Plan)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  <option value="starter">Starter (free)</option>
                  <option value="pro">Pro</option>
                  <option value="agency">Agency</option>
                </select>
              </label>

              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-200">
                  <span>{isEn ? "Monthly visitors" : "Monatliche Besucher"}</span>
                  <span className="text-cyan-300">{monthlyVisitors.toLocaleString("de-DE")}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={120000}
                  step={500}
                  value={monthlyVisitors}
                  onChange={(event) => setMonthlyVisitors(Number(event.target.value))}
                  className="w-full accent-cyan-400"
                />
              </label>

              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-200">
                  <span>{isEn ? "Affiliate clicks" : "Affiliate-Klicks"}</span>
                  <span className="text-emerald-300">{affiliateClicks}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={5}
                  value={affiliateClicks}
                  onChange={(event) => setAffiliateClicks(Number(event.target.value))}
                  className="w-full accent-emerald-400"
                />
              </label>

              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-200">
                  <span>{isEn ? "Newsletter signups" : "Newsletter-Anmeldungen"}</span>
                  <span className="text-amber-200">{newsletterSignups}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={250}
                  step={1}
                  value={newsletterSignups}
                  onChange={(event) => setNewsletterSignups(Number(event.target.value))}
                  className="w-full accent-amber-400"
                />
              </label>

              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-200">
                  <span>{isEn ? "Content pieces / month" : "Content-Stuecke / Monat"}</span>
                  <span className="text-violet-200">{contentPieces}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={40}
                  step={1}
                  value={contentPieces}
                  onChange={(event) => setContentPieces(Number(event.target.value))}
                  className="w-full accent-violet-400"
                />
              </label>

              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-200">
                  <span>{isEn ? "Team size" : "Teamgroesse"}</span>
                  <span className="text-slate-300">{teamSize}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={teamSize}
                  onChange={(event) => setTeamSize(Number(event.target.value))}
                  className="w-full accent-slate-300"
                />
              </label>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/12 via-white/5 to-emerald-500/10 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">{isEn ? "Result" : "Ergebnis"}</p>
                  <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{isEn ? "Your next best move" : "Dein naechster bester Schritt"}</h2>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">{isEn ? "Lift" : "Lift"}</p>
                  <p className="text-xl font-black text-emerald-200">{formatCurrency(currentLift)}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-200">{currentSummary}</p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-300">
                {isEn
                  ? "This free scan is enough to understand your first lever. Upgrade later only if you want weekly direction and deeper tracking."
                  : "Dieser kostenlose Scan reicht, um deinen ersten Hebel zu verstehen. Upgrade spaeter nur, wenn du woechentliche Richtung und tieferes Tracking willst."}
              </div>

              <div className="mt-6 space-y-3">
                {renderedRecommendations.slice(0, 3).map((rec, index) => (
                  <article key={rec.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-lg font-bold text-white">{index + 1}. {rec.title}</h3>
                      <span className={[
                        "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]",
                        priorityBorder(rec.priority),
                      ].join(" ")}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300"><strong>{isEn ? "Why:" : "Warum:"}</strong> {rec.why}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300"><strong>{isEn ? "Action:" : "Aktion:"}</strong> {rec.action}</p>
                    <p className="mt-3 text-sm font-semibold text-emerald-200">+{formatCurrency(rec.estimatedMonthlyLift)}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{isEn ? "What makes it unique" : "Was es einzigartig macht"}</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <p>{isEn ? "It is not just another AI tool. It connects monetization, execution and plan upgrades in one workflow." : "Es ist nicht einfach noch ein KI-Tool. Es verbindet Monetarisierung, Umsetzung und Plan-Upgrade in einem Workflow."}</p>
                <p>{isEn ? "Starter gives a useful preview. Pro gives weekly direction. Agency gives team-level depth." : "Starter liefert eine echte Vorschau. Pro gibt woechentliche Richtung. Agency liefert Tiefe fuer Teams."}</p>
                <p>{isEn ? "That combination is what gives it long-term value." : "Genau diese Kombination macht es langfristig wertvoll."}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="px-5 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{isEn ? "Subscription models" : "Abo-Modelle"}</p>
            <h2 className="mt-2 text-3xl font-black sm:text-5xl">{isEn ? "Start free, then unlock the real leverage" : "Kostenlos starten, dann den echten Hebel freischalten"}</h2>
            <p className="mt-3 text-base leading-7 text-slate-400 sm:text-lg">
              {isEn
                ? "You can keep the free scan as the entry point. Pro and Agency unlock the recurring revenue engine."
                : "Du kannst den kostenlosen Scan als Einstieg behalten. Pro und Agency schalten die wiederkehrende Umsatzmaschine frei."}
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {planCards.map((card) => (
              <article key={card.key} className={[
                "relative flex flex-col rounded-[2rem] border p-6 shadow-2xl shadow-slate-950/20",
                card.tone,
              ].join(" ")}>
                <div className={[
                  "absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r",
                  card.accent,
                ].join(" ")} />
                <div className="flex items-start justify-between gap-4 pt-2">
                  <div>
                    <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                      {card.badge}
                    </p>
                    <h3 className="mt-4 text-2xl font-black text-white">{card.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{card.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white">{card.price}</p>
                    <p className="text-sm text-slate-400">{card.period}</p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  {card.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-300">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">{card.action}</div>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
            <Link href="/kontakt?plan=pro&intent=upgrade" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
              {isEn ? "Need a manual setup?" : "Manuelle Einrichtung?"}
            </Link>
            <Link href="/tools" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
              {isEn ? "Back to tools" : "Zur Tool-Uebersicht"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
