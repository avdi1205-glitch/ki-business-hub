"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");

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

  return (
    <>
      <nav
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: "rgba(148, 163, 184, 0.16)",
          background: "rgba(15, 23, 42, 0.82)",
          boxShadow: "0 12px 30px rgba(2, 6, 23, 0.24)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2 rounded-2xl px-1 py-1 transition-colors hover:bg-white/5 sm:gap-3 sm:px-2" style={{ color: "var(--text-dark)" }}>
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-400 text-base shadow-lg shadow-sky-500/20 sm:h-10 sm:w-10 sm:text-lg">
              🚀
            </span>
            <span className="flex max-w-[7.5rem] flex-col leading-tight sm:max-w-none">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300 sm:text-sm sm:tracking-[0.22em]">KI Business Hub</span>
              <span className="text-xs text-slate-400 hidden sm:block">{t("brandTag")}</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-4 lg:flex">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 shadow-inner shadow-black/10">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-all hover:bg-white/10 hover:text-white"
                  style={{
                    color: pathname === link.href ? "#fff" : "var(--text-light)",
                    background: pathname === link.href ? "rgba(59, 130, 246, 0.2)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5 shadow-inner shadow-black/10">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-all hover:bg-white/10 hover:text-white"
                  style={{
                    color: pathname === link.href ? "#fff" : "#dbe3ef",
                    background: pathname === link.href ? "rgba(245, 158, 11, 0.2)" : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <Link
              href="/content-factory"
              className="rounded-full border border-emerald-400/30 bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-transform hover:-translate-y-0.5"
            >
              {t("freeStart")}
            </Link>

            <LanguageSwitcher />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 lg:hidden">
            <Link
              href="/content-factory"
              className="rounded-full border border-emerald-400/30 bg-emerald-500 px-2.5 py-2 text-[11px] font-bold text-slate-950 shadow-sm shadow-emerald-500/20"
            >
              {t("mobileStart")}
            </Link>

            <LanguageSwitcher compact />

            <button
              onClick={() => setOpen(true)}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-2 text-lg font-bold text-slate-100 shadow-sm"
              aria-label={t("openMenu")}
            >
              ☰
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
          onClick={() => setOpen(false)}
        >
          <div
            className="ml-auto h-full w-80 max-w-[85%] overflow-y-auto border-l border-white/10 p-6 shadow-2xl"
            style={{ background: "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.94) 100%)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-xl font-bold" style={{ color: "var(--text-dark)" }}>
                  📋 {t("menu")}
                </p>
                <p className="text-sm" style={{ color: "var(--text-light)" }}>
                  {t("quickNav")}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-2xl font-bold text-slate-100"
                aria-label={t("closeMenu")}
              >
                ×
              </button>
            </div>

            {/* Main Links */}
            <div className="mb-6 flex flex-col gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-white/10 px-4 py-3 font-semibold transition-all"
                  style={{
                    background: pathname === link.href ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.04)",
                    color: "#f8fafc",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t("adminPanel")}
              </p>
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="mb-2 block rounded-xl border border-white/10 px-4 py-3 font-medium transition-all last:mb-0"
                  style={{
                    background: pathname === link.href ? "rgba(245, 158, 11, 0.22)" : "rgba(255,255,255,0.04)",
                    color: "#f8fafc",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Footer Links */}
            <div className="mt-8 border-t" style={{ borderColor: "var(--border)" }} />
            <div className="mt-6 flex flex-col gap-3 text-sm">
              <Link
                href="/impressum"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
                style={{ color: "var(--text-light)" }}
              >
                {t("imprint")}
              </Link>
              <Link
                href="/datenschutz"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
                style={{ color: "var(--text-light)" }}
              >
                {t("privacy")}
              </Link>
              <Link
                href="/kontakt"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 transition-colors hover:bg-white/5"
                style={{ color: "var(--text-light)" }}
              >
                {t("contact")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}