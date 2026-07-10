export type Plan = "starter" | "pro" | "agency";
export type Focus = "affiliate" | "leadgen" | "ads" | "membership";

export type Recommendation = {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  why: string;
  action: string;
  estimatedMonthlyLift: number;
};

export type RevenueNavigatorInputs = {
  plan: Plan;
  focus: Focus;
  monthlyVisitors: number;
  affiliateClicks: number;
  newsletterSignups: number;
  contentPieces: number;
  teamSize: number;
};

export function normalizePlan(value: string | null | undefined): Plan {
  if (value === "agency") return "agency";
  if (value === "pro") return "pro";
  return "starter";
}

export function normalizeFocus(value: string | null | undefined): Focus {
  if (value === "leadgen" || value === "ads" || value === "membership") return value;
  return "affiliate";
}

export function sanitizeInputs(raw: Partial<RevenueNavigatorInputs>): RevenueNavigatorInputs {
  return {
    plan: normalizePlan(raw.plan),
    focus: normalizeFocus(raw.focus),
    monthlyVisitors: clampNumber(raw.monthlyVisitors, 1000, 250000, 8000),
    affiliateClicks: clampNumber(raw.affiliateClicks, 0, 25000, 120),
    newsletterSignups: clampNumber(raw.newsletterSignups, 0, 15000, 18),
    contentPieces: clampNumber(raw.contentPieces, 1, 400, 8),
    teamSize: clampNumber(raw.teamSize, 1, 100, 1),
  };
}

function clampNumber(value: number | undefined, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.max(min, Math.min(max, Math.round(value)));
}

export function computeOpportunityScore(inputs: RevenueNavigatorInputs) {
  const trafficScore = Math.min(inputs.monthlyVisitors / 150, 30);
  const clickScore = Math.min(inputs.affiliateClicks / 8, 25);
  const newsletterScore = Math.min(inputs.newsletterSignups * 1.8, 20);
  const contentScore = Math.min(inputs.contentPieces * 1.6, 15);
  const teamScore = inputs.teamSize >= 8 ? 10 : inputs.teamSize >= 4 ? 8 : inputs.teamSize >= 2 ? 6 : 4;
  return Math.round(Math.min(100, trafficScore + clickScore + newsletterScore + contentScore + teamScore));
}

export function starterRecommendations(focus: Focus, monthlyVisitors: number, newsletterSignups: number) {
  const baseLift = Math.max(18, Math.round(monthlyVisitors / 250) + newsletterSignups * 2);

  const focusMap: Record<Focus, { title: string; why: string; action: string }> = {
    affiliate: {
      title: "Affiliate-Cluster fuer Money Pages bauen",
      why: "Dein Fokus liegt auf Empfehlungen und Kaufabsicht.",
      action: "3 Vergleichsseiten, 1 Testbericht und 1 Alternatives-Guide priorisieren.",
    },
    leadgen: {
      title: "Lead-Magnet direkt vor den CTA setzen",
      why: "Du willst Kontaktanfragen und Anfragen statt nur Traffic.",
      action: "Ein kurzes PDF oder Checkliste als Upsell vor dem Haupt-CTA testen.",
    },
    ads: {
      title: "Evergreen-Content fuer hoehere Reichweite",
      why: "Ads funktionieren erst gut, wenn Sessions stabil wachsen.",
      action: "Artikel mit Suchintention und hoher Verweildauer nach oben ziehen.",
    },
    membership: {
      title: "Premium-Werkzeug als Wiederkehr-Modell aufbauen",
      why: "Wiederkehrende Einnahmen sind fuer die Zukunft am wertvollsten.",
      action: "Kostenlose Basis plus Premium-Reports, Vorlagen oder Alerts planen.",
    },
  };

  return {
    success: true,
    plan: "starter" as Plan,
    summary: `Starter-Scan: Du hast ein erstes Potenzial von bis zu ${formatCurrency(baseLift)} pro Monat, wenn du den naechsten Hebel sauber umsetzt.`,
    projectedMonthlyLift: baseLift,
    recommendations: [
      {
        id: `${focus}-starter-1`,
        priority: "high" as const,
        title: focusMap[focus].title,
        why: focusMap[focus].why,
        action: focusMap[focus].action,
        estimatedMonthlyLift: baseLift,
      },
      {
        id: `${focus}-starter-2`,
        priority: "medium" as const,
        title: "Messbaren CTA auf jede Geld-Seite setzen",
        why: "Ohne klare Handlungsaufforderung verlierst du Klicks und Leads.",
        action: "Pro Seite nur eine dominante Aktion: lesen, klicken oder anfragen.",
        estimatedMonthlyLift: Math.max(12, Math.round(baseLift * 0.55)),
      },
      {
        id: `${focus}-starter-3`,
        priority: "low" as const,
        title: "Newsletter als Wiederkehr-Kanal aktivieren",
        why: "E-Mail ist der guenstigste wiederholbare Umsatzhebel.",
        action: "An jedem relevanten Inhalt einen simplen Opt-in mit Nutzenversprechen platzieren.",
        estimatedMonthlyLift: Math.max(8, Math.round(baseLift * 0.4)),
      },
    ],
  };
}

export function buildCustomerPlaybook(rawInputs: Partial<RevenueNavigatorInputs>) {
  const inputs = sanitizeInputs(rawInputs);
  const opportunityScore = computeOpportunityScore(inputs);
  const visitorToClickRate = inputs.monthlyVisitors > 0 ? inputs.affiliateClicks / inputs.monthlyVisitors : 0;
  const visitorToLeadRate = inputs.monthlyVisitors > 0 ? inputs.newsletterSignups / inputs.monthlyVisitors : 0;
  const contentEfficiency = inputs.contentPieces > 0 ? inputs.affiliateClicks / inputs.contentPieces : inputs.affiliateClicks;
  const teamMultiplier = inputs.teamSize >= 6 ? 1.22 : inputs.teamSize >= 3 ? 1.12 : 1;

  const focusCopy: Record<Focus, { action: string; why: string; title: string }> = {
    affiliate: {
      title: "Money Pages mit hoher Kaufintention verdichten",
      why: "Affiliate lebt von klaren Einstiegsseiten und einer sichtbaren Tool-Fuehrung.",
      action: "Vergleichsseite, Alternative-Seite und ein Testbericht fuer das staerkste Tool als 3er-Cluster ausrollen.",
    },
    leadgen: {
      title: "Lead-Magnet direkt an den Traffic-Hotspots platzieren",
      why: "Ohne sichtbaren Lead-Magnet bleibt Traffic nur Reichweite statt Pipeline.",
      action: "Auf den 3 staerksten Seiten eine Checkliste oder Audit-Anfrage als 2-Step CTA einbauen.",
    },
    ads: {
      title: "Traffic zuerst auf RPM-starke Evergreen-Seiten schieben",
      why: "Ads skalieren besser, wenn Sessions und Seitenaufrufe pro Besucher steigen.",
      action: "2 Evergreen-Cluster mit hoher Suchintention bauen und die interne Verlinkung dorthin verdichten.",
    },
    membership: {
      title: "Freemium in einen wiederkehrenden Kern-Offer drehen",
      why: "Mitgliedschaft gewinnt, wenn der Einstieg gratis ist und die Premium-Stufe einen klaren Takt liefert.",
      action: "Free Scan offen lassen, aber Reports, Historie und Team-Ansicht nur fuer Kunden freischalten.",
    },
  };

  const coreLift = Math.max(39, Math.round((inputs.monthlyVisitors / 180) * teamMultiplier));
  const clickLift = Math.max(24, Math.round(inputs.affiliateClicks * 1.45 + inputs.contentPieces * 6));
  const leadLift = Math.max(18, Math.round(inputs.newsletterSignups * 4.2 + inputs.monthlyVisitors * 0.01));
  const efficiencyLift = Math.max(16, Math.round(contentEfficiency * 8 + opportunityScore * 0.8));

  const recommendations: Recommendation[] = [
    {
      id: `${inputs.focus}-core`,
      priority: "high",
      title: focusCopy[inputs.focus].title,
      why: `${focusCopy[inputs.focus].why} Opportunity Score aktuell ${opportunityScore}/100.`,
      action: focusCopy[inputs.focus].action,
      estimatedMonthlyLift: coreLift,
    },
    {
      id: `${inputs.focus}-cta`,
      priority: visitorToClickRate < 0.025 ? "high" : "medium",
      title: "CTA-Fuehrung auf Umsatzseiten straffer machen",
      why: `Deine Klickrate vom Traffic in den naechsten Umsatzschritt liegt bei ${(visitorToClickRate * 100).toFixed(2)}%.`,
      action: "Eine dominante Aktion pro Seite definieren und CTA-Bloecke oberhalb des ersten langen Scrollbereichs setzen.",
      estimatedMonthlyLift: clickLift,
    },
    {
      id: `${inputs.focus}-lead-loop`,
      priority: visitorToLeadRate < 0.015 ? "high" : "medium",
      title: "Jeden relevanten Besuch in E-Mail oder Anfrage umwandeln",
      why: `Aktuelle Besucher-zu-Lead-Rate: ${(visitorToLeadRate * 100).toFixed(2)}%.`,
      action: "Nach jedem Haupt-CTA einen kleinen Zweitpfad mit Audit, Checkliste oder Newsletter anbieten.",
      estimatedMonthlyLift: leadLift,
    },
    {
      id: `${inputs.focus}-ops`,
      priority: inputs.teamSize >= 4 ? "medium" : "low",
      title: "Woechentlichen Umsetzungsrhythmus festziehen",
      why: `Mit ${inputs.contentPieces} Content-Stuecken und Teamgroesse ${inputs.teamSize} gewinnt ein klarer Takt mehr als neue Ideen.`,
      action: "Jede Woche genau 1 Haupthebel und 2 Begleitaktionen definieren, statt alles parallel anzufassen.",
      estimatedMonthlyLift: efficiencyLift,
    },
  ];

  if (inputs.plan === "agency") {
    recommendations.push({
      id: `${inputs.focus}-agency`,
      priority: "medium",
      title: "Kunden- oder Projektportfolio nach Hebel clustern",
      why: "Agency-Teams verlieren sonst Fokus zwischen Leadgen, Affiliate und Content-Produktion.",
      action: "Pro Kunde nur einen aktiven Wachstumshebel je Woche und ein gemeinsames Reporting-Template festlegen.",
      estimatedMonthlyLift: Math.max(55, Math.round(coreLift * 0.9)),
    });
  }

  const maxItems = inputs.plan === "agency" ? 5 : 4;
  const selectedRecommendations = recommendations
    .sort((left, right) => right.estimatedMonthlyLift - left.estimatedMonthlyLift)
    .slice(0, maxItems);

  const projectedMonthlyLift = selectedRecommendations.reduce((sum, item) => sum + item.estimatedMonthlyLift, 0);
  const summary =
    inputs.plan === "agency"
      ? `Agency-Workspace: ${selectedRecommendations.length} priorisierte Hebel fuer dein Team mit Potenzial von ${formatCurrency(projectedMonthlyLift)} pro Monat.`
      : `Pro-Workspace: ${selectedRecommendations.length} klare Schritte fuer die naechsten 7 Tage mit Potenzial von ${formatCurrency(projectedMonthlyLift)} pro Monat.`;

  return {
    success: true,
    plan: inputs.plan,
    summary,
    projectedMonthlyLift,
    recommendations: selectedRecommendations,
    opportunityScore,
    inputs,
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function planRank(plan: Plan) {
  if (plan === "agency") return 3;
  if (plan === "pro") return 2;
  return 1;
}