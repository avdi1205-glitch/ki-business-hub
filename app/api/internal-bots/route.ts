import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";
import { prisma } from "@/lib/prisma";

type BotType = "sales" | "seo" | "content-ops" | "support";
type TeamRole = "owner" | "growth" | "content" | "support";

const botPrompts: Record<BotType, string> = {
  sales:
    "Du bist ein interner Sales-Bot. Optimiere auf Umsatz: mehr Upgrades, mehr Abschluesse, bessere CTA-Conversion und klarere Angebote. Nenne immer die schnellste profitable Aktion, einen CTA-Text und die groesste Einwandbehandlung.",
  seo:
    "Du bist ein interner SEO-Bot. Optimiere auf qualifizierten Traffic: suchintensive Keywords, interne Verlinkung, Vergleichsseiten, Money-Keywords und schnelle Ranking-Hebel mit Monetarisierungsperspektive.",
  "content-ops":
    "Du bist ein interner Content-Ops-Bot. Optimiere auf Output pro Stunde und Umsatzwirkung: Content-Pipeline, Automationen, Priorisierung von Seiten mit Conversion-Potenzial und klare Sprint-Schritte.",
  support:
    "Du bist ein interner Support-Bot. Optimiere auf Retention und Expansion: freundliche Antworten, Upgrade-Hinweise, Einwandbehandlung, naechste Schritte und kleine Hebel zur Reduktion von Churn.",
};

const botMoneyLens: Record<BotType, string> = {
  sales: "Money-Lens: Pro/Agency-Upsell, CTA-Positionierung, Preisanker, Einwaende, Abschlussquote.",
  seo: "Money-Lens: mehr qualifizierte Besucher auf Money-Seiten, interne Links auf konvertierende Seiten, Vergleichs- und Entscheidungs-Content.",
  "content-ops": "Money-Lens: schneller mehr publishen, erst Seiten mit Umsatzpotenzial, weniger Reibung, mehr Durchsatz.",
  support: "Money-Lens: weniger Churn, mehr Upgrades, bessere Antworten, hoehere Aktivierung und Bindung.",
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

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 10);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const bot = normalizeBot(body?.bot);
    const role = normalizeRole(body?.role);
    const goal = String(body?.goal || "").trim();
    const context = String(body?.context || "").trim();
    const playbook = String(body?.playbook || "").trim();
    const tags = normalizeTags(body?.tags);
    const recurringTaskKey = String(body?.recurringTaskKey || "").trim() || null;

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

${botMoneyLens[bot]}

Rolle im Team:
${role}

Aktiver Playbook-Modus:
${playbook || "Kein spezieller Playbook-Modus"}

Ziel:
${goal}

Kontext:
${context || "Kein zusaetzlicher Kontext"}

Antworte auf Deutsch und strukturiere die Antwort so:
1) Money-Diagnose: Was bringt am ehesten Umsatz oder qualifizierten Traffic?
2) Top-3 Aktionen mit Prioritaet: jeweils Wirkung, Aufwand, CTA/Offer-Hebel
3) Konkreter 7-Tage-Plan: mit Reihenfolge, Owner und naechstem Schritt
4) Einwand/Engpass: groesster Blocker plus die beste Gegenstrategie
5) Copy-Asset: ein kurzer, direkt nutzbarer CTA-, Hook- oder Antwort-Text
Verwende nur ASCII-Zeichen (ae, oe, ue, ss statt Umlaute).
`,
    });

    let persistenceAvailable = true;
    let runId: number | null = null;

    try {
      const saved = await prisma.internalBotRun.create({
        data: {
          bot,
          role,
          playbook: playbook || null,
          goal,
          context: context || null,
          answer: response.output_text,
          tags,
          recurringTaskKey,
        },
      });
      runId = saved.id;
    } catch {
      persistenceAvailable = false;
    }

    return NextResponse.json({
      success: true,
      bot,
      role,
      answer: response.output_text,
      tags,
      recurringTaskKey,
      runId,
      persistenceAvailable,
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
