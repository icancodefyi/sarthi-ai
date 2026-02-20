"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Dataset } from "@/types";

type DatasetRow = Omit<Dataset, "analytics" | "aiReport"> & {
  analytics?: null | { totalRecords: number; riskScore: number; anomalies: unknown[] };
};

const STATUS_STYLES: Record<string, string> = {
  processing: "bg-amber-50 text-amber-600 border-amber-100",
  analyzed:   "bg-indigo-50 text-indigo-600 border-indigo-100",
  completed:  "bg-green-50 text-green-600 border-green-100",
  failed:     "bg-red-50 text-red-600 border-red-100",
};

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  agricultural:   { label: "🌾 Agricultural",    color: "bg-green-50 text-green-700 border-green-100" },
  health:         { label: "🏥 Health",          color: "bg-rose-50 text-rose-700 border-rose-100" },
  education:      { label: "📚 Education",        color: "bg-sky-50 text-sky-700 border-sky-100" },
  finance:        { label: "💰 Finance",          color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
  infrastructure: { label: "🏗️ Infrastructure",   color: "bg-stone-50 text-stone-700 border-stone-100" },
  environment:    { label: "🌿 Environment",      color: "bg-teal-50 text-teal-700 border-teal-100" },
  social:         { label: "👥 Social",           color: "bg-purple-50 text-purple-700 border-purple-100" },
  general:        { label: "📊 General",          color: "bg-gray-50 text-gray-600 border-gray-100" },
};

export default function DatasetsPage() {
  const [datasets, setDatasets] = useState<DatasetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/datasets");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setDatasets(json.datasets);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load datasets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this dataset?")) return;
    await fetch(`/api/datasets/${id}`, { method: "DELETE" });
    setDatasets((prev) => prev.filter((d) => String(d._id) !== id));
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[13px] text-[#9ca3af] mb-1">Dashboard / Datasets</p>
          <h1
            className="text-[32px] text-[#0a0a0a] leading-tight"
            style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
          >
            My Datasets
          </h1>
        </div>
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13.5px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#e97316,#fb923c)" }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          Upload New
        </Link>
      </div>

      {/* States */}
      {loading && (
        <div className="flex items-center gap-3 text-[14px] text-[#9ca3af] py-12 justify-center">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Loading datasets…
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-4 text-[13px] text-red-600 max-w-md">
          {error}
        </div>
      )}

      {!loading && !error && datasets.length === 0 && (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-[#f9fafb] border border-[#f0ede8] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="none" stroke="#d1d5db" strokeWidth="1.6" viewBox="0 0 24 24">
              <ellipse cx="12" cy="6" rx="8" ry="3" />
              <path d="M4 6v4c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
              <path d="M4 14v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4" />
            </svg>
          </div>
          <p className="text-[15px] text-[#6b7280] mb-4">No datasets yet</p>
          <Link href="/dashboard/upload" className="text-[13px] font-semibold text-[#e97316] hover:underline">
            Upload your first CSV →
          </Link>
        </div>
      )}

      {/* Dataset cards */}
      {!loading && datasets.length > 0 && (
        <div className="grid gap-4">
          {datasets.map((ds) => {
            const id = String(ds._id);
            const status = ds.status;
            const styleClass = STATUS_STYLES[status] || STATUS_STYLES.processing;
            const date = new Date(ds.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            });

            return (
              <div
                key={id}
                className="bg-white border border-[#f0ede8] rounded-2xl p-5 flex items-center gap-5"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-[#f9fafb] flex items-center justify-center shrink-0">
                  <svg width="20" height="20" fill="none" stroke="#6366f1" strokeWidth="1.8" viewBox="0 0 24 24">
                    <ellipse cx="12" cy="6" rx="8" ry="3" />
                    <path d="M4 6v4c0 1.657 3.582 3 8 3s8-1.343 8-3V6" />
                    <path d="M4 14v4c0 1.657 3.582 3 8 3s8-1.343 8-3v-4" />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-[14.5px] font-semibold text-[#0a0a0a] truncate">
                      {ds.originalName}
                    </p>
                    <span className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full border ${styleClass}`}>
                      {status}
                    </span>
                    {ds.category && CATEGORY_META[ds.category] && (
                      <span className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full border ${CATEGORY_META[ds.category].color}`}>
                        {CATEGORY_META[ds.category].label}
                      </span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-[#9ca3af]">
                    {ds.metadata.rowCount > 0
                      ? `${ds.metadata.rowCount.toLocaleString()} rows · ${ds.metadata.columnCount} columns · `
                      : ""}
                    {(ds.metadata.fileSize / 1024).toFixed(1)} KB · {date}
                  </p>
                  {ds.analytics && (
                    <div className="flex items-center gap-4 mt-1.5 text-[12px] text-[#6b7280]">
                      <span>Risk: <strong className="text-[#0a0a0a]">{ds.analytics.riskScore}</strong></span>
                      <span>Anomalies: <strong className="text-[#0a0a0a]">{ds.analytics.anomalies.length}</strong></span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {(status === "analyzed" || status === "completed") && (
                    <Link
                      href={`/dashboard/datasets/${id}`}
                      className="px-4 py-2 rounded-lg border border-[#e5e7eb] text-[12.5px] font-medium text-[#0a0a0a] hover:bg-[#fafaf9] transition-colors"
                    >
                      View
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(id)}
                    className="p-2 rounded-lg border border-[#fee2e2] text-red-400 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Refresh */}
      {!loading && datasets.length > 0 && (
        <button
          onClick={load}
          className="mt-6 text-[12.5px] text-[#9ca3af] hover:text-[#0a0a0a] transition-colors flex items-center gap-1.5"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M23 4v6h-6M1 20v-6h6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          Refresh
        </button>
      )}
    </div>
  );
}
