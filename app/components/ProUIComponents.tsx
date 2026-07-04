import React from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
}

export function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <div
      className="rounded-lg p-6 transition-shadow hover:shadow-md"
      style={{
        background: "var(--background-elevated)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-2 text-sm font-medium" style={{ color: "var(--text-light)" }}>{title}</p>
          <p className="text-2xl font-bold" style={{ color: "var(--text-dark)" }}>{value}</p>
          {change && (
            <p
              className="mt-2 text-sm"
              style={{ color: trend === "up" ? "var(--success-light)" : "var(--danger-light)" }}
            >
              {trend === "up" ? "↑" : "↓"} {change}
            </p>
          )}
        </div>
        <div style={{ color: "var(--text-muted)" }}>{icon}</div>
      </div>
    </div>
  );
}

interface ChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
}

export function SimpleChart({ title, data }: ChartProps) {
  const max = Math.max(...data.map(d => d.value));
  
  return (
    <div
      className="rounded-lg p-6"
      style={{
        background: "var(--background-elevated)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <h3 className="mb-4 font-semibold" style={{ color: "var(--text-dark)" }}>{title}</h3>
      <div className="space-y-4">
        {data.map((item, idx) => (
          <div key={idx}>
            <div className="flex justify-between mb-1">
              <span className="text-sm" style={{ color: "var(--text-light)" }}>{item.label}</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-dark)" }}>{item.value}</span>
            </div>
            <div className="h-2 w-full rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

export function ActionButton({ label, onClick, variant = "primary", disabled }: ActionButtonProps) {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400",
    secondary: "text-white disabled:opacity-50",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]}`}
      style={
        variant === "secondary"
          ? { background: "var(--background-elevated)", border: "1px solid rgba(255,255,255,0.14)" }
          : undefined
      }
    >
      {label}
    </button>
  );
}
