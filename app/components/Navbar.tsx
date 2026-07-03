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
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin", label: "Artikel" },
    { href: "/admin/affiliate", label: "Affiliate Manager" },
    { href: "/create-article", label: "Create Article" },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 text-white">
          <Link href="/" className="text-xl font-bold">
            🚀 KI Business Hub
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-cyan-400">
                {link.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setOpen(true)}
            className="rounded-lg border border-white/20 px-3 py-2 text-2xl lg:hidden"
          >
            ☰
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="ml-auto h-full w-80 max-w-[85%] bg-slate-950 p-6 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-8 flex items-center justify-between">
              <p className="text-xl font-bold">🚀 Menü</p>
              <button onClick={() => setOpen(false)} className="text-3xl">
                ×
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-white/10 px-4 py-3 hover:bg-white/20"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-8 border-t border-white/10 pt-5 text-sm text-gray-400">
              <Link href="/impressum" onClick={() => setOpen(false)} className="block py-2">
                Impressum
              </Link>
              <Link href="/datenschutz" onClick={() => setOpen(false)} className="block py-2">
                Datenschutz
              </Link>
              <Link href="/kontakt" onClick={() => setOpen(false)} className="block py-2">
                Kontakt
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}