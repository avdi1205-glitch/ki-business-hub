import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function AdminCheckoutRescuePage() {
	await requireAdminSession("/admin/checkout-rescue");

	return (
		<main className="min-h-screen px-6 py-10 sm:px-8 lg:px-10" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
			<section className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
				<h1 className="text-3xl font-black">Checkout Rescue</h1>
				<p className="mt-3 text-sm leading-7" style={{ color: "var(--text-light)" }}>
					Diese Admin-Seite ist aktiv. Hier siehst du Leads aus fehlgeschlagenen oder manuellen Checkout-Flows.
				</p>

				<div className="mt-6 flex flex-wrap gap-3">
					<Link
						href="/admin/dashboard"
						className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold"
					>
						Zurueck zum Dashboard
					</Link>
					<Link
						href="/stats"
						className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-100"
					>
						Stats ansehen
					</Link>
				</div>
			</section>
		</main>
	);
}
