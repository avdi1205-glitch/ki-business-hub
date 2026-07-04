import Link from "next/link";
import { prisma } from "../../lib/prisma";
import AffiliateButton from "../blog/[slug]/AffiliateButton";
import TopTools from "../components/TopTools";

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

export default async function BesteToolsPage() {
  const affiliateLinks = await prisma.affiliateLink.findMany({
    orderBy: { rating: "desc" },
  });

  return (
    <main style={{ background: "var(--background)", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20" style={{ background: "linear-gradient(135deg, var(--background) 0%, var(--background-alt) 100%)" }}>
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 font-bold" style={{ color: "var(--success)" }}>
            💰 KI Business Hub Empfehlungen
          </p>

          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl" style={{ color: "var(--text-dark)" }}>
            Die besten Tools für dein Online-Business
          </h1>

          <p className="mb-10 max-w-3xl text-xl leading-8" style={{ color: "#e2e8f0" }}>
            Vergleiche Software für KI, Hosting, VPN, Automation und Affiliate-Marketing.
            Schnell, klar und auf den Punkt.
          </p>

          <TopTools tools={affiliateLinks} />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-6 text-3xl font-bold">📊 Vergleichstabelle</h2>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/10">
          <table className="w-full text-left">
            <thead className="bg-white/10">
              <tr>
                <th className="p-4">Tool</th>
                <th className="p-4">Bewertung</th>
                <th className="p-4">Preis</th>
                <th className="p-4">Kategorie</th>
                <th className="p-4">Aktion</th>
              </tr>
            </thead>

            <tbody>
              {affiliateLinks.map((tool) => (
                <tr key={tool.id} className="border-t border-white/10">
                  <td className="p-4 font-bold">{tool.name}</td>

                  <td className="p-4 font-bold text-yellow-400">
                    {stars(tool.rating)} {tool.rating}/10
                  </td>

                  <td className="p-4 font-bold text-green-400">
                    {tool.price || "Keine Angabe"}
                  </td>

                  <td className="p-4 text-slate-300">{tool.category}</td>

                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/tools/${createSlug(tool.name)}`}
                        className="rounded-lg border border-blue-400/30 bg-blue-600 px-4 py-3 text-center font-bold text-white shadow-sm hover:bg-blue-700"
                      >
                        Mehr erfahren
                      </Link>

                      <AffiliateButton
                        id={tool.id}
                        url={tool.url}
                        text={tool.buttonText || "🚀 Angebot ansehen"}
                        clickSource="best-tools-table"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-14 rounded-2xl border border-white/10 bg-white/10 p-8">
          <h2 className="mb-6 text-3xl font-bold">❓ Häufige Fragen</h2>

          <div className="space-y-6 text-slate-100">
            <div>
              <h3 className="text-xl font-bold text-white">
                Welches Tool ist die beste Wahl?
              </h3>
              <p>
                Das hängt von deinem Ziel ab. Für Hosting ist Hostinger stark,
                für KI-Anwendungen ChatGPT Plus und für Datenschutz NordVPN.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Sind die Links Affiliate-Links?
              </h3>
              <p>
                Einige Links können Affiliate-Links sein. Wenn du darüber kaufst,
                können wir eine Provision erhalten. Für dich entstehen keine Zusatzkosten.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}