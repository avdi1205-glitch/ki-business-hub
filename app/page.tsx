import Link from "next/link";
import type { Metadata } from "next";
import Script from "next/script";
import { prisma } from "../lib/prisma";
import TopTools from "./components/TopTools";
import ConversionHero from "./components/ConversionHero";
import { FeaturesSection } from "./components/FeaturesSection";
import { PricingSection } from "./components/PricingSection";
import { ComparisonTable } from "./components/ComparisonTable";
import { FAQSection } from "./components/FAQSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import NewsletterForm from "./components/NewsletterForm";
import CheckoutCtaButton from "./components/CheckoutCtaButton";
import { getSiteUrl } from "../lib/site-url";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  if (locale === "en") {
    return {
      title: "Nexmoneta | AI tools, content factory, and affiliate workflow",
      description:
        "Use AI content, affiliate tools, and automation in one clear workflow. Start free and upgrade to Pro or Agency when you need it.",
      alternates: {
        canonical: "/",
      },
    };
  }

  return {
    title: "Nexmoneta | KI-Tools, Content-Factory und Affiliate-Workflow",
    description:
      "Nutze KI-Content, Affiliate-Tools und Automatisierung in einem klaren Workflow. Starte kostenlos und upgrade bei Bedarf auf Pro oder Agency.",
    alternates: {
      canonical: "/",
    },
  };
}

export default async function Home() {
  const siteUrl = getSiteUrl();
  const locale = await getLocale();
  const t = await getTranslations("home");

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity:
      locale === "en"
        ? [
            {
              "@type": "Question",
              name: "How much can I really earn?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "It depends on niche, reach, and execution. The platform helps you create content faster and implement monetization in a more structured way.",
              },
            },
            {
              "@type": "Question",
              name: "Is it really free?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, you can start for free. For more volume, automation, and reporting, Pro is available for EUR 39 per month.",
              },
            },
            {
              "@type": "Question",
              name: "How does affiliate payout work?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "You place relevant recommendations and can track clicks. Compensation comes from each partner program and varies.",
              },
            },
            {
              "@type": "Question",
              name: "Is my site really secure?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "There are technical protection mechanisms for infrastructure and data access. You should also use strong credentials and clean processes.",
              },
            },
          ]
        : [
            {
              "@type": "Question",
              name: "Wie viel kann ich wirklich verdienen?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Das haengt von Nische, Reichweite und Umsetzung ab. Die Plattform hilft dir, Inhalte schneller zu erstellen und Monetarisierung strukturierter umzusetzen.",
              },
            },
            {
              "@type": "Question",
              name: "Ist das wirklich kostenlos?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ja, du kannst kostenlos starten. Fuer mehr Volumen, Automatisierung und Reports gibt es Pro fuer 39 EUR pro Monat.",
              },
            },
            {
              "@type": "Question",
              name: "Wie funktioniert die Affiliate-Bezahlung?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Du platzierst passende Empfehlungen und kannst Klicks tracken. Die Verguetung kommt vom jeweiligen Partnerprogramm und ist unterschiedlich.",
              },
            },
            {
              "@type": "Question",
              name: "Ist meine Seite wirklich sicher?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Es gibt technische Schutzmechanismen fuer Infrastruktur und Datenzugriff. Zusaetzlich solltest du starke Zugangsdaten und saubere Prozesse nutzen.",
              },
            },
          ],
  };

  let tools: Awaited<ReturnType<typeof prisma.affiliateLink.findMany>> = [];
  let articles: Awaited<ReturnType<typeof prisma.article.findMany>> = [];

  try {
    tools = await prisma.affiliateLink.findMany({
      orderBy: { rating: "desc" },
      take: 3,
    });

    const recentArticles = await prisma.article.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    articles = recentArticles
      .filter((article) => {
        const row = article as { locale?: string | null };
        return !row.locale || row.locale === locale;
      })
      .slice(0, 3);
  } catch {
    // Keep rendering the customer-facing page even if the local DB is unavailable.
  }

  return (
    <>
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Script
        id="website-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Nexmoneta",
            url: siteUrl,
            inLanguage: locale === "en" ? "en-US" : "de-DE",
          }),
        }}
      />

      <main className="relative isolate min-h-screen overflow-hidden mesh-background text-slate-100">
        <div className="noise-overlay" />
        <div className="orbital-glow left-[-8rem] top-[8rem] h-72 w-72 bg-cyan-500/25" />
        <div className="orbital-glow right-[-6rem] top-[24rem] h-80 w-80 bg-emerald-500/20" style={{ animationDelay: "-3s" }} />
        <div className="orbital-glow left-[44%] top-[68rem] h-96 w-96 bg-violet-500/15" style={{ animationDelay: "-6s" }} />

        {/* Conversion Hero */}
        <ConversionHero />

        <section className="px-4 pb-8 pt-2 sm:px-6">
          <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-[1.35fr_0.85fr]">
            <Link
              href="/tools"
              className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-2xl shadow-cyan-950/20 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-white/10 md:p-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/80">Schneller Einstieg</p>
              <h2 className="display-heading max-w-xl text-3xl font-black text-white sm:text-4xl lg:text-5xl">
                Das ist kein Standard-Layout. Es ist ein schneller Weg zu Entscheidungen.
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Tools vergleichen, Empfehlungen finden, Inhalte strukturieren: der visuelle Pfad bleibt klar, aber dynamischer und stärker auf Conversion ausgelegt.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-cyan-200">Asymmetrisch</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slate-200">Bewegte Tiefe</span>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-emerald-200">Klare Hierarchie</span>
              </div>
            </Link>

            <div className="grid gap-4">
              <Link
                href="/affiliate"
                className="group rounded-[1.75rem] border border-white/10 bg-slate-950/50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/30 hover:bg-slate-900/70"
              >
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300/80">Direkter Pfad</p>
                <p className="mt-3 text-2xl font-black text-white">Empfehlungen, die wie ein Premium-Editor wirken.</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">Mehr visuelle Spannung, weniger graue Standardboxen.</p>
              </Link>

              <Link
                href="/blog"
                className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/10"
              >
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-300/80">Explorativ</p>
                <p className="mt-3 text-2xl font-black text-white">Lesen, bevor man klickt. Aber schöner inszeniert.</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">Ein ruhigerer Einstieg für Besucher, die erst Orientierung wollen.</p>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-4 pb-3 sm:px-6">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-cyan-400/15 bg-cyan-500/6 px-5 py-4 text-sm leading-7 text-slate-200 backdrop-blur-xl">
            <span className="font-semibold text-cyan-300">Oder direkt entscheiden:</span> Wenn du schon weißt, was du brauchst, nimm oben die passende Strecke. Wenn du unsicher bist, helfen dir die Top-Tools beim Vergleichen.
          </div>
        </section>

      {/* Unique Value Proposition - Einzigartig */}
        <section className="py-24 animate-fadeInUp" style={{ animationDelay: "120ms" }}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-violet-300/80">Warum Nexmoneta</p>
            <h2 className="display-heading text-4xl font-black text-white sm:text-5xl md:text-6xl">
              🚀 {t("uniqueTitle")}
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-500/10 p-8 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 md:translate-y-8 animate-fadeInUp" style={{ animationDelay: "80ms" }}>
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: "#f8fafc" }}>{t("uniqueAi")}</h3>
              <p className="leading-7" style={{ color: "#dbeafe" }}>
                {t("uniqueAiText")}
              </p>
            </div>

            <div className="rounded-[2rem] border border-emerald-400/20 bg-emerald-500/10 p-8 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 animate-fadeInUp" style={{ animationDelay: "180ms" }}>
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: "#f8fafc" }}>{t("uniqueRoi")}</h3>
              <p className="leading-7" style={{ color: "#dcfce7" }}>
                {t("uniqueRoiText")}
              </p>
            </div>

            <div className="rounded-[2rem] border border-violet-400/20 bg-violet-500/10 p-8 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1 md:-translate-y-8 animate-fadeInUp" style={{ animationDelay: "280ms" }}>
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: "#f8fafc" }}>{t("uniqueAutomation")}</h3>
              <p className="leading-7" style={{ color: "#ede9fe" }}>
                {t("uniqueAutomationText")}
              </p>
            </div>
          </div>
        </div>
        </section>

      {/* Top Tools Section */}
        <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/80">Top Tools</p>
            <h2 className="display-heading text-4xl font-black text-white sm:text-5xl md:text-6xl">
              {t("topToolsTitle")}
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300 sm:text-xl">
              {t("topToolsSubtitle")}
            </p>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20 transition-transform duration-300 hover:-translate-y-1">
              <p className="text-sm font-bold text-emerald-300">Mehr Klarheit</p>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-light)" }}>Schnell sehen, was sich fuer dich lohnt.</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20 transition-transform duration-300 hover:-translate-y-1 md:translate-y-6">
              <p className="text-sm font-bold text-emerald-300">Weniger Recherche</p>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-light)" }}>Weniger Tabs, schneller zum naechsten Schritt.</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-lg shadow-slate-950/20 transition-transform duration-300 hover:-translate-y-1 md:-translate-y-4">
              <p className="text-sm font-bold text-emerald-300">Schneller Umsatzpfad</p>
              <p className="mt-2 text-sm leading-6" style={{ color: "var(--text-light)" }}>Direkt zu den stärksten Klickpfaden.</p>
            </div>
          </div>

          <TopTools tools={tools} />
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* Testimonials Section */}
      <div className="animate-fadeInUp">
        <TestimonialsSection />
      </div>

      {/* Latest Articles */}
        <section className="py-24 animate-fadeInUp" style={{ animationDelay: "220ms" }}>
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-amber-300/80">Neuer Content</p>
            <h2 className="display-heading text-4xl font-black text-white sm:text-5xl md:text-6xl">
              📝 {t("latestArticlesTitle")}
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {articles.slice(0, 3).map((article, idx) => (
              <Link
                key={article.id}
                href={article.slug ? `/blog/${article.slug}` : "#"}
                className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/30 hover:bg-white/10 animate-fadeInUp"
                style={{ animationDelay: `${idx * 90}ms` }}
              >
                <div className="h-2 bg-gradient-to-r from-cyan-400 via-emerald-400 to-violet-400" />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 transition-colors group-hover:text-cyan-300" style={{ color: "var(--text-dark)" }}>
                    {article.title}
                  </h3>
                  <p className="mb-4 leading-7" style={{ color: "var(--text-light)" }}>
                    {article.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center gap-2 font-semibold text-cyan-300 transition-transform group-hover:translate-x-1">
                    {t("articleReadMore")}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/blog"
              className="px-8 py-4 font-bold rounded-lg transition-all duration-300 transform hover:scale-105 inline-block"
              style={{ background: "var(--primary)", color: "white" }}
            >
              {t("latestArticlesLink")}
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Comparison Table */}
      <ComparisonTable />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA */}
        <section className="py-24 text-white animate-fadeInUp" style={{ animationDelay: "120ms" }}>
        <div className="mx-auto max-w-4xl rounded-[2.5rem] border border-white/10 bg-white/6 px-4 py-12 text-center backdrop-blur-2xl sm:px-8">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/80">Letzter Schritt</p>
          <h2 className="display-heading text-4xl font-black md:text-5xl">
            {t("finalTitle")}
          </h2>
          <p className="mx-auto mb-8 mt-6 max-w-2xl text-xl leading-8 text-slate-200">
            {t("finalSubtitle")}
          </p>
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/content-factory"
                className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg rounded-lg hover:shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105"
              >
                🚀 {t("finalFreeCta")}
              </Link>
              <CheckoutCtaButton
                href="/api/checkout?plan=pro"
                ctaKey="final-pro"
                variantA={{
                  label: `💎 ${t("finalProCta")}`,
                  sourceSuffix: "variant-a",
                  className: "px-10 py-4 rounded-lg border border-cyan-400/30 bg-cyan-500/10 text-cyan-100 font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:bg-cyan-500/20",
                }}
                variantB={{
                  label: `⚡ ${t("finalProAltCta")}`,
                  sourceSuffix: "variant-b",
                  className: "px-10 py-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 text-emerald-100 font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:bg-emerald-500/20",
                }}
              />
            </div>
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
              <p className="mb-3 text-sm font-semibold text-cyan-300">📧 {t("newsletterTitle")}</p>
              <NewsletterForm source="homepage-final-cta" />
            </div>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
