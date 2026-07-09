"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const nextPath = useMemo(() => {
		const raw = searchParams.get("next") || "/admin/dashboard";
		return raw.startsWith("/") ? raw : "/admin/dashboard";
	}, [searchParams]);

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/admin/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password, nextPath }),
			});

			const payload = await response.json().catch(() => ({}));

			if (!response.ok) {
				const message = typeof payload?.error === "string" ? payload.error : "Login fehlgeschlagen.";
				setError(message);
				return;
			}

			const redirectPath = typeof payload?.nextPath === "string" && payload.nextPath.startsWith("/")
				? payload.nextPath
				: nextPath;

			router.replace(redirectPath);
			router.refresh();
		} catch {
			setError("Netzwerkfehler. Bitte erneut versuchen.");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<main className="min-h-screen px-6 py-10 sm:px-8 lg:px-10" style={{ background: "var(--background)", color: "var(--text-dark)" }}>
			<section className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
				<h1 className="text-3xl font-black">Admin Login</h1>
				<p className="mt-2 text-sm" style={{ color: "var(--text-light)" }}>
					Melde dich mit deinen Admin-Zugangsdaten an.
				</p>

				<form className="mt-6 space-y-4" onSubmit={onSubmit}>
					<label className="block text-sm font-bold" htmlFor="username">
						Benutzername
					</label>
					<input
						id="username"
						name="username"
						autoComplete="username"
						className="w-full rounded-xl border border-white/15 bg-slate-950/40 px-4 py-3"
						value={username}
						onChange={(event) => setUsername(event.target.value)}
						required
					/>

					<label className="block text-sm font-bold" htmlFor="password">
						Passwort
					</label>
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="current-password"
						className="w-full rounded-xl border border-white/15 bg-slate-950/40 px-4 py-3"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						required
					/>

					{error && (
						<p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
							{error}
						</p>
					)}

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-black text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isSubmitting ? "Anmeldung..." : "Einloggen"}
					</button>
				</form>
			</section>
		</main>
	);
}
