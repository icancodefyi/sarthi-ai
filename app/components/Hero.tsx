export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-white" style={{ minHeight: "100svh" }}>
      {/* Blob */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-40"
        style={{
          width: "1000px",
          height: "680px",
          background: "radial-gradient(ellipse 55% 50% at 50% 0%, #fb923c 0%, #c084fc 42%, #a5b4fc 68%, transparent 100%)",
          opacity: 0.45,
          filter: "blur(1px)",
        }}
      />
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6" style={{ paddingTop: "clamp(120px,18vh,200px)", paddingBottom: "60px" }}>
        {/* Ornament */}
        <div className="mb-8 flex items-center gap-3 opacity-60">
          <svg width="48" height="32" viewBox="0 0 48 32" fill="none">
            <path d="M44 5C36 1 24 1 20 11C16 21 24 29 32 27C40 25 42 17 36 13C30 9 22 13 24 19" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <circle cx="24" cy="19" r="1.4" fill="#818cf8"/>
          </svg>
          <svg width="48" height="32" viewBox="0 0 48 32" fill="none" style={{ transform: "scaleX(-1)" }}>
            <path d="M44 5C36 1 24 1 20 11C16 21 24 29 32 27C40 25 42 17 36 13C30 9 22 13 24 19" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <circle cx="24" cy="19" r="1.4" fill="#818cf8"/>
          </svg>
        </div>
        {/* Badge */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12.5px] font-medium bg-white text-indigo-600" style={{ boxShadow: "0 0 0 1px rgba(99,102,241,0.25),0 1px 8px rgba(0,0,0,0.06)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
            India&apos;s Sovereign AI Governance Platform
          </span>
        </div>
        {/* Heading */}
        <h1 className="text-[#0a0a0a] mb-6 leading-[1.06] tracking-[-0.025em]" style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400, fontSize: "clamp(48px,8vw,88px)", maxWidth: "820px" }}>
          AI for Governance<br />from India
        </h1>
        <p className="text-[17px] text-[#6b7280] leading-relaxed mb-1" style={{ maxWidth: "480px" }}>From raw data to responsible decisions.</p>
        <p className="text-[17px] text-[#6b7280] leading-relaxed mb-12" style={{ maxWidth: "480px" }}>Built on sovereign compute. Delivering district-level intelligence.</p>
        <button className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[14.5px] font-medium text-white transition-opacity hover:opacity-80" style={{ background: "#0a0a0a" }}>
          Experience Sarthi
        </button>
      </div>
      {/* Partner Strip */}
      <div className="relative z-10 px-6 pb-20">
        <p className="text-center text-[10.5px] font-semibold text-[#b8b0a8] tracking-[0.2em] uppercase mb-7">India builds with Sarthi</p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {["NIC","NABARD","Ministry of Agriculture","NHM","CSC e-Gov","NDAP","MyGov India","UIDAI"].map((name) => (
            <span key={name} className="text-[14px] font-semibold text-[#c8c0b8] whitespace-nowrap">{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
