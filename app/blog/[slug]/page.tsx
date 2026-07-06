import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import { prisma } from "../../../lib/prisma";
import { getSiteUrl } from "../../../lib/site-url";
import GoogleAd from "../../components/GoogleAd";
import NewsletterForm from "@/app/components/NewsletterForm";
import OptimizedAffiliateButton from "@/app/components/OptimizedAffiliateButton";
import CheckoutCtaButton from "@/app/components/CheckoutCtaButton";
import { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";

function getExcerpt(text: string, maxLength = 160): string {
  if (!text) return "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength - 1)}…`;
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const t = await getTranslations("blogArticle");
  const { slug } = await params;
  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article) return {};

  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/blog/${slug}`;
  const description = getExcerpt(article.idea || article.content, 170);
  const ogImage = `${siteUrl}/og-image.png`;

  return {
    title: `${article.title} | ${t("siteName")}`,
    description,
    alternates: {
      canonical: `/blog/${slug}`,
    },
    authors: [{ name: "Nexmoneta" }],
    openGraph: {
      title: article.title,
      description,
      type: "article",
      url: articleUrl,
      publishedTime: article.createdAt.toISOString(),
      section: article.category || "Blog",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = await getTranslations("blogArticle");
  const locale = await getLocale();
  const articleTopAdSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_TOP;
  const articleInlineAdSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_INLINE;
  const articleSidebarAdSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE_SIDEBAR;

  const article = await prisma.article.findUnique({
    where: { slug },
  });

  if (!article) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/blog/${slug}`;
  const dateLocale = locale === "en" ? "en-US" : "de-DE";
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": articleUrl,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    headline: article.title,
    description: getExcerpt(article.idea || article.content, 170),
    datePublished: article.createdAt.toISOString(),
    inLanguage: locale === "en" ? "en-US" : "de-DE",
    articleSection: article.category || "Blog",
    isAccessibleForFree: true,
    image: [`${siteUrl}/og-image.png`],
    wordCount: article.content ? article.content.trim().split(/\s+/).length : undefined,
    author: {
      "@type": "Organization",
      name: "Nexmoneta",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Nexmoneta",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: t("breadcrumbHome"),
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("breadcrumbBlog"),
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: articleUrl,
      },
    ],
  };

  // Get top tools for recommendations
  const topTools = await prisma.affiliateLink.findMany({
    orderBy: { rating: "desc" },
    take: 5,
  });

  // Query related tools only when a valid category exists.
  const relatedTools = article.category
    ? await prisma.affiliateLink.findMany({
      where: { category: article.category },
      orderBy: { clicks: "desc" },
      take: 3,
    })
    : [];

  const mainTools = topTools.slice(0, 3);
  const sidebarTools = relatedTools.slice(0, 4);

  return (
    <>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Script
        id="article-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <main style={{ background: "var(--background)" }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20" style={{ background: "linear-gradient(135deg, var(--background) 0%, var(--background-alt) 100%)" }}>
        <div className="relative mx-auto max-w-4xl">
          <p className="mb-4 inline-flex items-center rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-cyan-200">
            {t("aiGenerated")}
          </p>

          <p className="mb-4 font-bold" style={{ color: "var(--primary)" }}>
            {article.category || "Blog"} • SEO Score: {article.seoScore || "0"}
          </p>

          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl" style={{ color: "var(--text-dark)" }}>
            {article.title}
          </h1>

          <p className="text-xl leading-8 text-slate-100">
            {article.idea}
          </p>

          <div className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur md:grid-cols-3">
            <div>
              <p className="text-sm font-bold text-cyan-300">1. Schnell pruefen</p>
              <p className="mt-1 text-sm leading-6 text-slate-200">Die wichtigsten Empfehlungen stehen direkt oben, damit du nicht suchen musst.</p>
            </div>
            <div>
              <p className="text-sm font-bold text-cyan-300">2. Passendes Tool waehlen</p>
              <p className="mt-1 text-sm leading-6 text-slate-200">Die naechste gute Entscheidung ist meist eines der Top-Tools oder ein direkter Vergleich.</p>
            </div>
            <div>
              <p className="text-sm font-bold text-cyan-300">3. Mit einem Klick weiter</p>
              <p className="mt-1 text-sm leading-6 text-slate-200">Wenn etwas passt, sofort in die passende Tool- oder Empfehlungsstrecke wechseln.</p>
            </div>
          </div>

          {/* Top CTA Section */}
          <div className="mt-8 rounded-xl border border-green-500/30 bg-green-500/10 p-6">
            <p className="mb-4 text-sm text-green-400">
              💡 {t("quickRecommendation")}
            </p>
            {mainTools[0] && (
              <OptimizedAffiliateButton
                toolId={mainTools[0].id}
                toolName={mainTools[0].name}
                toolUrl={mainTools[0].url}
                articleSlug={slug}
                clickSource={`blog-${slug}-hero`}
                buttonText={mainTools[0].buttonText || t("tryIt")}
              />
            )}
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Article Content */}
          <div className="lg:col-span-2">
            {articleTopAdSlot && (
              <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
                <GoogleAd slot={articleTopAdSlot} size="responsive" />
              </div>
            )}

            <article className="rounded-2xl border border-white/10 bg-white/10 p-8">
              <div className="whitespace-pre-line leading-8 text-gray-200">
                {article.content}
              </div>
            </article>

            {articleInlineAdSlot && (
              <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
                <GoogleAd slot={articleInlineAdSlot} size="responsive" />
              </div>
            )}

            {/* Mid-Article CTA */}
            {mainTools[1] && (
              <div className="mt-10 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-8">
                <h3 className="mb-4 text-2xl font-bold">
                  ⚡ {t("continueWith", { name: mainTools[1].name })}
                </h3>
                <p className="mb-6 leading-7 text-slate-100">
                  {mainTools[1].description || t("toolFallbackDescription")}
                </p>
                <OptimizedAffiliateButton
                  toolId={mainTools[1].id}
                  toolName={mainTools[1].name}
                  toolUrl={mainTools[1].url}
                  articleSlug={slug}
                  clickSource={`blog-${slug}-mid`}
                  buttonText={t("compareNow")}
                />
              </div>
            )}

            <section className="mt-10 rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/12 to-cyan-500/8 p-8 shadow-2xl shadow-slate-950/20 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300/80">
                {locale === "en" ? "Next revenue step" : "Naechster Umsatzschritt"}
              </p>
              <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h3 className="text-2xl font-black text-white sm:text-3xl">
                    {locale === "en"
                      ? "Turn this article into a repeatable content and affiliate workflow when it fits your setup."
                      : "Mach aus diesem Artikel einen wiederholbaren Content- und Affiliate-Workflow, wenn es zu deinem Setup passt."}
                  </h3>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                    {locale === "en"
                      ? "A single recommendation helps. A repeatable system for publishing, monetizing, and tracking usually goes further. That is where Pro and Agency can become useful."
                      : "Eine einzelne Empfehlung hilft. Ein wiederholbares System fuer Veröffentlichen, Monetarisieren und Tracking bringt meist deutlich mehr. Genau dort koennen Pro und Agency sinnvoll werden."}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:w-[40rem]">
                  <Link
                    href="/content-factory"
                    className="rounded-2xl border border-emerald-300/20 bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-center font-black text-white shadow-[0_18px_40px_rgba(16,185,129,0.22)] transition-all duration-300 hover:-translate-y-1"
                  >
                    🚀 {locale === "en" ? "Start free" : "Kostenlos starten"}
                  </Link>
                  <CheckoutCtaButton
                    href="/api/checkout?plan=pro"
                    ctaKey={`blog-${slug}-pro`}
                    variantA={{
                      label: locale === "en" ? "💎 See Pro for EUR 39" : "💎 Pro fuer 39 EUR ansehen",
                      sourceSuffix: "variant-a",
                      className: "rounded-2xl border border-sky-300/20 bg-sky-500/10 px-4 py-3 text-center font-black text-sky-100 transition-all duration-300 hover:-translate-y-1 hover:bg-sky-500/20",
                    }}
                    variantB={{
                      label: locale === "en" ? "⚡ See Pro" : "⚡ Pro ansehen",
                      sourceSuffix: "variant-b",
                      className: "rounded-2xl border border-sky-300/20 bg-sky-500/10 px-4 py-3 text-center font-black text-sky-100 transition-all duration-300 hover:-translate-y-1 hover:bg-sky-500/20",
                    }}
                  />
                  <CheckoutCtaButton
                    href="/api/checkout?plan=agency"
                    ctaKey={`blog-${slug}-agency`}
                    variantA={{
                      label: locale === "en" ? "👑 See Agency for EUR 149" : "👑 Agency fuer 149 EUR ansehen",
                      sourceSuffix: "variant-a",
                      className: "rounded-2xl border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-center font-black text-amber-100 transition-all duration-300 hover:-translate-y-1 hover:bg-amber-500/20",
                    }}
                    variantB={{
                      label: locale === "en" ? "🏢 See Agency" : "🏢 Agency ansehen",
                      sourceSuffix: "variant-b",
                      className: "rounded-2xl border border-amber-300/20 bg-amber-500/10 px-4 py-3 text-center font-black text-amber-100 transition-all duration-300 hover:-translate-y-1 hover:bg-amber-500/20",
                    }}
                  />
                </div>
              </div>
            </section>

            {/* All Recommended Tools */}
            {mainTools.length > 0 && (
              <section className="mt-10 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-8">
                <h2 className="mb-6 text-3xl font-bold">
                  🏆 {t("bestRatedTools")}
                </h2>

                <div className="grid gap-6 md:grid-cols-2">
                  {mainTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="rounded-xl border border-white/10 bg-white/10 p-6 hover:bg-white/20"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <h3 className="text-xl font-bold">{tool.name}</h3>
                        <span className="text-2xl font-bold text-yellow-400">
                          ⭐ {tool.rating.toFixed(1)}
                        </span>
                      </div>

                      {tool.badge && (
                        <p className="mb-3 inline-block rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-black">
                          {tool.badge}
                        </p>
                      )}

                      <p className="mb-4 leading-7 text-slate-100">
                        {tool.description || tool.category}
                      </p>

                      {tool.price && (
                        <p className="mb-4 font-bold text-green-400">
                          💰 {tool.price}
                        </p>
                      )}

                      <OptimizedAffiliateButton
                        toolId={tool.id}
                        toolName={tool.name}
                        toolUrl={tool.url}
                        articleSlug={slug}
                        clickSource={`blog-${slug}-grid`}
                        buttonText={tool.buttonText || t("visit")}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom Newsletter CTA */}
            <section className="mt-10 rounded-2xl border border-orange-500/30 bg-orange-500/10 p-8">
              <h3 className="mb-2 text-2xl font-bold">
                📬 {t("newsletterHeading")}
              </h3>
              <p className="mb-6 leading-7 text-slate-100">
                {t("newsletterBody")}
              </p>
              <NewsletterForm source={`blog-${slug}`} />
            </section>
          </div>

          {/* Sidebar - Additional Tools & Info */}
          <div className="space-y-6 lg:col-span-1">
            {articleSidebarAdSlot && (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <GoogleAd slot={articleSidebarAdSlot} size="300x600" />
              </div>
            )}

            {/* Related Tools Sidebar */}
            {sidebarTools.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
                <h3 className="mb-4 font-bold text-cyan-300">
                  🎯 {t("moreRecommendations")}
                </h3>
                <div className="space-y-3">
                  {sidebarTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="rounded-lg border border-white/10 bg-white/5 p-4 hover:bg-white/10"
                    >
                      <p className="font-bold text-white">{tool.name}</p>
                      <p className="text-xs text-slate-300">{tool.category}</p>
                      <p className="mt-2 text-sm text-yellow-400">
                        ⭐ {tool.rating.toFixed(1)}/10 ({tool.clicks} {t("clicks")})
                      </p>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={async () => {
                          try {
                            await fetch("/api/track-affiliate-click", {
                              method: "POST",
                              body: JSON.stringify({
                                affiliateLinkId: tool.id,
                                articleSlug: slug,
                              }),
                            });
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        className="mt-3 inline-block rounded-full bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-500/20 hover:text-cyan-100"
                      >
                        {t("visit")}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Article Info Box */}
            <div className="rounded-2xl border border-white/10 bg-white/10 p-6">
              <h4 className="mb-4 font-bold">📊 {t("articleInfo")}</h4>
              <div className="space-y-2 text-sm text-slate-300">
                <p>🤖 {t("labelAi")}</p>
                <p>📁 {t("labelCategory")}: {article.category || t("general")}</p>
                <p>📅 {t("published")}: {new Date(article.createdAt).toLocaleDateString(dateLocale)}</p>
                <p>🎯 SEO Score: {article.seoScore || 0}%</p>
                <p>
                  📝 {t("status")}: {article.status === "Veröffentlicht"
                    ? locale === "en"
                      ? "Published"
                      : "Veröffentlicht"
                    : article.status === "Geplant"
                      ? locale === "en"
                        ? "Scheduled"
                        : "Geplant"
                      : article.status}
                </p>
              </div>
            </div>

            {/* CTA Box */}
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
              <h4 className="mb-3 font-bold text-green-300">
                ✨ {t("proTip")}
              </h4>
              <p className="text-sm text-gray-300">
                {t("proTipBody")}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-10">
          <Link
            href="/blog"
            className="inline-block rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold hover:bg-white/20"
          >
            ← {t("backToBlog")}
          </Link>
        </div>
      </section>
      </main>
    </>
  );
}