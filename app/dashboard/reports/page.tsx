"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ReportRow {
  _id: string;
  reportId: string;
  createdAt: string;
  certificateObject: {
    datasetName: string;
    userName: string;
    aiConfidenceScore: number;
    integrityHash: string;
  };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((j) => setReports(j.reports ?? []))
      .catch(() => setError("Failed to load reports"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-[13px] text-[#9ca3af] mb-1">Dashboard / Reports</p>
        <h1
          className="text-[32px] text-[#0a0a0a] leading-tight"
          style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
        >
          Certified Reports
        </h1>
        <p className="text-[14px] text-[#6b7280] mt-2">
          Immutable reports with SHA-256 integrity hash and QR verification.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-[14px] text-[#9ca3af] py-12 justify-center">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Loading reports…
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-4 text-[13px] text-red-600">{error}</div>
      )}

      {!loading && reports.length === 0 && (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-[#f9fafb] border border-[#f0ede8] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" fill="none" stroke="#d1d5db" strokeWidth="1.6" viewBox="0 0 24 24">
              <path d="M9 12h6M9 16h4M9 8h6" strokeLinecap="round" />
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </div>
          <p className="text-[15px] text-[#6b7280] mb-2">No certified reports yet</p>
          <p className="text-[13px] text-[#9ca3af]">
            Upload a dataset, run AI interpretation, then generate a certified report.
          </p>
        </div>
      )}

      {!loading && reports.length > 0 && (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div
              key={report.reportId}
              className="bg-white border border-[#f0ede8] rounded-2xl p-5 flex items-center gap-5"
            >
              <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center shrink-0">
                <svg width="20" height="20" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14.5px] font-semibold text-[#0a0a0a] truncate">
                  {report.certificateObject?.datasetName ?? "Unknown dataset"}
                </p>
                <p className="text-[12px] text-[#9ca3af] mt-0.5">
                  {new Date(report.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
                  })} · Confidence: {report.certificateObject?.aiConfidenceScore}%
                </p>
                <p className="text-[11px] text-[#d1d5db] font-mono mt-0.5 truncate">
                  {report.certificateObject?.integrityHash?.slice(0, 40)}…
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/report/${report.reportId}`}
                  className="px-4 py-2 rounded-lg border border-[#e5e7eb] text-[12.5px] font-medium text-[#0a0a0a] hover:bg-[#fafaf9] transition-colors"
                >
                  View
                </Link>
                <Link
                  href={`/verify/${report.reportId}`}
                  className="px-4 py-2 rounded-lg border border-[#bbf7d0] text-[12.5px] font-medium text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  Verify
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
