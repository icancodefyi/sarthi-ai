export default function CTA() {
  return (
    <section className="w-full py-20 px-6" style={{ background: "#f9f8f6" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div className="relative overflow-hidden rounded-3xl px-10 py-24 flex flex-col items-center text-center" style={{ background: "#0d0c0b" }}>
          {/* Glow */}
          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-28 w-175 h-100"
            style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, #f97316 0%, #7c3aed 55%, transparent 100%)", opacity: 0.22 }} />

          <p className="relative text-[11px] font-semibold text-[#6b6560] tracking-[0.2em] uppercase mb-6">Get started</p>
          <h2
            className="relative text-white leading-[1.07] tracking-[-0.022em] mb-6"
            style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400, fontSize: "clamp(32px,5vw,56px)", maxWidth: "680px" }}
          >
            Turn your government data<br />into actionable intelligence.
          </h2>
          <p className="relative text-[16px] text-[#8a8278] leading-relaxed mb-10" style={{ maxWidth: "440px" }}>
            Upload a sample dataset and experience the full Sarthi pipeline — from anomaly detection to a certified policy brief — in under 2 minutes.
          </p>
          <div className="relative flex flex-col sm:flex-row items-center gap-3">
            <button className="px-7 py-3.5 rounded-full text-[14.5px] font-semibold text-[#0d0c0b] bg-white transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-orange-500/50 hover:bg-gradient-to-r hover:from-orange-400 hover:to-orange-500 hover:text-white">
              Try with Sample Data
            </button>
            <button className="px-7 py-3.5 rounded-full text-[14.5px] font-medium text-white transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600" style={{ border: "1px solid rgba(255,255,255,0.15)" }}>
              Request a Demo
            </button>
          </div>
          <p className="relative mt-10 text-[12px] text-[#5a5550] flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1L2 3v5c0 2.8 2.2 4.8 4.5 5.2C8.8 12.8 11 10.8 11 8V3L6.5 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
            No account required · Sovereign compute · SHA256 certified output
          </p>
        </div>
      </div>
    </section>
  );
}
