"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/tools", label: "KI Tools" },
    { href: "/beste-tools", label: "Beste Tools" },
    { href: "/affiliate", label: "Affiliate" },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin", label: "Artikel" },
    { href: "/admin/affiliate", label: "Affiliate Manager" },
    { href: "/create-article", label: "Create Article" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl" style={{ color: "var(--text-dark)" }}>
            <span className="text-2xl">🚀</span>
            <span className="hidden sm:inline">KI Business Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 lg:flex">
            {/* Main Links */}
            <div className="flex gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-medium transition-colors hover:opacity-70"
                  style={{ color: "var(--text-dark)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Admin Links */}
            <div className="border-l" style={{ borderColor: "var(--border)" }} />
            <div className="flex gap-6">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium transition-colors hover:opacity-70"
                  style={{ color: "var(--text-light)" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(true)}
            className="rounded-lg border px-3 py-2 text-2xl lg:hidden font-bold"
            style={{ borderColor: "var(--border)", color: "var(--text-dark)" }}
          >
            ☰
          </button>
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
            className="ml-auto h-full w-80 max-w-[85%] p-6 shadow-2xl overflow-y-auto"
            style={{ background: "var(--background)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <div className="mb-8 flex items-center justify-between">
              <p className="text-xl font-bold" style={{ color: "var(--text-dark)" }}>
                📋 Menü
              </p>
              <button
                onClick={() => setOpen(false)}
                className="text-3xl font-bold"
                style={{ color: "var(--text-light)" }}
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
                  className="rounded-lg px-4 py-3 font-medium transition-all"
                  style={{
                    background: "var(--primary)",
                    color: "white",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Admin Section */}
            <div className="mb-6 border-t" style={{ borderColor: "var(--border)" }} />
            <p className="mb-3 text-sm font-semibold" style={{ color: "var(--text-light)" }}>
              Admin Panel
            </p>
            <div className="flex flex-col gap-2">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 font-medium transition-all"
                  style={{
                    background: "var(--accent)",
                    color: "white",
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
                className="hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-light)" }}
              >
                Impressum
              </Link>
              <Link
                href="/datenschutz"
                onClick={() => setOpen(false)}
                className="hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-light)" }}
              >
                Datenschutz
              </Link>
              <Link
                href="/kontakt"
                onClick={() => setOpen(false)}
                className="hover:opacity-70 transition-opacity"
                style={{ color: "var(--text-light)" }}
              >
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}