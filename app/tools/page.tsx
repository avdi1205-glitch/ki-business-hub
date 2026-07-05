import Link from "next/link";
import { prisma } from "../../lib/prisma";
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

export default async function ToolsPage() {
  const t = await getTranslations("tools");
  let tools: Awaited<ReturnType<typeof prisma.affiliateLink.findMany>> = [];

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
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-transparent" />

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
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        {tools.length === 0 && (
          <div className="mb-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 text-yellow-100">
            Tool-Daten sind gerade nicht verfuegbar. Bitte spaeter erneut laden.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={`/tools/${createSlug(tool.name)}`}
              className="rounded-2xl border border-white/10 bg-white/10 p-6 hover:bg-white/20"
            >
              {tool.badge && (
                <p className="mb-4 inline-block rounded-full bg-yellow-500 px-3 py-1 text-sm font-bold text-black">
                  {tool.badge}
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