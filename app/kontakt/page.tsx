export default async function KontaktPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; source?: string; intent?: string }>;
}) {
  const t = {
    title: "Contact",
    intro: "Questions, feedback, or want to get in touch?",
    request: "Request",
    source: "Source",
    howEarn: "How you get paid",
    email: "Email",
    website: "Website",
    note: "Note",
    supportFlow: "How support works",
  };
  const { plan, source, intent } = await searchParams;
  const planLabel = plan?.toLowerCase() === "agency"
    ? "Agency plan"
    : plan?.toLowerCase() === "pro"
      ? "Pro plan"
      : plan?.toUpperCase();

  const sourceLabels: Record<string, string> = {
    "hero-start-free-start": "Homepage Hero - Start free",
    "hero-start-direct-start": "Homepage Hero - Get started",
    "hero-pro-price-view": "Homepage Hero - View Pro",
    "hero-pro-direct-pro": "Homepage Hero - Go Pro",
    "pricing-pro-variant-a": "Pricing section - Pro variant A",
    "pricing-pro-variant-b": "Pricing section - Pro variant B",
    "pricing-agency-variant-a": "Pricing section - Agency variant A",
    "pricing-agency-variant-b": "Pricing section - Agency variant B",
    "final-pro-variant-a": "Final CTA - Pro variant A",
    "final-pro-variant-b": "Final CTA - Pro variant B",
    "pricing-card-pro": "Pricing card Pro",
    "pricing-card-agency": "Pricing card Agency",
    "hero-secondary": "Homepage Hero secondary",
    "final-cta": "Final CTA",
  };

  const sourceLabel = source
    ? sourceLabels[source] || source.replaceAll("-", " ")
    : "website";

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
              {t.source}: {sourceLabel}. Set PRO_CHECKOUT_URL and AGENCY_CHECKOUT_URL in Vercel so customers can pay directly.
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
              {t.note}: Before launch, replace this with your real contact email.
            </p>
            <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
              If you have Stripe Payment Links or Lemon Squeezy links, add them in Vercel as PRO_CHECKOUT_URL and AGENCY_CHECKOUT_URL. Then the upgrade buttons work directly.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-xl p-6" style={{ background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.24)" }}>
          <h2 className="mb-3 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>{t.supportFlow}</h2>
          <div className="space-y-2 text-sm" style={{ color: "var(--text-light)" }}>
            <p>1. Bot first response for standard questions, onboarding, and quick troubleshooting.</p>
            <p>2. Human handover for billing, account-specific issues, technical bugs, and edge cases.</p>
            <p>3. Priority handling for active Pro and Agency users on urgent blockers.</p>
          </div>
        </div>

        <div className="mt-8 rounded-xl p-6" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 className="mb-3 text-2xl font-bold" style={{ color: "var(--text-dark)" }}>{t.howEarn}</h2>
          <div className="space-y-2 text-sm" style={{ color: "var(--text-light)" }}>
            <p>1. Affiliate clicks and sales run through your partner programs.</p>
            <p>2. Direct plan revenue runs through your payment provider, for example Stripe Payment Links.</p>
            <p>3. Newsletters and A/B tests help you generate more clicks and more paid conversions.</p>
          </div>
        </div>
      </section>
    </main>
  );
}