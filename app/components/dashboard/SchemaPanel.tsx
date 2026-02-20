"use client";

import { useState } from "react";
import type { Analytics } from "@/types";

const AG_KEYWORDS = [
  "crop", "yield", "harvest", "soil", "fertilizer", "rainfall",
  "irrigation", "farm", "kharif", "rabi", "wheat", "rice", "cotton",
  "sugarcane", "pulses", "agri", "sowing", "pesticide", "manure",
];

type ColType = "Numeric" | "Date" | "Categorical" | "Text";

const COLLAPSE_AT = 8;

const TYPE_META: Record<ColType, { label: string; icon: string; tagBg: string; tagText: string; sectionBorder: string }> = {
  Numeric:     { label: "Numeric",     icon: "🔢", tagBg: "bg-indigo-50",  tagText: "text-indigo-600",  sectionBorder: "border-indigo-100" },
  Date:        { label: "Date / Time", icon: "📅", tagBg: "bg-blue-50",    tagText: "text-blue-600",    sectionBorder: "border-blue-100"   },
  Categorical: { label: "Categorical", icon: "≡",  tagBg: "bg-amber-50",   tagText: "text-amber-700",   sectionBorder: "border-amber-100"  },
  Text:        { label: "Text",        icon: "T",  tagBg: "bg-gray-100",   tagText: "text-gray-500",    sectionBorder: "border-gray-200"   },
};

export function isAgriculturalDataset(columns: string[]): boolean {
  return columns.some((col) =>
    AG_KEYWORDS.some((kw) => col.toLowerCase().includes(kw))
  );
}

/* ─── Inline range bar for numeric ─────────────────────────────────────── */
function RangeBar({ min, max, mean }: { min: number; max: number; mean: number }) {
  const span = max - min;
  const p = span === 0 ? 50 : Math.round(((mean - min) / span) * 100);
  return (
    <div className="relative h-1.5 w-full rounded-full bg-[#e5e7eb] mt-1.5">
      <div className="absolute inset-y-0 left-0 rounded-full bg-indigo-200" style={{ width: `${p}%` }} />
      <div
        className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white shadow"
        style={{ left: `calc(${p}% - 5px)` }}
      />
    </div>
  );
}

/* ─── Numeric column card ───────────────────────────────────────────────── */
function NumericCard({
  name,
  stats,
  anomalyCount,
}: {
  name: string;
  stats: Analytics["numericSummary"][string];
  anomalyCount: number;
}) {
  const fmt = (v: number) =>
    Math.abs(v) >= 1_000
      ? v.toLocaleString("en-IN", { maximumFractionDigits: 1 })
      : v.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  return (
    <div className="bg-white border border-[#f0ede8] rounded-xl p-3 flex flex-col gap-1 min-w-0">
      <div className="flex items-start justify-between gap-1">
        <p className="text-[12.5px] font-semibold text-[#0a0a0a] truncate leading-tight" title={name}>
          {name}
        </p>
        {anomalyCount > 0 && (
          <span className="shrink-0 text-[10px] font-semibold bg-red-50 text-red-500 border border-red-100 rounded-md px-1.5 py-0.5">
            {anomalyCount} ⚠
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-[10.5px] text-[#9ca3af]">
        <span title="mean">μ <span className="font-mono text-[#374151]">{fmt(stats.mean)}</span></span>
        <span className="opacity-40">·</span>
        <span title="std dev">σ <span className="font-mono text-[#374151]">{fmt(stats.stdDev)}</span></span>
      </div>
      <RangeBar min={stats.min} max={stats.max} mean={stats.mean} />
      <div className="flex justify-between text-[9.5px] text-[#c3bdb5] font-mono mt-0.5">
        <span>{fmt(stats.min)}</span>
        <span>{fmt(stats.max)}</span>
      </div>
    </div>
  );
}

/* ─── Categorical / Text chip ───────────────────────────────────────────── */
function Chip({ name, type }: { name: string; type: ColType }) {
  const m = TYPE_META[type];
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${m.tagBg} border-transparent`}>
      <span className={`text-[11px] font-bold ${m.tagText}`}>{m.icon}</span>
      <span className="text-[12.5px] font-medium text-[#0a0a0a]">{name}</span>
    </div>
  );
}

/* ─── Collapsible section ───────────────────────────────────────────────── */
function Section({
  type,
  children,
  count,
}: {
  type: ColType;
  children: React.ReactNode;
  count: number;
}) {
  const m = TYPE_META[type];
  return (
    <div className={`rounded-xl border ${m.sectionBorder} bg-white overflow-hidden`}>
      <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${m.sectionBorder} bg-[#fafaf9]`}>
        <span className="text-[13px]">{m.icon}</span>
        <span className="text-[12px] font-semibold text-[#374151]">{m.label}</span>
        <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${m.tagBg} ${m.tagText}`}>
          {count}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function SchemaPanel({ analytics }: { analytics: Analytics }) {
  const [showAllNumeric, setShowAllNumeric] = useState(false);
  const [showAllCat, setShowAllCat] = useState(false);

  const numericCols = new Set(Object.keys(analytics.numericSummary));
  const dateCol = analytics.dateRange
    ? analytics.columns.find((c) => /date|time|year|month|day|period/i.test(c))
    : null;

  // Anomaly count per column
  const anomalyMap: Record<string, number> = {};
  for (const a of analytics.anomalies) {
    anomalyMap[a.column] = (anomalyMap[a.column] ?? 0) + 1;
  }

  const grouped: Record<ColType, string[]> = { Numeric: [], Date: [], Categorical: [], Text: [] };
  for (const col of analytics.columns) {
    if (numericCols.has(col)) grouped.Numeric.push(col);
    else if (col === dateCol) grouped.Date.push(col);
    else if (/name|description|notes|remarks|text|comment/i.test(col)) grouped.Text.push(col);
    else grouped.Categorical.push(col);
  }

  const numericVisible = showAllNumeric ? grouped.Numeric : grouped.Numeric.slice(0, COLLAPSE_AT);
  const catAll = [...grouped.Categorical, ...grouped.Text];
  const catVisible = showAllCat ? catAll : catAll.slice(0, COLLAPSE_AT);

  const counts = {
    Numeric: grouped.Numeric.length,
    Date: grouped.Date.length,
    Categorical: grouped.Categorical.length,
    Text: grouped.Text.length,
  };

  return (
    <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0a0a0a]">Schema Detection</h3>
          <p className="text-[12px] text-[#9ca3af] mt-0.5">
            {analytics.columns.length} columns auto-detected across your dataset
          </p>
        </div>
        {analytics.dateRange && (
          <div className="text-right shrink-0">
            <p className="text-[10px] text-[#9ca3af] uppercase tracking-wide mb-0.5">Date Range</p>
            <p className="text-[12.5px] font-medium text-[#0a0a0a]">
              {analytics.dateRange.min} → {analytics.dateRange.max}
            </p>
          </div>
        )}
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {(["Numeric", "Date", "Categorical", "Text"] as ColType[]).map((t) =>
          counts[t] > 0 ? (
            <span
              key={t}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11.5px] font-medium border ${TYPE_META[t].tagBg} ${TYPE_META[t].tagText} border-transparent`}
            >
              {TYPE_META[t].icon} {counts[t]} {TYPE_META[t].label}
            </span>
          ) : null
        )}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-4">

        {/* Numeric */}
        {grouped.Numeric.length > 0 && (
          <Section type="Numeric" count={counts.Numeric}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {numericVisible.map((col) => (
                <NumericCard
                  key={col}
                  name={col}
                  stats={analytics.numericSummary[col]}
                  anomalyCount={anomalyMap[col] ?? 0}
                />
              ))}
            </div>
            {grouped.Numeric.length > COLLAPSE_AT && (
              <button
                onClick={() => setShowAllNumeric((p) => !p)}
                className="mt-3 text-[12px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
              >
                {showAllNumeric
                  ? "← Show fewer"
                  : `+ Show ${grouped.Numeric.length - COLLAPSE_AT} more columns`}
              </button>
            )}
          </Section>
        )}

        {/* Date */}
        {grouped.Date.length > 0 && (
          <Section type="Date" count={counts.Date}>
            <div className="flex flex-wrap gap-2">
              {grouped.Date.map((col) => (
                <div
                  key={col}
                  className="inline-flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5"
                >
                  <div>
                    <p className="text-[12.5px] font-semibold text-[#0a0a0a]">{col}</p>
                    {analytics.dateRange && (
                      <p className="text-[11px] text-blue-500 font-mono mt-0.5">
                        {analytics.dateRange.min} → {analytics.dateRange.max}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Categorical + Text */}
        {catAll.length > 0 && (
          <Section type="Categorical" count={catAll.length}>
            <div className="flex flex-wrap gap-2">
              {catVisible.map((col) => (
                <Chip
                  key={col}
                  name={col}
                  type={grouped.Text.includes(col) ? "Text" : "Categorical"}
                />
              ))}
            </div>
            {catAll.length > COLLAPSE_AT && (
              <button
                onClick={() => setShowAllCat((p) => !p)}
                className="mt-3 text-[12px] text-amber-500 hover:text-amber-700 font-medium transition-colors"
              >
                {showAllCat
                  ? "← Show fewer"
                  : `+ Show ${catAll.length - COLLAPSE_AT} more columns`}
              </button>
            )}
          </Section>
        )}

      </div>
    </div>
  );
}

