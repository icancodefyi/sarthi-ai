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

export default function FarmerLinkPanel({ datasetId, linkedFarmer, onLinked, onUnlinked, onAnalysisComplete }: Props) {
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const [analysed, setAnalysed] = useState(false);
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

          {/* Run analysis CTA */}
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
          ) : (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
                <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-green-800">Kisan AI Analysis complete</p>
                <p className="text-[12px] text-green-700 mt-0.5">
                  AI insights below are now enriched with {linkedFarmer.name}&apos;s crop &amp; weather context. Scroll down to view.
                </p>
              </div>
              <button
                onClick={() => { setAnalysed(false); }}
                className="text-[12px] text-green-600 hover:text-green-800 transition-colors font-medium"
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
