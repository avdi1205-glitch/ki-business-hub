import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireCustomerSession } from "@/lib/customer-auth";

export default async function CustomerAccountPage() {
  const email = await requireCustomerSession("/konto");

  const entitlement = await prisma.customerEntitlement.findFirst({
    where: {
      email,
      status: "active",
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!entitlement) {
    redirect("/konto/login?error=no_active_plan");
  }

  return (
    <main className="min-h-screen px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300/80">Mein Konto</p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Dein Plan ist aktiv</h1>
          <p className="mt-3 text-slate-300">
            Diese Freischaltung ist mit deiner Kauf-E-Mail verbunden: <strong>{email}</strong>
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-bold text-white">Aktives Paket</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Plan</p>
              <p className="mt-1 text-2xl font-black text-emerald-300">{entitlement.plan.toUpperCase()}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-400">Status</p>
              <p className="mt-1 text-2xl font-black text-white">{entitlement.status}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
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
