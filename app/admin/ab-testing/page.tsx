"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StatCard, ActionButton } from "@/app/components/ProUIComponents";

type AffiliateOption = {
  id: number;
  name: string;
  buttonText: string | null;
};

type ABTest = {
  id: number;
  affiliateLinkId: number;
  affiliateName: string;
  currentButtonText: string | null;
  variantA: string;
  variantB: string;
  impressionsA: number;
  impressionsB: number;
  clicksA: number;
  clicksB: number;
  rateA: number;
  rateB: number;
  confidence: number;
  winner: "A" | "B" | null;
  status: string;
  createdAt: string;
  appliedAt: string | null;
};

export default function ABTestingPage() {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [tests, setTests] = useState<ABTest[]>([]);
  const [affiliates, setAffiliates] = useState<AffiliateOption[]>([]);
  const [selectedAffiliate, setSelectedAffiliate] = useState("");
  const [variantA, setVariantA] = useState("Kostenlos testen");
  const [variantB, setVariantB] = useState("Jetzt starten");

  const activeTests = useMemo(() => tests.filter((test) => test.status === "active"), [tests]);
  const completedTests = useMemo(() => tests.filter((test) => test.status === "complete"), [tests]);
  const averageRate = activeTests.length
    ? (activeTests.reduce((sum, test) => sum + Math.max(test.rateA, test.rateB), 0) / activeTests.length).toFixed(2)
    : "0.00";

  const loadData = useCallback(async () => {
    const response = await fetch("/api/ab-testing");
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "A/B-Testdaten konnten nicht geladen werden");
    }

    setTests(data.tests || []);
    setAffiliates(data.affiliates || []);

    if (!selectedAffiliate && data.affiliates?.[0]?.id) {
      setSelectedAffiliate(String(data.affiliates[0].id));
      setVariantA(data.affiliates[0].buttonText || "Kostenlos testen");
      setVariantB("Jetzt starten");
    }
  }, [selectedAffiliate]);

  useEffect(() => {
    const init = async () => {
      try {
        await loadData();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "A/B-Testdaten konnten nicht geladen werden");
      } finally {
        setInitialLoading(false);
      }
    };

    void init();
  }, [loadData]);

  const createTest = async () => {
    if (!selectedAffiliate) {
      setStatus("Bitte zuerst einen Affiliate-Link auswählen.");
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/ab-testing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-test",
          affiliateLinkId: Number(selectedAffiliate),
          variantA,
          variantB,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "A/B-Test konnte nicht erstellt werden");
      }

      setStatus(data.message);
      await loadData();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "A/B-Test konnte nicht erstellt werden");
    } finally {
      setLoading(false);
    }
  };

  const applyWinner = async (test: ABTest) => {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/ab-testing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "apply-winner", testId: test.id, winner: test.winner }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gewinner konnte nicht übernommen werden");
      }

      setStatus(data.message);
      await loadData();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gewinner konnte nicht übernommen werden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>🧪 A/B-Testing</h1>
          <p style={{ color: "var(--text-light)" }}>Teste echte CTA-Texte auf deinen Affiliate-Buttons und rolle Gewinner live aus.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Aktive Tests" value={activeTests.length} change="live auf Affiliate-Buttons" icon="⚙️" />
          <StatCard title="Top CTR" value={`${averageRate}%`} change="bester Text pro aktivem Test" icon="📈" trend="up" />
          <StatCard title="Übernommene Gewinner" value={completedTests.length} change="bereits live gesetzt" icon="🏆" />
          <StatCard title="Affiliate-Links" value={affiliates.length} change="verfügbare Testziele" icon="💰" trend="up" />
        </div>

        <div className="mb-8 rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>➕ Neuen CTA-Test anlegen</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-light)" }}>Affiliate-Link</label>
              <select
                value={selectedAffiliate}
                onChange={(event) => {
                  const nextId = event.target.value;
                  setSelectedAffiliate(nextId);
                  const nextAffiliate = affiliates.find((affiliate) => String(affiliate.id) === nextId);
                  if (nextAffiliate?.buttonText) {
                    setVariantA(nextAffiliate.buttonText);
                  }
                }}
                className="w-full rounded-lg px-4 py-2"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-dark)" }}
              >
                <option value="">-- Wähle Link --</option>
                {affiliates.map((affiliate) => (
                  <option key={affiliate.id} value={affiliate.id}>
                    {affiliate.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-light)" }}>Variante A</label>
              <input
                value={variantA}
                onChange={(event) => setVariantA(event.target.value)}
                className="w-full rounded-lg px-4 py-2"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-dark)" }}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-light)" }}>Variante B</label>
              <input
                value={variantB}
                onChange={(event) => setVariantB(event.target.value)}
                className="w-full rounded-lg px-4 py-2"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-dark)" }}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <ActionButton label={loading ? "Erstelle..." : "A/B-Test starten"} onClick={createTest} disabled={loading} />
            {status && <p className="text-sm" style={{ color: "var(--text-light)" }}>{status}</p>}
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {initialLoading ? (
            <div className="rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-light)" }}>
              Lade Tests...
            </div>
          ) : activeTests.length === 0 ? (
            <div className="rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-light)" }}>
              Noch keine aktiven Tests. Erstelle den ersten CTA-Test für einen Affiliate-Link.
            </div>
          ) : (
            activeTests.map((test) => (
              <div key={test.id} className="rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="mb-2 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>{test.affiliateName}</h2>
                    <p className="text-sm" style={{ color: "var(--text-light)" }}>Aktueller Live-Text: {test.currentButtonText || "Nicht gesetzt"}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ background: "rgba(59, 130, 246, 0.18)", color: "#93c5fd" }}>
                    🔄 Aktiv
                  </span>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <h3 className="mb-3 font-semibold" style={{ color: "var(--text-dark)" }}>Variante A</h3>
                    <div className="mb-4 rounded-lg px-3 py-2 font-medium" style={{ background: "rgba(59, 130, 246, 0.18)", color: "#bfdbfe" }}>
                      &quot;{test.variantA}&quot;
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span style={{ color: "var(--text-light)" }}>Impressions</span><span style={{ color: "var(--text-dark)" }}>{test.impressionsA}</span></div>
                      <div className="flex justify-between"><span style={{ color: "var(--text-light)" }}>Klicks</span><span style={{ color: "var(--text-dark)" }}>{test.clicksA}</span></div>
                      <div className="flex justify-between"><span style={{ color: "var(--text-light)" }}>CTR</span><span style={{ color: "var(--text-dark)" }}>{test.rateA}%</span></div>
                    </div>
                  </div>

                  <div className="rounded-lg border-2 p-4" style={{ background: "rgba(16, 185, 129, 0.08)", borderColor: test.winner === "B" ? "rgba(16, 185, 129, 0.45)" : "rgba(255,255,255,0.12)" }}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold" style={{ color: "var(--text-dark)" }}>Variante B</h3>
                      {test.winner === "B" && (
                        <span className="inline-flex items-center rounded px-2 py-1 text-xs font-bold" style={{ background: "rgba(16, 185, 129, 0.18)", color: "#86efac" }}>
                          🏆 Führt
                        </span>
                      )}
                    </div>
                    <div className="mb-4 rounded-lg px-3 py-2 font-medium" style={{ background: "rgba(16, 185, 129, 0.18)", color: "#bbf7d0" }}>
                      &quot;{test.variantB}&quot;
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span style={{ color: "var(--text-light)" }}>Impressions</span><span style={{ color: "var(--text-dark)" }}>{test.impressionsB}</span></div>
                      <div className="flex justify-between"><span style={{ color: "var(--text-light)" }}>Klicks</span><span style={{ color: "var(--text-dark)" }}>{test.clicksB}</span></div>
                      <div className="flex justify-between"><span style={{ color: "var(--text-light)" }}>CTR</span><span style={{ color: "var(--success-light)" }}>{test.rateB}%</span></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm" style={{ color: "var(--text-light)" }}>Signifikanz</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
                        <div className="h-2 rounded-full bg-green-600" style={{ width: `${test.confidence}%` }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>{test.confidence}%</span>
                    </div>
                  </div>
                  <ActionButton
                    label={loading ? "Übernehme..." : `Gewinner ${test.winner || "ermitteln"} live setzen`}
                    onClick={() => applyWinner(test)}
                    disabled={loading}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>✅ Abgeschlossene Tests</h2>
          <div className="space-y-3">
            {completedTests.length === 0 ? (
              <p style={{ color: "var(--text-light)" }}>Noch keine Gewinner übernommen.</p>
            ) : (
              completedTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between rounded-lg p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div>
                    <p className="font-medium" style={{ color: "var(--text-dark)" }}>{test.affiliateName}</p>
                    <p className="text-sm" style={{ color: "var(--text-light)" }}>
                      Gewinner: &quot;{test.winner === "A" ? test.variantA : test.variantB}&quot; • Live seit {test.appliedAt ? new Date(test.appliedAt).toLocaleString("de-DE") : "unbekannt"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ background: "rgba(16, 185, 129, 0.18)", color: "#86efac" }}>
                      ✅ {test.confidence}% Konfidenz
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
