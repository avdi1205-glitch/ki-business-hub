import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-auth";

function statusTone(status: string, graceUntil: Date | null) {
  if (status === "active" || status === "trialing") {
    return "bg-emerald-500/10 text-emerald-200 border-emerald-400/30";
  }

  if (status === "past_due" && graceUntil && graceUntil.getTime() > Date.now()) {
    return "bg-amber-500/10 text-amber-100 border-amber-400/30";
  }

  return "bg-rose-500/10 text-rose-100 border-rose-400/30";
}

function formatGraceUntil(graceUntil: Date | null) {
  if (!graceUntil) return "-";
  return graceUntil.toLocaleDateString("de-DE");
}

export default async function BillingAdminPage() {
  await requireAdminSession("/admin/billing");

  const entitlements = await prisma.customerEntitlement.findMany({
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const counts = entitlements.reduce<Record<string, number>>((accumulator, row) => {
    accumulator[row.status] = (accumulator[row.status] || 0) + 1;
    return accumulator;
  }, {});

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300/80">Billing Control</p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Kunden-Zugänge & Zahlungsstatus</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Hier siehst du, welche Konten aktiv sind, welche in der Kulanzfrist laufen und welche gesperrt wurden.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-emerald-100">Active: {counts.active || 0}</span>
            <span className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-amber-100">Past due: {counts.past_due || 0}</span>
            <span className="rounded-full border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-rose-100">Canceled: {counts.canceled || 0}</span>
            <Link href="/admin" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-100 hover:bg-white/10">
              Zurueck zum Admin
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-400">
                  <th className="px-4 py-3 font-semibold">E-Mail</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Kulanz bis</th>
                  <th className="px-4 py-3 font-semibold">Stripe Kunde</th>
                  <th className="px-4 py-3 font-semibold">Stripe Abo</th>
                  <th className="px-4 py-3 font-semibold">Zuletzt aktualisiert</th>
                </tr>
              </thead>
              <tbody>
                {entitlements.map((row) => {
                  const graceUntil = row.graceUntil ? new Date(row.graceUntil) : null;
                  return (
                    <tr key={row.id} className="border-b border-white/10 last:border-0">
                      <td className="px-4 py-3 text-slate-100">{row.email}</td>
                      <td className="px-4 py-3 text-slate-200">{row.plan.toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusTone(row.status, graceUntil)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{formatGraceUntil(graceUntil)}</td>
                      <td className="px-4 py-3 text-slate-300">{row.stripeCustomerId || "-"}</td>
                      <td className="px-4 py-3 text-slate-300">{row.stripeSubscriptionId || "-"}</td>
                      <td className="px-4 py-3 text-slate-300">{new Date(row.updatedAt).toLocaleString("de-DE")}</td>
                    </tr>
                  );
                })}
                {!entitlements.length && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-300">
                      Noch keine Kunden-Zugaenge vorhanden.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}