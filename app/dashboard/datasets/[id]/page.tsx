"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import type { Dataset, AIReport, LinkedFarmer } from "@/types";
import KPICards from "@/app/components/dashboard/KPICards";
import AnalyticsChart from "@/app/components/dashboard/AnalyticsChart";
import AIInsightPanel from "@/app/components/dashboard/AIInsightPanel";
import AnomalyTable from "@/app/components/dashboard/AnomalyTable";
import Pagination from "@/app/components/dashboard/Pagination";
import SimulationPanel from "@/app/components/dashboard/SimulationPanel";
import SchemaPanel from "@/app/components/dashboard/SchemaPanel";
import FarmerLinkPanel from "@/app/components/dashboard/FarmerLinkPanel";
import DatasetChatbot from "@/app/components/dashboard/DatasetChatbot";
import NewsCorrelation from "@/app/components/dashboard/NewsCorrelation";

const NUMERIC_PAGE_SIZE = 8;

export default function DatasetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [numericPage, setNumericPage] = useState(1);
  const [linkedFarmer, setLinkedFarmer] = useState<LinkedFarmer | null>(null);

  async function load() {
    try {
      const res = await fetch(`/api/datasets/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDataset(json.dataset);
      // If still processing, keep polling
      if (json.dataset.status === "processing") {
        setPolling(true);
      } else {
        setPolling(false);
      }
      if (json.dataset.linkedFarmer) {
        setLinkedFarmer(json.dataset.linkedFarmer);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  // Poll every 3s while processing
  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(() => {
      load();
    }, 3000);
    return () => clearInterval(interval);
  }, [polling]);

  function handleAIGenerated(report: AIReport) {
    setDataset((prev) => (prev ? { ...prev, aiReport: report, status: "completed" } : prev));
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-[14px] text-[#9ca3af]">
        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
        Loading dataset…
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="p-8">
        <p className="text-red-500 text-[14px]">{error ?? "Dataset not found"}</p>
        <button onClick={() => router.back()} className="mt-4 text-[13px] text-[#6366f1] hover:underline">
          ← Back
        </button>
      </div>
    );
  }

  const isProcessing = dataset.status === "processing";

  return (
    <div className="p-8">
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[12.5px] text-[#9ca3af] mb-3">
          <Link href="/dashboard" className="hover:text-[#0a0a0a] transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard/datasets" className="hover:text-[#0a0a0a] transition-colors">Datasets</Link>
          <span>/</span>
          <span className="text-[#0a0a0a]">{dataset.originalName}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1
              className="text-[28px] text-[#0a0a0a] leading-tight"
              style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
            >
              {dataset.originalName}
            </h1>
            <p className="text-[13px] text-[#9ca3af] mt-1">
              Uploaded {new Date(dataset.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric"
              })} · {(dataset.metadata.fileSize / 1024).toFixed(1)} KB
            </p>
          </div>

          <div className="flex items-center gap-3">
            {(dataset.status === "analyzed" || dataset.status === "completed") && dataset.aiReport && (
              <>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-[#374151] bg-white border border-[#e5e7eb] hover:bg-[#f9fafb] transition-colors"
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Export PDF
                </button>
                <Link
                  href={`/dashboard/datasets/${id}/generate-report`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                  style={{ background: "linear-gradient(135deg,#e97316,#fb923c)" }}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12h6M9 16h4M9 8h6" strokeLinecap="round" />
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                  </svg>
                  Generate Certified Report
                </Link>
              </>
            )}
            <span
              className={`text-[11.5px] font-medium px-3 py-1.5 rounded-full border ${
                dataset.status === "completed"
                  ? "bg-green-50 text-green-600 border-green-100"
                  : dataset.status === "analyzed"
                  ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                  : dataset.status === "processing"
                  ? "bg-amber-50 text-amber-600 border-amber-100"
                  : "bg-red-50 text-red-600 border-red-100"
              }`}
            >
              {dataset.status}
            </span>
          </div>
        </div>
      </div>

      {/* Processing state */}
      {isProcessing && (
        <div className="rounded-2xl bg-[#fffbeb] border border-amber-100 px-5 py-4 flex items-center gap-3 mb-6">
          <svg className="animate-spin w-4 h-4 text-amber-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <p className="text-[13px] text-amber-700">
            Python analytics engine is processing your data. This page updates automatically…
          </p>
        </div>
      )}

      {/* Analytics ready */}
      {dataset.analytics && (
        <>
          <KPICards analytics={dataset.analytics} datasetId={id} />
          <SchemaPanel analytics={dataset.analytics} />
          {dataset.category === "agricultural" && (
            <FarmerLinkPanel
              datasetId={id}
              linkedFarmer={linkedFarmer}
              onLinked={(f) => setLinkedFarmer(f)}
              onUnlinked={() => setLinkedFarmer(null)}
              onAnalysisComplete={(report) => handleAIGenerated(report)}
            />
          )}
          <AnalyticsChart analytics={dataset.analytics} />
          <AIInsightPanel
            aiReport={dataset.aiReport}
            datasetId={id}
            onGenerated={handleAIGenerated}
          />
          {dataset.aiReport && (
            <NewsCorrelation
              aiReport={dataset.aiReport}
              analytics={dataset.analytics}
              datasetName={dataset.originalName}
            />
          )}
          <AnomalyTable anomalies={dataset.analytics.anomalies} />

          <SimulationPanel
            datasetId={id}
            defaultForecast={dataset.analytics.forecast}
            defaultAnomalyCount={dataset.analytics.anomalies.length}
            defaultRiskScore={dataset.analytics.riskScore}
          />

          {/* Numeric Summary */}
          {(() => {
            const numericEntries = Object.entries(dataset.analytics.numericSummary);
            const numericTotalPages = Math.ceil(numericEntries.length / NUMERIC_PAGE_SIZE);
            const numericSlice = numericEntries.slice(
              (numericPage - 1) * NUMERIC_PAGE_SIZE,
              numericPage * NUMERIC_PAGE_SIZE
            );
            return (
              <div className="bg-white border border-[#f0ede8] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#0a0a0a]">Numeric Column Summary</h3>
                    <p className="text-[12px] text-[#9ca3af]">{numericEntries.length} numeric column{numericEntries.length !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#f0ede8]">
                        {["Column", "Mean", "Std Dev", "Min", "Max", "Variance"].map((h) => (
                          <th key={h} className="pb-2.5 text-[11.5px] font-semibold text-[#9ca3af] uppercase tracking-wide pr-6">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {numericSlice.map(([col, s]) => (
                        <tr key={col} className="border-b border-[#fafaf9] hover:bg-[#fafaf9] transition-colors">
                          <td className="py-2.5 text-[13px] font-medium text-[#0a0a0a] pr-6">{col}</td>
                          <td className="py-2.5 text-[13px] font-mono text-[#374151] pr-6">{s.mean}</td>
                          <td className="py-2.5 text-[13px] font-mono text-[#374151] pr-6">{s.stdDev}</td>
                          <td className="py-2.5 text-[13px] font-mono text-[#374151] pr-6">{s.min}</td>
                          <td className="py-2.5 text-[13px] font-mono text-[#374151] pr-6">{s.max}</td>
                          <td className="py-2.5 text-[13px] font-mono text-[#374151] pr-6">{s.variance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  page={numericPage}
                  totalPages={numericTotalPages}
                  totalItems={numericEntries.length}
                  pageSize={NUMERIC_PAGE_SIZE}
                  onPage={(p) => setNumericPage(p)}
                />
              </div>
            );
          })()}
        </>
      )}

      {/* Floating chatbot — always visible once analytics ready */}
      {dataset.analytics && (
        <DatasetChatbot datasetId={id} datasetName={dataset.originalName} />
      )}
    </div>
  );
}
