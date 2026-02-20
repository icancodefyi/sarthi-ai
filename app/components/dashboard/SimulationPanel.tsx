"use client";

import { useState } from "react";
import type { ForecastPoint, Anomaly } from "@/types";

interface SimResult {
  forecastPeriods: number;
  zThreshold: number;
  growthAdjustment: number;
  forecast: ForecastPoint[];
  filteredAnomalies: Anomaly[];
  filteredAnomalyCount: number;
  filteredRiskScore: number;
}

interface Props {
  datasetId: string;
  defaultForecast: ForecastPoint[];
  defaultAnomalyCount: number;
  defaultRiskScore: number;
}

export default function SimulationPanel({
  datasetId,
  defaultForecast,
  defaultAnomalyCount,
  defaultRiskScore,
}: Props) {
  const [forecastPeriods, setForecastPeriods] = useState(5);
  const [zThreshold, setZThreshold] = useState(2.5);
  const [growthAdjustment, setGrowthAdjustment] = useState(0);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSimulation() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch(`/api/datasets/${datasetId}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forecastPeriods, zThreshold, growthAdjustment }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResult(json.simulation);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setRunning(false);
    }
  }

  function reset() {
    setResult(null);
    setForecastPeriods(5);
    setZThreshold(2.5);
    setGrowthAdjustment(0);
  }

  const displayForecast = result?.forecast ?? defaultForecast;
  const displayAnomalyCount = result?.filteredAnomalyCount ?? defaultAnomalyCount;
  const displayRiskScore = result?.filteredRiskScore ?? defaultRiskScore;

  return (
    <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0a0a0a]">Simulation Panel</h3>
          <p className="text-[12px] text-[#9ca3af]">Adjust parameters and recompute analytics</p>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <button
              onClick={reset}
              className="text-[12px] text-[#9ca3af] hover:text-[#0a0a0a] transition-colors"
            >
              Reset
            </button>
          )}
          <button
            onClick={runSimulation}
            disabled={running}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white disabled:opacity-50 transition-opacity"
            style={{ background: "linear-gradient(135deg,#0a0a0a,#374151)" }}
          >
            {running ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Running…
              </>
            ) : (
              "Run Simulation"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Forecast periods */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12.5px] font-medium text-[#0a0a0a]">Forecast Periods</label>
            <span className="text-[12.5px] font-bold text-[#6366f1]">{forecastPeriods}</span>
          </div>
          <input
            type="range"
            min={1}
            max={30}
            value={forecastPeriods}
            onChange={(e) => setForecastPeriods(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-[10.5px] text-[#9ca3af] mt-1">
            <span>1</span><span>30</span>
          </div>
        </div>

        {/* Z-score threshold */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12.5px] font-medium text-[#0a0a0a]">Anomaly Z-Score Threshold</label>
            <span className="text-[12.5px] font-bold text-[#e97316]">{zThreshold.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min={1.5}
            max={5.0}
            step={0.1}
            value={zThreshold}
            onChange={(e) => setZThreshold(Number(e.target.value))}
            className="w-full accent-orange-500"
          />
          <div className="flex justify-between text-[10.5px] text-[#9ca3af] mt-1">
            <span>1.5 (sensitive)</span><span>5.0 (strict)</span>
          </div>
        </div>

        {/* Growth adjustment */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[12.5px] font-medium text-[#0a0a0a]">Forecast Growth Adjustment</label>
            <span className={`text-[12.5px] font-bold ${growthAdjustment >= 0 ? "text-green-600" : "text-red-500"}`}>
              {growthAdjustment > 0 ? "+" : ""}{growthAdjustment}%
            </span>
          </div>
          <input
            type="range"
            min={-50}
            max={50}
            step={1}
            value={growthAdjustment}
            onChange={(e) => setGrowthAdjustment(Number(e.target.value))}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-[10.5px] text-[#9ca3af] mt-1">
            <span>-50%</span><span>+50%</span>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className={`rounded-xl p-4 border ${result ? "border-[#e0e7ff] bg-[#f0f3ff]" : "border-[#f0ede8] bg-[#fafaf9]"}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1">Anomaly Count</p>
          <p className={`text-[22px] font-bold ${result ? "text-[#6366f1]" : "text-[#d1d5db]"}`}>
            {displayAnomalyCount}
          </p>
          {result && <p className="text-[10.5px] text-[#9ca3af] mt-0.5">at Z &gt; {zThreshold.toFixed(1)}</p>}
        </div>
        <div className={`rounded-xl p-4 border ${result ? "border-[#fde68a] bg-[#fffbeb]" : "border-[#f0ede8] bg-[#fafaf9]"}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1">Risk Score</p>
          <p className={`text-[22px] font-bold ${result ? "text-[#d97706]" : "text-[#d1d5db]"}`}>
            {displayRiskScore}
          </p>
          {result && <p className="text-[10.5px] text-[#9ca3af] mt-0.5">recalculated</p>}
        </div>
        <div className={`rounded-xl p-4 border ${result ? "border-[#bbf7d0] bg-[#f0fdf4]" : "border-[#f0ede8] bg-[#fafaf9]"}`}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af] mb-1">Forecast Horizon</p>
          <p className={`text-[22px] font-bold ${result ? "text-[#16a34a]" : "text-[#d1d5db]"}`}>
            +{forecastPeriods}
          </p>
          {result && <p className="text-[10.5px] text-[#9ca3af] mt-0.5">periods ahead</p>}
        </div>
      </div>

      {/* Forecast values table */}
      {result && displayForecast.length > 0 && (
        <div className="rounded-xl bg-[#fafaf9] border border-[#f0ede8] p-4">
          <p className="text-[12px] font-semibold text-[#0a0a0a] mb-3">Simulated Forecast Values</p>
          <div className="flex gap-3 flex-wrap">
            {displayForecast.map((f, i) => (
              <div key={i} className="bg-white border border-[#f0ede8] rounded-lg px-3 py-2 text-center min-w-[80px]">
                <p className="text-[10px] text-[#9ca3af]">{f.label}</p>
                <p className="text-[13px] font-bold text-[#0a0a0a] font-mono">{f.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!result && (
        <p className="text-[12.5px] text-[#9ca3af] text-center py-2">
          Adjust sliders above and click <strong>Run Simulation</strong> to see recalculated results.
        </p>
      )}
    </div>
  );
}
