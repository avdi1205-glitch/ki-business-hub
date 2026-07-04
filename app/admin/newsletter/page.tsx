"use client";

import React, { useState } from "react";
import { StatCard, ActionButton } from "@/app/components/ProUIComponents";

export default function NewsletterAutomationPage() {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    totalSubscribers: 1250,
    weeklyGrowth: 45,
    estimatedRevenue: 625,
  });

  const handleSendNewsletter = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/newsletter-automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send-segment",
          subject: "Weekly AI Business Tips 🚀",
          template: "default",
          variables: { week: "Latest" },
        }),
      });
      const data = await response.json();
      if (data.success) alert(`✅ Newsletter an ${data.sent} Abos versendet!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📧 Newsletter-Automatisierung</h1>
          <p className="text-gray-600">Verwalte automatisierte Email-Kampagnen an deine Subscriber</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Gesamt Abos"
            value={metrics.totalSubscribers}
            change="+45 diese Woche"
            icon="👥"
            trend="up"
          />
          <StatCard
            title="Wöchentliche Steigerung"
            value={metrics.weeklyGrowth}
            change="+12%"
            icon="📈"
            trend="up"
          />
          <StatCard
            title="Geschätzte Einnahmen"
            value={`€${metrics.estimatedRevenue}`}
            change="+€125 diese Woche"
            icon="💰"
            trend="up"
          />
        </div>

        {/* Campaign Manager */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📤 Kampagne versenden</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Betreff</label>
              <input
                type="text"
                defaultValue="Weekly AI Business Tips 🚀"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Weekly Digest</option>
                <option>Promotional</option>
                <option>Welcome</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Segment</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Alle (1.250)</option>
                <option>Aktive Nutzer (892)</option>
                <option>Neue (358)</option>
              </select>
            </div>
          </div>

          <ActionButton
            label={loading ? "Wird versendet..." : "Jetzt versenden"}
            onClick={handleSendNewsletter}
            disabled={loading}
          />
        </div>

        {/* Recent Campaigns */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Letzte Kampagnen</h2>
          
          <div className="space-y-3">
            {[
              { subject: "AI Tools für 2026", sent: 1200, opens: 456, rate: "38%" },
              { subject: "ChatGPT Tipps", sent: 1180, opens: 412, rate: "35%" },
              { subject: "Business Automation", sent: 1150, opens: 398, rate: "35%" },
            ].map((campaign, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-medium text-gray-900">{campaign.subject}</p>
                  <p className="text-sm text-gray-600">{campaign.sent} versendet</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{campaign.opens} Öffnungen</p>
                  <p className="text-sm text-green-600">{campaign.rate} Öffnungsrate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
