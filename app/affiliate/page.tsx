import Link from "next/link";
import { prisma } from "../../lib/prisma";
import AffiliateButton from "../blog/[slug]/AffiliateButton";
import { getTranslations } from "next-intl/server";

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

export default async function AffiliatePage() {
  const t = await getTranslations("affiliate");
  const links = await prisma.affiliateLink.findMany({
    orderBy: { rating: "desc" },
  });

  return (
    <main style={{ background: "var(--background)" }}>
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-cyan-500/10 to-transparent" />

        <div className="relative mx-auto max-w-6xl">
          <p className="mb-4 font-bold text-green-400">
            💰 {t("eyebrow")}
          </p>

          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
            {t("title")}
          </h1>

          <p className="mb-10 max-w-3xl text-xl leading-8 text-slate-100">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="rounded-2xl border border-white/10 bg-white/10 p-6"
            >
              {link.badge && (
                <p className="mb-4 inline-block rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-black">
                  {link.badge}
                </p>
              )}

              <h2 className="text-2xl font-bold">{link.name}</h2>

              <p className="mt-3 font-bold text-yellow-400">
                ⭐ {link.rating}/10
              </p>

              {link.price && (
                <p className="mt-2 font-bold text-green-400">
                  💰 {link.price}
                </p>
              )}

              <p className="mt-2 text-slate-300">{link.category}</p>

              {link.description && (
                <p className="mt-4 leading-7 text-slate-100">{link.description}</p>
              )}

              <div className="mt-6 space-y-3">
                <Link
                  href={`/tools/${createSlug(link.name)}`}
                  className="block rounded-xl border border-blue-400/30 bg-blue-600 px-4 py-3 text-center font-bold text-white shadow-sm hover:bg-blue-700"
                >
                  {t("readMore")}
                </Link>

                <AffiliateButton
                  id={link.id}
                  url={link.url}
                  text={link.buttonText || `🚀 ${t("cta")}`}
                  clickSource="affiliate-directory"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}