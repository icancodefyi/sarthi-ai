"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ReportData {
  _id: string;
  reportId: string;
  createdAt: string;
  isValid: boolean;
  qrCodeUrl: string;
  snapshotData?: {
    analytics?: {
      totalRecords?: number;
      growthPercent?: number | null;
      riskScore?: number;
      anomalies?: unknown[];
    };
    aiReport?: {
      executiveSummary?: string;
      certificationReasoning?: string;
      certificationNotes?: string[];
    };
  };
  certificateObject: {
    reportId: string;
    datasetId: string;
    datasetName: string;
    userId: string;
    userName: string;
    userEmail: string;
    generatedDate: string;
    aiConfidenceScore: number;
    integrityHash: string;
    snapshotSummary?: {
      totalRecords: number;
      growthRate: number;
      riskScore: number;
      anomalyCount: number;
    };
    aiSummary?: string;
    certificationNotes?: string[];
  };
}

export default function PublicReportPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reports/${reportId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.report) setData({ ...j.report, isValid: j.isValid });
        else setError("Report not found");
      })
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[14px] text-[#9ca3af]">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          Loading report…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[18px] text-[#0a0a0a] mb-2">Report not found</p>
          <p className="text-[14px] text-[#9ca3af]">{error}</p>
        </div>
      </div>
    );
  }

  const cert = data.certificateObject;
  const snap = data.snapshotData;

  // Fall back to raw snapshotData for old reports that predate the certificateObject enrichment
  const totalRecords = cert.snapshotSummary?.totalRecords ?? snap?.analytics?.totalRecords;
  const growthRate = cert.snapshotSummary?.growthRate ?? snap?.analytics?.growthPercent;
  const riskScore = cert.snapshotSummary?.riskScore ?? snap?.analytics?.riskScore;
  const anomalyCount = cert.snapshotSummary?.anomalyCount ?? snap?.analytics?.anomalies?.length;
  const aiSummary = cert.aiSummary ?? snap?.aiReport?.executiveSummary ?? "";
  const certNotes: string[] = cert.certificationNotes ??
    (snap?.aiReport?.certificationNotes ?? (snap?.aiReport?.certificationReasoning ? [snap.aiReport.certificationReasoning] : []));
  const generatedDate = cert.generatedDate ?? data.createdAt;

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <div className="border-b border-[#f0ede8] bg-white px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#ea580c] to-[#f97316] flex items-center justify-center">
            <svg width="14" height="14" fill="white" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-[#0a0a0a]">Sarthi AI</span>
        </div>
        <div className="flex items-center gap-3">
          {data.isValid ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-[12px] font-semibold text-green-700">
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Verified Authentic
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-[12px] font-semibold text-red-700">
              Integrity Check Failed
            </span>
          )}
          <button
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-lg border border-[#e5e7eb] text-[12.5px] font-medium text-[#6b7280] hover:bg-[#f9fafb] transition-colors"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">
        {/* Title block */}
        <div>
          <p className="text-[12px] text-[#9ca3af] uppercase tracking-widest mb-1">Certified AI Report</p>
          <h1
            className="text-[34px] text-[#0a0a0a] leading-tight"
            style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
          >
            {cert.datasetName}
          </h1>
          <p className="text-[13px] text-[#9ca3af] mt-1.5">
            Generated {generatedDate ? new Date(generatedDate).toLocaleString("en-IN", {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
            }) : "—"} · Report ID: {cert.reportId.slice(0, 16)}…
          </p>
        </div>

        {/* Owner + confidence */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-[#f0ede8] rounded-2xl p-5">
            <p className="text-[11px] text-[#9ca3af] uppercase tracking-wide mb-2">Report Owner</p>
            <p className="text-[15px] font-semibold text-[#0a0a0a]">{cert.userName}</p>
            <p className="text-[13px] text-[#6b7280]">{cert.userEmail}</p>
          </div>
          <div className="bg-white border border-[#f0ede8] rounded-2xl p-5">
            <p className="text-[11px] text-[#9ca3af] uppercase tracking-wide mb-2">AI Confidence Score</p>
            <p className="text-[32px] font-bold text-[#ea580c]">{cert.aiConfidenceScore}%</p>
          </div>
        </div>

        {/* KPI snapshot */}
        <div className="bg-white border border-[#f0ede8] rounded-2xl p-5">
          <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide mb-4">Analytics Snapshot</p>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Records", value: totalRecords != null ? totalRecords.toLocaleString() : "—" },
              { label: "Growth Rate", value: growthRate != null ? `${Number(growthRate).toFixed(1)}%` : "—" },
              { label: "Risk Score", value: riskScore != null ? Number(riskScore).toFixed(1) : "—" },
              { label: "Anomalies", value: anomalyCount ?? "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[11px] text-[#9ca3af]">{label}</p>
                <p className="text-[20px] font-bold text-[#0a0a0a] mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-white border border-[#f0ede8] rounded-2xl p-5">
          <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide mb-3">AI Summary</p>
          <p className="text-[14px] text-[#374151] leading-relaxed">{aiSummary}</p>
        </div>

        {/* Certification notes */}
        {certNotes.length > 0 && (
          <div className="bg-white border border-[#f0ede8] rounded-2xl p-5">
            <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide mb-3">Certification Notes</p>
            <ul className="space-y-2">
              {certNotes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-[13.5px] text-[#374151]">
                  <span className="text-[#ea580c] mt-0.5">›</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Integrity block */}
        <div className="bg-[#0a0a0a] rounded-2xl p-6 flex items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <svg width="16" height="16" fill="none" stroke="#ea580c" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <p className="text-[12px] text-[#9ca3af] uppercase tracking-wide">SHA-256 Integrity Hash</p>
            </div>
            <p className="font-mono text-[11px] text-[#e5e7eb] break-all leading-relaxed">{cert.integrityHash}</p>
            <div className="flex items-center gap-2 mt-4">
              {data.isValid ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[12px] text-green-400 font-medium">Hash verified — data is intact</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-[12px] text-red-400 font-medium">Hash mismatch — data may be tampered</span>
                </>
              )}
            </div>
          </div>
          {data.qrCodeUrl && (
            <div className="shrink-0">
              <img src={data.qrCodeUrl} alt="Verify QR" className="w-24 h-24 rounded-lg" />
              <p className="text-[10px] text-[#6b7280] text-center mt-1.5">Scan to verify</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-2 pb-6">
          <p className="text-[12px] text-[#9ca3af]">
            This report was certified by{" "}
            <Link href="/" className="text-[#ea580c] hover:underline">Sarthi AI</Link>. 
            {" "}Verify at{" "}
            <Link href={`/verify/${reportId}`} className="text-[#ea580c] hover:underline font-mono">
              /verify/{reportId?.slice(0, 12)}…
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
