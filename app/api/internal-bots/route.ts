import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

type BotType = "sales" | "seo" | "content-ops" | "support";

const botPrompts: Record<BotType, string> = {
  sales: "Du bist ein interner Sales-Bot. Gib kurze, umsetzbare Upsell-Strategien fuer Pro/Agency, inkl. CTA-Ideen und Priorisierung nach Umsatzhebel.",
  seo: "Du bist ein interner SEO-Bot. Gib konkrete SEO-Verbesserungen fuer Rankings, interne Verlinkung und Content-Cluster. Fokus auf schnelle Wirkung.",
  "content-ops": "Du bist ein interner Content-Ops-Bot. Plane effiziente Content-Workflows, Automationsschritte und Wochen-Sprints mit klaren Verantwortlichkeiten.",
  support: "Du bist ein interner Support-Bot. Formuliere klare, freundliche Antworten fuer Nutzerfragen und gib gleichzeitig konkrete naechste Schritte fuer das Team.",
};

function normalizeBot(value: unknown): BotType | null {
  if (value === "sales" || value === "seo" || value === "content-ops" || value === "support") {
    return value;
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const bot = normalizeBot(body?.bot);
    const goal = String(body?.goal || "").trim();
    const context = String(body?.context || "").trim();

    if (!bot) {
      return NextResponse.json({ success: false, error: "Ungueltiger Bot-Typ." }, { status: 400 });
    }

    if (!goal) {
      return NextResponse.json({ success: false, error: "Bitte ein Ziel angeben." }, { status: 400 });
    }

    const openai = await getOpenAI();
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: `
${botPrompts[bot]}

Ziel:
${goal}

Kontext:
${context || "Kein zusaetzlicher Kontext"}

Antworte auf Deutsch und strukturiere die Antwort so:
1) Kurzdiagnose
2) Top-3 Aktionen mit Prioritaet
3) Konkreter 7-Tage-Plan
`,
    });

    return NextResponse.json({
      success: true,
      bot,
      answer: response.output_text,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Interner Fehler",
      },
      { status: 500 }
    );
  }
}
