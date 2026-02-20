"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "agricultural", label: "🌾 Agricultural / Farming", description: "Crop data, soil reports, yield, irrigation" },
  { value: "health",       label: "🏥 Health & Medical",       description: "Patient data, disease surveillance, health KPIs" },
  { value: "education",    label: "📚 Education",              description: "Enrollment, dropout rates, school performance" },
  { value: "finance",      label: "💰 Finance & Revenue",      description: "Budget, tax collection, scheme funds" },
  { value: "infrastructure",label:"🏗️ Infrastructure",         description: "Roads, utilities, construction progress" },
  { value: "environment",  label: "🌿 Environment",            description: "Air quality, water, forest cover, climate" },
  { value: "social",       label: "👥 Social Welfare",         description: "Beneficiary data, scheme coverage" },
  { value: "general",      label: "📊 General / Other",        description: "Any other government data" },
] as const;

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(f: File | null) {
    if (!f) return;
    if (!f.name.endsWith(".csv")) {
      setError("Only CSV files are supported.");
      return;
    }
    setError(null);
    setFile(f);
  }

  async function handleUpload() {
    if (!file || !category) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Upload failed");
      }

      router.push(`/dashboard/datasets`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[13px] text-[#9ca3af] mb-1">Dashboard / Upload</p>
        <h1
          className="text-[32px] text-[#0a0a0a] leading-tight"
          style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
        >
          Upload Dataset
        </h1>
        <p className="text-[14px] text-[#6b7280] mt-2">
          Select a category and upload a CSV. The analytics engine will automatically process your data.
        </p>
      </div>

      {/* Category selector */}
      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-[#374151] mb-3">Dataset Category <span className="text-red-400">*</span></label>
        <div className="grid grid-cols-2 gap-2.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`text-left px-4 py-3 rounded-xl border transition-all ${
                category === cat.value
                  ? "border-[#e97316] bg-[#fff7ed] shadow-sm"
                  : "border-[#e5e7eb] bg-white hover:border-[#e97316] hover:bg-[#fffdf9]"
              }`}
            >
              <p className="text-[13px] font-medium text-[#0a0a0a]">{cat.label}</p>
              <p className="text-[11.5px] text-[#9ca3af] mt-0.5">{cat.description}</p>
            </button>
          ))}
        </div>
        {category === "agricultural" && (
          <div className="mt-3 rounded-xl bg-green-50 border border-green-100 px-4 py-3 flex items-start gap-2.5 text-[13px] text-green-700">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mt-0.5 shrink-0">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>
              <strong>Kisan AI will be enabled</strong> — after upload, open the dataset and:
              <ol className="list-decimal ml-4 mt-1 space-y-0.5 text-[12px]">
                <li>Link a farmer&apos;s Aadhaar to attach their crop, soil &amp; land profile</li>
                <li>Click <strong>Run Kisan Analysis</strong> to re-generate AI insights with live weather enrichment</li>
                <li>Generate a certified report that includes the farmer attribution</li>
              </ol>
            </span>
          </div>
        )}
      </div>

      {/* Drop zone */}
      <div
        className={`relative rounded-2xl border-2 border-dashed transition-colors p-12 text-center cursor-pointer
          ${dragging ? "border-[#e97316] bg-[#fff7ed]" : "border-[#e5e7eb] bg-white hover:border-[#e97316] hover:bg-[#fffdf9]"}
        `}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFileChange(e.dataTransfer.files[0] ?? null);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#fff7ed] flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="#e97316" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
            </div>
            <p className="text-[15px] font-semibold text-[#0a0a0a]">{file.name}</p>
            <p className="text-[13px] text-[#9ca3af]">
              {(file.size / 1024).toFixed(1)} KB · Click to change
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f9fafb] flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="#9ca3af" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-[#0a0a0a]">
              Drag &amp; drop your CSV or click to browse
            </p>
            <p className="text-[13px] text-[#9ca3af]">Only .csv files are supported</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      {/* Action */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleUpload}
          disabled={!file || !category || uploading}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-semibold text-white transition-opacity disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#e97316,#fb923c)" }}
        >
          {uploading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              Uploading…
            </>
          ) : (
            "Upload & Analyze"
          )}
        </button>

        {file && (
          <button
            onClick={() => { setFile(null); setError(null); }}
            className="text-[13px] text-[#9ca3af] hover:text-[#0a0a0a] transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Info note */}
      <div className="mt-8 rounded-xl bg-[#f0f3ff] border border-[#e0e7ff] px-4 py-4 text-[13px] text-[#6366f1] leading-relaxed">
        <strong>What happens next:</strong> Your CSV is stored, then the Python analytics
        engine computes stats, detects anomalies, and builds a forecast.
        Once complete, you&apos;ll see full results in your dataset view.
      </div>
    </div>
  );
}
