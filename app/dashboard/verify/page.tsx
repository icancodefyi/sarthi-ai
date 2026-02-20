"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface VerifyResult {
  reportId: string;
  isValid: boolean;
  integrityStatus: "verified" | "tampered" | "not_found";
  owner: string;
  datasetName: string;
  generatedDate: string;
  aiConfidenceScore: number | null;
  integrityHash: string;
}

interface ReportRow {
  reportId: string;
  createdAt: string;
  certificateObject: {
    datasetName: string;
    aiConfidenceScore: number;
    integrityHash: string;
  };
}

function extractId(raw: string): string {
  // Accept: bare ID, full URL /verify/abc123, https://... /verify/abc123
  const match = raw.match(/(?:verify\/)?([a-zA-Z0-9_-]{16,})/);
  return match ? match[1] : raw.trim();
}

function HashDisplay({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(hash).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <div className="bg-[#0a0a0a] rounded-xl p-4 flex items-start gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#6b7280] uppercase tracking-widest mb-1.5">SHA-256 Integrity Hash</p>
        <p className="font-mono text-[10.5px] text-[#e5e7eb] break-all leading-relaxed">{hash}</p>
      </div>
      <button
        onClick={copy}
        className="shrink-0 mt-0.5 px-2.5 py-1.5 rounded-lg text-[10.5px] font-medium border border-[#374151] text-[#9ca3af] hover:text-white hover:border-[#6b7280] transition-colors"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

function ResultCard({ result, onReset }: { result: VerifyResult; onReset: () => void }) {
  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${result.reportId}`;
  const [urlCopied, setUrlCopied] = useState(false);

  const valid = result.isValid;

  function shareUrl() {
    navigator.clipboard.writeText(verifyUrl).then(() => {
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    });
  }

  return (
    <div className="bg-white border border-[#f0ede8] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Status banner */}
      <div
        className={`px-6 py-5 flex items-center gap-4 ${
          valid ? "bg-green-50 border-b border-green-100" : "bg-red-50 border-b border-red-100"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
            valid ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {valid ? (
            <svg width="22" height="22" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="22" height="22" fill="none" stroke="#ef4444" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <p className={`text-[17px] font-bold ${valid ? "text-green-800" : "text-red-800"}`}>
            {valid ? "Document Verified ✓" : "Integrity Check Failed"}
          </p>
          <p className={`text-[12.5px] mt-0.5 ${valid ? "text-green-600" : "text-red-500"}`}>
            {valid
              ? "This report is authentic — hash matches original. It has not been tampered with."
              : "The report data does not match the stored hash. It may have been modified after issuance."}
          </p>
        </div>
        <button
          onClick={onReset}
          className="shrink-0 text-[12px] text-[#9ca3af] hover:text-[#374151] transition-colors"
        >
          ✕ Clear
        </button>
      </div>

      {/* Detail rows */}
      <div className="px-6 py-4 grid grid-cols-2 gap-x-8 gap-y-3 border-b border-[#f0ede8]">
        {[
          { label: "Dataset", value: result.datasetName },
          { label: "Owner", value: result.owner },
          {
            label: "Generated",
            value: new Date(result.generatedDate).toLocaleString("en-IN", {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
            }),
          },
          {
            label: "AI Confidence",
            value: result.aiConfidenceScore != null ? `${result.aiConfidenceScore}%` : "—",
          },
          {
            label: "Report ID",
            value: result.reportId,
          },
          {
            label: "Status",
            value: valid ? "VALID" : "TAMPERED",
            bold: true,
            color: valid ? "text-green-600" : "text-red-500",
          },
        ].map(({ label, value, bold, color }) => (
          <div key={label}>
            <p className="text-[10.5px] text-[#9ca3af] uppercase tracking-wide mb-0.5">{label}</p>
            <p className={`text-[13.5px] font-medium text-[#0a0a0a] ${bold ? color : ""} truncate`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Hash */}
      <div className="px-6 py-4 border-b border-[#f0ede8]">
        <HashDisplay hash={result.integrityHash} />
      </div>

      {/* Actions */}
      <div className="px-6 py-4 flex flex-wrap gap-3">
        <Link
          href={`/report/${result.reportId}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#0a0a0a,#374151)" }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 12h6M9 16h4M9 8h6" strokeLinecap="round" />
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          View Full Report
        </Link>
        <button
          onClick={shareUrl}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-medium border border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] transition-colors"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
          </svg>
          {urlCopied ? "Copied!" : "Copy Verify URL"}
        </button>
        <Link
          href={`/verify/${result.reportId}`}
          target="_blank"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12.5px] font-medium border border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] transition-colors"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Public Verify Page ↗
        </Link>
      </div>
    </div>
  );
}

export default function VerifyDashboardPage() {
  const [input, setInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Reports list for quick-verify
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [quickVerifying, setQuickVerifying] = useState<string | null>(null);
  const [quickResults, setQuickResults] = useState<Record<string, boolean>>({});

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((j) => setReports(j.reports ?? []))
      .catch(() => {})
      .finally(() => setReportsLoading(false));
  }, []);

  async function verify(rawId: string) {
    const id = extractId(rawId);
    if (!id) return;
    setVerifying(true);
    setFetchError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/verify/${id}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setResult(json);
      // scroll to result smoothly
      setTimeout(() => document.getElementById("result-card")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e: unknown) {
      setFetchError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  async function quickVerify(reportId: string) {
    setQuickVerifying(reportId);
    try {
      const res = await fetch(`/api/verify/${reportId}`);
      const json = await res.json();
      setQuickResults((prev) => ({ ...prev, [reportId]: json.isValid === true }));
    } catch {
      setQuickResults((prev) => ({ ...prev, [reportId]: false }));
    } finally {
      setQuickVerifying(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input.trim()) verify(input.trim());
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[13px] text-[#9ca3af] mb-1">Dashboard / Verify Document</p>
        <h1
          className="text-[32px] text-[#0a0a0a] leading-tight"
          style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
        >
          Document Verification
        </h1>
        <p className="text-[14px] text-[#6b7280] mt-2">
          Verify the authenticity and integrity of any Sarthi AI certified report using its ID or URL.
        </p>
      </div>

      {/* Search box */}
      <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 mb-6">
        <p className="text-[12px] font-semibold text-[#374151] uppercase tracking-wide mb-3">
          Enter Report ID or Verification URL
        </p>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d1d5db]"
              width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <path d="M9 12h6M9 16h4M9 8h6" strokeLinecap="round" />
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. abc123def456…  or  https://…/verify/abc123"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#e5e7eb] text-[13px] text-[#0a0a0a] placeholder:text-[#c3bdb5] focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition"
            />
          </div>
          <button
            type="submit"
            disabled={verifying || !input.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-50 transition-opacity"
            style={{ background: "linear-gradient(135deg,#0a0a0a,#374151)" }}
          >
            {verifying ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Verifying…
              </>
            ) : (
              <>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verify
              </>
            )}
          </button>
        </form>

        <p className="text-[11.5px] text-[#9ca3af] mt-2.5">
          You can paste a full URL like <span className="font-mono text-[#6b7280]">https://sarthi.ai/verify/abc123</span> — the ID will be extracted automatically.
        </p>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 flex items-center gap-2.5 text-[13px] text-red-600">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" />
          </svg>
          {fetchError}
        </div>
      )}

      {/* Result */}
      {result && (
        <div id="result-card" className="mb-8">
          <ResultCard result={result} onReset={() => { setResult(null); setInput(""); inputRef.current?.focus(); }} />
        </div>
      )}

      {/* How it works */}
      {!result && (
        <div className="bg-[#fafaf9] border border-[#f0ede8] rounded-2xl p-5 mb-8">
          <p className="text-[12px] font-semibold text-[#374151] mb-4">How verification works</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: "01", icon: "🔑", title: "Submit ID", desc: "Paste the report ID or full verification URL" },
              { step: "02", icon: "🔒", title: "Hash Match", desc: "We re-compute the SHA-256 hash and compare against the stored original" },
              { step: "03", icon: "✅", title: "Result", desc: "If hashes match — verified authentic. Any modification breaks the hash" },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#c3bdb5] tracking-widest">{step}</span>
                  <span className="text-[14px]">{icon}</span>
                </div>
                <p className="text-[12.5px] font-semibold text-[#0a0a0a]">{title}</p>
                <p className="text-[11.5px] text-[#9ca3af] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Reports — quick verify */}
      <div className="bg-white border border-[#f0ede8] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0ede8]">
          <div>
            <p className="text-[13.5px] font-semibold text-[#0a0a0a]">My Certified Reports</p>
            <p className="text-[11.5px] text-[#9ca3af] mt-0.5">Click Verify on any report to check its integrity instantly</p>
          </div>
          <Link
            href="/dashboard/reports"
            className="text-[12px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
          >
            View all →
          </Link>
        </div>

        {reportsLoading && (
          <div className="px-6 py-8 flex items-center gap-2 text-[13px] text-[#9ca3af]">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Loading reports…
          </div>
        )}

        {!reportsLoading && reports.length === 0 && (
          <div className="px-6 py-10 text-center">
            <p className="text-[13px] text-[#9ca3af]">No certified reports yet.</p>
            <Link
              href="/dashboard/datasets"
              className="mt-2 inline-block text-[12.5px] text-indigo-500 hover:underline"
            >
              Go to datasets → generate your first report
            </Link>
          </div>
        )}

        {!reportsLoading && reports.length > 0 && (
          <div>
            {reports.slice(0, 8).map((report, i) => {
              const qr = quickResults[report.reportId];
              const isChecked = report.reportId in quickResults;
              const isChecking = quickVerifying === report.reportId;
              return (
                <div
                  key={report.reportId}
                  className={`flex items-center gap-4 px-6 py-4 ${i < reports.length - 1 ? "border-b border-[#f9f9f7]" : ""} hover:bg-[#fafaf9] transition-colors`}
                >
                  {/* Status indicator */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isChecking
                        ? "bg-[#f3f4f6]"
                        : isChecked
                        ? qr ? "bg-green-50" : "bg-red-50"
                        : "bg-[#f9fafb]"
                    }`}
                  >
                    {isChecking ? (
                      <svg className="animate-spin w-3.5 h-3.5 text-[#9ca3af]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                    ) : isChecked ? (
                      qr ? (
                        <svg width="14" height="14" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" fill="none" stroke="#ef4444" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )
                    ) : (
                      <svg width="14" height="14" fill="none" stroke="#d1d5db" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path d="M9 12h6M9 16h4M9 8h6" strokeLinecap="round" />
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0a0a0a] truncate">
                      {report.certificateObject?.datasetName ?? "Unknown dataset"}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-[11px] text-[#9ca3af]">
                        {new Date(report.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                      <span className="text-[#e5e7eb]">·</span>
                      <p className="text-[11px] font-mono text-[#c3bdb5] truncate max-w-40">
                        {report.reportId}
                      </p>
                      {isChecked && (
                        <span
                          className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${
                            qr ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                          }`}
                        >
                          {qr ? "VALID" : "TAMPERED"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => quickVerify(report.reportId)}
                      disabled={isChecking}
                      className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[#374151] hover:bg-[#f0f4ff] hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-40 transition-colors"
                    >
                      {isChecking ? "…" : "Verify"}
                    </button>
                    <Link
                      href={`/report/${report.reportId}`}
                      className="text-[11.5px] font-medium px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

