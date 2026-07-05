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
  let links: Awaited<ReturnType<typeof prisma.affiliateLink.findMany>> = [];

  try {
    links = await prisma.affiliateLink.findMany({
      orderBy: { rating: "desc" },
    });
  } catch {
    // Render fallback content if DB is unavailable.
    links = [];
  }

  return (
    <main style={{ background: "var(--background)" }}>
      <section
        className="relative overflow-hidden px-6 py-20"
        style={{ background: "linear-gradient(160deg, #0b1220 0%, #0f3d36 100%)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/12 via-cyan-500/10 to-transparent" />

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

          <div className="mb-8 grid gap-3 text-sm text-slate-100 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-bold text-emerald-300">Praxisnutzen zuerst</p>
              <p className="mt-1 text-slate-200">Nur Tools, die in echten Workflows sinnvoll sind.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-bold text-emerald-300">Klare Entscheidung</p>
              <p className="mt-1 text-slate-200">Rating, Preis und Nutzen auf einen Blick.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-bold text-emerald-300">Schnell zum passenden Tool</p>
              <p className="mt-1 text-slate-200">Direkt zu Details oder zur Empfehlung wechseln.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="#affiliate-grid"
              className="rounded-xl bg-emerald-500 px-5 py-3 font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400"
            >
              Empfehlungen ansehen
            </Link>
            <Link
              href="/tools"
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-bold text-slate-100 hover:bg-white/10"
            >
              Zur Tool-Uebersicht
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20" style={{ background: "var(--background)" }}>
        <div className="-mt-10 mb-8 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-bold text-emerald-300">Bewertung</p>
              <p className="mt-1 text-sm text-slate-200">Top-Ratings stehen oben, damit du schneller entscheiden kannst.</p>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">Preis-Leistung</p>
              <p className="mt-1 text-sm text-slate-200">Preis und Nutzen sind direkt sichtbar, ohne Zusatzsuche.</p>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">Naechster Schritt</p>
              <p className="mt-1 text-sm text-slate-200">Ueber Details oder Button direkt zum passenden Angebot gehen.</p>
            </div>
          </div>
        </div>

        {links.length === 0 && (
          <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-yellow-100">
            Affiliate-Daten sind gerade nicht verfuegbar. Bitte spaeter erneut laden.
          </div>
        )}

        <div id="affiliate-grid" className="grid gap-6 md:grid-cols-3">
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