"use client"

const navLinks = {
  Platform: ["Data Ingestion", "KPI Engine", "KCI Alerts", "Simulation", "Executive Brief", "Integrity Cert"],
  Developers: ["API Reference", "Integration Guide", "Sample Datasets", "SDK"],
  Company: ["About", "Mission", "Blog", "Contact"],
};

export default function Footer() {
  return (
    <footer className="w-full px-6 pt-20 pb-10" style={{ background: "#0d0c0b", color: "#fff" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 pb-16" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="md:col-span-2 flex flex-col gap-5">
            <div>
              <h3 className="text-[24px] font-semibold tracking-tight mb-3">sarthi</h3>
              <p className="text-[14px] leading-relaxed" style={{ color: "#7a7068", maxWidth: "260px" }}>
                From raw data to responsible decisions. Sovereign AI governance intelligence for Bharat.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full self-start" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#f97316" }} />
              <span className="text-[12px] font-medium" style={{ color: "#7a7068" }}>Powered by Sarvam AI</span>
            </div>
          </div>
          {Object.entries(navLinks).map(([section, items]) => (
            <div key={section} className="flex flex-col gap-4">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: "#5a5550" }}>{section}</h4>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[14px] transition-colors" style={{ color: "#7a7068" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#d4cec8")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#7a7068")}
                    >{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 gap-4">
          <p className="text-[13px]" style={{ color: "#5a5550" }}>© 2026 Sarthi AI. Built for Bharat.</p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Use", "Security"].map((t) => (
              <a key={t} href="#" className="text-[13px] transition-colors" style={{ color: "#5a5550" }}>{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
