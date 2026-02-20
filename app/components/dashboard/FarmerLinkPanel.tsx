"use client";

import { useState } from "react";
import type { LinkedFarmer, AIReport } from "@/types";

interface Props {
  datasetId: string;
  linkedFarmer: LinkedFarmer | null | undefined;
  onLinked: (farmer: LinkedFarmer) => void;
  onUnlinked: () => void;
  onAnalysisComplete?: (report: AIReport) => void;
}

function formatAadhaar(val: string) {
  return val.replace(/\D/g, "").slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1-");
}

function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#f97316" : "#dc2626";
  return (
    <svg width="60" height="60" viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} fill="none" stroke="#f0ece6" strokeWidth="5" />
      <circle
        cx="30" cy="30" r={r} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap="round"
        transform="rotate(-90 30 30)"
      />
      <text x="30" y="35" textAnchor="middle" fill={color} fontSize="13" fontWeight="700">{score}</text>
    </svg>
  );
}

export default function FarmerLinkPanel({ datasetId, linkedFarmer, onLinked, onUnlinked, onAnalysisComplete }: Props) {
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [analysed, setAnalysed] = useState(false);
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleLink() {
    const digits = aadhaarInput.replace(/\D/g, "");
    if (digits.length !== 12) { setError("Enter a valid 12-digit Aadhaar number."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/datasets/${datasetId}/link-farmer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: digits }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Link failed");
      onLinked(json.farmer);
      setAadhaarInput("");
      setAnalysed(false);
      setAiReport(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleUnlink() {
    setLoading(true);
    await fetch(`/api/datasets/${datasetId}/link-farmer`, { method: "DELETE" });
    setLoading(false);
    setAnalysed(false);
    setAiReport(null);
    onUnlinked();
  }

  async function handleRunAnalysis() {
    setAnalysing(true);
    setError(null);
    try {
      const res = await fetch(`/api/datasets/${datasetId}/interpret`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Analysis failed");
      setAnalysed(true);
      setAiReport(json.aiReport ?? null);
      if (json.aiReport && onAnalysisComplete) onAnalysisComplete(json.aiReport);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalysing(false);
    }
  }

  return (
    <div className="bg-[#fff7ed] border border-[#fed7aa] rounded-2xl p-5 mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[22px]">🌾</span>
        <div>
          <p className="text-[13px] font-semibold text-[#92400e]">Kisan AI — Agricultural Dataset</p>
          <p className="text-[12px] text-[#c2410c]">
            Link a farmer profile to enrich AI interpretation with real crop, soil &amp; live weather context
          </p>
        </div>
      </div>

      {linkedFarmer ? (
        <>
          {/* Farmer card */}
          <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-[#fed7aa] mb-3">
            <div className="flex items-center gap-3">
              <span className="text-[22px]">🧑‍🌾</span>
              <div>
                <p className="text-[13.5px] font-semibold text-[#0a0a0a]">{linkedFarmer.name}</p>
                <p className="text-[12px] text-[#6b7280]">
                  {linkedFarmer.village}, {linkedFarmer.district}, {linkedFarmer.state}
                </p>
                <div className="flex items-center gap-3 mt-0.5 text-[11.5px] text-[#9ca3af]">
                  <span>🌱 {linkedFarmer.crops.join(", ")}</span>
                  <span>📐 {linkedFarmer.landAcres} acres</span>
                  <span>🪨 {linkedFarmer.soilType}</span>
                  <span>💧 {linkedFarmer.irrigationType}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {analysed && (
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">
                  ✓ Analysis done
                </span>
              )}
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                Linked
              </span>
              <button
                onClick={handleUnlink}
                disabled={loading || analysing}
                className="text-[12px] text-[#9ca3af] hover:text-red-500 transition-colors disabled:opacity-50"
              >
                Unlink
              </button>
            </div>
          </div>

          {/* Run analysis CTA / inline report */}
          {!analysed ? (
            <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#7c2d12]">Run Kisan AI Analysis</p>
                <p className="text-[12px] text-[#c2410c] mt-0.5">
                  Re-generate AI insights enriched with {linkedFarmer.name}&apos;s crop profile + live weather at {linkedFarmer.village}
                </p>
              </div>
              <button
                onClick={handleRunAnalysis}
                disabled={analysing}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
              >
                {analysing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    Analysing…
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                    </svg>
                    Run Kisan Analysis
                  </>
                )}
              </button>
            </div>
          ) : aiReport ? (
            <div className="flex flex-col gap-4 mt-1">
              {/* Completed bar */}
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <svg width="15" height="15" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
                    <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-[12.5px] font-semibold text-green-800">
                    Kisan AI Analysis complete — enriched with {linkedFarmer.name}&apos;s crop &amp; weather context
                  </p>
                </div>
                <button
                  onClick={() => { setAnalysed(false); setAiReport(null); handleRunAnalysis(); }}
                  className="text-[11.5px] text-green-600 hover:text-green-800 transition-colors font-medium shrink-0"
                >
                  Re-run
                </button>
              </div>

              {/* Confidence + headline */}
              <div className="flex items-center gap-4 bg-white border border-[#fed7aa] rounded-xl px-5 py-4">
                <ScoreRing score={aiReport.confidenceScore} />
                <div>
                  <p className="text-[11px] font-semibold text-[#a8a29e] uppercase tracking-wider mb-0.5">AI Confidence Score</p>
                  <p className="text-[13px] text-[#3d3530] leading-relaxed">{aiReport.executiveSummary}</p>
                </div>
              </div>

              {/* Insight Highlights */}
              {aiReport.insightHighlights.length > 0 && (
                <div className="bg-white border border-[#fed7aa] rounded-xl px-5 py-4">
                  <p className="text-[11px] font-semibold text-[#f97316] uppercase tracking-wider mb-3">🔍 Insight Highlights</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {aiReport.insightHighlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#f97316] shrink-0" />
                        <span className="text-[13px] text-[#4a4540] leading-relaxed">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Anomaly Explanations */}
              {aiReport.anomalyExplanations.length > 0 && (
                <div className="bg-white border border-[#fecaca] rounded-xl px-5 py-4">
                  <p className="text-[11px] font-semibold text-red-500 uppercase tracking-wider mb-3">⚠ Anomaly Explanations</p>
                  <div className="flex flex-col gap-2">
                    {aiReport.anomalyExplanations.map((a, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        <span className="text-[13px] text-[#4a4540] leading-relaxed">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Risk + Forecast side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white border border-[#fed7aa] rounded-xl px-5 py-4">
                  <p className="text-[11px] font-semibold text-[#d97706] uppercase tracking-wider mb-2">📊 Risk Reasoning</p>
                  <p className="text-[13px] text-[#4a4540] leading-relaxed">{aiReport.riskReasoning}</p>
                </div>
                <div className="bg-white border border-[#fed7aa] rounded-xl px-5 py-4">
                  <p className="text-[11px] font-semibold text-[#0ea5e9] uppercase tracking-wider mb-2">📈 Forecast Narrative</p>
                  <p className="text-[13px] text-[#4a4540] leading-relaxed">{aiReport.forecastNarrative}</p>
                </div>
              </div>

              {/* Contextual News */}
              {aiReport.contextualNews.length > 0 && (
                <div className="bg-white border border-[#e2e8f0] rounded-xl px-5 py-4">
                  <p className="text-[11px] font-semibold text-[#6b7280] uppercase tracking-wider mb-3">🌐 Possible External Factors</p>
                  <div className="flex flex-col gap-2">
                    {aiReport.contextualNews.map((n, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                        <span className="text-[13px] text-[#4a4540] leading-relaxed">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certification */}
              <div className="flex items-start gap-3 bg-[#f0fdf4] border border-green-200 rounded-xl px-5 py-3">
                <svg width="15" height="15" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24" className="mt-0.5 shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="text-[11px] font-semibold text-green-800 uppercase tracking-wider mb-0.5">Certification Note</p>
                  <p className="text-[13px] text-green-700 leading-relaxed">{aiReport.certificationReasoning}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <p className="text-[13px] text-green-800">Analysis complete.</p>
              <button
                onClick={() => { setAnalysed(false); }}
                className="ml-auto text-[12px] text-green-600 hover:text-green-800 transition-colors font-medium"
              >
                Re-run
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              type="text"
              value={aadhaarInput}
              onChange={(e) => setAadhaarInput(formatAadhaar(e.target.value))}
              placeholder="Enter Aadhaar number (XXXX-XXXX-XXXX)"
              className="flex-1 px-3 py-2 rounded-xl border border-[#fed7aa] text-[13px] font-mono bg-white focus:outline-none focus:border-[#ea580c]"
            />
            <button
              onClick={handleLink}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
            >
              {loading ? "Linking…" : "Link Farmer"}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-[#c2410c]">
            Demo Aadhaar numbers: <span className="font-mono">1234-5678-9012</span> · <span className="font-mono">2345-6789-0123</span> · <span className="font-mono">3456-7890-1234</span>
          </p>
        </>
      )}
      {error && <p className="mt-2 text-[12px] text-red-600">⚠ {error}</p>}
    </div>
  );
}
