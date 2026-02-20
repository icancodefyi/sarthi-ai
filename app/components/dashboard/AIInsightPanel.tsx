"use client";

import { useState } from "react";
import { useTTS } from "@/app/hooks/useTTS";
import type { AIReport } from "@/types";

interface Props {
  aiReport: AIReport | null;
  datasetId: string;
  onGenerated: (report: AIReport) => void;
}

type Tab = "summary" | "insights" | "news" | "certification";

export default function AIInsightPanel({ aiReport, datasetId, onGenerated }: Props) {
  const [tab, setTab] = useState<Tab>("summary");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { speak, stop, speaking } = useTTS();

  async function runInterpretation() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/datasets/${datasetId}/interpret`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      onGenerated(json.aiReport);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "AI interpretation failed");
    } finally {
      setLoading(false);
    }
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "summary", label: "Summary" },
    { id: "insights", label: "Insights" },
    { id: "news", label: "Context" },
    { id: "certification", label: "Certification" },
  ];

  return (
    <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0a0a0a]">AI Insight Panel</h3>
          <p className="text-[12px] text-[#9ca3af]">Powered by Groq · Llama 3.3 70B</p>
        </div>
        {!aiReport && (
          <button
            onClick={runInterpretation}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)" }}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Thinking…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Run AI Interpretation
              </>
            )}
          </button>
        )}
        {aiReport && (
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#16a34a] font-medium flex items-center gap-1">
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Confidence: {aiReport.confidenceScore}%
            </span>
            <button
              onClick={runInterpretation}
              disabled={loading}
              className="text-[12px] text-[#9ca3af] hover:text-[#6366f1] transition-colors flex items-center gap-1"
            >
              {loading ? "Refreshing…" : "↻ Refresh"}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      {!aiReport && !loading && (
        <div className="py-10 text-center text-[13px] text-[#9ca3af] border border-dashed border-[#e5e7eb] rounded-xl">
          Click <strong>Run AI Interpretation</strong> to generate insights using Groq AI.
        </div>
      )}

      {loading && (
        <div className="py-10 text-center text-[13px] text-[#6366f1]">
          <svg className="animate-spin w-6 h-6 mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Groq is analyzing your data…
        </div>
      )}

      {aiReport && !loading && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 mb-5 bg-[#fafaf9] rounded-xl p-1 border border-[#f0ede8]">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${
                  tab === t.id
                    ? "bg-white text-[#0a0a0a] shadow-sm"
                    : "text-[#9ca3af] hover:text-[#6b7280]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {tab === "summary" && (
            <div>
              <p className="text-[14px] text-[#374151] leading-relaxed">
                {aiReport.executiveSummary}
              </p>
              <button
                onClick={() => speaking ? stop() : speak(aiReport.executiveSummary)}
                className={`mt-3 flex items-center gap-2 text-[12px] font-medium px-3 py-1.5 rounded-lg border transition-all ${
                  speaking
                    ? "border-[#6366f1] text-[#6366f1] bg-[#f0f3ff]"
                    : "border-[#e5e7eb] text-[#9ca3af] hover:border-[#6366f1] hover:text-[#6366f1]"
                }`}
              >
                {speaking ? (
                  <>
                    <svg width="11" height="11" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                    Stop reading
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" strokeLinecap="round" />
                    </svg>
                    Read aloud
                  </>
                )}
              </button>
            </div>
          )}

          {tab === "insights" && (
            <div className="space-y-3">
              {aiReport.insightHighlights.length === 0 && (
                <p className="text-[13px] text-[#9ca3af]">No insights generated.</p>
              )}
              {aiReport.insightHighlights.map((insight, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#f0f3ff] text-[#6366f1] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-[13.5px] text-[#374151] leading-relaxed">{insight}</p>
                </div>
              ))}
              {aiReport.anomalyExplanations.length > 0 && (
                <div className="mt-4 border-t border-[#f0ede8] pt-4">
                  <p className="text-[12px] font-semibold text-[#0a0a0a] mb-2">Anomaly Explanations</p>
                  {aiReport.anomalyExplanations.map((exp, i) => (
                    <p key={i} className="text-[13px] text-[#6b7280] mb-1">• {exp}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "news" && (
            <div className="space-y-3">
              <p className="text-[13px] text-[#374151] leading-relaxed mb-3">
                {aiReport.forecastNarrative}
              </p>
              <p className="text-[12px] font-semibold text-[#0a0a0a] mb-2">Possible Contextual Factors</p>
              {aiReport.contextualNews.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-[#e97316] mt-0.5">→</span>
                  <p className="text-[13px] text-[#6b7280]">{item}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "certification" && (
            <div className="space-y-4">
              <p className="text-[14px] text-[#374151] leading-relaxed">
                {aiReport.certificationReasoning}
              </p>
              <p className="text-[13px] text-[#6b7280] leading-relaxed">
                {aiReport.riskReasoning}
              </p>
              <div className="mt-2 flex items-center gap-3 rounded-xl bg-[#f0fdf4] border border-green-100 px-4 py-3">
                <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-[13px] text-[#16a34a] font-medium">
                  AI Confidence Score: {aiReport.confidenceScore}% — Eligible for certification
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
