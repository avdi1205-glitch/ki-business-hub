"use client";

import React, { useState, useEffect } from "react";
import { useLocale } from "next-intl";

export function SocialProof() {
  const locale = useLocale();
  const isEn = locale === "en";
  const [isVisible, setIsVisible] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, name: "Sarah M.", text: isEn ? "just earned €47" : "hat gerade €47 verdient" },
    { id: 2, name: "Tom K.", text: isEn ? "just bought the AI guide" : "hat den AI-Guide gekauft" },
    { id: 3, name: "Julia L.", text: isEn ? "just earned €125" : "hat gerade €125 verdient" },
  ]);

  // Rotate notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) => {
        const newNotifs = [...prev];
        newNotifs.unshift(newNotifs.pop()!);
        return newNotifs;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 hidden max-w-sm animate-in fade-in slide-in-from-right-2 duration-500 2xl:block">
      {/* Main Badge */}
      <div className="rounded-xl shadow-lg p-4 mb-3" style={{ background: "var(--background-elevated)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
        <div className="flex items-start gap-3">
          <div className="text-2xl">✅</div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: "var(--text-dark)" }}>
              {isEn ? "1,247 members are earning money" : "1.247 Member verdienen Geld"}
            </p>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>4.9/5 (324 Reviews)</span>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Notification Carousel */}
      <div className="space-y-2">
        {notifications.slice(0, 2).map((notif) => (
          <div
            key={notif.id}
            className="rounded-lg p-3 animate-pulse"
            style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
            }}
          >
            <p className="text-xs font-medium" style={{ color: "var(--text-light)" }}>
              <span style={{ color: "var(--success)" }}>✓</span> {notif.name}{" "}
              <span style={{ color: "var(--text-muted)" }}>{notif.text}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Trust Stats */}
      <div className="text-center mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
        <p>{isEn ? "💰 Avg. €2,150/month • 🔐 100% secure" : "💰 Durchschn. €2.150/Monat • 🔐 100% Sicher"}</p>
      </div>
    </div>
  );
}
