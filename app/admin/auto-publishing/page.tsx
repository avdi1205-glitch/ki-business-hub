"use client";

import React, { useState } from "react";
import { StatCard, ActionButton } from "@/app/components/ProUIComponents";

export default function AutoPublishingPage() {
  const [loading, setLoading] = useState(false);

  const scheduled = [
    {
      title: "5 beste KI-Tools 2026",
      date: "2026-07-05",
      time: "09:00",
      category: "Tools",
      status: "scheduled",
    },
    {
      title: "Affiliate-Marketing für Anfänger",
      date: "2026-07-06",
      time: "14:00",
      category: "Marketing",
      status: "scheduled",
    },
    {
      title: "Content Factory Update",
      date: "2026-07-07",
      time: "10:30",
      category: "Business",
      status: "scheduled",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📅 Auto-Publishing</h1>
          <p className="text-gray-600">Automatische Veröffentlichung deiner Artikel nach Zeitplan</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Geplant"
            value={scheduled.length}
            change="diese Woche"
            icon="📋"
          />
          <StatCard
            title="Veröffentlicht diesen Monat"
            value="12"
            change="+3 mehr als letzter Monat"
            icon="✅"
            trend="up"
          />
          <StatCard
            title="Durchschn. Publikationsverzögerung"
            value="2 Min"
            change="sehr schnell"
            icon="⚡"
          />
        </div>

        {/* Scheduled Articles */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📝 Geplante Artikel</h2>
          
          <div className="space-y-3">
            {scheduled.map((article, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors border-l-4 border-blue-500"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">{article.title}</p>
                  <div className="flex gap-3 text-sm text-gray-600">
                    <span>📅 {article.date} {article.time}</span>
                    <span>•</span>
                    <span>🏷️ {article.category}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
                    Ändern
                  </button>
                  <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors">
                    Löschen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* New Schedule */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">⏰ Neuen Artikel planen</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Artikel</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option>-- Wähle Artikel --</option>
                <option>AI für Anfänger</option>
                <option>Business Automation</option>
                <option>Marketing Tips</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Datum</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  defaultValue="2026-07-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Uhrzeit</label>
                <input
                  type="time"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  defaultValue="09:00"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span>Wöchentlich wiederholen</span>
              </label>
            </div>

            <ActionButton
              label="Planen"
              onClick={() => alert("✅ Artikel geplant!")}
            />
          </div>
        </div>

        {/* Publishing History */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Veröffentlichungsverlauf</h2>
          
          <div className="space-y-3">
            {[
              { title: "KI Tools Überblick", date: "2026-07-03", views: "1.250", time: "2 Tage" },
              { title: "ChatGPT Anleitung", date: "2026-07-02", views: "892", time: "3 Tage" },
              { title: "Automation Guide", date: "2026-07-01", views: "756", time: "4 Tage" },
            ].map((item, idx) => (
              <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">Vor {item.time} veröffentlicht</p>
                </div>
                <p className="text-right font-medium text-green-600">{item.views} Aufrufe</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
