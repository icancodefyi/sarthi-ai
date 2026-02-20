export default function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Orange radial blob - top center, exactly like Sarvam */}
      <div
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-32"
        style={{
          width: "900px",
          height: "600px",
          background:
            "radial-gradient(ellipse 60% 55% at 50% 0%, #f97316 0%, #c084fc 45%, #a5b4fc 70%, transparent 100%)",
          opacity: 0.55,
          filter: "blur(2px)",
        }}
      />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-350 mx-auto w-full">
        <div className="text-[22px] font-semibold text-gray-900 tracking-tight">
          sarthi
        </div>
        <div className="hidden md:flex items-center gap-8">
          <button className="text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
            PLATFORM <span className="text-[10px]">›</span>
          </button>
          <button className="text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
            DEVELOPERS <span className="text-[10px]">›</span>
          </button>
          <button className="text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
            BLOGS <span className="text-[10px]">›</span>
          </button>
          <button className="text-[13px] font-medium text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
            ABOUT <span className="text-[10px]">›</span>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2 bg-gray-900 text-white rounded-full text-[13px] font-medium hover:bg-gray-800 transition-colors">
            Experience Sarthi
          </button>
          <button className="px-5 py-2 bg-white text-gray-900 border border-gray-300 rounded-full text-[13px] font-medium hover:bg-gray-50 transition-colors">
            Talk to Us
          </button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-8 pt-16 pb-12 text-center">
        {/* Decorative Ornament — two swirls like Sarvam */}
        <div className="mb-6 flex items-center justify-center gap-4">
          {/* Left swirl */}
          <svg width="52" height="38" viewBox="0 0 52 38" fill="none" className="opacity-70">
            <path d="M48 6 C 40 2, 28 2, 24 12 C 20 22, 28 30, 36 28 C 44 26, 46 18, 40 14 C 34 10, 26 14, 28 20" stroke="#6366f1" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            <circle cx="28" cy="20" r="1.5" fill="#6366f1" opacity="0.7"/>
          </svg>
          {/* Right swirl */}
          <svg width="52" height="38" viewBox="0 0 52 38" fill="none" className="opacity-70" style={{transform:"scaleX(-1)"}}>
            <path d="M48 6 C 40 2, 28 2, 24 12 C 20 22, 28 30, 36 28 C 44 26, 46 18, 40 14 C 34 10, 26 14, 28 20" stroke="#6366f1" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
            <circle cx="28" cy="20" r="1.5" fill="#6366f1" opacity="0.7"/>
          </svg>
        </div>

        {/* Badge */}
        <div className="mb-7">
          <span
            className="inline-block px-5 py-1.5 rounded-full text-[13px] font-medium text-indigo-700 bg-white"
            style={{ boxShadow: "0 0 0 1.5px rgba(99,102,241,0.4), 0 1px 6px rgba(0,0,0,0.07)" }}
          >
            India&apos;s Sovereign AI Governance Platform
          </span>
        </div>

        {/* Main Heading */}
        <h1
          className="max-w-3xl text-[56px] md:text-[72px] lg:text-[82px] text-gray-900 mb-5 leading-[1.08] tracking-[-0.02em]"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontWeight: 400 }}
        >
          AI for Governance<br />from India
        </h1>

        {/* Subheading */}
        <p className="text-[17px] text-gray-600 mb-1 leading-relaxed">
          From raw data to responsible decisions. Powered by sovereign compute.
        </p>
        <p className="text-[17px] text-gray-600 mb-10 leading-relaxed">
          Delivering district-level intelligence at scale.
        </p>

        {/* CTA Button */}
        <button className="px-7 py-3 bg-gray-900 text-white rounded-full text-[15px] font-medium tracking-wide hover:bg-gray-800 transition-all shadow-sm">
          Experience Sarthi
        </button>
      </div>

      {/* Bottom Section — partner strip */}
      <div className="relative z-10 px-8 pb-16 pt-8">
        <p className="text-center text-[11px] font-semibold text-gray-400 tracking-[0.18em] uppercase mb-8">
          India governs with Sarthi
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {[
            "NIC",
            "NABARD",
            "Ministry of Agriculture",
            "NHM",
            "Infosys BPM",
            "CSC e-Gov",
            "UIDAI",
            "NDAP",
            "MyGov India",
          ].map((name) => (
            <span
              key={name}
              className="text-[15px] font-semibold text-gray-400 opacity-80 whitespace-nowrap"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
