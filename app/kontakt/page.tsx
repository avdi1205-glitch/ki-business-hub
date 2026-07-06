export default async function KontaktPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; source?: string; intent?: string }>;
}) {
  const t = {
    title: "Kontakt",
    intro: "Fragen, Feedback oder moechtest du mit uns sprechen?",
    request: "Anfrage",
    source: "Quelle",
    howEarn: "So verdienst du Geld",
    email: "E-Mail",
    website: "Website",
    note: "Hinweis",
    supportFlow: "So arbeitet der Support",
  };
  const { plan, source, intent } = await searchParams;
  const planLabel = plan?.toLowerCase() === "agency"
    ? "Agency Plan"
    : plan?.toLowerCase() === "pro"
      ? "Pro Plan"
      : plan?.toUpperCase();

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

  const sourceLabel = source
    ? sourceLabels[source] || source.replaceAll("-", " ")
    : "Website";

  return (
    <main className="min-h-screen p-10" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
      <section className="mx-auto max-w-4xl rounded-2xl p-10" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <h1 className="mb-8 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>
          {t.title}
        </h1>

        <p className="mb-6" style={{ color: "var(--text-light)" }}>
          {t.intro}
        </p>

        {(plan || intent === "upgrade") && (
          <div className="mb-8 rounded-xl p-5" style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.24)" }}>
            <p className="font-semibold" style={{ color: "var(--text-dark)" }}>
              {t.request}: {plan ? planLabel : "Upgrade"}
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-light)" }}>
              {t.source}: {sourceLabel}. Setze PRO_CHECKOUT_URL und AGENCY_CHECKOUT_URL in Vercel, damit Kunden direkt bezahlen koennen.
            </p>
          </div>
        )}

        <div className="space-y-4" style={{ color: "var(--text-light)" }}>
          <p>
            <strong>{t.email}:</strong><br />
            deine@email.de
          </p>

          <p>
            <strong>{t.website}:</strong><br />
            Nexmoneta
          </p>

          <div className="pt-6">
            <p className="text-sm" style={{ color: "#fbbf24" }}>
              {t.note}: Vor dem Launch bitte die echte Support-E-Mail eintragen.
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Wenn du Stripe Payment Links oder Lemon Squeezy Links nutzt, hinterlege sie in Vercel als PRO_CHECKOUT_URL und AGENCY_CHECKOUT_URL. Dann funktionieren die Upgrade-Buttons direkt.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl p-6" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.24)" }}>
          <h2 className="mb-3 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>{t.supportFlow}</h2>
          <div className="space-y-2 text-sm" style={{ color: "var(--text-light)" }}>
            <p>1. Bot-Antwort zuerst bei Standardfragen, Onboarding und schnellen Rueckfragen.</p>
            <p>2. Menschliche Uebergabe bei Billing, account-spezifischen Themen, Bugs und Sonderfaellen.</p>
            <p>3. Priorisierte Bearbeitung fuer aktive Pro- und Agency-Nutzer bei dringenden Blockern.</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 className="mb-3 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>{t.howEarn}</h2>
          <div className="space-y-2 text-sm" style={{ color: "var(--text-light)" }}>
            <p>1. Affiliate-Klicks und Verkaeufe laufen ueber deine Partnerprogramme.</p>
            <p>2. Direkter Plan-Umsatz laeuft ueber deinen Zahlungsanbieter, z. B. Stripe Payment Links.</p>
            <p>3. Newsletter und A/B-Tests helfen dir, mehr Klicks und mehr bezahlte Conversions zu erreichen.</p>
          </div>
        </div>
      </section>
    </main>
  );
}