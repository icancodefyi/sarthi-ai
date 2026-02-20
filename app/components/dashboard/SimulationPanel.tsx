"use client";

import { useState } from "react";
import { useTTS } from "@/app/hooks/useTTS";
import type { ForecastPoint, Anomaly } from "@/types";

interface SimResult {
  forecastPeriods: number;
  zThreshold: number;
  growthAdjustment: number;
  forecast: ForecastPoint[];
  filteredAnomalies: Anomaly[];
  filteredAnomalyCount: number;
  filteredRiskScore: number;
  explanation?: string;
  originalAnomalyCount?: number;
  originalRiskScore?: number;
}

function DeltaBadge({ delta, lowerIsBetter = true }: { delta: number; lowerIsBetter?: boolean }) {
  if (delta === 0)
    return <span className="text-[11px] font-medium text-[#9ca3af] ml-1.5">no change</span>;
  const improved = lowerIsBetter ? delta < 0 : delta > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ml-1.5 ${
        improved ? "text-green-600" : "text-red-500"
      }`}
    >
      {improved ? "▼" : "▲"} {Math.abs(delta)}
      <span className="font-medium opacity-70">{improved ? " better" : " worse"}</span>
    </span>
  );
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

  const { speak, stop, speaking } = useTTS();

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
    stop();
    setForecastPeriods(5);
    setZThreshold(2.5);
    setGrowthAdjustment(0);
  }

  const displayForecast = result?.forecast ?? defaultForecast;
  const origAnomalies = result?.originalAnomalyCount ?? defaultAnomalyCount;
  const origRisk = result?.originalRiskScore ?? defaultRiskScore;
  const newAnomalies = result?.filteredAnomalyCount ?? defaultAnomalyCount;
  const newRisk = result?.filteredRiskScore ?? defaultRiskScore;
  const anomalyDelta = newAnomalies - origAnomalies;
  const riskDelta = newRisk - origRisk;

  return (
    <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0a0a0a]">What-If Simulation</h3>
          <p className="text-[12px] text-[#9ca3af]">Change the sliders, run, and see exactly what shifts — with an AI explanation of why.</p>
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

      {/* Parameter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 mt-5">

        {/* Forecast Periods */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label className="text-[12.5px] font-semibold text-[#0a0a0a]">Forecast Periods</label>
            <span className="text-[12.5px] font-bold text-[#6366f1]">{forecastPeriods}</span>
          </div>
          <p className="text-[11px] text-[#9ca3af] mb-2 leading-relaxed">
            How many future time steps to predict. More periods = longer outlook, but less certainty.
          </p>
          <input
            type="range"
            min={1}
            max={30}
            value={forecastPeriods}
            onChange={(e) => setForecastPeriods(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <div className="flex justify-between text-[10.5px] text-[#9ca3af] mt-1">
            <span>1 (near-term)</span><span>30 (long-range)</span>
          </div>
        </div>

        {/* Anomaly Sensitivity */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label className="text-[12.5px] font-semibold text-[#0a0a0a]">Anomaly Sensitivity</label>
            <span className="text-[12.5px] font-bold text-[#e97316]">{zThreshold.toFixed(1)}σ</span>
          </div>
          <p className="text-[11px] text-[#9ca3af] mb-2 leading-relaxed">
            How far a value must be from average to count as unusual. Lower = flags more; higher = only extreme outliers.
          </p>
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
            <span>1.5 (very sensitive)</span><span>5.0 (only extreme)</span>
          </div>
        </div>

        {/* Scenario Adjustment */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label className="text-[12.5px] font-semibold text-[#0a0a0a]">Scenario Adjustment</label>
            <span className={`text-[12.5px] font-bold ${growthAdjustment >= 0 ? "text-green-600" : "text-red-500"}`}>
              {growthAdjustment > 0 ? "+" : ""}{growthAdjustment}%
            </span>
          </div>
          <p className="text-[11px] text-[#9ca3af] mb-2 leading-relaxed">
            Shift all future predictions up or down. Use positive for optimistic planning, negative for worst-case risk.
          </p>
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
            <span>−50% (pessimistic)</span><span>+50% (optimistic)</span>
          </div>
        </div>
      </div>

      {/* Before / After Comparison */}
      {result ? (
        <>
          <div className="rounded-xl border border-[#e5e7eb] overflow-hidden mb-4">
            <div className="grid grid-cols-4 bg-[#f9fafb] border-b border-[#e5e7eb] px-4 py-2">
              <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Metric</span>
              <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Before</span>
              <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">After</span>
              <span className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-wide">Change</span>
            </div>
            {/* Anomaly row */}
            <div className="grid grid-cols-4 px-4 py-3 border-b border-[#f3f4f6] items-center">
              <div>
                <p className="text-[13px] font-medium text-[#0a0a0a]">Anomalies</p>
                <p className="text-[10.5px] text-[#9ca3af]">Unusual data points</p>
              </div>
              <span className="text-[18px] font-bold text-[#d1d5db]">{origAnomalies}</span>
              <span className={`text-[18px] font-bold ${anomalyDelta < 0 ? "text-green-600" : anomalyDelta > 0 ? "text-red-500" : "text-[#374151]"}`}>
                {newAnomalies}
              </span>
              <DeltaBadge delta={anomalyDelta} lowerIsBetter />
            </div>
            {/* Risk score row */}
            <div className="grid grid-cols-4 px-4 py-3 border-b border-[#f3f4f6] items-center">
              <div>
                <p className="text-[13px] font-medium text-[#0a0a0a]">Risk Score</p>
                <p className="text-[10.5px] text-[#9ca3af]">0 = safe, 100 = critical</p>
              </div>
              <span className="text-[18px] font-bold text-[#d1d5db]">{origRisk}</span>
              <span className={`text-[18px] font-bold ${riskDelta < 0 ? "text-green-600" : riskDelta > 0 ? "text-red-500" : "text-[#374151]"}`}>
                {newRisk}
              </span>
              <DeltaBadge delta={riskDelta} lowerIsBetter />
            </div>
            {/* Forecast horizon row */}
            <div className="grid grid-cols-4 px-4 py-3 items-center">
              <div>
                <p className="text-[13px] font-medium text-[#0a0a0a]">Forecast Horizon</p>
                <p className="text-[10.5px] text-[#9ca3af]">Periods predicted ahead</p>
              </div>
              <span className="text-[18px] font-bold text-[#d1d5db]">5</span>
              <span className="text-[18px] font-bold text-[#6366f1]">+{forecastPeriods}</span>
              <span className="text-[11px] font-medium text-[#6366f1] ml-1.5">
                {forecastPeriods > 5 ? `▲ ${forecastPeriods - 5} more` : forecastPeriods < 5 ? `▼ ${5 - forecastPeriods} fewer` : "unchanged"}
              </span>
            </div>
          </div>

          {/* AI Explanation */}
          {result.explanation ? (
            <div className="rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] p-4 mb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-green-500 text-[16px] mt-0.5 shrink-0">✦</span>
                  <div>
                    <p className="text-[12px] font-semibold text-green-800 mb-1">AI Explanation — What This Means</p>
                    <p className="text-[13px] text-[#374151] leading-relaxed">{result.explanation}</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    speaking
                      ? stop()
                      : speak(result.explanation!, "en-IN")
                  }
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium border transition-colors"
                  style={
                    speaking
                      ? { background: "#f0fdf4", color: "#16a34a", borderColor: "#86efac" }
                      : { background: "white", color: "#374151", borderColor: "#d1fae5" }
                  }
                >
                  {speaking ? (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                      Stop
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Read aloud
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-[#fafaf9] border border-[#f0ede8] px-4 py-3 mb-4 flex items-center gap-2 text-[12.5px] text-[#9ca3af]">
              <svg className="animate-spin w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              AI is generating an explanation…
            </div>
          )}

          {/* Forecast values table */}
          {displayForecast.length > 0 && (
            <div className="rounded-xl bg-[#fafaf9] border border-[#f0ede8] p-4">
              <p className="text-[12px] font-semibold text-[#0a0a0a] mb-3">
                Simulated Forecast Values
                {growthAdjustment !== 0 && (
                  <span className={`ml-2 text-[11px] font-medium ${growthAdjustment > 0 ? "text-green-600" : "text-red-500"}`}>
                    ({growthAdjustment > 0 ? "+" : ""}{growthAdjustment}% scenario applied)
                  </span>
                )}
              </p>
              <div className="flex gap-3 flex-wrap">
                {displayForecast.map((f, i) => (
                  <div key={i} className="bg-white border border-[#f0ede8] rounded-lg px-3 py-2 text-center min-w-20">
                    <p className="text-[10px] text-[#9ca3af]">{f.label}</p>
                    <p className="text-[13px] font-bold text-[#0a0a0a] font-mono">{f.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl bg-[#fafaf9] border border-[#f0ede8] px-5 py-5 text-center">
          <p className="text-[13px] text-[#9ca3af] mb-1">
            Adjust the sliders above to model a scenario, then click <strong className="text-[#0a0a0a]">Run Simulation</strong>.
          </p>
          <p className="text-[11.5px] text-[#c3bdb5]">
            The AI will explain what changed and what it means in plain language.
          </p>
        </div>
      )}
    </div>
  );
}
