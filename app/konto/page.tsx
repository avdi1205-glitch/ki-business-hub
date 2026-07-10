import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCustomerSession } from "@/lib/customer-auth";
import { hasCustomerAccess } from "@/lib/customer-entitlement";
import { isAdminSessionAuthenticated } from "@/lib/admin-auth";

export default async function CustomerAccountPage() {
  const isAdmin = await isAdminSessionAuthenticated();
  const adminOverrideEmail = process.env.ADMIN_OVERRIDE_EMAIL || "admin@nexmoneta.local";
  const email = isAdmin ? adminOverrideEmail : await requireCustomerSession("/konto");

  if (isAdmin) {
    const activeEntitlement = {
      plan: "agency",
      status: "active",
      graceUntil: null,
    };

    return (
      <main className="min-h-screen px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300/80">Mein Konto</p>
            <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Admin Override aktiv</h1>
            <p className="mt-3 text-slate-300">
              Du nutzt einen Admin-Override fuer Pro/Agency-Tests mit: <strong>{email}</strong>
            </p>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-xl font-bold text-white">Aktives Paket</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Plan</p>
                <p className="mt-1 text-2xl font-black text-emerald-300">{activeEntitlement.plan.toUpperCase()}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-400">Status</p>
                <p className="mt-1 text-2xl font-black text-white">{activeEntitlement.status}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/konto/revenue-navigator" className="rounded-lg bg-cyan-500 px-4 py-2 font-bold text-slate-950">
                Revenue Navigator Workspace
              </Link>
              <Link href="/content-factory" className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 font-bold text-slate-950">
                Content Factory öffnen
              </Link>
              <form action="/api/customer/logout" method="post">
                <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-100">
                  Abmelden
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const entitlement = await prisma.customerEntitlement.findFirst({
    where: {
      email,
      status: { in: ["active", "trialing", "past_due"] },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!hasCustomerAccess(entitlement)) {
    redirect("/konto/login?error=no_active_plan");
  }

  const activeEntitlement = entitlement!;

  return (
    <main className="min-h-screen px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300/80">Mein Konto</p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Dein Plan ist aktiv</h1>
          <p className="mt-3 text-slate-300">
            Diese Freischaltung ist mit deiner Kauf-E-Mail verbunden: <strong>{email}</strong>
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Wenn du dich mit einer anderen E-Mail anmeldest, kann der Zugang nicht automatisch zugeordnet werden.
          </p>
          <p className="mt-2 text-sm text-emerald-300">
            Der Zugriff bleibt nur aktiv, solange dein Plan bei Stripe nicht auf pausiert, faellig oder gekuendigt steht.
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-white">Aktives Paket</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Plan</p>
              <p className="mt-1 text-2xl font-black text-emerald-300">{activeEntitlement.plan.toUpperCase()}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Status</p>
              <p className="mt-1 text-2xl font-black text-white">{activeEntitlement.status}</p>
            </div>
          </div>

          {activeEntitlement.status === "past_due" && activeEntitlement.graceUntil && (
            <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Deine Zahlung ist faellig. Du hast noch Zugriff bis {new Date(activeEntitlement.graceUntil).toLocaleDateString("de-DE")}. Danach wird der Zugang automatisch gesperrt, wenn keine Zahlung eingeht.
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/konto/revenue-navigator" className="rounded-lg bg-cyan-500 px-4 py-2 font-bold text-slate-950">
              Revenue Navigator Workspace
            </Link>
            <Link href="/content-factory" className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 font-bold text-slate-950">
              Content Factory öffnen
            </Link>
            <form action="/api/customer/logout" method="post">
              <button className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-100">
                Abmelden
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
