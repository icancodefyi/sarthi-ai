"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Dataset {
  _id: string;
  name: string;
  status: string;
  rowCount?: number;
  columnHeaders?: string[];
  analytics?: { kpis?: { growthRate?: number; anomalyCount?: number } };
  aiReport?: { confidenceScore?: number; summary?: string };
}

const CHECK_LIST = [
  { key: "uploaded", label: "Dataset uploaded" },
  { key: "analyzed", label: "Analytics processed" },
  { key: "aiReport", label: "AI interpretation complete" },
];

export default function GenerateReportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/datasets/${id}`)
      .then((r) => r.json())
      .then((j) => setDataset(j.dataset ?? null))
      .catch(() => setError("Failed to load dataset"))
      .finally(() => setLoading(false));
  }, [id]);

  const checks = {
    uploaded: !!dataset,
    analyzed: ["analyzed", "completed"].includes(dataset?.status ?? ""),
    aiReport: !!dataset?.aiReport,
  };

  const allPassed = Object.values(checks).every(Boolean);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/datasets/${id}/report`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Report generation failed");
      router.push(`/report/${json.reportId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setGenerating(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <p className="text-[13px] text-[#9ca3af] mb-1">Datasets / Generate Report</p>
        <h1
          className="text-[32px] text-[#0a0a0a] leading-tight"
          style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
        >
          Generate Certified Report
        </h1>
        <p className="text-[14px] text-[#6b7280] mt-2">
          Immutable snapshot · SHA-256 integrity hash · QR verification
        </p>
      </div>

      {loading && (
        <div className="text-[14px] text-[#9ca3af] flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Loading dataset…
        </div>
      )}

      {!loading && dataset && (
        <>
          {/* Dataset summary */}
          <div className="bg-white border border-[#f0ede8] rounded-2xl p-5 mb-6">
            <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide mb-3">Dataset</p>
            <p className="text-[16px] font-semibold text-[#0a0a0a]">{dataset.name}</p>
            <div className="flex gap-6 mt-3">
              <div>
                <p className="text-[11px] text-[#9ca3af]">Rows</p>
                <p className="text-[14px] font-medium text-[#0a0a0a]">{dataset.rowCount?.toLocaleString() ?? "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9ca3af]">Columns</p>
                <p className="text-[14px] font-medium text-[#0a0a0a]">{dataset.columnHeaders?.length ?? "—"}</p>
              </div>
              <div>
                <p className="text-[11px] text-[#9ca3af]">AI Confidence</p>
                <p className="text-[14px] font-medium text-[#0a0a0a]">
                  {dataset.aiReport?.confidenceScore ? `${dataset.aiReport.confidenceScore}%` : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Pre-flight checklist */}
          <div className="bg-white border border-[#f0ede8] rounded-2xl p-5 mb-6">
            <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide mb-4">Pre-flight checklist</p>
            <div className="space-y-3">
              {CHECK_LIST.map(({ key, label }) => {
                const passed = checks[key as keyof typeof checks];
                return (
                  <div key={key} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        passed ? "bg-green-100" : "bg-[#f3f4f6]"
                      }`}
                    >
                      {passed ? (
                        <svg width="12" height="12" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" fill="none" stroke="#d1d5db" strokeWidth="2.5" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="8" />
                        </svg>
                      )}
                    </div>
                    <span className={`text-[13.5px] ${passed ? "text-[#0a0a0a]" : "text-[#9ca3af]"}`}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* What gets included */}
          <div className="bg-[#fafaf9] border border-[#f0ede8] rounded-2xl p-5 mb-6">
            <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide mb-3">What's included in the report</p>
            <ul className="space-y-2 text-[13px] text-[#6b7280]">
              {[
                "Full analytics snapshot (KPIs, anomalies, forecast)",
                "AI-generated insights and certification notes",
                "SHA-256 integrity hash of all report data",
                "QR code linking to public verification page",
                "Immutably stored — cannot be altered after generation",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-[#ea580c] mt-0.5">›</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!allPassed || generating}
            className="w-full py-3 rounded-xl text-[14px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: allPassed && !generating ? "linear-gradient(135deg,#ea580c,#f97316)" : "#e5e7eb",
              color: allPassed && !generating ? "white" : "#9ca3af",
            }}
          >
            {generating ? "Generating…" : allPassed ? "Generate Certified Report" : "Complete checklist to continue"}
          </button>
        </>
      )}
    </div>
  );
}
