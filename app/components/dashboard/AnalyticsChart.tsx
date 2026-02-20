"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  Legend,
} from "recharts";
import type { Analytics } from "@/types";

interface Props {
  analytics: Analytics;
}

export default function AnalyticsChart({ analytics }: Props) {
  const numericCols = Object.keys(analytics.numericSummary);
  if (numericCols.length === 0) {
    return (
      <div className="bg-white border border-[#f0ede8] rounded-2xl p-8 text-center text-[13px] text-[#9ca3af]">
        No numeric columns to chart.
      </div>
    );
  }

  const primaryCol = numericCols[0];

  // Build chart data from moving averages (which have processed index)
  const ma = analytics.movingAverages[primaryCol] ?? [];
  const forecast = analytics.forecast;

  // Use MA data as real data points, then append forecast
  const realData = ma.map((val, i) => ({
    index: i + 6, // MA starts at index 6 (window=7)
    real: val,
    forecast: null as number | null,
  }));

  const forecastData = forecast.map((f) => ({
    index: f.period,
    real: null as number | null,
    forecast: f.value,
    label: f.label,
  }));

  // Overlap last real point with first forecast for continuity
  if (realData.length > 0 && forecastData.length > 0) {
    const last = realData[realData.length - 1];
    forecastData[0] = { ...forecastData[0], real: last.real };
  }

  const chartData = [...realData, ...forecastData];

  // Anomaly reference dots
  const anomaliesForPrimary = analytics.anomalies
    .filter((a) => a.column === primaryCol)
    .slice(0, 8);

  // Find y-values for anomaly dots from MA data
  const anomalyDots = anomaliesForPrimary
    .map((a) => {
      const found = realData.find((d) => d.index === a.rowIndex);
      return found ? { x: found.index, y: found.real } : null;
    })
    .filter(Boolean) as { x: number; y: number }[];

  return (
    <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0a0a0a]">
            {primaryCol} — Trend & Forecast
          </h3>
          <p className="text-[12px] text-[#9ca3af]">
            7-period moving average · 5-period linear forecast
          </p>
        </div>
        <div className="flex items-center gap-4 text-[11.5px] text-[#6b7280]">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#6366f1] inline-block" />
            Real
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#e97316] inline-block border-dashed" />
            Forecast
          </span>
          {anomalyDots.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              Anomaly
            </span>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="index"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #f0ede8",
              borderRadius: "10px",
              fontSize: "12px",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [
              value != null ? Number(value).toFixed(2) : "—",
              name === "real" ? primaryCol : "Forecast",
            ]}
          />
          <Line
            type="monotone"
            dataKey="real"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            connectNulls={false}
            name="real"
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#e97316"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={{ fill: "#e97316", r: 3 }}
            connectNulls={false}
            name="forecast"
          />
          {anomalyDots.map((dot, i) => (
            <ReferenceDot
              key={i}
              x={dot.x}
              y={dot.y}
              r={5}
              fill="#ef4444"
              stroke="#fff"
              strokeWidth={1.5}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
