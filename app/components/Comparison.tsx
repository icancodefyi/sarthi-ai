const rows = [
  { feature: "Shows data", old: "Charts only", sarthi: "Generates insights + narrative" },
  { feature: "Who can use it", old: "Requires technical skill", sarthi: "Conversational & officer-friendly" },
  { feature: "Language support", old: "English only", sarthi: "Hindi + regional languages" },
  { feature: "Explainability", old: "None", sarthi: "Transparent causal reasoning" },
  { feature: "Forecasting", old: "No simulation", sarthi: "What-if intervention engine" },
  { feature: "Trust & integrity", old: "No tamper detection", sarthi: "SHA256 hash certification" },
  { feature: "Anomaly detection", old: "Manual or absent", sarthi: "AI-powered Isolation Forest" },
  { feature: "News correlation", old: "Not available", sarthi: "Automatic regional linking" },
];

export default function Comparison() {
  return (
    <section id="features" className="w-full py-32 px-6" style={{ background: "#f9f8f6" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <p className="text-center text-[16px] font-semibold text-[#a8a29e] tracking-[0.18em] uppercase mb-5">
          Why Sarthi
        </p>
        <h2
          className="text-center text-[#0a0a0a] leading-[1.07] tracking-[-0.022em] mb-5"
          style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400, fontSize: "clamp(36px,5vw,58px)" }}
        >
          Not a dashboard.<br />A decision-support AI.
        </h2>
        <p className="text-center text-[16px] text-[#6b7280] leading-relaxed mb-16" style={{ maxWidth: "440px", margin: "0 auto 64px" }}>
          Every category where Sarthi replaces the status quo.
        </p>

        <div className="overflow-hidden" style={{ border: "1px solid #e8e4de", borderRadius: "16px" }}>
          {/* Header */}
          <div className="grid grid-cols-3 px-7 py-4" style={{ background: "#f4f1ec", borderBottom: "1px solid #e8e4de" }}>
            <span className="text-[11.5px] font-semibold text-[#a8a29e] uppercase tracking-wider">Capability</span>
            <span className="text-[11.5px] font-semibold text-[#a8a29e] uppercase tracking-wider text-center">Existing BI Tools</span>
            <span className="text-[11.5px] font-semibold uppercase tracking-wider text-center text-[#f97316]">Sarthi AI</span>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.feature}
              className="grid grid-cols-3 px-7 py-5 items-center bg-white hover:bg-[#fdfcfa] transition-colors"
              style={{ borderBottom: i < rows.length - 1 ? "1px solid #f0ece6" : "none" }}
            >
              <span className="text-[14px] font-medium text-[#3d3530]">{r.feature}</span>
              <div className="flex items-center justify-center gap-2">
                <svg className="blink-wrong" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#f1f0ee"/><path d="M4.5 4.5l5 5M9.5 4.5l-5 5" stroke="#c4bcb4" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <span className="text-[13.5px] text-[#9ca3af]">{r.old}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <svg className="blink-right" width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#fff7ed"/><path d="M3.5 7l2.5 2.5 4.5-4.5" stroke="#f97316" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-[13.5px] font-medium text-[#0a0a0a]">{r.sarthi}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
