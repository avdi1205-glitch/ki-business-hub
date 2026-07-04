"use client";

import React from "react";
import Link from "next/link";

export default function AdminPage() {
  const skills = [
    {
      icon: "📧",
      name: "Newsletter",
      desc: "Automatisierte Email-Kampagnen",
      href: "/admin/newsletter",
      color: "bg-blue-100",
      accent: "text-blue-600",
    },
    {
      icon: "🔍",
      name: "SEO-Analyzer",
      desc: "Artikel-Optimierung für Rankings",
      href: "/admin/seo-analyzer",
      color: "bg-purple-100",
      accent: "text-purple-600",
    },
    {
      icon: "🎯",
      name: "Affiliate-Match",
      desc: "Intelligente Tool-Vorschläge",
      href: "/admin/affiliate-match",
      color: "bg-pink-100",
      accent: "text-pink-600",
    },
    {
      icon: "📅",
      name: "Auto-Publishing",
      desc: "Zeitgesteuerte Veröffentlichung",
      href: "/admin/auto-publishing",
      color: "bg-green-100",
      accent: "text-green-600",
    },
    {
      icon: "🧪",
      name: "A/B-Testing",
      desc: "CTA-Text Optimierung",
      href: "/admin/ab-testing",
      color: "bg-orange-100",
      accent: "text-orange-600",
    },
    {
      icon: "📊",
      name: "Analytics",
      desc: "Revenue & Performance",
      href: "/admin/earnings",
      color: "bg-cyan-100",
      accent: "text-cyan-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 Admin Dashboard</h1>
            <p className="text-gray-600">Monetisierungs-Plattform mit 6 intelligenten Skills</p>
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
            { label: "Konversion", value: "8.2%", change: "+1.5%" },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <p className="text-sm text-green-600 font-medium">{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, idx) => (
            <Link key={idx} href={skill.href}>
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer h-full group">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${skill.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <span className="text-2xl">{skill.icon}</span>
                </div>
                
                <h3 className={`text-lg font-semibold mb-2 group-hover:${skill.accent}`}>
                  {skill.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{skill.desc}</p>
                
                <div className="flex items-center text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform">
                  Öffnen →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Letzte Aktivität</h2>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="space-y-4">
              {[
                { action: "Newsletter versendet", details: "1.250 Abos", time: "vor 2 Stunden", icon: "📧" },
                { action: "SEO-Analyse durchgeführt", details: "39 Artikel analysiert", time: "vor 4 Stunden", icon: "🔍" },
                { action: "Affiliate-Links hinzugefügt", details: "12 neue Matches", time: "vor 6 Stunden", icon: "🎯" },
                { action: "3 Artikel veröffentlicht", details: "über Auto-Publishing", time: "vor 8 Stunden", icon: "📅" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="text-2xl">{item.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.action}</p>
                    <p className="text-sm text-gray-600">{item.details}</p>
                  </div>
                  <p className="text-sm text-gray-500">{item.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}