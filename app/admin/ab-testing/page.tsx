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
  const [variantA, setVariantA] = useState("Start free");
  const [variantB, setVariantB] = useState("Get started now");

  const activeTests = useMemo(() => tests.filter((test) => test.status === "active"), [tests]);
  const completedTests = useMemo(() => tests.filter((test) => test.status === "complete"), [tests]);
  const averageRate = activeTests.length
    ? (activeTests.reduce((sum, test) => sum + Math.max(test.rateA, test.rateB), 0) / activeTests.length).toFixed(2)
    : "0.00";

  const loadData = useCallback(async () => {
    const response = await fetch("/api/ab-testing");
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Could not load A/B test data");
    }

    setTests(data.tests || []);
    setAffiliates(data.affiliates || []);

    if (!selectedAffiliate && data.affiliates?.[0]?.id) {
      setSelectedAffiliate(String(data.affiliates[0].id));
      setVariantA(data.affiliates[0].buttonText || "Start free");
      setVariantB("Get started now");
    }
  }, [selectedAffiliate]);

  useEffect(() => {
    const init = async () => {
      try {
        await loadData();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not load A/B test data");
      } finally {
        setInitialLoading(false);
      }
    };

    init();
  }, [loadData]);

  const selectedAffiliateData = affiliates.find((affiliate) => String(affiliate.id) === selectedAffiliate);

  useEffect(() => {
    if (selectedAffiliateData?.buttonText) {
      queueMicrotask(() => {
        setVariantA(selectedAffiliateData.buttonText as string);
      });
    }
  }, [selectedAffiliateData?.buttonText]);

  const createTest = async () => {
    if (!selectedAffiliate) {
      setStatus("Please select an affiliate link first.");
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
        throw new Error(data.error || "Could not create A/B test");
      }

      setStatus(data.message);
      await loadData();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not create A/B test");
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
        throw new Error(data.error || "Could not apply winner");
      }

      setStatus(data.message);
      await loadData();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not apply winner");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--background)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-dark)" }}>🧪 A/B testing</h1>
          <p style={{ color: "var(--text-light)" }}>Test real CTA copy on your affiliate buttons and roll winners out live.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Active tests" value={activeTests.length} change="live on affiliate buttons" icon="⚙️" />
          <StatCard title="Top CTR" value={`${averageRate}%`} change="best copy per active test" icon="📈" trend="up" />
          <StatCard title="Applied winners" value={completedTests.length} change="already live" icon="🏆" />
          <StatCard title="Affiliate links" value={affiliates.length} change="available test targets" icon="💰" trend="up" />
        </div>

        <div className="mb-8 rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>➕ Create new CTA test</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-light)" }}>Affiliate link</label>
              <select
                value={selectedAffiliate}
                onChange={(event) => setSelectedAffiliate(event.target.value)}
                className="w-full rounded-lg px-4 py-2"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-dark)" }}
              >
                <option value="">-- Choose link --</option>
                {affiliates.map((affiliate) => (
                  <option key={affiliate.id} value={affiliate.id}>
                    {affiliate.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-light)" }}>Variant A</label>
              <input
                value={variantA}
                onChange={(event) => setVariantA(event.target.value)}
                className="w-full rounded-lg px-4 py-2"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-dark)" }}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-light)" }}>Variant B</label>
              <input
                value={variantB}
                onChange={(event) => setVariantB(event.target.value)}
                className="w-full rounded-lg px-4 py-2"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-dark)" }}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <ActionButton label={loading ? "Creating..." : "Start A/B test"} onClick={createTest} disabled={loading} />
            {status && <p className="text-sm" style={{ color: "var(--text-light)" }}>{status}</p>}
          </div>
        </div>

        <div className="space-y-6 mb-8">
          {initialLoading ? (
            <div className="rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-light)" }}>
              Loading tests...
            </div>
          ) : activeTests.length === 0 ? (
            <div className="rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)", color: "var(--text-light)" }}>
              No active tests yet. Create the first CTA test for an affiliate link.
            </div>
          ) : (
            activeTests.map((test) => (
              <div key={test.id} className="rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="mb-2 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>{test.affiliateName}</h2>
                    <p className="text-sm" style={{ color: "var(--text-light)" }}>Current live copy: {test.currentButtonText || "Not set"}</p>
                  </div>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ background: "rgba(59, 130, 246, 0.18)", color: "#93c5fd" }}>
                    🔄 Active
                  </span>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <h3 className="mb-3 font-semibold" style={{ color: "var(--text-dark)" }}>Variant A</h3>
                    <div className="mb-4 rounded-lg px-3 py-2 font-medium" style={{ background: "rgba(59, 130, 246, 0.18)", color: "#bfdbfe" }}>
                      &ldquo;{test.variantA}&rdquo;
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span style={{ color: "var(--text-light)" }}>Impressions</span><span style={{ color: "var(--text-dark)" }}>{test.impressionsA}</span></div>
                      <div className="flex justify-between"><span style={{ color: "var(--text-light)" }}>Clicks</span><span style={{ color: "var(--text-dark)" }}>{test.clicksA}</span></div>
                      <div className="flex justify-between"><span style={{ color: "var(--text-light)" }}>CTR</span><span style={{ color: "var(--text-dark)" }}>{test.rateA}%</span></div>
                    </div>
                  </div>

                  <div className="rounded-lg border-2 p-4" style={{ background: "rgba(16, 185, 129, 0.08)", borderColor: test.winner === "B" ? "rgba(16, 185, 129, 0.45)" : "rgba(255,255,255,0.12)" }}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-semibold" style={{ color: "var(--text-dark)" }}>Variant B</h3>
                      {test.winner === "B" && (
                        <span className="inline-flex items-center rounded px-2 py-1 text-xs font-bold" style={{ background: "rgba(16, 185, 129, 0.18)", color: "#86efac" }}>
                          🏆 Winning
                        </span>
                      )}
                    </div>
                    <div className="mb-4 rounded-lg px-3 py-2 font-medium" style={{ background: "rgba(16, 185, 129, 0.18)", color: "#bbf7d0" }}>
                      &ldquo;{test.variantB}&rdquo;
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span style={{ color: "var(--text-light)" }}>Impressions</span><span style={{ color: "var(--text-dark)" }}>{test.impressionsB}</span></div>
                      <div className="flex justify-between"><span style={{ color: "var(--text-light)" }}>Clicks</span><span style={{ color: "var(--text-dark)" }}>{test.clicksB}</span></div>
                      <div className="flex justify-between"><span style={{ color: "var(--text-light)" }}>CTR</span><span style={{ color: "var(--success-light)" }}>{test.rateB}%</span></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-sm" style={{ color: "var(--text-light)" }}>Significance</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-32 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
                        <div className="h-2 rounded-full bg-green-600" style={{ width: `${test.confidence}%` }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>{test.confidence}%</span>
                    </div>
                  </div>
                  <ActionButton
                    label={loading ? "Applying..." : `Apply ${test.winner || "winner"} live`}
                    onClick={() => applyWinner(test)}
                    disabled={loading}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="rounded-lg p-6" style={{ background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--text-dark)" }}>✅ Completed tests</h2>
          <div className="space-y-3">
            {completedTests.length === 0 ? (
              <p style={{ color: "var(--text-light)" }}>No winners applied yet.</p>
            ) : (
              completedTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between rounded-lg p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div>
                    <p className="font-medium" style={{ color: "var(--text-dark)" }}>{test.affiliateName}</p>
                    <p className="text-sm" style={{ color: "var(--text-light)" }}>
                      Winner: &ldquo;{test.winner === "A" ? test.variantA : test.variantB}&rdquo; • Live since {test.appliedAt ? new Date(test.appliedAt).toLocaleString() : "unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium" style={{ background: "rgba(16, 185, 129, 0.18)", color: "#86efac" }}>
                      ✅ {test.confidence}% confidence
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
