export default function GenerateReportPage() {
  return (
    <div className="p-8">
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
      <div className="rounded-2xl border border-dashed border-[#e5e7eb] bg-white p-12 text-center text-[14px] text-[#9ca3af]">
        Coming in Phase 5 — Report &amp; Certification Engine
      </div>
    </div>
  );
}
