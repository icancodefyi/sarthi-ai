const steps = [
  { n: "01", title: "Upload", color: "#f97316", desc: "Drop CSV, Excel, or JSON. Auto schema detection, date normalisation, quality scoring." },
  { n: "02", title: "Analyse", color: "#8b5cf6", desc: "AI identifies top KPIs, anomalies via Isolation Forest, and flags underperforming regions." },
  { n: "03", title: "Simulate", color: "#0ea5e9", desc: "Pick a KPI, set an intervention. Regression engine returns predicted impact and confidence interval." },
  { n: "04", title: "Summarise", color: "#10b981", desc: "Grounded LLM generates a 500-word policy brief with causal reasoning and action items." },
  { n: "05", title: "Certify", color: "#0a0a0a", desc: "SHA256 hash timestamps the final report. Any alteration is detected and flagged instantly." },
];

export default function HowItWorks() {
  return (
    <section className="w-full bg-white py-32 px-6">
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <p className="text-center text-[15px] font-semibold text-[#a8a29e] tracking-[0.18em] uppercase mb-5">
          How It Works
        </p>
        <h2
          className="text-center text-[#0a0a0a] leading-[1.07] tracking-[-0.022em] mb-5"
          style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400, fontSize: "clamp(36px,5vw,58px)" }}
        >
          Five steps from raw data<br />to certified intelligence.
        </h2>
        <p className="text-center text-[16px] text-[#6b7280] leading-relaxed mb-20" style={{ maxWidth: "440px", margin: "0 auto 80px" }}>
          A clear, auditable pipeline — every step is AI-driven.
        </p>

        <div className="flex flex-col gap-6">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="flex items-center gap-8 p-8 rounded-2xl border-l-4 transition-all duration-500 hover:bg-gradient-to-r hover:from-white hover:to-[#fff7ed] hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1 cursor-pointer group"
              style={{ 
                borderLeftColor: s.color,
                border: "1px solid #e8e4de",
                borderLeftWidth: "4px",
                borderLeftColor: s.color,
                transformStyle: "preserve-3d",
                perspective: "1000px"
              }}
            >
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[13px] font-mono font-medium" style={{ color: s.color }}>{s.n}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-[20px] font-semibold text-[#0a0a0a] mb-2 transition-colors duration-300 group-hover:text-[#f97316]">{s.title}</h3>
                <p className="text-[15px] text-[#6b7280] leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
