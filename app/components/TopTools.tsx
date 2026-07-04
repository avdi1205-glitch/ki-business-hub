import Link from "next/link";
import AffiliateButton from "../blog/[slug]/AffiliateButton";

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
  const topTools = tools.slice(0, 3);

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6">
        🏆 Unsere Top 3 Empfehlungen
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {topTools.map((tool, index) => (
          <div
            key={tool.id}
            className="bg-white/10 border border-white/10 rounded-2xl p-6"
          >
            <p className="text-green-400 font-bold mb-3">
              #{index + 1} Empfehlung
            </p>

            {tool.badge && (
              <p className="inline-block bg-yellow-500 text-black font-bold px-3 py-1 rounded-full mb-3">
                {tool.badge}
              </p>
            )}

            <h3 className="text-2xl font-bold">
              {tool.name}
            </h3>

            <p className="text-yellow-400 font-bold mt-3">
              ⭐ {tool.rating}/10
            </p>

            {tool.price && (
              <p className="text-green-400 font-bold mt-2">
                💰 {tool.price}
              </p>
            )}

            <p className="mt-2 leading-7" style={{ color: "#cbd5e1" }}>
              {tool.category}
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href={`/tools/${createSlug(tool.name)}`}
                className="block rounded-lg border border-blue-400/30 bg-blue-600 px-4 py-3 text-center font-bold text-white hover:bg-blue-700"
                style={{ color: "#f8fafc", textShadow: "0 1px 1px rgba(0,0,0,0.25)" }}
              >
                Mehr erfahren
              </Link>

              <AffiliateButton
                id={tool.id}
                url={tool.url}
                text={tool.buttonText || "🚀 Angebot ansehen"}
                clickSource="homepage-top-tools"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}