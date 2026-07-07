import Link from "next/link";
import AccessLinkForm from "./AccessLinkForm";

export default async function CustomerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="min-h-screen px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-300/80">Kundenkonto</p>
          <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">Zugang zu deinem gekauften Plan</h1>
          <p className="mt-3 text-slate-300">
            Gib die E-Mail ein, die du beim Kauf in Stripe verwendet hast. Wir senden dir einen sicheren Login-Link.
          </p>

          {params.error && (
            <p className="mt-4 rounded-lg border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Der Link war ungültig oder abgelaufen. Bitte fordere einen neuen Zugangslink an.
            </p>
          )}
        </div>

        <AccessLinkForm />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
          <p>
            Noch keinen Plan gekauft? Dann starte hier:
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-100" href="/api/checkout?plan=pro&source=konto-login">
              Pro
            </Link>
            <Link className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-semibold text-slate-100" href="/api/checkout?plan=agency&source=konto-login">
              Agency
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
