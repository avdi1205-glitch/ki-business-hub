import Link from "next/link";
import AffiliateButton from "../blog/[slug]/AffiliateButton";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

type Tool = {
  id: number;
  name: string;
  url: string;
  category: string;
  rating: number;
  price: string | null;
  badge: string | null;
  buttonText: string | null;
};

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

export default function TopTools({ tools }: { tools: Tool[] }) {
  const t = useTranslations("home");
  const locale = useLocale();
  const topTools = tools.slice(0, 3);

  const translateBadge = (badge: string) => {
    if (locale === "en") return badge;
    if (badge === "Most Popular") return "Am beliebtesten";
    if (badge === "Best for Images") return "Am besten fuer Bilder";
    return badge;
  };

  return (
    <section className="mb-12">
      <div className="mb-6 max-w-2xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/80">Top Tools</p>
        <h2 className="display-heading text-3xl font-black text-white sm:text-4xl">🏆 {t("topToolsSectionTitle")}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {topTools.map((tool, index) => (
          <div
            key={tool.id}
            className={`rounded-[2rem] border border-white/10 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${index === 1 ? "md:translate-y-6" : index === 2 ? "md:-translate-y-4" : ""}`}
            style={{
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.7) 100%)",
              boxShadow: "0 24px 60px rgba(2, 6, 23, 0.28)",
            }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300/80 mb-3">
              #{index + 1} {t("topToolsRecommendation")}
            </p>

            {tool.badge && (
              <p className="inline-block rounded-full bg-amber-400 px-3 py-1 mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-950">
                {translateBadge(tool.badge)}
              </p>
            )}

            <h3 className="text-2xl font-black text-white">
              {tool.name}
            </h3>

            <p className="mt-3 font-bold text-amber-300">
              ⭐ {tool.rating}/10
            </p>

            {tool.price && (
              <p className="mt-2 font-bold text-emerald-300">
                💰 {tool.price}
              </p>
            )}

            <p className="mt-2 leading-7 text-slate-300">
              {tool.category}
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href={`/tools/${createSlug(tool.name)}`}
                className="block rounded-2xl border border-sky-400/30 bg-sky-500/10 px-4 py-3 text-center font-black text-white transition-all duration-300 hover:-translate-y-1 hover:bg-sky-500/20"
              >
                {t("topToolsLearnMore")}
              </Link>

              <AffiliateButton
                id={tool.id}
                url={tool.url}
                text={tool.buttonText || `🚀 ${t("topToolsOfferCta")}`}
                clickSource="homepage-top-tools"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}