"use client";

import React, { useState, useEffect } from "react";

export function SocialProof() {
  const [isVisible, setIsVisible] = useState(true);
  const [notifications, setNotifications] = useState([
    { id: 1, name: "Sarah M.", text: "hat gerade €47 verdient" },
    { id: 2, name: "Tom K.", text: "hat den AI-Guide gekauft" },
    { id: 3, name: "Julia L.", text: "hat gerade €125 verdient" },
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
    <div className="fixed bottom-4 right-4 z-40 max-w-sm animate-in fade-in slide-in-from-right-2 duration-500">
      {/* Main Badge */}
      <div className="bg-white rounded-xl shadow-lg border border-green-200 p-4 mb-3">
        <div className="flex items-start gap-3">
          <div className="text-2xl">✅</div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">
              1.247 Member verdienen Geld
            </p>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
              <span className="text-xs text-gray-600">4.9/5 (324 Reviews)</span>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
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
            className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border border-green-100 animate-pulse"
          >
            <p className="text-xs font-medium text-gray-900">
              <span className="text-green-600">✓</span> {notif.name}{" "}
              <span className="text-gray-600">{notif.text}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Trust Stats */}
      <div className="text-center mt-3 text-xs text-gray-500">
        <p>💰 Durchschn. €2.150/Monat • 🔐 100% Sicher</p>
      </div>
    </div>
  );
}
