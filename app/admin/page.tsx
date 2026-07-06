"use client";

import React from "react";
import Link from "next/link";

export default function AdminPage() {
  const skills = [
    {
      icon: "🤖",
      name: "Content Factory",
      desc: "KI-gestuetzte Artikel-Erstellung",
      href: "/content-factory",
      color: "#3b82f6",
      accent: "text-blue-400",
    },
    {
      icon: "📧",
      name: "Newsletter",
      desc: "Automatisierte E-Mail-Kampagnen",
      href: "/admin/newsletter",
      color: "#3b82f6",
      accent: "text-blue-400",
    },
    {
      icon: "🔍",
      name: "SEO-Analyzer",
      desc: "Artikel-Optimierung fuer bessere Rankings",
      href: "/admin/seo-analyzer",
      color: "#8b5cf6",
      accent: "text-purple-400",
    },
    {
      icon: "🎯",
      name: "Affiliate-Match",
      desc: "Smarte Tool-Empfehlungen",
      href: "/admin/affiliate-match",
      color: "#ec4899",
      accent: "text-pink-400",
    },
    {
      icon: "📅",
      name: "Auto-Publishing",
      desc: "Geplantes Veröffentlichen",
      href: "/admin/auto-publishing",
      color: "#10b981",
      accent: "text-green-400",
    },
    {
      icon: "🧪",
      name: "A/B-Testing",
      desc: "Optimierung von CTA-Texten",
      href: "/admin/ab-testing",
      color: "#f59e0b",
      accent: "text-amber-400",
    },
    {
      icon: "📊",
      name: "Analytics",
      desc: "Umsatz und Performance",
      href: "/admin/earnings",
      color: "#06b6d4",
      accent: "text-cyan-400",
    },
    {
      icon: "💸",
      name: "Umsatz-Navigator",
      desc: "Woechentlicher Umsatz-Plan mit klaren Prioritaeten",
      href: "/admin/revenue-navigator",
      color: "#10b981",
      accent: "text-emerald-400",
    },
    {
      icon: "🧠",
      name: "Interne Bots",
      desc: "Sales-, SEO-, Content-Ops- und Support-Copiloten",
      href: "/admin/internal-bots",
      color: "#f97316",
      accent: "text-orange-400",
    },
  ];

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "var(--background-elevated)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>🚀 Admin Dashboard</h1>
            <p style={{ color: "var(--text-light)" }}>Monetarisierungs-Plattform mit 9 intelligenten Modulen</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Diese Woche", value: "€487.50", change: "+28%" },
            { label: "Diesen Monat", value: "€2.145", change: "+42%" },
            { label: "Artikel", value: "39", change: "+6 generiert" },
            { label: "Conversion", value: "8.2%", change: "+1.5%" },
          ].map((stat, idx) => (
            <div key={idx} className="rounded-xl border p-6 transition-shadow" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>{stat.label}</p>
              <p className="text-3xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>{stat.value}</p>
              <p className="text-sm font-medium" style={{ color: "var(--success)" }}>{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, idx) => (
            <Link key={idx} href={skill.href}>
              <div className="rounded-xl border p-6 transition-all cursor-pointer h-full group" style={{ background: "var(--background-elevated)", border: `1px solid ${skill.color}40` }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 group-hover:scale-110 transition-transform" style={{ background: `${skill.color}20` }}>
                  <span className="text-2xl">{skill.icon}</span>
                </div>
                
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-dark)" }}>
                  {skill.name}
                </h3>
                <p className="text-sm mb-4" style={{ color: "var(--text-light)" }}>{skill.desc}</p>
                
                <div className="flex items-center text-sm font-medium transition-transform group-hover:translate-x-1" style={{ color: skill.color }}>
                  Oeffnen →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text-dark)" }}>📊 Letzte Aktivitaeten</h2>
          
          <div className="rounded-xl border p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="space-y-4">
              {[
                { action: "Newsletter versendet", details: "1.250 Abonnenten", time: "vor 2 Stunden", icon: "📧" },
                { action: "SEO-Analyse abgeschlossen", details: "39 Artikel analysiert", time: "vor 4 Stunden", icon: "🔍" },
                { action: "Affiliate-Links hinzugefuegt", details: "12 neue Matches", time: "vor 6 Stunden", icon: "🎯" },
                { action: "3 Artikel veroeffentlicht", details: "via Auto-Publishing", time: "vor 8 Stunden", icon: "📅" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium" style={{ color: "var(--text-dark)" }}>{item.action}</p>
                    <p className="text-sm" style={{ color: "var(--text-light)" }}>{item.details}</p>
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}