import Link from "next/link";
import CheckoutRescueLeadForm from "./CheckoutRescueLeadForm";

type SearchValue = string | string[] | undefined;

function firstValue(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

function describeSource(source: string | undefined) {
  if (!source) return "Website";

  const sourceLabels: Record<string, string> = {
    "hero-start-free-start": "Homepage Hero - Kostenlos starten",
    "hero-start-direct-start": "Homepage Hero - Direkt starten",
    "hero-pro-price-view": "Homepage Hero - Pro ansehen",
    "hero-pro-direct-pro": "Homepage Hero - Pro aktivieren",
    "pricing-pro-variant-a": "Pricing-Bereich - Pro Variante A",
    "pricing-pro-variant-b": "Pricing-Bereich - Pro Variante B",
    "pricing-agency-variant-a": "Pricing-Bereich - Agency Variante A",
    "pricing-agency-variant-b": "Pricing-Bereich - Agency Variante B",
    "final-pro-variant-a": "Finale CTA - Pro Variante A",
    "final-pro-variant-b": "Finale CTA - Pro Variante B",
    "pricing-card-pro": "Pricing-Karte Pro",
    "pricing-card-agency": "Pricing-Karte Agency",
    "hero-secondary": "Homepage Hero sekundaer",
    "final-cta": "Finale CTA",
  };

  if (sourceLabels[source]) return sourceLabels[source];
  if (source.startsWith("tools-")) return "Tools Uebersicht";
  if (source.startsWith("tool-")) return "Tool-Detailseite";
  if (source.startsWith("blog-")) return "Blog-Artikel";
  if (source.startsWith("affiliate-")) return "Affiliate-Seite";
  if (source.startsWith("factory-")) return "Content-Factory";

  return source.replaceAll("-", " ");
}

export default async function KontaktPage({
  searchParams,
}: {
  searchParams: Promise<{
    plan?: SearchValue;
    source?: SearchValue;
    intent?: SearchValue;
    reason?: SearchValue;
    error?: SearchValue;
  }>;
}) {
  const params = await searchParams;
  const supportEmail = "kontakt@nexmoneta.com";
  const plan = firstValue(params.plan)?.toLowerCase();
  const source = firstValue(params.source);
  const intent = firstValue(params.intent);
  const reason = firstValue(params.reason);
  const error = firstValue(params.error);

  const planConfig = plan === "agency"
    ? {
        name: "Agency",
        accent: "#f59e0b",
        badge: "Skaliert fuer Team, Kunden und hoehere Publishing-Frequenz",
        primaryCta: "Agency manuell anfragen",
        bullets: [
          "Mehr Volumen fuer Content, SEO und Affiliate-Ausspielung",
          "Schnellere Umsetzungswege fuer wiederholbare Revenue-Workflows",
          "Priorisierte Unterstuetzung bei Blockern im Setup",
        ],
      }
    : plan === "pro"
      ? {
          name: "Pro",
          accent: "#06b6d4",
          badge: "Sauberer Schritt von Testbetrieb zu regelmaessigem Umsatzaufbau",
          primaryCta: "Pro manuell anfragen",
          bullets: [
            "Mehr Output fuer Content und Affiliate-Seiten ohne Bastelchaos",
            "Klarere Monetarisierungspfade mit weniger Reibung im Alltag",
            "Schnellerer Support fuer konkrete Umsetzungsfragen",
          ],
        }
      : null;

  const sourceLabel = describeSource(source);
  const headline = planConfig ? `${planConfig.name} anfragen` : "Kontakt";
  const intro = planConfig
    ? `Du warst schon nah am ${planConfig.name}-Upgrade. Wenn der direkte Checkout gerade noch nicht live ist, holen wir dich ohne Umweg manuell in den naechsten Schritt.`
    : "Fragen, Feedback oder moechtest du mit uns ueber deinen naechsten Umsatzschritt sprechen?";

  const mailSubject = encodeURIComponent(
    planConfig
      ? `${planConfig.name} Anfrage ueber ${sourceLabel}`
      : `Kontaktanfrage ueber ${sourceLabel}`,
  );

  const mailBody = encodeURIComponent(
    [
      "Hallo Nexmoneta-Team,",
      "",
      planConfig
        ? `ich moechte den ${planConfig.name}-Plan manuell anfragen.`
        : "ich moechte mehr ueber euer Angebot erfahren.",
      source ? `Quelle: ${source}` : "Quelle: website",
      intent ? `Intent: ${intent}` : "Intent: kontakt",
      "",
      "Mein aktuelles Ziel:",
      "",
      "Meine Fragen:",
    ].join("\n"),
  );

  const mailtoHref = `mailto:${supportEmail}?subject=${mailSubject}&body=${mailBody}`;

  return (
    <main
      className="min-h-screen px-6 py-10 sm:px-8 lg:px-10"
      style={{
        background: "radial-gradient(circle at top, rgba(8,145,178,0.18), transparent 32%), var(--background)",
        color: "var(--text-dark)",
      }}
    >
      <section
        className="mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-10"
        style={{ backgroundColor: "var(--background-elevated)" }}
      >
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
          <div>
            <div className="mb-5 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.24em]">
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-cyan-200">
                Umsatzpfad aktiv
              </span>
              {(planConfig || intent === "upgrade") && (
                <span
                  className="rounded-full border px-4 py-2"
                  style={{
                    color: planConfig?.accent || "#f8fafc",
                    borderColor: `${planConfig?.accent || "#94a3b8"}55`,
                    background: `${planConfig?.accent || "#94a3b8"}14`,
                  }}
                >
                  {planConfig ? planConfig.name : "Upgrade"}
                </span>
              )}
            </div>

            <h1 className="max-w-3xl text-4xl font-black sm:text-5xl" style={{ color: "var(--text-dark)" }}>
              {headline}
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-8" style={{ color: "var(--text-light)" }}>
              {intro}
            </p>

            {(reason === "checkout_url_missing" || error === "invalid_plan") && (
              <div className="mt-6 rounded-2xl border border-amber-400/25 bg-amber-500/10 p-5">
                <p className="font-semibold" style={{ color: "var(--text-dark)" }}>
                  {reason === "checkout_url_missing"
                    ? "Der direkte Bezahl-Link ist gerade noch nicht live."
                    : "Die gewuenschte Upgrade-Route war nicht gueltig."}
                </p>
                <p className="mt-2 text-sm leading-7" style={{ color: "var(--text-light)" }}>
                  Du kannst trotzdem direkt anfragen. Wir sehen bereits, von welcher Seite du kommst, und koennen dich ohne extra Rueckfragen in den passenden Flow bringen.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={mailtoHref}
                className="rounded-2xl px-6 py-4 text-center font-black text-white transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: `linear-gradient(135deg, ${planConfig?.accent || "#06b6d4"}, #10b981)`,
                  boxShadow: "0 18px 40px rgba(8,145,178,0.22)",
                }}
              >
                {planConfig ? planConfig.primaryCta : "Support direkt anschreiben"}
              </Link>
              <Link
                href="/content-factory"
                className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-6 py-4 text-center font-black text-emerald-100 transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-500/20"
              >
                Kostenlos weiter testen
              </Link>
              <Link
                href="/tools"
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-center font-black text-slate-100 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
              >
                Erst Tools vergleichen
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Quelle</p>
                <p className="mt-3 text-lg font-bold" style={{ color: "var(--text-dark)" }}>{sourceLabel}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Intent</p>
                <p className="mt-3 text-lg font-bold" style={{ color: "var(--text-dark)" }}>{intent || "Kontakt"}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Antwortweg</p>
                <p className="mt-3 text-lg font-bold" style={{ color: "var(--text-dark)" }}>{supportEmail}</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 p-6 text-slate-100">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300/80">Naechster Schritt</p>
              <h2 className="mt-3 text-2xl font-black text-white">
                {planConfig ? `${planConfig.name} passt, wenn du nicht nur testen willst.` : "So holen wir dich in den passenden Flow."}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {planConfig?.badge || "Wir priorisieren manuelle Rueckmeldungen fuer Upgrade-, Support- und Revenue-Fragen mit klarem Kontext aus der Quelle."}
              </p>
              <div className="mt-5 space-y-3">
                {(planConfig?.bullets || [
                  "Klare Einordnung, welcher Plan zu deinem aktuellen Umsatz-Ziel passt",
                  "Schneller naechster Schritt statt allgemeinem Hin-und-her",
                  "Konkreter manueller Rueckkanal, solange Payment Links noch fehlen",
                ]).map((bullet) => (
                  <div key={bullet} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    {bullet}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-cyan-400/20 bg-cyan-500/10 p-6">
              <h2 className="text-2xl font-black" style={{ color: "var(--text-dark)" }}>Support-Flow</h2>
              <div className="mt-4 space-y-3 text-sm leading-7" style={{ color: "var(--text-light)" }}>
                <p>1. Standardfragen werden schnell vorqualifiziert, damit Umsatz-Themen nicht in allgemeinem Support untergehen.</p>
                <p>2. Billing, Account-Faelle, Bugs und planbezogene Rueckfragen gehen direkt in die menschliche Bearbeitung.</p>
                <p>3. Aktive Pro- und Agency-Nutzer werden bei dringenden Blockern priorisiert weitergezogen.</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-500/10 p-6">
              <h2 className="text-2xl font-black" style={{ color: "var(--text-dark)" }}>Schnelle Rueckmeldung</h2>
              <p className="mt-3 text-sm leading-7" style={{ color: "var(--text-light)" }}>
                Wenn du keine Mail verfassen willst, hinterlasse hier deine Adresse. Wir speichern Quelle und Plan-Kontext automatisch,
                damit du eine passende Antwort statt Standard-Text bekommst.
              </p>
              <div className="mt-4">
                <CheckoutRescueLeadForm
                  plan={plan}
                  source={source}
                  intent={intent}
                  reason={reason}
                />
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
              <h2 className="text-2xl font-black" style={{ color: "var(--text-dark)" }}>Monetarisierungs-Logik</h2>
              <div className="mt-4 space-y-3 text-sm leading-7" style={{ color: "var(--text-light)" }}>
                <p>1. Tools und Artikel erzeugen Nachfrage und qualifizieren den Bedarf.</p>
                <p>2. Content Factory, Tracking und Affiliate-Platzierung machen aus Interesse einen wiederholbaren Umsatzpfad.</p>
                <p>3. Bezahlte Plaene lohnen sich dann, wenn du Volumen, Tempo und Conversion sauberer steuern willst.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}