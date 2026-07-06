"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");
  const isAdminContext =
    pathname?.startsWith("/admin") || pathname === "/create-article" || pathname === "/editor";

  const links = [
    { href: "/", label: t("home") },
    { href: "/blog", label: t("blog") },
    { href: "/tools", label: t("tools") },
    { href: "/beste-tools", label: t("bestTools") },
    { href: "/affiliate", label: t("affiliate") },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: t("dashboard") },
    { href: "/admin", label: t("articles") },
    { href: "/admin/affiliate", label: t("affiliateManager") },
    { href: "/create-article", label: t("createArticle") },
  ];

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      setOpen(false);
      setLoggingOut(false);
      router.push("/");
      router.refresh();
    }
  }

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-2xl"
        style={{
          borderColor: "rgba(148, 163, 184, 0.16)",
          background: "rgba(15, 23, 42, 0.85)",
          boxShadow: "0 8px 32px rgba(2, 6, 23, 0.2)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex min-w-0 items-center gap-2 rounded-2xl px-2 py-1 transition-all hover:bg-white/5 active:scale-95">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-emerald-500 text-lg shadow-lg shadow-sky-500/30 flex-shrink-0">
              🚀
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-white">Nexmoneta</span>
              <span className="hidden max-w-[11rem] text-[10px] leading-tight text-slate-400 lg:block">{t("brandTag")}</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md p-1.5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-all hover:bg-white/20 active:scale-95"
                  style={{
                    color: pathname === link.href ? "#fff" : "#cbd5e1",
                    background: pathname === link.href ? "rgba(59, 130, 246, 0.25)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {isAdminContext && (
              <>
                <div className="h-8 w-px bg-white/10 mx-2" />

                <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md p-1.5">
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={false}
                      className="rounded-full px-4 py-2 text-sm font-semibold transition-all hover:bg-white/20 active:scale-95"
                      style={{
                        color: pathname === link.href ? "#fff" : "#cbd5e1",
                        background: pathname === link.href ? "rgba(245, 158, 11, 0.2)" : "transparent",
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10 active:scale-95"
                  disabled={loggingOut}
                >
                  {loggingOut ? "..." : t("logout")}
                </button>
              </>
            )}

            {!isAdminContext && (
              <Link
                href="/admin-login"
                prefetch={false}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10 active:scale-95"
              >
                {t("adminLogin")}
              </Link>
            )}

            <div className="ml-3">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            {!isAdminContext && (
              <Link
                href="/admin-login"
                prefetch={false}
                className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition-all hover:bg-white/10 active:scale-95"
              >
                {t("adminLogin")}
              </Link>
            )}

            <Link
              href="/content-factory"
              className="hidden sm:inline-flex rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all hover:shadow-emerald-500/40 active:scale-95"
            >
              {t("freeStart")}
            </Link>

            <LanguageSwitcher compact />

            <button
              onClick={() => setOpen(!open)}
              className="rounded-lg border border-white/20 bg-white/5 backdrop-blur-md px-3 py-2.5 text-xl font-bold text-slate-100 hover:bg-white/10 transition-all active:scale-95"
              aria-label={t("openMenu")}
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />

          {/* Mobile Menu */}
          <div
            className="fixed right-0 top-0 z-50 h-screen w-80 max-w-[90vw] overflow-y-auto lg:hidden"
            style={{
              background: "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.94) 100%)",
              borderLeft: "1px solid rgba(148, 163, 184, 0.16)",
            }}
          >
            {/* Close Button */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="text-lg font-bold text-white">Menu</h2>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xl font-bold text-slate-100 hover:bg-white/10 transition-all"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {/* Navigation Links */}
            <div className="space-y-1 px-4 py-6">
              <p className="mb-3 px-2 text-xs font-bold uppercase tracking-widest text-slate-500">Main</p>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-3 text-base font-semibold transition-all hover:bg-white/10"
                  style={{
                    color: pathname === link.href ? "#10b981" : "#cbd5e1",
                    background: pathname === link.href ? "rgba(16, 185, 129, 0.1)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              ))}

              {isAdminContext && (
                <>
                  <p className="mb-4 mt-6 px-2 text-xs font-bold uppercase tracking-widest text-slate-500">Admin</p>
                  {adminLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      prefetch={false}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-4 py-3 text-base font-semibold transition-all hover:bg-white/10"
                      style={{
                        color: pathname === link.href ? "#f59e0b" : "#cbd5e1",
                        background: pathname === link.href ? "rgba(245, 158, 11, 0.1)" : "transparent",
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="mt-3 block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left text-base font-semibold text-slate-200 transition-all hover:bg-white/10"
                  >
                    {loggingOut ? "..." : t("logout")}
                  </button>
                </>
              )}

              {!isAdminContext && (
                <Link
                  href="/admin-login"
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="mt-6 block rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base font-semibold text-slate-200 transition-all hover:bg-white/10"
                >
                  {t("adminLogin")}
                </Link>
              )}
            </div>

            {/* CTA Button */}
            <div className="border-t border-white/10 px-6 py-6">
              <Link
                href="/content-factory"
                onClick={() => setOpen(false)}
                className="block w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 py-3 text-center font-bold text-slate-950 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all active:scale-95"
              >
                🚀 {t("freeStart")}
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}