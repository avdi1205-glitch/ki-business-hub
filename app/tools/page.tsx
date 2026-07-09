import Link from "next/link";
import { prisma } from "../../lib/prisma";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import CheckoutCtaButton from "../components/CheckoutCtaButton";

function createSlug(name: string) {
  return name
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default async function ToolsPage() {
  const t = await getTranslations("tools");
  const locale = await getLocale();
  let tools: Awaited<ReturnType<typeof prisma.affiliateLink.findMany>> = [];

  const translateBadge = (badge: string | null) => {
    if (!badge) return null;
    if (locale === "en") return badge;
    if (badge === "Most Popular") return "Am beliebtesten";
    if (badge === "Best for Images") return "Am besten fuer Bilder";
    return badge;
  };

  try {
    tools = await prisma.affiliateLink.findMany({
      orderBy: { rating: "desc" },
    });
  } catch {
    // Keep customer-facing page readable even when DB env/config is missing.
    tools = [];
  }

  return (
    <main style={{ background: "var(--background)" }}>
      <section
        className="relative overflow-hidden px-6 py-20"
        style={{ background: "linear-gradient(160deg, #0b1220 0%, #172554 100%)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/12 via-blue-500/10 to-transparent" />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-4 font-bold text-cyan-300">
            🤖 {t("eyebrow")}
          </p>

          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
            {t("title")}
          </h1>

          <p className="mb-10 max-w-3xl text-xl leading-8 text-slate-100">
            {t("subtitle")}
          </p>

          <div className="mb-8 flex flex-wrap gap-3 text-sm text-slate-100">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Schnelle Orientierung</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Klare Preis-Leistung</span>
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Direkt zur Entscheidung</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/affiliate"
              className="rounded-xl bg-cyan-500 px-5 py-3 font-bold text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-400"
            >
              Zu den besten Empfehlungen
            </Link>
            <Link
              href="#tools-grid"
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-bold text-slate-100 hover:bg-white/10"
            >
              Alle Tools ansehen
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20" style={{ background: "var(--background)" }}>
        <div className="-mt-10 mb-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-bold text-cyan-300">1. Vergleichen</p>
              <p className="mt-1 text-sm text-slate-200">Schnell sehen, welche Tools wirklich zu deinem Ziel passen.</p>
            </div>
            <div>
              <p className="text-sm font-bold text-cyan-300">2. Entscheiden</p>
              <p className="mt-1 text-sm text-slate-200">Klare Ratings, Preise und Beschreibungen ohne unnötigen Lärm.</p>
            </div>
            <div>
              <p className="text-sm font-bold text-cyan-300">3. Starten</p>
              <p className="mt-1 text-sm text-slate-200">Mit einem Klick tiefer einsteigen oder direkt zur Empfehlung wechseln.</p>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/12 to-blue-500/8 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300/80">{t("offerEyebrow")}</p>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-2xl font-black text-white sm:text-3xl">{t("offerTitle")}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{t("offerSubtitle")}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:w-[38rem]">
              <Link
                href="/content-factory"
                className="rounded-2xl border border-emerald-300/20 bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-center font-black text-white shadow-[0_18px_40px_rgba(16,185,129,0.22)] transition-all duration-300 hover:-translate-y-1"
              >
                🚀 {t("offerFreeCta")}
              </Link>
              <CheckoutCtaButton
                href="/api/checkout?plan=pro"
                ctaKey="tools-pro"
                variantA={{
                  label: `${t("offerProA")}`,
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
                ctaKey="tools-agency"
                variantA={{
                  label: `${t("offerAgencyA")}`,
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

        {tools.length === 0 && (
          <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-yellow-100">
            Tool-Daten sind gerade nicht verfuegbar. Bitte spaeter erneut laden.
          </div>
        )}

        <div id="tools-grid" className="grid gap-6 md:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${createSlug(tool.name)}`}
              className="rounded-2xl border border-white/10 bg-white/10 p-6 hover:bg-white/20"
            >
              {tool.badge && (
                <p className="mb-4 inline-block rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-black">
                  {translateBadge(tool.badge)}
                </p>
              )}

              <h2 className="text-2xl font-bold">{tool.name}</h2>

              <p className="mt-3 font-bold text-yellow-400">
                ⭐ {tool.rating}/10
              </p>

              {tool.price && (
                <p className="mt-2 font-bold text-green-400">
                  💰 {tool.price}
                </p>
              )}

              <p className="mt-2 text-slate-300">{tool.category}</p>

              {tool.description && (
                <p className="mt-4 leading-7 text-slate-100">{tool.description}</p>
              )}

              <p className="mt-6 inline-flex rounded-full bg-cyan-500/10 px-3 py-2 font-bold text-cyan-200">
                {t("readMore")}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}