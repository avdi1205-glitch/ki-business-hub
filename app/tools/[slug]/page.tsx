import { notFound } from "next/navigation";
import { prisma } from "../../../lib/prisma";
import AffiliateButton from "../../blog/[slug]/AffiliateButton";

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
  const { slug } = await params;

  const tools = await prisma.affiliateLink.findMany();
  const tool = tools.find((item) => createSlug(item.name) === slug);

  if (!tool) {
    notFound();
  }

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
            {tool.name} Test & Bewertung
          </h1>

          <p className="mb-3 text-2xl font-bold text-yellow-400">
            {stars(tool.rating)} {tool.rating}/10
          </p>

          {tool.price && (
            <p className="mb-8 text-xl font-bold text-green-400">
              💰 {tool.price}
            </p>
          )}

          <p className="text-slate-300">Kategorie: {tool.category}</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        {tool.description && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/10 p-8">
            <h2 className="mb-3 text-3xl font-bold">Kurzfazit</h2>
            <p className="leading-7 text-slate-100">{tool.description}</p>
          </div>
        )}

        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {tool.pros && (
            <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6">
              <h2 className="mb-4 text-2xl font-bold text-green-400">
                ✅ Vorteile
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
                ❌ Nachteile
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
            Lohnt sich {tool.name}?
          </h2>

          <p className="mb-6 leading-7 text-slate-100">
            {tool.name} ist besonders interessant, wenn du eine Lösung aus der
            Kategorie <strong>{tool.category}</strong> suchst und schnell eine
            passende Empfehlung finden möchtest.
          </p>

          <AffiliateButton
            id={tool.id}
            url={tool.url}
            text={tool.buttonText || "🚀 Angebot ansehen"}
            clickSource={`tool-detail-${slug}`}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/10 p-8">
          <h2 className="mb-6 text-3xl font-bold">Häufige Fragen</h2>

          <div className="space-y-5 text-slate-100">
            <div>
              <h3 className="font-bold text-white">
                Für wen ist {tool.name} geeignet?
              </h3>
              <p>
                Für Nutzer, die eine zuverlässige Lösung im Bereich{" "}
                {tool.category} suchen.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white">
                Ist {tool.name} empfehlenswert?
              </h3>
              <p>
                Mit einer Bewertung von {tool.rating}/10 gehört {tool.name} zu
                unseren empfohlenen Tools.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}