"use client";

import { useState } from "react";
import type { Analytics } from "@/types";

interface Props {
  analytics: Analytics;
}

interface CardDef {
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
  infoTitle: string;
  infoBody: { heading: string; detail: string }[];
}

const cards = (a: Analytics): CardDef[] => [
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
    infoTitle: "How Total Records is counted",
    infoBody: [
      {
        heading: "Row count",
        detail:
          "Every row in your CSV (excluding the header) is counted as one record, regardless of whether it contains empty cells.",
      },
      {
        heading: "Date range (if shown)",
        detail:
          "The system scans all columns for date/time patterns. If one is found, the earliest and latest values are shown as the dataset's time span.",
      },
      {
        heading: "Why it matters",
        detail:
          "Larger datasets produce more statistically reliable anomaly detection and forecasting. Below ~100 rows, risk scores and growth figures should be interpreted with caution.",
      },
    ],
  },
  {
    label: "Growth",
    value:
      a.growthPercent != null
        ? `${a.growthPercent > 0 ? "+" : ""}${a.growthPercent}%`
        : "N/A",
    sub: "First vs last value",
    color:
      a.growthPercent != null && a.growthPercent >= 0 ? "#16a34a" : "#dc2626",
    bg:
      a.growthPercent != null && a.growthPercent >= 0 ? "#f0fdf4" : "#fef2f2",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    infoTitle: "How Growth % is calculated",
    infoBody: [
      {
        heading: "Formula",
        detail:
          "Growth % = ((last numeric value − first numeric value) / |first numeric value|) × 100. The primary numeric column (highest variance) is used.",
      },
      {
        heading: "Positive vs negative",
        detail:
          "Green (+) means the final value is higher than the starting value. Red (−) means it has declined. N/A means no numeric column was found.",
      },
      {
        heading: "Limitation",
        detail:
          "This is a simple point-to-point comparison and does not smooth out seasonal variation. Use the forecast chart for a trend view.",
      },
    ],
  },
  {
    label: "Risk Score",
    value: `${a.riskScore}/100`,
    sub:
      a.riskScore < 30
        ? "Low risk"
        : a.riskScore < 60
        ? "Moderate risk"
        : "High risk",
    color:
      a.riskScore < 30
        ? "#16a34a"
        : a.riskScore < 60
        ? "#d97706"
        : "#dc2626",
    bg:
      a.riskScore < 30
        ? "#f0fdf4"
        : a.riskScore < 60
        ? "#fffbeb"
        : "#fef2f2",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
        <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
      </svg>
    ),
    infoTitle: "How the Risk Score is calculated",
    infoBody: [
      {
        heading: "Composite formula (0–100)",
        detail:
          "Risk Score = (anomaly density × 40) + (average Z-score severity × 40) + (growth volatility × 20). Each component is normalised to a 0–100 scale before weighting.",
      },
      {
        heading: "Anomaly density (40%)",
        detail:
          "The proportion of flagged rows across all numeric columns. More anomalies relative to total records = higher contribution to risk.",
      },
      {
        heading: "Z-score severity (40%)",
        detail:
          "The average Z-score of all detected anomalies. A Z-score measures how many standard deviations a value sits from the column mean — extreme outliers push this up.",
      },
      {
        heading: "Growth volatility (20%)",
        detail:
          "Sharp negative growth or erratic swings between the first and last value add to the score. Stable or positive growth reduces this component.",
      },
      {
        heading: "Thresholds",
        detail:
          "0–29 → Low risk (green) · 30–59 → Moderate risk (amber) · 60–100 → High risk (red).",
      },
    ],
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
    infoTitle: "How Anomalies are detected",
    infoBody: [
      {
        heading: "Z-score method",
        detail:
          "For every numeric column, the mean (μ) and standard deviation (σ) are computed. Any value where |value − μ| / σ > threshold is flagged as an anomaly.",
      },
      {
        heading: "Default threshold: 2.5σ",
        detail:
          "A point must deviate more than 2.5 standard deviations from the column average to be counted. You can raise or lower this in the What-If Simulation panel.",
      },
      {
        heading: "Per-column, not global",
        detail:
          "Each column is analysed independently so that columns with naturally higher variance don't dominate the anomaly count.",
      },
      {
        heading: "Zero anomalies",
        detail:
          "Does not mean the data is perfect — it means no values exceed the Z-score threshold. Very uniform or aggregated datasets may show 0 even with quality issues.",
      },
    ],
  },
];

function InfoModal({
  card,
  onClose,
}: {
  card: CardDef;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4 border-b border-[#f0ede8]"
          style={{ background: card.bg }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "white", color: card.color }}
          >
            {card.icon}
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-[#0a0a0a]">{card.infoTitle}</p>
            <p className="text-[11.5px]" style={{ color: card.color }}>
              {card.label} · {card.value}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#9ca3af] hover:text-[#374151] hover:bg-white transition-colors"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {card.infoBody.map(({ heading, detail }) => (
            <div key={heading}>
              <p className="text-[12.5px] font-semibold text-[#0a0a0a] mb-1">{heading}</p>
              <p className="text-[13px] text-[#6b7280] leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#f0ede8] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-[12.5px] font-medium text-white"
            style={{ background: "linear-gradient(135deg,#0a0a0a,#374151)" }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

export default function KPICards({ analytics }: Props) {
  const [openCard, setOpenCard] = useState<CardDef | null>(null);
  const cardList = cards(analytics);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cardList.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-[#f0ede8] rounded-2xl p-5 relative"
          >
            {/* Info button */}
            <button
              onClick={() => setOpenCard(card)}
              title={`How is ${card.label} calculated?`}
              className="absolute top-3.5 right-3.5 w-5 h-5 rounded-full flex items-center justify-center text-[#c3bdb5] hover:text-[#6366f1] hover:bg-[#f0f3ff] transition-colors"
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

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

      {openCard && <InfoModal card={openCard} onClose={() => setOpenCard(null)} />}
    </>
  );
}

