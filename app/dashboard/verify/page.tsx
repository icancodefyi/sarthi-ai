export default function VerifyPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-[13px] text-[#9ca3af] mb-1">Dashboard / Verify Report</p>
        <h1
          className="text-[32px] text-[#0a0a0a] leading-tight"
          style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 }}
        >
          Verify Report
        </h1>
        <p className="text-[14px] text-[#6b7280] mt-2">
          Enter a report ID to verify its integrity and authenticity.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-[#e5e7eb] bg-white p-12 text-center text-[14px] text-[#9ca3af]">
        Coming in Phase 5 — QR Verification Engine
      </div>
    </div>
  );
}
