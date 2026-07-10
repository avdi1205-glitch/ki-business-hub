"use client";

import { format, startOfWeek } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";
import CheckoutCtaButton from "../components/CheckoutCtaButton";
import { computeOpportunityScore, type Focus, normalizePlan, planRank, starterRecommendations, type Plan, type Recommendation } from "@/lib/revenue-navigator";

type PlaybookResponse = {
  success: boolean;
  locked?: boolean;
  message?: string;
  error?: string;
  plan?: Plan;
  summary?: string;
  projectedMonthlyLift?: number;
  recommendations?: Recommendation[];
  baseline?: {
    totalRevenue30Days: number;
    totalClicks30Days: number;
    epc: number;
    subscribers: number;
    activeTests: number;
    completedTests: number;
  };
  cached?: boolean;
  savedScan?: SavedScan | null;
};

type SavedScan = {
  id: number;
  plan: string;
  focus: string;
  opportunityScore: number;
  projectedMonthlyLift: number;
  summary: string;
  createdAt: string;
};

type RevenueNavigatorStudioProps = {
  locale: string;
  mode?: "public" | "customer";
  customerPlan?: Plan;
  customerEmail?: string;
  initialSavedScans?: SavedScan[];
};

const QUICK_SCAN_QUESTIONS = [
  "1) Wie viele qualifizierte Leads habt ihr pro Monat?",
  "2) Wie hoch ist eure aktuelle Abschlussquote?",
  "3) Gibt es ein klares Kernangebot mit festem Preis?",
  "4) Wie schnell erfolgt Follow-up nach einer Anfrage?",
  "5) Habt ihr einen festen Sales-Prozess?",
  "6) Welche Daten trackt ihr woechentlich?",
  "7) Ist eure Pipeline fuer die naechsten 30 Tage planbar?",
  "8) Wo liegt aktuell euer groesstes Problem?",
];

const OUTREACH_DAY_1 = [
  "Erstnachricht: Hi [Name], kurze Frage: Habt ihr in [Branche] aktuell genug Anfragen, aber zu wenig planbare Abschluesse?",
  "Follow-up: Falls relevant fuer euch: Ich habe einen 2-Minuten-Scan, der sofort zeigt, wo euer groesster Umsatzhebel liegt. Soll ich ihn dir senden?",
];

const OUTREACH_DAY_2 = [
  "Erstnachricht: Hi [Name], ich sehe bei vielen Teams: nicht zu wenig Leads, sondern zu wenig klare Priorisierung im Funnel. Wie ist das bei euch gerade?",
  "Follow-up: Wenn du willst, schicke ich dir den kurzen Scan. Danach hast du 3 klare Massnahmen fuer die naechsten 30 Tage.",
];

const OUTREACH_DAY_3 = [
  "Erstnachricht: Hi [Name], wenn ich eure Pipeline in 30 Tagen stabiler machen sollte: Was ist gerade der groesste Engpass bei euch?",
  "Follow-up: Genau dafuer habe ich eine kurze Revenue-Auswertung vorbereitet. Soll ich dir die 2-Minuten-Version schicken?",
];

const OUTREACH_DAY_4 = [
  "Erstnachricht: Hi [Name], ich arbeite mit Unternehmen, die bereits sichtbar sind, aber Umsatz nicht sauber planen koennen. Kommt dir das bekannt vor?",
  "Follow-up: Wenn ja, lass uns klein starten: 2-Minuten-Scan, dann siehst du sofort, ob ein 30-Tage-Sprint fuer euch Sinn macht.",
];

const OUTREACH_DAY_5 = [
  "Erstnachricht: Hi [Name], kurze Direktfrage: Wie schnell antwortet ihr aktuell auf neue Anfragen, im Schnitt unter 24h?",
  "Follow-up: Falls nicht konstant: Das ist oft der schnellste Umsatzhebel. Ich kann dir einen kurzen Ablauf schicken, mit dem Teams ihre Abschlussquote spuerbar anheben.",
];

const OUTREACH_DAY_6 = [
  "Erstnachricht: Hi [Name], was waere euch gerade wichtiger: A) mehr qualifizierte Leads oder B) mehr Abschluesse aus bestehenden Leads?",
  "Follow-up: Top, danke. Ich habe fuer A oder B einen kurzen Massnahmenplan fuer 30 Tage. Soll ich ihn dir direkt schicken?",
];

const OUTREACH_DAY_7 = [
  "Erstnachricht: Hi [Name], letzte kurze Nachricht von mir: Soll ich dir den kompakten Revenue-Scan senden, damit du euren Engpass in 2 Minuten klar siehst?",
  "Follow-up: Wenn aktuell kein Fokus darauf liegt, alles gut. Wenn du willst, melde dich einfach mit Scan, dann schicke ich ihn sofort rueber.",
];

const OUTREACH_DAYS = [
  OUTREACH_DAY_1,
  OUTREACH_DAY_2,
  OUTREACH_DAY_3,
  OUTREACH_DAY_4,
  OUTREACH_DAY_5,
  OUTREACH_DAY_6,
  OUTREACH_DAY_7,
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function priorityBorder(priority: Recommendation["priority"]) {
  if (priority === "high") return "border-rose-400/30 bg-rose-500/10 text-rose-200";
  if (priority === "medium") return "border-amber-400/30 bg-amber-500/10 text-amber-100";
  return "border-emerald-400/30 bg-emerald-500/10 text-emerald-100";
}

function focusLabel(focus: string, isEn: boolean) {
  if (focus === "leadgen") return isEn ? "Lead generation" : "Leadgen";
  if (focus === "ads") return "Ads";
  if (focus === "membership") return isEn ? "Membership" : "Mitgliedschaft";
  return "Affiliate";
}

function formatDelta(value: number) {
  if (value === 0) return "0";
  return value > 0 ? `+${value}` : String(value);
}

function buildSparklinePoints(values: number[]) {
  if (values.length === 0) return "";
  if (values.length === 1) return "0,48 100,48";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 88 - ((value - min) / spread) * 64;
      return `${x},${y}`;
    })
    .join(" ");
}
export default function RevenueNavigatorStudio({
  locale,
  mode = "public",
  customerPlan = "pro",
  customerEmail,
  initialSavedScans = [],
}: RevenueNavigatorStudioProps) {
  const isEn = locale === "en";
  const isCustomerMode = mode === "customer";
  const [plan, setPlan] = useState<Plan>(isCustomerMode ? customerPlan : "starter");
  const [focus, setFocus] = useState<Focus>("affiliate");
  const [monthlyVisitors, setMonthlyVisitors] = useState(8000);
  const [affiliateClicks, setAffiliateClicks] = useState(120);
  const [newsletterSignups, setNewsletterSignups] = useState(18);
  const [contentPieces, setContentPieces] = useState(8);
  const [teamSize, setTeamSize] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlaybookResponse | null>(null);
  const [captureName, setCaptureName] = useState("");
  const [captureEmail, setCaptureEmail] = useState("");
  const [captureStatus, setCaptureStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [captureMessage, setCaptureMessage] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [agencyEmail, setAgencyEmail] = useState("");
  const [agencyCompany, setAgencyCompany] = useState("");
  const [agencyTeam, setAgencyTeam] = useState("2-5");
  const [agencyConsent, setAgencyConsent] = useState(false);
  const [agencyStatus, setAgencyStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [agencyMessage, setAgencyMessage] = useState("");
  const [kitMessage, setKitMessage] = useState<string | null>(null);
  const [savedScans, setSavedScans] = useState<SavedScan[]>(initialSavedScans);

  const opportunityScore = useMemo(() => computeOpportunityScore({
    plan,
    focus,
    monthlyVisitors,
    affiliateClicks,
    newsletterSignups,
    contentPieces,
    teamSize,
  }), [affiliateClicks, contentPieces, focus, monthlyVisitors, newsletterSignups, plan, teamSize]);

  const starterPreview = useMemo(() => starterRecommendations(focus, monthlyVisitors, newsletterSignups), [focus, monthlyVisitors, newsletterSignups]);
  const availablePlans = useMemo(() => {
    if (!isCustomerMode) return ["starter", "pro", "agency"] as Plan[];
    return (["pro", "agency"] as Plan[]).filter((nextPlan) => planRank(nextPlan) <= planRank(customerPlan));
  }, [customerPlan, isCustomerMode]);

  const planCards = [
    {
      key: "starter",
      name: isEn ? "Starter" : "Starter",
      price: isEn ? "Free" : "Kostenlos",
      period: isEn ? "for ever" : "für immer",
      accent: "from-cyan-400 via-sky-400 to-emerald-400",
      tone: "border-white/10 bg-white/[0.03]",
      badge: isEn ? "Entry" : "Einstieg",
      summary: isEn
        ? "Ideal if you want a first scan before you invest."
        : "Ideal, wenn du zuerst einen schnellen Scan willst, bevor du investierst.",
      features: isEn
        ? ["1 free scan", "Starter recommendations", "Plan suggestion", "No weekly report"]
        : ["1 kostenloser Scan", "Starter-Empfehlungen", "Plan-Empfehlung", "Kein Wochenreport"],
      action: (
        <button
          type="button"
          onClick={() => {
            setPlan("starter");
            void generatePlaybook("starter");
          }}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
        >
          {isEn ? "Run Starter Scan" : "Starter-Scan starten"}
        </button>
      ),
    },
    {
      key: "pro",
      name: "Pro",
      price: "39 EUR",
      period: isEn ? "per month" : "pro Monat",
      accent: "from-cyan-300 via-cyan-400 to-emerald-300",
      tone: "border-cyan-400/35 bg-cyan-500/10",
      badge: isEn ? "Recommended" : "Empfohlen",
      summary: isEn
        ? "Weekly playbooks, one clear priority per week, and a system that keeps monetization moving."
        : "Woechentliche Playbooks, ein klarer Haupthebel pro Woche und ein System, das Monetarisierung voranbringt.",
      features: isEn
        ? ["Weekly playbook", "One priority per week", "Revenue lift estimate", "Affiliate, lead and ad focus", "Better CTA direction", "Growth tracking"]
        : ["Woechentlicher Plan", "Ein Schwerpunkt pro Woche", "Umsatz-Prognose", "Affiliate-, Lead- und Ads-Fokus", "Bessere CTA-Richtung", "Wachstums-Tracking"],
      action: (
        <CheckoutCtaButton
          href="/api/checkout?plan=pro"
          ctaKey="revenue-navigator-pro"
          variantA={{
            label: isEn ? "Activate Pro" : "Pro aktivieren",
            sourceSuffix: "variant-a",
            className: "block w-full rounded-2xl bg-cyan-500 px-4 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-400",
          }}
          variantB={{
            label: isEn ? "See Pro" : "Pro ansehen",
            sourceSuffix: "variant-b",
            className: "block w-full rounded-2xl bg-cyan-500 px-4 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-cyan-400",
          }}
          showReminder={false}
        />
      ),
    },
    {
      key: "agency",
      name: "Agency",
      price: "149 EUR",
      period: isEn ? "per month" : "pro Monat",
      accent: "from-amber-300 via-orange-300 to-rose-300",
      tone: "border-amber-400/35 bg-amber-500/10",
      badge: isEn ? "Teams" : "Teams",
      summary: isEn
        ? "For teams that need multi-project control, clearer accountability and faster scaling."
        : "Fuer Teams mit Multi-Projekt-Steuerung, klarer Verantwortung und schnellerem Skalieren.",
      features: isEn
        ? ["Multiple projects", "Agency playbooks", "More recommendations", "Team-level priorities", "Operational rhythm", "Growth ops support"]
        : ["Mehrere Projekte", "Agency-Playbooks", "Mehr Empfehlungen", "Team-Prioritaeten", "Operativer Wochenrhythmus", "Growth-Ops-Unterstuetzung"],
      action: (
        <CheckoutCtaButton
          href="/api/checkout?plan=agency"
          ctaKey="revenue-navigator-agency"
          variantA={{
            label: isEn ? "Activate Agency" : "Agency aktivieren",
            sourceSuffix: "variant-a",
            className: "block w-full rounded-2xl bg-amber-500 px-4 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-amber-400",
          }}
          variantB={{
            label: isEn ? "See Agency" : "Agency ansehen",
            sourceSuffix: "variant-b",
            className: "block w-full rounded-2xl bg-amber-500 px-4 py-3 text-center text-sm font-bold text-slate-950 transition hover:bg-amber-400",
          }}
          showReminder={false}
        />
      ),
    },
  ];

  async function generatePlaybook(nextPlan = plan) {
    setLoading(true);
    setError(null);

    if (nextPlan === "starter" && !isCustomerMode) {
      setData(starterPreview);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/revenue-playbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: nextPlan,
          focus,
          monthlyVisitors,
          affiliateClicks,
          newsletterSignups,
          contentPieces,
          teamSize,
        }),
      });
      const json = (await res.json()) as PlaybookResponse;

      if (!res.ok && !json.locked) {
        throw new Error(json.error || (isEn ? "Could not load playbook." : "Playbook konnte nicht geladen werden."));
      }

      if (json.locked) {
        setError(json.message || (isEn ? "Upgrade needed for this view." : "Upgrade erforderlich fuer diese Ansicht."));
        setData(json);
      } else {
        setData(json);
        if (json.savedScan) {
          setSavedScans((current) => [json.savedScan!, ...current.filter((scan) => scan.id !== json.savedScan!.id)].slice(0, 8));
        }
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : isEn ? "Could not load playbook." : "Playbook konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  async function submitCapture(mode: "newsletter" | "lead") {
    if (!captureEmail.trim()) {
      setCaptureStatus("error");
      setCaptureMessage(isEn ? "Please enter your email first." : "Bitte trage zuerst deine E-Mail ein.");
      return;
    }

    setCaptureStatus("loading");
    setCaptureMessage("");

    const normalizedEmail = captureEmail.trim().toLowerCase();
    const normalizedName = captureName.trim();
    const sourceToken = `revenue-navigator:${focus}:${plan}:score-${opportunityScore}`;

    try {
      if (mode === "newsletter") {
        const response = await fetch("/api/subscribe-newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            name: normalizedName || undefined,
            source: sourceToken,
          }),
        });

        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || (isEn ? "Newsletter signup failed." : "Newsletter-Anmeldung fehlgeschlagen."));
        }

        setCaptureStatus("success");
        setCaptureMessage(
          isEn
            ? "Check your inbox and confirm your newsletter subscription."
            : "Bitte pruefe dein Postfach und bestaetige deine Newsletter-Anmeldung."
        );
        return;
      }

      const response = await fetch("/api/contact-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: normalizedName || undefined,
          email: normalizedEmail,
          plan,
          source: sourceToken,
          intent: "upgrade",
          reason: "revenue_navigator_followup",
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || (isEn ? "Lead request failed." : "Lead-Anfrage fehlgeschlagen."));
      }

      setCaptureStatus("success");
      setCaptureMessage(
        isEn
          ? "Great. We saved your request and will reach out with next steps."
          : "Perfekt. Deine Anfrage ist gespeichert und wir melden uns mit den naechsten Schritten."
      );
    } catch (nextError) {
      setCaptureStatus("error");
      setCaptureMessage(
        nextError instanceof Error
          ? nextError.message
          : isEn
            ? "Connection error. Please try again."
            : "Verbindungsfehler. Bitte erneut versuchen."
      );
    }
  }

  async function submitAgencyOnboarding() {
    if (!agencyEmail.trim()) {
      setAgencyStatus("error");
      setAgencyMessage(isEn ? "Please enter your business email first." : "Bitte trage zuerst deine Business-E-Mail ein.");
      return;
    }

    if (!agencyConsent) {
      setAgencyStatus("error");
      setAgencyMessage(
        isEn
          ? "Please confirm data processing for Agency onboarding first."
          : "Bitte bestaetige zuerst die Datenverarbeitung fuer das Agency-Onboarding."
      );
      return;
    }

    setAgencyStatus("loading");
    setAgencyMessage("");

    const normalizedEmail = agencyEmail.trim().toLowerCase();
    const normalizedName = agencyName.trim();
    const normalizedCompany = agencyCompany.trim();
    const consentAt = new Date().toISOString().slice(0, 10);

    try {
      const response = await fetch("/api/contact-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: normalizedCompany ? `${normalizedName || "Team"} (${normalizedCompany})` : normalizedName || undefined,
          email: normalizedEmail,
          plan: "agency",
          source: `revenue-navigator:${focus}:agency:score-${opportunityScore}|consent:yes|consentAt:${consentAt}`,
          intent: "upgrade",
          reason: `agency_onboarding_team_${agencyTeam}`,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || (isEn ? "Agency onboarding request failed." : "Agency-Onboarding-Anfrage fehlgeschlagen."));
      }

      setAgencyStatus("success");
      setAgencyMessage(
        isEn
          ? "Done. Your Agency request is saved and we will contact you with setup steps."
          : "Perfekt. Deine Agency-Anfrage ist gespeichert und wir melden uns mit den Setup-Schritten."
      );
      setAgencyName("");
      setAgencyEmail("");
      setAgencyCompany("");
      setAgencyConsent(false);
    } catch (nextError) {
      setAgencyStatus("error");
      setAgencyMessage(
        nextError instanceof Error
          ? nextError.message
          : isEn
            ? "Connection error. Please try again."
            : "Verbindungsfehler. Bitte erneut versuchen."
      );
    }
  }

  const renderedRecommendations = data?.recommendations && data.recommendations.length > 0 ? data.recommendations : starterPreview.recommendations || [];
  const primaryRecommendation = renderedRecommendations[0];
  const currentLift = data?.projectedMonthlyLift ?? starterPreview.projectedMonthlyLift ?? 0;
  const currentSummary = data?.summary || starterPreview.summary;
  const latestSavedScan = savedScans[0] || null;
  const previousSavedScan = savedScans[1] || null;
  const liftDelta = latestSavedScan && previousSavedScan ? latestSavedScan.projectedMonthlyLift - previousSavedScan.projectedMonthlyLift : null;
  const scoreDelta = latestSavedScan && previousSavedScan ? latestSavedScan.opportunityScore - previousSavedScan.opportunityScore : null;
  const scansByWeek = useMemo(() => {
    return savedScans.reduce<Array<{ weekKey: string; weekLabel: string; scans: SavedScan[] }>>((groups, scan) => {
      const date = new Date(scan.createdAt);
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const weekKey = weekStart.toISOString();
      const weekLabel = `${isEn ? "Week of" : "Woche ab"} ${format(weekStart, "dd.MM.yyyy")}`;
      const existing = groups.find((group) => group.weekKey === weekKey);

      if (existing) {
        existing.scans.push(scan);
        return groups;
      }

      groups.push({ weekKey, weekLabel, scans: [scan] });
      return groups;
    }, []);
  }, [isEn, savedScans]);
  const weeklyMetrics = useMemo(() => {
    return scansByWeek.map((group) => {
      const totalLift = group.scans.reduce((sum, scan) => sum + scan.projectedMonthlyLift, 0);
      const avgLift = Math.round(totalLift / group.scans.length);
      const avgScore = Math.round(group.scans.reduce((sum, scan) => sum + scan.opportunityScore, 0) / group.scans.length);
      return {
        weekKey: group.weekKey,
        weekLabel: group.weekLabel,
        scanCount: group.scans.length,
        avgLift,
        avgScore,
      };
    }).reverse();
  }, [scansByWeek]);
  const liftSparkline = useMemo(() => buildSparklinePoints(weeklyMetrics.map((week) => week.avgLift)), [weeklyMetrics]);
  const scoreSparkline = useMemo(() => buildSparklinePoints(weeklyMetrics.map((week) => week.avgScore)), [weeklyMetrics]);

  async function exportCurrentPlaybook() {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 48;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const maxWidth = pageWidth - marginX * 2;
    let cursorY = 56;

    const writeParagraph = (text: string, fontSize = 11, color: [number, number, number] = [51, 65, 85], gap = 16) => {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);
      const lines = pdf.splitTextToSize(text, maxWidth);

      if (cursorY + lines.length * (fontSize + 4) > pageHeight - 48) {
        pdf.addPage();
        cursorY = 56;
      }

      pdf.text(lines, marginX, cursorY);
      cursorY += lines.length * (fontSize + 4) + gap;
    };

    pdf.setFillColor(7, 11, 22);
    pdf.rect(0, 0, pageWidth, 120, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    pdf.text("Revenue Navigator", marginX, 58);
    pdf.setFontSize(12);
    pdf.setTextColor(165, 243, 252);
    pdf.text(isEn ? "Customer playbook export" : "Kunden-Playbook Export", marginX, 82);

    cursorY = 150;
    writeParagraph(`${isEn ? "Plan" : "Plan"}: ${normalizePlan(plan).toUpperCase()}`, 12, [8, 145, 178], 8);
    writeParagraph(`${isEn ? "Focus" : "Fokus"}: ${focusLabel(focus, isEn)}`, 12, [8, 145, 178], 8);
    writeParagraph(`${isEn ? "Opportunity score" : "Opportunity Score"}: ${opportunityScore}/100`, 12, [8, 145, 178], 8);
    writeParagraph(`${isEn ? "Projected monthly lift" : "Prognostizierter Monatslift"}: ${formatCurrency(currentLift)}`, 12, [8, 145, 178], 18);
    writeParagraph(currentSummary, 11, [51, 65, 85], 20);

    renderedRecommendations.forEach((recommendation, index) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42);
      if (cursorY > pageHeight - 120) {
        pdf.addPage();
        cursorY = 56;
      }
      pdf.text(`${index + 1}. ${recommendation.title}`, marginX, cursorY);
      cursorY += 22;
      writeParagraph(`${isEn ? "Why" : "Warum"}: ${recommendation.why}`, 11, [51, 65, 85], 10);
      writeParagraph(`${isEn ? "Action" : "Aktion"}: ${recommendation.action}`, 11, [51, 65, 85], 10);
      writeParagraph(`${isEn ? "Potential lift" : "Potenzieller Lift"}: ${formatCurrency(recommendation.estimatedMonthlyLift)}`, 11, [5, 150, 105], 16);
    });

    pdf.save(`revenue-navigator-${plan}-${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  function exportCurrentPlaybookAsText() {
    const lines = [
      isEn ? "Revenue Navigator Playbook" : "Revenue Navigator Playbook",
      `${isEn ? "Plan" : "Plan"}: ${normalizePlan(plan).toUpperCase()}`,
      `${isEn ? "Focus" : "Fokus"}: ${focusLabel(focus, isEn)}`,
      `${isEn ? "Opportunity score" : "Opportunity Score"}: ${opportunityScore}/100`,
      `${isEn ? "Projected monthly lift" : "Prognostizierter Monatslift"}: ${formatCurrency(currentLift)}`,
      "",
      currentSummary,
      "",
      ...(renderedRecommendations.length > 0
        ? renderedRecommendations.flatMap((recommendation, index) => [
            `${index + 1}. ${recommendation.title}`,
            `${isEn ? "Why" : "Warum"}: ${recommendation.why}`,
            `${isEn ? "Action" : "Aktion"}: ${recommendation.action}`,
            `${isEn ? "Lift" : "Lift"}: ${formatCurrency(recommendation.estimatedMonthlyLift)}`,
            "",
          ])
        : []),
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `revenue-navigator-${plan}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  async function copyKitText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setKitMessage(isEn ? "Copied to clipboard." : "In die Zwischenablage kopiert.");
    } catch {
      setKitMessage(isEn ? "Could not copy automatically." : "Konnte nicht automatisch kopieren.");
    }
  }

  return (
    <main className="min-h-screen bg-[#070b16] text-slate-100">
      <section className="relative overflow-hidden px-5 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.12),_transparent_28%),linear-gradient(180deg,_rgba(7,11,22,0.9),_rgba(7,11,22,1))]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">
                {isCustomerMode ? (isEn ? "Customer workspace" : "Kunden-Workspace") : (isEn ? "Free scan first" : "Erst kostenlos scannen")}
              </p>
              <h1 className="max-w-4xl text-4xl font-black leading-[1.02] sm:text-5xl lg:text-7xl">
                {isEn
                  ? "Revenue Navigator turns content into a real monetization system."
                  : "Revenue Navigator macht aus Content ein echtes Monetarisierungs-System."}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                {isCustomerMode
                  ? (isEn
                    ? "Run customer-specific scans, keep your history, and come back every week without touching the admin area."
                    : "Fuehre kundenspezifische Scans aus, behalte deine Historie und komme jede Woche wieder, ohne den Admin zu beruehren.")
                  : isEn
                  ? "Start with a free scan, uncover the single revenue lever with the highest upside, and upgrade when you want weekly guidance that turns ideas into repeatable money."
                  : "Starte mit einem kostenlosen Scan, finde den einen Umsatzhebel mit dem grössten Potenzial und upgrade, wenn du aus Ideen einen wiederholbaren Geldprozess machen willst."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-200">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{isEn ? "Affiliate" : "Affiliate"}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{isEn ? "Leads" : "Leads"}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{isEn ? "Abo" : "Abo"}</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{isEn ? "Newsletter" : "Newsletter"}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                {isCustomerMode ? (
                  <>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-100">{customerEmail}</span>
                    <Link href="/konto" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-100 transition hover:bg-white/10">
                      {isEn ? "Back to account" : "Zurueck zum Konto"}
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/konto/revenue-navigator" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-100 transition hover:bg-white/10">
                      {isEn ? "Already a customer? Open workspace" : "Schon Kunde? Workspace oeffnen"}
                    </Link>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-emerald-100">
                      {isEn ? "Best used weekly, not once" : "Der Hebel entsteht wöchentlich, nicht einmalig"}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/70">
                {isEn ? "Opportunity score" : "Opportunity Score"}
              </p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-black text-white">{opportunityScore}</p>
                  <p className="mt-1 text-sm text-slate-400">{isEn ? "out of 100" : "von 100"}</p>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">{isEn ? "Potential" : "Potenzial"}</p>
                  <p className="text-xl font-black text-emerald-200">{formatCurrency(currentLift)}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {isEn
                  ? "The better the combination of traffic, clicks, leads and content volume, the stronger the suggested plan."
                  : "Je besser die Mischung aus Traffic, Klicks, Leads und Content-Volumen, desto staerker die empfohlene Stufe."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{isEn ? "Scan" : "Scan"}</p>
                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{isEn ? "Set the inputs" : "Werte setzen"}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
                  {isEn
                    ? "Use realistic numbers. The tool is designed to give you a sharp next move, not a fake promise."
                    : "Nutze reale Werte. Das Tool soll dir die naechste klare Bewegung geben, nicht leere Versprechen."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void generatePlaybook(plan)}
                disabled={loading}
                className="rounded-2xl border border-cyan-400/20 bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (isEn ? "Scanning..." : "Scanne...") : plan === "starter" ? (isEn ? "Run free scan" : "Kostenlosen Scan starten") : (isEn ? "Generate" : "Generieren")}
              </button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <span className="text-sm font-semibold text-slate-200">{isEn ? "Main focus" : "Hauptfokus"}</span>
                <select
                  value={focus}
                  onChange={(event) => setFocus(event.target.value as Focus)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  <option value="affiliate">Affiliate</option>
                  <option value="leadgen">Lead-Gen</option>
                  <option value="ads">Ads</option>
                  <option value="membership">Membership</option>
                </select>
              </label>

              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <span className="text-sm font-semibold text-slate-200">{isEn ? "Plan" : "Plan"}</span>
                <select
                  value={plan}
                  onChange={(event) => setPlan(event.target.value as Plan)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  {availablePlans.map((option) => (
                    <option key={option} value={option}>
                      {option === "starter" ? "Starter (free)" : option === "pro" ? "Pro" : "Agency"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-200">
                  <span>{isEn ? "Monthly visitors" : "Monatliche Besucher"}</span>
                  <span className="text-cyan-300">{monthlyVisitors.toLocaleString("de-DE")}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={120000}
                  step={500}
                  value={monthlyVisitors}
                  onChange={(event) => setMonthlyVisitors(Number(event.target.value))}
                  className="w-full accent-cyan-400"
                />
              </label>

              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-200">
                  <span>{isEn ? "Affiliate clicks" : "Affiliate-Klicks"}</span>
                  <span className="text-emerald-300">{affiliateClicks}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={500}
                  step={5}
                  value={affiliateClicks}
                  onChange={(event) => setAffiliateClicks(Number(event.target.value))}
                  className="w-full accent-emerald-400"
                />
              </label>

              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-200">
                  <span>{isEn ? "Newsletter signups" : "Newsletter-Anmeldungen"}</span>
                  <span className="text-amber-200">{newsletterSignups}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={250}
                  step={1}
                  value={newsletterSignups}
                  onChange={(event) => setNewsletterSignups(Number(event.target.value))}
                  className="w-full accent-amber-400"
                />
              </label>

              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-200">
                  <span>{isEn ? "Content pieces / month" : "Content-Stuecke / Monat"}</span>
                  <span className="text-violet-200">{contentPieces}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={40}
                  step={1}
                  value={contentPieces}
                  onChange={(event) => setContentPieces(Number(event.target.value))}
                  className="w-full accent-violet-400"
                />
              </label>

              <label className="space-y-2 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-200">
                  <span>{isEn ? "Team size" : "Teamgroesse"}</span>
                  <span className="text-slate-300">{teamSize}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={teamSize}
                  onChange={(event) => setTeamSize(Number(event.target.value))}
                  className="w-full accent-slate-300"
                />
              </label>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/12 via-white/5 to-emerald-500/10 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">{isEn ? "Result" : "Ergebnis"}</p>
                  <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{isEn ? "Your next best move" : "Dein naechster bester Schritt"}</h2>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">{isEn ? "Lift" : "Lift"}</p>
                  <p className="text-xl font-black text-emerald-200">{formatCurrency(currentLift)}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-200">{currentSummary}</p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-300">
                {isEn
                  ? "This free scan is enough to understand your first lever. Upgrade later only if you want weekly direction and deeper tracking."
                  : "Dieser kostenlose Scan reicht, um deinen ersten Hebel zu verstehen. Upgrade spaeter nur, wenn du woechentliche Richtung und tieferes Tracking willst."}
              </div>

              {!isCustomerMode && (
                <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  {isEn
                    ? "Most users do not need more information. They need one weekly decision. That is what Pro and Agency are for."
                    : "Die meisten brauchen nicht mehr Informationen, sondern jede Woche genau eine gute Entscheidung. Genau dafuer sind Pro und Agency da."}
                </div>
              )}

              <div className="mt-6 rounded-[1.75rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/12 via-slate-950/40 to-emerald-500/10 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                  {isEn ? "Primary action" : "Hauptaktion"}
                </p>
                <h3 className="mt-2 text-2xl font-black text-white">
                  {primaryRecommendation ? primaryRecommendation.title : (isEn ? "No recommendation yet" : "Noch keine Empfehlung")}
                </h3>
                {primaryRecommendation && (
                  <>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      <strong>{isEn ? "Why this first:" : "Warum zuerst:"}</strong> {primaryRecommendation.why}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      <strong>{isEn ? "Do this now:" : "Jetzt tun:"}</strong> {primaryRecommendation.action}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className={[
                        "rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]",
                        priorityBorder(primaryRecommendation.priority),
                      ].join(" ")}>
                        {primaryRecommendation.priority}
                      </span>
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-200">
                        {isEn ? "Potential" : "Potenzial"} +{formatCurrency(primaryRecommendation.estimatedMonthlyLift)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {renderedRecommendations.slice(1, 3).map((rec) => (
                  <article key={rec.id} className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {isEn ? "Support action" : "Begleitaktion"}
                    </p>
                    <h4 className="mt-2 text-base font-bold text-white">{rec.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{rec.action}</p>
                  </article>
                ))}
              </div>

              {isCustomerMode && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={exportCurrentPlaybook}
                    className="rounded-full border border-cyan-300/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
                  >
                    {isEn ? "Export PDF" : "PDF exportieren"}
                  </button>
                  <button
                    type="button"
                    onClick={exportCurrentPlaybookAsText}
                    className="rounded-full border border-emerald-300/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/20"
                  >
                    {isEn ? "Export text" : "Text exportieren"}
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                  >
                    {isEn ? "Print / PDF" : "Drucken / PDF"}
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{isEn ? "What makes it unique" : "Was es einzigartig macht"}</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                <p>{isEn ? "It is not just another AI tool. It connects monetization, execution and plan upgrades in one workflow." : "Es ist nicht einfach noch ein KI-Tool. Es verbindet Monetarisierung, Umsetzung und Plan-Upgrade in einem Workflow."}</p>
                <p>{isEn ? "Starter gives a useful preview. Pro gives weekly direction. Agency gives team-level depth." : "Starter liefert eine echte Vorschau. Pro gibt woechentliche Richtung. Agency liefert Tiefe fuer Teams."}</p>
                <p>{isEn ? "That combination is what gives it long-term value." : "Genau diese Kombination macht es langfristig wertvoll."}</p>
              </div>
            </div>

            {isCustomerMode && latestSavedScan && (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{isEn ? "Trend" : "Verlauf"}</p>
                <h3 className="mt-2 text-2xl font-bold text-white">{isEn ? "How your latest scan changed" : "So hat sich dein letzter Scan veraendert"}</h3>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isEn ? "Latest lift" : "Aktueller Lift"}</p>
                    <p className="mt-2 text-2xl font-black text-emerald-300">{formatCurrency(latestSavedScan.projectedMonthlyLift)}</p>
                    {liftDelta !== null && (
                      <p className={`mt-2 text-sm ${liftDelta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                        {isEn ? "vs previous" : "vs. vorher"}: {formatDelta(liftDelta)}
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isEn ? "Latest score" : "Aktueller Score"}</p>
                    <p className="mt-2 text-2xl font-black text-cyan-300">{latestSavedScan.opportunityScore}/100</p>
                    {scoreDelta !== null && (
                      <p className={`mt-2 text-sm ${scoreDelta >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                        {isEn ? "vs previous" : "vs. vorher"}: {formatDelta(scoreDelta)}
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isEn ? "Latest focus" : "Letzter Fokus"}</p>
                    <p className="mt-2 text-2xl font-black text-white">{focusLabel(latestSavedScan.focus, isEn)}</p>
                    <p className="mt-2 text-sm text-slate-400">{new Date(latestSavedScan.createdAt).toLocaleDateString("de-DE")}</p>
                  </div>
                </div>
              </div>
            )}

            {isCustomerMode && weeklyMetrics.length > 0 && (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{isEn ? "Weekly pulse" : "Wochen-Puls"}</p>
                <h3 className="mt-2 text-2xl font-bold text-white">{isEn ? "Your monetization trend by week" : "Dein Monetarisierungs-Trend pro Woche"}</h3>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isEn ? "Average lift" : "Durchschnittlicher Lift"}</p>
                        <p className="mt-2 text-2xl font-black text-emerald-300">{formatCurrency(weeklyMetrics[weeklyMetrics.length - 1]?.avgLift || 0)}</p>
                      </div>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">{weeklyMetrics.length} {isEn ? "weeks" : "Wochen"}</span>
                    </div>
                    <svg viewBox="0 0 100 100" className="mt-4 h-28 w-full overflow-visible">
                      <polyline fill="none" stroke="rgba(16,185,129,0.25)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" points={liftSparkline} />
                      <polyline fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={liftSparkline} />
                    </svg>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isEn ? "Average score" : "Durchschnittlicher Score"}</p>
                        <p className="mt-2 text-2xl font-black text-cyan-300">{weeklyMetrics[weeklyMetrics.length - 1]?.avgScore || 0}/100</p>
                      </div>
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">{isEn ? "Weekly trend" : "Wochentrend"}</span>
                    </div>
                    <svg viewBox="0 0 100 100" className="mt-4 h-28 w-full overflow-visible">
                      <polyline fill="none" stroke="rgba(34,211,238,0.25)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" points={scoreSparkline} />
                      <polyline fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={scoreSparkline} />
                    </svg>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {weeklyMetrics.map((week) => (
                    <div key={week.weekKey} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{week.weekLabel}</p>
                      <p className="mt-2 text-lg font-bold text-white">{formatCurrency(week.avgLift)}</p>
                      <p className="mt-1 text-sm text-slate-300">Score {week.avgScore}/100</p>
                      <p className="mt-1 text-xs text-slate-400">{week.scanCount} {isEn ? "scan(s)" : "Scan(s)"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isCustomerMode && (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{isEn ? "Weekly history" : "Wochenhistorie"}</p>
                    <h3 className="mt-2 text-2xl font-bold text-white">{isEn ? "Your recent playbooks by week" : "Deine letzten Playbooks nach Wochen"}</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">{savedScans.length}</span>
                </div>

                <div className="mt-4 space-y-3">
                  {scansByWeek.length > 0 ? scansByWeek.map((group) => (
                    <div key={group.weekKey} className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">{group.weekLabel}</p>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">{group.scans.length}</span>
                      </div>

                      <div className="space-y-3">
                        {group.scans.map((scan) => (
                          <article key={scan.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{scan.plan.toUpperCase()} • {focusLabel(scan.focus, isEn)}</p>
                                <p className="mt-1 text-sm font-semibold text-white">{scan.summary}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-black text-emerald-300">+{formatCurrency(scan.projectedMonthlyLift)}</p>
                                <p className="text-xs text-slate-400">{new Date(scan.createdAt).toLocaleDateString("de-DE")}</p>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  )) : (
                    <p className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-300">
                      {isEn ? "Run your first customer scan to store a playbook here." : "Fuehre deinen ersten Kunden-Scan aus, um hier ein Playbook zu speichern."}
                    </p>
                  )}
                </div>
              </div>
            )}

            {isCustomerMode && customerPlan === "pro" && (
              <div className="rounded-[2rem] border border-amber-400/20 bg-gradient-to-br from-amber-500/12 via-slate-950/40 to-rose-500/10 p-5 sm:p-6 shadow-2xl shadow-amber-950/20">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/70">{isEn ? "Upgrade path" : "Upgrade-Pfad"}</p>
                <h3 className="mt-2 text-2xl font-black text-white">{isEn ? "Agency unlocks team depth and more playbooks" : "Agency schaltet Team-Tiefe und mehr Playbooks frei"}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {isEn
                    ? "If you want multiple projects, shared priorities, and team-scale monetization workflows, move from Pro to Agency."
                    : "Wenn du mehrere Projekte, gemeinsame Prioritaeten und Monetarisierungs-Workflows fuer Teams willst, geh von Pro auf Agency."}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">{isEn ? "More recommendations per scan" : "Mehr Empfehlungen pro Scan"}</div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">{isEn ? "Team-level growth ops" : "Team-Level Growth Ops"}</div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">{isEn ? "Multi-project coordination" : "Multi-Projekt-Steuerung"}</div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    href="/api/checkout?plan=agency&source=revenue-navigator-workspace-upsell"
                    className="rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
                  >
                    {isEn ? "Upgrade to Agency" : "Auf Agency upgraden"}
                  </Link>
                  <Link
                    href="/kontakt?plan=agency&intent=upgrade&source=revenue-navigator-workspace"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                  >
                    {isEn ? "Talk about setup" : "Setup besprechen"}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {!isCustomerMode && <section id="pricing" className="px-5 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 rounded-[2rem] border border-emerald-400/20 bg-gradient-to-br from-emerald-500/12 via-slate-950/40 to-cyan-500/10 p-6 shadow-2xl shadow-emerald-950/20">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/70">
                  {isEn ? "Step 5: capture demand" : "Schritt 5: Nachfrage erfassen"}
                </p>
                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  {isEn ? "Keep every scan as a real contact" : "Jeden Scan als echten Kontakt behalten"}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                  {isEn
                    ? "Use one form for both actions: newsletter for long-term nurture, lead request for direct upgrade conversations."
                    : "Nutze ein gemeinsames Formular fuer beide Aktionen: Newsletter fuer langfristiges Nurturing, Lead-Anfrage fuer direkte Upgrade-Gespraeche."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 sm:p-5">
                <div className="grid gap-3">
                  <input
                    type="text"
                    value={captureName}
                    onChange={(event) => setCaptureName(event.target.value)}
                    placeholder={isEn ? "Your name" : "Dein Name"}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                  />
                  <input
                    type="email"
                    value={captureEmail}
                    onChange={(event) => setCaptureEmail(event.target.value)}
                    placeholder={isEn ? "your@email.com" : "deine@email.de"}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none"
                  />

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => void submitCapture("newsletter")}
                      disabled={captureStatus === "loading"}
                      className="rounded-xl border border-cyan-300/20 bg-cyan-500/15 px-4 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-500/25 disabled:opacity-60"
                    >
                      {captureStatus === "loading" ? (isEn ? "Saving..." : "Speichert...") : (isEn ? "Join newsletter" : "Newsletter sichern")}
                    </button>
                    <button
                      type="button"
                      onClick={() => void submitCapture("lead")}
                      disabled={captureStatus === "loading"}
                      className="rounded-xl border border-emerald-300/20 bg-emerald-500/15 px-4 py-3 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/25 disabled:opacity-60"
                    >
                      {captureStatus === "loading" ? (isEn ? "Saving..." : "Speichert...") : (isEn ? "Request upgrade help" : "Upgrade-Hilfe anfragen")}
                    </button>
                  </div>

                  <p className="text-xs text-slate-400">
                    {isEn
                      ? "Newsletter uses double opt-in. Lead request goes to your admin pipeline."
                      : "Newsletter nutzt Double-Opt-in. Lead-Anfrage geht direkt in deine Admin-Pipeline."}
                  </p>

                  {captureMessage && (
                    <p className={[
                      "text-sm",
                      captureStatus === "success" ? "text-emerald-300" : "text-rose-300",
                    ].join(" ")}>
                      {captureMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/12 via-slate-950/40 to-sky-500/10 p-6 shadow-2xl shadow-cyan-950/20">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">
                  {isEn ? "2-minute sales kit" : "2-Minuten Sales-Kit"}
                </p>
                <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                  {isEn ? "Use this directly for outreach" : "Direkt fuer Outreach nutzen"}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                  {isEn
                    ? "Not just theory: copy the quick scan and first outreach messages. Send them in DM, email or WhatsApp."
                    : "Nicht nur Theorie: kopiere den Kurz-Scan und die ersten Outreach-Nachrichten. Sende sie per DM, E-Mail oder WhatsApp."}
                </p>

                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-sm font-semibold text-white">{isEn ? "Quick scan questions" : "Kurz-Scan Fragen"}</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    {QUICK_SCAN_QUESTIONS.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => void copyKitText(QUICK_SCAN_QUESTIONS.join("\n"))}
                    className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/25"
                  >
                    {isEn ? "Copy quick scan" : "Kurz-Scan kopieren"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {OUTREACH_DAYS.map((day, index) => (
                  <div key={index} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      {isEn ? `Day ${index + 1}` : `Tag ${index + 1}`}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{day[0]}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{day[1]}</p>
                    <button
                      type="button"
                      onClick={() => void copyKitText(day.join("\n\n"))}
                      className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
                    >
                      {isEn ? "Copy day" : "Tag kopieren"}
                    </button>
                  </div>
                ))}

                {kitMessage && <p className="text-sm text-emerald-300">{kitMessage}</p>}
              </div>
            </div>
          </div>

          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{isEn ? "Subscription models" : "Abo-Modelle"}</p>
            <h2 className="mt-2 text-3xl font-black sm:text-5xl">{isEn ? "Start free, then unlock the real leverage" : "Kostenlos starten, dann den echten Hebel freischalten"}</h2>
            <p className="mt-3 text-base leading-7 text-slate-400 sm:text-lg">
              {isEn
                ? "You can keep the free scan as the entry point. Pro and Agency unlock the recurring revenue engine."
                : "Du kannst den kostenlosen Scan als Einstieg behalten. Pro und Agency schalten die wiederkehrende Umsatzmaschine frei."}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1.5">{isEn ? "Free = first direction" : "Free = erste Richtung"}</span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5">{isEn ? "Pro = weekly operating system" : "Pro = wöchentliches Betriebssystem"}</span>
              <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5">{isEn ? "Agency = team monetization cockpit" : "Agency = Monetarisierungs-Cockpit fürs Team"}</span>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {planCards.map((card) => (
              <article key={card.key} className={[
                "relative flex flex-col rounded-[2rem] border p-6 shadow-2xl shadow-slate-950/20",
                card.tone,
              ].join(" ")}>
                <div className={[
                  "absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r",
                  card.accent,
                ].join(" ")} />
                <div className="flex items-start justify-between gap-4 pt-2">
                  <div>
                    <p className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200">
                      {card.badge}
                    </p>
                    <h3 className="mt-4 text-2xl font-black text-white">{card.name}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{card.summary}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-white">{card.price}</p>
                    <p className="text-sm text-slate-400">{card.period}</p>
                  </div>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  {card.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-300">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">{card.action}</div>

                {card.key !== "starter" && (
                  <p className="mt-4 text-xs leading-6 text-slate-400">
                    {card.key === "pro"
                      ? (isEn ? "Best for solo operators and small sites that need one clear weekly revenue decision." : "Am stärksten für Solo-Betreiber und kleinere Seiten, die jede Woche genau eine klare Umsatzentscheidung brauchen.")
                      : (isEn ? "Best for teams, client work, and multiple monetization tracks running in parallel." : "Am stärksten für Teams, Kundenprojekte und mehrere Umsatzpfade gleichzeitig.")}
                  </p>
                )}
              </article>
            ))}
          </div>

              <div className="mt-6 rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-500/12 via-slate-950/40 to-emerald-500/10 p-6 shadow-2xl shadow-cyan-950/20">
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/70">{isEn ? "Why Pro" : "Warum Pro"}</p>
                    <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                      {isEn
                        ? "Pro turns the scan into a weekly operating system."
                        : "Pro macht aus dem Scan ein woechentliches Betriebssystem."}
                    </h3>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                      {isEn
                        ? "Free shows you the first lever. Pro keeps telling you what to do next, so you do not lose momentum after the first idea."
                        : "Free zeigt dir den ersten Hebel. Pro sagt dir weiter, was als naechstes zu tun ist, damit du nach der ersten Idee nicht stehen bleibst."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isEn ? "Output" : "Output"}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{isEn ? "1 weekly priority" : "1 Wochenprioritaet"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isEn ? "Focus" : "Fokus"}</p>
                      <p className="mt-1 text-sm font-semibold text-white">Affiliate + Leads + Ads</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isEn ? "Value" : "Wert"}</p>
                      <p className="mt-1 text-sm font-semibold text-white">+{formatCurrency(Math.max(39, currentLift + 20))}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isEn ? "Cadence" : "Takt"}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{isEn ? "Every 7 days" : "Alle 7 Tage"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-[2rem] border border-amber-400/20 bg-gradient-to-br from-amber-500/12 via-slate-950/40 to-rose-500/10 p-6 shadow-2xl shadow-amber-950/20">
                <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/70">{isEn ? "Why Agency" : "Warum Agency"}</p>
                    <h3 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                      {isEn
                        ? "Agency gives your team one monetization command center."
                        : "Agency gibt deinem Team ein gemeinsames Monetarisierungs-Zentrum."}
                    </h3>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                      {isEn
                        ? "When multiple projects run in parallel, Agency keeps focus, ownership and execution speed aligned week by week."
                        : "Wenn mehrere Projekte parallel laufen, haelt Agency Fokus, Verantwortlichkeit und Umsetzungstempo Woche fuer Woche auf Linie."}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isEn ? "Projects" : "Projekte"}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{isEn ? "Multi-project" : "Mehrere parallel"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isEn ? "Team" : "Team"}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{isEn ? "Shared priorities" : "Gemeinsame Prioritaeten"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isEn ? "Cadence" : "Takt"}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{isEn ? "Weekly ops rhythm" : "Woechentlicher Ops-Rhythmus"}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isEn ? "Scale" : "Skalierung"}</p>
                      <p className="mt-1 text-sm font-semibold text-white">{isEn ? "Faster execution" : "Schnellere Umsetzung"}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/35 p-4 sm:p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/70">
                    {isEn ? "Agency onboarding" : "Agency Onboarding"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {isEn
                      ? "If you want team setup support, send your details here and we will follow up with your next steps."
                      : "Wenn du Team-Setup-Unterstuetzung willst, sende hier deine Daten und wir melden uns mit den naechsten Schritten."}
                  </p>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(event) => setAgencyName(event.target.value)}
                      placeholder={isEn ? "Your name" : "Dein Name"}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={agencyCompany}
                      onChange={(event) => setAgencyCompany(event.target.value)}
                      placeholder={isEn ? "Company" : "Firma"}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                    />
                    <input
                      type="email"
                      value={agencyEmail}
                      onChange={(event) => setAgencyEmail(event.target.value)}
                      placeholder={isEn ? "business@email.com" : "business@email.de"}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
                    />
                    <select
                      value={agencyTeam}
                      onChange={(event) => setAgencyTeam(event.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none"
                    >
                      <option value="2-5">2-5</option>
                      <option value="6-10">6-10</option>
                      <option value="11-20">11-20</option>
                      <option value="20+">20+</option>
                    </select>
                  </div>

                  <label className="mt-3 flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/35 px-4 py-3 text-xs leading-6 text-slate-300">
                    <input
                      type="checkbox"
                      checked={agencyConsent}
                      onChange={(event) => setAgencyConsent(event.target.checked)}
                      className="mt-1 h-4 w-4 accent-amber-400"
                    />
                    <span>
                      {isEn
                        ? "I agree that my data can be processed to contact me about Agency onboarding and setup support."
                        : "Ich stimme zu, dass meine Daten fuer die Kontaktaufnahme zum Agency-Onboarding und Setup-Support verarbeitet werden duerfen."}
                      {" "}
                      <Link href="/datenschutz" className="underline text-amber-200 hover:text-amber-100">
                        {isEn ? "Privacy Policy" : "Datenschutzerklaerung"}
                      </Link>
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => void submitAgencyOnboarding()}
                    disabled={agencyStatus === "loading"}
                    className="mt-3 w-full rounded-xl border border-amber-300/30 bg-amber-500/15 px-4 py-3 text-sm font-bold text-amber-100 transition hover:bg-amber-500/25 disabled:opacity-60"
                  >
                    {agencyStatus === "loading"
                      ? (isEn ? "Saving..." : "Speichert...")
                      : (isEn ? "Request Agency onboarding" : "Agency-Onboarding anfragen")}
                  </button>

                  {agencyMessage && (
                    <p className={[
                      "mt-2 text-sm",
                      agencyStatus === "success" ? "text-emerald-300" : "text-rose-300",
                    ].join(" ")}>
                      {agencyMessage}
                    </p>
                  )}
                </div>
              </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-400">
            <Link href="/kontakt?plan=pro&intent=upgrade" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
              {isEn ? "Need a manual setup?" : "Manuelle Einrichtung?"}
            </Link>
            <Link href="/tools" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
              {isEn ? "Back to tools" : "Zur Tool-Uebersicht"}
            </Link>
          </div>
        </div>
      </section>}

      {isCustomerMode && (
        <section className="px-5 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap gap-3 text-sm text-slate-400">
              <Link href="/konto" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
                {isEn ? "Back to account" : "Zurueck zum Konto"}
              </Link>
              <Link href="/kontakt?source=revenue-navigator-workspace&intent=support" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
                {isEn ? "Need help with setup?" : "Hilfe beim Setup?"}
              </Link>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
