import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import AffiliateButton from "../../blog/[slug]/AffiliateButton";
import { getLocale } from "next-intl/server";

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

function stars(rating: number) {
  if (rating >= 9) return "⭐⭐⭐⭐⭐";
  if (rating >= 8) return "⭐⭐⭐⭐";
  if (rating >= 7) return "⭐⭐⭐";
  if (rating >= 6) return "⭐⭐";
  return "⭐";
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const locale = await getLocale();
  const isEn = locale === "en";
  const { slug } = await params;

  let tools: Awaited<ReturnType<typeof prisma.affiliateLink.findMany>> = [];

  try {
    tools = await prisma.affiliateLink.findMany();
  } catch {
    tools = [];
  }

  if (tools.length === 0) {
    return (
      <main className="px-6 py-20" style={{ background: "var(--background)", minHeight: "100vh" }}>
        <div className="mx-auto max-w-3xl rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-8 text-yellow-100">
          {isEn
            ? "Tool details are temporarily unavailable. Please try again later."
            : "Tool-Details sind voruebergehend nicht verfuegbar. Bitte spaeter erneut versuchen."}
        </div>
      </main>
    );
  }

  const tool = tools.find((item) => createSlug(item.name) === slug);

  if (!tool) {
    notFound();
  }

  const alternativeTools = tools
    .filter((item) => item.id !== tool.id)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <main style={{ background: "var(--background)" }}>
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-cyan-500/10 to-transparent" />

        <div className="relative mx-auto max-w-5xl">
          {tool.badge && (
            <p className="mb-6 inline-block rounded-full bg-yellow-500 px-4 py-2 font-bold text-black">
              {tool.badge}
            </p>
          )}

          <h1 className="mb-4 text-5xl font-bold tracking-tight md:text-7xl">
            {isEn ? `${tool.name} review & rating` : `${tool.name} Test & Bewertung`}
          </h1>

          <p className="mb-3 text-2xl font-bold text-yellow-400">
            {stars(tool.rating)} {tool.rating}/10
          </p>

          {tool.price && (
            <p className="mb-8 text-xl font-bold text-green-400">
              💰 {tool.price}
            </p>
          )}

          <p className="text-slate-300">{isEn ? "Category" : "Kategorie"}: {tool.category}</p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
              <strong className="block text-cyan-300">Klare Einordnung</strong>
              Schnell sehen, ob das Tool zu deinem Ziel passt.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
              <strong className="block text-cyan-300">Weniger Risiko</strong>
              Bewertungen, Pros und Cons helfen bei der Entscheidung.
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
              <strong className="block text-cyan-300">Schneller Einstieg</strong>
              Direkt zu Angebot oder Vergleich wechseln.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <div className="mb-8 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="mb-2 text-2xl font-bold">Schnelle Entscheidung</h2>
              <p className="max-w-3xl leading-7 text-slate-100">
                Wenn du das Tool weiterpruefen willst, kannst du direkt zum Angebot gehen oder zuerst die Alternativen vergleichen.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <AffiliateButton
                id={tool.id}
                url={tool.url}
                text={tool.buttonText || (isEn ? "🚀 View offer" : "🚀 Angebot ansehen")}
                clickSource={`tool-detail-${slug}-hero`}
              />
              <Link
                href="/tools#tools-grid"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-bold text-slate-100 hover:bg-white/10"
              >
                Weitere Tools vergleichen
              </Link>
            </div>
          </div>
        </div>

        {tool.description && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/10 p-8">
            <h2 className="mb-3 text-3xl font-bold">{isEn ? "Quick takeaway" : "Kurzfazit"}</h2>
            <p className="leading-7 text-slate-100">{tool.description}</p>
          </div>
        )}

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {tool.pros && (
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
              <h2 className="mb-4 text-2xl font-bold text-green-400">
                {isEn ? "✅ Pros" : "✅ Vorteile"}
              </h2>

              <ul className="ml-6 list-disc space-y-2 text-slate-100">
                {tool.pros.split("\n").map((pro, index) => (
                  <li key={index}>{pro}</li>
                ))}
              </ul>
            </div>
          )}

          {tool.cons && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
              <h2 className="mb-4 text-2xl font-bold text-red-400">
                {isEn ? "❌ Cons" : "❌ Nachteile"}
              </h2>

              <ul className="ml-6 list-disc space-y-2 text-slate-100">
                {tool.cons.split("\n").map((con, index) => (
                  <li key={index}>{con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mb-8 rounded-2xl border border-green-500/40 bg-green-500/10 p-8">
          <h2 className="mb-4 text-3xl font-bold">
            {isEn ? `Is ${tool.name} worth it?` : `Lohnt sich ${tool.name}?`}
          </h2>

          <p className="mb-6 leading-7 text-slate-100">
            {isEn
              ? `${tool.name} is especially interesting if you are looking for a solution in the `
              : `${tool.name} ist besonders interessant, wenn du eine Lösung aus der `}
            {isEn ? "category " : "Kategorie "}
            <strong>{tool.category}</strong>
            {isEn
              ? " and want to find a suitable recommendation quickly."
              : " suchst und schnell eine passende Empfehlung finden möchtest."}
          </p>

          <AffiliateButton
            id={tool.id}
            url={tool.url}
            text={tool.buttonText || (isEn ? "🚀 View offer" : "🚀 Angebot ansehen")}
            clickSource={`tool-detail-${slug}`}
          />
        </div>

        {alternativeTools.length > 0 && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/10 p-8">
            <h2 className="mb-3 text-3xl font-bold">{isEn ? "Good alternatives" : "Gute Alternativen"}</h2>
            <p className="mb-6 leading-7 text-slate-100">
              {isEn
                ? "If this one is not the best fit, compare these alternatives before deciding."
                : "Wenn das hier nicht perfekt passt, vergleiche zuerst diese Alternativen."}
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              {alternativeTools.map((alternative) => (
                <div key={alternative.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold text-white">{alternative.name}</h3>
                    <span className="text-lg font-bold text-yellow-400">⭐ {alternative.rating.toFixed(1)}</span>
                  </div>
                  <p className="mb-3 text-sm text-slate-300">{alternative.category}</p>
                  {alternative.price && <p className="mb-4 font-bold text-green-400">💰 {alternative.price}</p>}
                  <p className="mb-5 text-sm leading-6 text-slate-100">{alternative.description || alternative.category}</p>
                  <Link
                    href={`/tools/${createSlug(alternative.name)}`}
                    className="inline-flex rounded-xl bg-cyan-500 px-4 py-2 font-bold text-white hover:bg-cyan-400"
                  >
                    {isEn ? "Open details" : "Details ansehen"}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/10 p-8">
          <h2 className="mb-6 text-3xl font-bold">{isEn ? "Frequently asked questions" : "Häufige Fragen"}</h2>

          <div className="space-y-5 text-slate-100">
            <div>
              <h3 className="font-bold text-white">
                {isEn ? `Who is ${tool.name} for?` : `Für wen ist ${tool.name} geeignet?`}
              </h3>
              <p>
                {isEn
                  ? "For users looking for a reliable solution in "
                  : "Für Nutzer, die eine zuverlässige Lösung im Bereich "}
                {tool.category}
                {isEn ? "." : " suchen."}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white">
                {isEn ? `Is ${tool.name} recommended?` : `Ist ${tool.name} empfehlenswert?`}
              </h3>
              <p>
                {isEn
                  ? `With a rating of ${tool.rating}/10, ${tool.name} is one of our recommended tools.`
                  : `Mit einer Bewertung von ${tool.rating}/10 gehört ${tool.name} zu unseren empfohlenen Tools.`}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}