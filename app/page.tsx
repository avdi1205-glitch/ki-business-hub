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
import AiTransparencyBadge from "./components/AiTransparencyBadge";
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
                text: "Du platzierst passende Empfehlungen und kannst Klicks tracken. Die Vergütung kommt vom jeweiligen Partnerprogramm und ist unterschiedlich.",
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

      <main className="relative isolate min-h-screen text-slate-100" style={{ background: "#080e1a" }}>

        {/* Conversion Hero */}
        <ConversionHero />

      {/* Unique Value Proposition */}
        <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-16 max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">Warum Nexmoneta</p>
            <h2 className="text-4xl font-black text-white sm:text-5xl">
              {t("uniqueTitle")}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.08] p-7" style={{ background: "rgba(255,255,255,0.02)" }}>
              <h3 className="text-lg font-bold text-white">{t("uniqueAi")}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {t("uniqueAiText")}
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] p-7" style={{ background: "rgba(255,255,255,0.02)" }}>
              <h3 className="text-lg font-bold text-white">{t("uniqueRoi")}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {t("uniqueRoiText")}
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] p-7" style={{ background: "rgba(255,255,255,0.02)" }}>
              <h3 className="text-lg font-bold text-white">{t("uniqueAutomation")}</h3>
              <p className="mt-2 text-sm leading-7 text-slate-400">
                {t("uniqueAutomationText")}
              </p>
            </div>
          </div>
        </div>
        </section>

      {/* Top Tools Section */}
        <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Top Tools</p>
            <h2 className="text-4xl font-black text-white sm:text-5xl">
              {t("topToolsTitle")}
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-400">
              {t("topToolsSubtitle")}
            </p>
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
        <section className="py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">Neuer Content</p>
            <h2 className="text-4xl font-black text-white sm:text-5xl">
              {t("latestArticlesTitle")}
            </h2>
            <AiTransparencyBadge locale={locale} className="mt-5" />
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
                className="px-10 py-4 rounded-xl bg-white font-bold text-slate-900 text-base transition hover:bg-slate-100"
              >
                {t("finalFreeCta")}
              </Link>
              <CheckoutCtaButton
                href="/api/checkout?plan=pro"
                ctaKey="final-pro"
                variantA={{
                  label: t("finalProCta"),
                  sourceSuffix: "variant-a",
                  className: "px-10 py-4 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-100 font-bold text-base transition hover:bg-cyan-500/20",
                }}
                variantB={{
                  label: t("finalProAltCta"),
                  sourceSuffix: "variant-b",
                  className: "px-10 py-4 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-100 font-bold text-base transition hover:bg-cyan-500/20",
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
