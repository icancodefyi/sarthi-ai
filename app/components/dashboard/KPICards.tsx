"use client";

import type { Analytics } from "@/types";

interface Props {
  analytics: Analytics;
}

const cards = (a: Analytics) => [
  {
    label: "Total Records",
    value: a.totalRecords.toLocaleString(),
    sub: a.dateRange ? `${a.dateRange.min} → ${a.dateRange.max}` : "No date detected",
    color: "#6366f1",
    bg: "#f0f3ff",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v4c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
        <path d="M4 14v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4" />
      </svg>
    ),
  },
  {
    label: "Growth",
    value: a.growthPercent != null ? `${a.growthPercent > 0 ? "+" : ""}${a.growthPercent}%` : "N/A",
    sub: "First vs last value",
    color: a.growthPercent != null && a.growthPercent >= 0 ? "#16a34a" : "#dc2626",
    bg: a.growthPercent != null && a.growthPercent >= 0 ? "#f0fdf4" : "#fef2f2",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    label: "Risk Score",
    value: `${a.riskScore}/100`,
    sub: a.riskScore < 30 ? "Low risk" : a.riskScore < 60 ? "Moderate risk" : "High risk",
    color: a.riskScore < 30 ? "#16a34a" : a.riskScore < 60 ? "#d97706" : "#dc2626",
    bg: a.riskScore < 30 ? "#f0fdf4" : a.riskScore < 60 ? "#fffbeb" : "#fef2f2",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Anomalies",
    value: a.anomalies.length.toString(),
    sub: `Across ${[...new Set(a.anomalies.map((x) => x.column))].length} column(s)`,
    color: a.anomalies.length === 0 ? "#16a34a" : "#e97316",
    bg: a.anomalies.length === 0 ? "#f0fdf4" : "#fff7ed",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function KPICards({ analytics }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards(analytics).map((card) => (
        <div
          key={card.label}
          className="bg-white border border-[#f0ede8] rounded-2xl p-5"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
            style={{ background: card.bg, color: card.color }}
          >
            {card.icon}
          </div>
          <p className="text-[22px] font-bold tracking-tight" style={{ color: card.color }}>
            {card.value}
          </p>
          <p className="text-[12.5px] font-medium text-[#0a0a0a] mt-0.5">{card.label}</p>
          <p className="text-[11.5px] text-[#9ca3af] mt-0.5">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
