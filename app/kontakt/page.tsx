export default async function KontaktPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; source?: string; intent?: string }>;
}) {
  const { plan, source, intent } = await searchParams;

  return (
    <main className="min-h-screen p-10" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
      <section className="mx-auto max-w-4xl rounded-2xl p-10" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <h1 className="mb-8 text-5xl font-bold" style={{ color: "var(--text-dark)" }}>
          Kontakt
        </h1>

        <p className="mb-6" style={{ color: "var(--text-light)" }}>
          Du hast Fragen, Feedback oder möchtest mit uns Kontakt aufnehmen?
        </p>

        {(plan || intent === "upgrade") && (
          <div className="mb-8 rounded-xl p-5" style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.24)" }}>
            <p className="font-semibold" style={{ color: "var(--text-dark)" }}>
              Anfrage: {plan ? `${plan.toUpperCase()} Plan` : "Upgrade"}
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-light)" }}>
              Quelle: {source || "website"}. Hinterlege `PRO_CHECKOUT_URL` und `AGENCY_CHECKOUT_URL` in Vercel, damit Kunden direkt bezahlen können.
            </p>
          </div>
        )}

        <div className="space-y-4" style={{ color: "var(--text-light)" }}>
          <p>
            <strong>E-Mail:</strong><br />
            deine@email.de
          </p>

          <p>
            <strong>Website:</strong><br />
            KI Business Hub
          </p>

          <div className="pt-6">
            <p className="text-sm" style={{ color: "#fbbf24" }}>
              Hinweis: Vor dem Livegang bitte deine echte Kontakt-E-Mail eintragen.
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              Wenn du Stripe Payment Links oder Lemon Squeezy Links hast, trage sie in Vercel als `PRO_CHECKOUT_URL` und `AGENCY_CHECKOUT_URL` ein. Dann funktionieren die Upgrade-Buttons direkt.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 className="mb-3 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>Wie du Geld bekommst</h2>
          <div className="space-y-2 text-sm" style={{ color: "var(--text-light)" }}>
            <p>1. Affiliate-Klicks und Verkäufe laufen über deine Partnerprogramme.</p>
            <p>2. Direkte Plan-Umsätze laufen über deinen Zahlungsanbieter, z. B. Stripe Payment Links.</p>
            <p>3. Newsletter und A/B-Tests helfen dir, mehr Klicks und mehr bezahlte Conversions zu erzeugen.</p>
          </p>
        </div>
      </section>
    </main>
  );
}