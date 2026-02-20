"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceDot, Legend,
} from "recharts";
import type { Analytics } from "@/types";

type ChartType = "Line" | "Bar" | "Pie";

const PIE_COLORS = ["#6366f1", "#e97316", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#f59e0b", "#14b8a6"];
const PIE_PAGE_SIZE = 6;

interface Props {
  analytics: Analytics;
}

export default function AnalyticsChart({ analytics }: Props) {
  const numericCols = Object.keys(analytics.numericSummary);

  const [selectedCol, setSelectedCol] = useState(numericCols[0] ?? "");
  const [chartType, setChartType] = useState<ChartType>("Line");
  const [filterMin, setFilterMin] = useState("");
  const [filterMax, setFilterMax] = useState("");
  const [piePage, setPiePage] = useState(0);

  const colStats = analytics.numericSummary[selectedCol];

  const rawData = useMemo(() => {
    const ma = analytics.movingAverages[selectedCol] ?? [];
    const forecast = analytics.forecast;
    const realPoints = ma.map((val, i) => ({
      index: i + 6,
      real: val,
      forecast: null as number | null,
    }));
    const forecastPoints = forecast.map((f) => ({
      index: f.period,
      real: null as number | null,
      forecast: f.value,
    }));
    if (realPoints.length > 0 && forecastPoints.length > 0) {
      forecastPoints[0] = { ...forecastPoints[0], real: realPoints[realPoints.length - 1].real };
    }
    return [...realPoints, ...forecastPoints];
  }, [selectedCol, analytics]);

  const chartData = useMemo(() => {
    const min = filterMin !== "" ? parseFloat(filterMin) : -Infinity;
    const max = filterMax !== "" ? parseFloat(filterMax) : Infinity;
    return rawData.map((d) => ({
      ...d,
      real: d.real != null && d.real >= min && d.real <= max ? d.real : null,
      forecast: d.forecast != null && d.forecast >= min && d.forecast <= max ? d.forecast : null,
    }));
  }, [rawData, filterMin, filterMax]);

  const anomalyDots = useMemo(() => {
    return analytics.anomalies
      .filter((a) => a.column === selectedCol)
      .slice(0, 8)
      .map((a) => {
        const found = rawData.find((d) => d.index === a.rowIndex);
        return found?.real != null ? { x: found.index, y: found.real } : null;
      })
      .filter(Boolean) as { x: number; y: number }[];
  }, [selectedCol, rawData, analytics.anomalies]);

  const pieData = useMemo(() =>
    numericCols
      .map((col) => ({ name: col, value: Math.abs(analytics.numericSummary[col]?.mean ?? 0) }))
      .filter((d) => d.value > 0),
    [numericCols, analytics.numericSummary]
  );
  const pieTotalPages = Math.max(1, Math.ceil(pieData.length / PIE_PAGE_SIZE));
  const piePageSafe = Math.min(piePage, pieTotalPages - 1);
  const piePageData = pieData.slice(piePageSafe * PIE_PAGE_SIZE, (piePageSafe + 1) * PIE_PAGE_SIZE);

  if (numericCols.length === 0) {
    return (
      <div className="bg-white border border-[#f0ede8] rounded-2xl p-8 text-center text-[13px] text-[#9ca3af]">
        No numeric columns to chart.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 mb-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <label className="text-[11.5px] text-[#9ca3af] uppercase tracking-wide">Column</label>
          <select
            value={selectedCol}
            onChange={(e) => setSelectedCol(e.target.value)}
            className="text-[13px] font-medium text-[#0a0a0a] border border-[#e5e7eb] rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-[#6366f1]"
          >
            {numericCols.map((col) => <option key={col} value={col}>{col}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1 bg-[#f5f5f4] rounded-lg p-1">
          {(["Line", "Bar", "Pie"] as ChartType[]).map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={`px-3 py-1 rounded-md text-[12.5px] font-medium transition-all ${
                chartType === t ? "bg-white text-[#0a0a0a] shadow-sm" : "text-[#9ca3af] hover:text-[#6b7280]"
              }`}
            >
              {t === "Line" ? "📈 Line" : t === "Bar" ? "📊 Bar" : "🥧 Pie"}
            </button>
          ))}
        </div>

        {chartType !== "Pie" && (
          <div className="flex items-center gap-2 ml-auto">
            <label className="text-[11.5px] text-[#9ca3af] uppercase tracking-wide">Filter</label>
            <input
              type="number"
              placeholder={`Min${colStats ? ` (${colStats.min})` : ""}`}
              value={filterMin}
              onChange={(e) => setFilterMin(e.target.value)}
              className="w-28 text-[12px] border border-[#e5e7eb] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#6366f1]"
            />
            <span className="text-[#d1d5db]">–</span>
            <input
              type="number"
              placeholder={`Max${colStats ? ` (${colStats.max})` : ""}`}
              value={filterMax}
              onChange={(e) => setFilterMax(e.target.value)}
              className="w-28 text-[12px] border border-[#e5e7eb] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#6366f1]"
            />
            {(filterMin || filterMax) && (
              <button onClick={() => { setFilterMin(""); setFilterMax(""); }} className="text-[11.5px] text-[#9ca3af] hover:text-red-500 transition-colors">
                ✕ Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0a0a0a]">
            {chartType === "Pie" ? "Mean Value Distribution Across Columns" : `${selectedCol} — Trend & Forecast`}
          </h3>
          <p className="text-[12px] text-[#9ca3af]">
            {chartType === "Pie" ? `${pieData.length} numeric columns compared` : "7-period moving average · linear forecast"}
          </p>
        </div>
        {chartType !== "Pie" && (
          <div className="flex items-center gap-4 text-[11.5px] text-[#6b7280]">
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#6366f1] inline-block" /> Real</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#e97316] inline-block" /> Forecast</span>
            {anomalyDots.length > 0 && (
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Anomaly</span>
            )}
          </div>
        )}
      </div>

      {/* Line Chart */}
      {chartType === "Line" && (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="index" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #f0ede8", borderRadius: "10px", fontSize: "12px" }}
              formatter={(value: unknown, name: unknown) => [value != null ? Number(value).toFixed(2) : "—", name === "real" ? selectedCol : "Forecast"]}
            />
            <Line type="monotone" dataKey="real" stroke="#6366f1" strokeWidth={2} dot={false} connectNulls={false} name="real" />
            <Line type="monotone" dataKey="forecast" stroke="#e97316" strokeWidth={2} strokeDasharray="5 4" dot={{ fill: "#e97316", r: 3 }} connectNulls={false} name="forecast" />
            {anomalyDots.map((dot, i) => (
              <ReferenceDot key={i} x={dot.x} y={dot.y} r={5} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Bar Chart */}
      {chartType === "Bar" && (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData.filter((d) => d.real != null || d.forecast != null)} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="index" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: "#fff", border: "1px solid #f0ede8", borderRadius: "10px", fontSize: "12px" }}
              formatter={(value: unknown, name: unknown) => [value != null ? Number(value).toFixed(2) : "—", name === "real" ? selectedCol : "Forecast"]}
            />
            <Legend iconSize={10} wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="real" name={selectedCol} fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={20} />
            <Bar dataKey="forecast" name="Forecast" fill="#e97316" radius={[3, 3, 0, 0]} maxBarSize={20} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Pie Chart */}
      {chartType === "Pie" && (
        <div>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="55%" height={260}>
              <PieChart>
                <Pie data={piePageData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value">
                  {piePageData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[(piePageSafe * PIE_PAGE_SIZE + i) % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #f0ede8", borderRadius: "10px", fontSize: "12px" }}
                  formatter={(value: unknown) => [Number(value).toFixed(2), "Mean"]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2.5 flex-1">
              {piePageData.map((entry, i) => {
                const colorIdx = (piePageSafe * PIE_PAGE_SIZE + i) % PIE_COLORS.length;
                return (
                  <div key={entry.name} className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: PIE_COLORS[colorIdx] }} />
                    <span className="text-[12.5px] text-[#374151] truncate">{entry.name}</span>
                    <span className="text-[12px] font-mono text-[#9ca3af] ml-auto pl-4 shrink-0">{entry.value.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Pie pagination */}
          {pieTotalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f0ede8]">
              <p className="text-[12px] text-[#9ca3af]">
                Showing {piePageSafe * PIE_PAGE_SIZE + 1}–{Math.min((piePageSafe + 1) * PIE_PAGE_SIZE, pieData.length)} of {pieData.length} columns
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPiePage((p) => Math.max(0, p - 1))}
                  disabled={piePageSafe === 0}
                  className="px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[12px] text-[#374151] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: pieTotalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPiePage(i)}
                    className={`w-7 h-7 rounded-lg text-[12px] font-medium transition-colors ${
                      i === piePageSafe
                        ? "bg-[#6366f1] text-white"
                        : "border border-[#e5e7eb] text-[#9ca3af] hover:bg-[#f9fafb]"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPiePage((p) => Math.min(pieTotalPages - 1, p + 1))}
                  disabled={piePageSafe === pieTotalPages - 1}
                  className="px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[12px] text-[#374151] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

  