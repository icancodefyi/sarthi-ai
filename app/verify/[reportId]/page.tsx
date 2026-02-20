"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface VerifyResult {
  reportId: string;
  isValid: boolean;
  integrityStatus: "valid" | "tampered" | "not_found";
  owner: string;
  datasetName: string;
  generatedDate: string;
  aiConfidenceScore: number;
  integrityHash: string;
}

export default function VerifyPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/verify/${reportId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.integrityStatus === "not_found") setError("Report not found");
        else setResult(j);
      })
      .catch(() => setError("Verification failed"))
      .finally(() => setLoading(false));
  }, [reportId]);

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col">
      {/* Header */}
      <div className="border-b border-[#f0ede8] bg-white px-8 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#ea580c] to-[#f97316] flex items-center justify-center">
          <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[15px] font-semibold text-[#0a0a0a]">Sarthi AI</span>
        <span className="text-[13px] text-[#9ca3af] ml-2">/ Verification</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          {loading && (
            <div className="text-center">
              <svg className="animate-spin w-10 h-10 mx-auto text-[#d1d5db]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <p className="mt-4 text-[14px] text-[#9ca3af]">Verifying integrity…</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-[18px] font-semibold text-[#0a0a0a] mb-1">Report Not Found</p>
              <p className="text-[13px] text-[#9ca3af]">No report exists with ID: {reportId?.slice(0, 24)}…</p>
            </div>
          )}

          {!loading && result && (
            <div>
              {/* Status hero */}
              <div
                className={`rounded-2xl p-8 text-center mb-6 ${
                  result.isValid
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    result.isValid ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {result.isValid ? (
                    <svg width="28" height="28" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg width="28" height="28" fill="none" stroke="#ef4444" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <p
                  className={`text-[22px] font-bold mb-1 ${
                    result.isValid ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {result.isValid ? "Report Verified" : "Integrity Check Failed"}
                </p>
                <p className={`text-[13px] ${result.isValid ? "text-green-600" : "text-red-600"}`}>
                  {result.isValid
                    ? "This report is authentic and has not been tampered with."
                    : "The report data does not match the original hash. It may have been modified."}
                </p>
              </div>

              {/* Details */}
              <div className="bg-white border border-[#f0ede8] rounded-2xl p-5 space-y-3 mb-4">
                {[
                  { label: "Dataset", value: result.datasetName },
                  { label: "Owner", value: result.owner },
                  {
                    label: "Generated",
                    value: new Date(result.generatedDate).toLocaleString("en-IN", {
                      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                    }),
                  },
                  { label: "AI Confidence Score", value: `${result.aiConfidenceScore}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between text-[13.5px]">
                    <span className="text-[#9ca3af]">{label}</span>
                    <span className="text-[#0a0a0a] font-medium">{value}</span>
                  </div>
                ))}
              </div>

              {/* Hash */}
              <div className="bg-[#0a0a0a] rounded-2xl p-5 mb-6">
                <p className="text-[11px] text-[#6b7280] uppercase tracking-wide mb-2">SHA-256 Hash</p>
                <p className="font-mono text-[10.5px] text-[#e5e7eb] break-all leading-relaxed">
                  {result.integrityHash}
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/report/${reportId}`}
                  className="flex-1 text-center py-2.5 rounded-xl border border-[#e5e7eb] text-[13px] font-medium text-[#0a0a0a] hover:bg-[#f9fafb] transition-colors"
                >
                  View Full Report
                </Link>
                <Link
                  href="/"
                  className="flex-1 text-center py-2.5 rounded-xl text-[13px] font-medium text-white transition-colors"
                  style={{ background: "linear-gradient(135deg,#ea580c,#f97316)" }}
                >
                  Go to Sarthi AI
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
