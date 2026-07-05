import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

type BotType = "sales" | "seo" | "content-ops" | "support";
type TeamRole = "owner" | "growth" | "content" | "support";

const botPrompts: Record<BotType, string> = {
  sales: "Du bist ein interner Sales-Bot. Gib kurze, umsetzbare Upsell-Strategien fuer Pro/Agency, inkl. CTA-Ideen und Priorisierung nach Umsatzhebel.",
  seo: "Du bist ein interner SEO-Bot. Gib konkrete SEO-Verbesserungen fuer Rankings, interne Verlinkung und Content-Cluster. Fokus auf schnelle Wirkung.",
  "content-ops": "Du bist ein interner Content-Ops-Bot. Plane effiziente Content-Workflows, Automationsschritte und Wochen-Sprints mit klaren Verantwortlichkeiten.",
  support: "Du bist ein interner Support-Bot. Formuliere klare, freundliche Antworten fuer Nutzerfragen und gib gleichzeitig konkrete naechste Schritte fuer das Team.",
};

const rolePermissions: Record<TeamRole, BotType[]> = {
  owner: ["sales", "seo", "content-ops", "support"],
  growth: ["sales", "seo", "content-ops"],
  content: ["seo", "content-ops"],
  support: ["support"],
};

function normalizeBot(value: unknown): BotType | null {
  if (value === "sales" || value === "seo" || value === "content-ops" || value === "support") {
    return value;
  }

  return null;
}

function normalizeRole(value: unknown): TeamRole {
  if (value === "growth" || value === "content" || value === "support") {
    return value;
  }

  return "owner";
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const bot = normalizeBot(body?.bot);
    const role = normalizeRole(body?.role);
    const goal = String(body?.goal || "").trim();
    const context = String(body?.context || "").trim();
    const playbook = String(body?.playbook || "").trim();

    if (!bot) {
      return NextResponse.json({ success: false, error: "Ungueltiger Bot-Typ." }, { status: 400 });
    }

    if (!rolePermissions[role].includes(bot)) {
      return NextResponse.json({ success: false, error: "Deine Rolle darf diesen Bot nicht ausfuehren." }, { status: 403 });
    }

    if (!goal) {
      return NextResponse.json({ success: false, error: "Bitte ein Ziel angeben." }, { status: 400 });
    }

    const openai = await getOpenAI();
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: `
${botPrompts[bot]}

Rolle im Team:
${role}

Aktiver Playbook-Modus:
${playbook || "Kein spezieller Playbook-Modus"}

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
      role,
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
