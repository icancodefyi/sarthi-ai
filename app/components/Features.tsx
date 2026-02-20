const modules = [
  { n: "01", title: "Intelligent Data Ingestion", short: "Schema detection · Quality Score · Missing value flags", desc: "Supports CSV, Excel, JSON. Auto-detects schema, normalises dates, infers column types, and outputs a Data Quality Score from 0 to 100." },
  { n: "02", title: "KPI Evaluation Engine", short: "Top 5 KPIs · Outlier detection · Region ranking", desc: "AI evaluates variance, outliers, and data consistency to automatically surface the top-performing and underperforming regions — no manual scanning." },
  { n: "03", title: "Key Change Intelligence", short: "Anomaly flags · Baseline deviation · Confidence score", desc: "Isolation Forest detects sudden spikes or drops, shows deviation from baseline, and explains statistical reasoning with a confidence score." },
  { n: "04", title: "News Correlation Engine", short: "Regional news · Causal linking · Date-matched", desc: "When an anomaly is detected, the system fetches regional news, summarises headlines, and connects probable external causes automatically." },
  { n: "05", title: "+5% Simulation Engine", short: "What-if analysis · Regression model · Confidence interval", desc: "Select any KPI and an intervention hypothesis. Linear regression predicts the estimated impact with confidence bounds in seconds." },
  { n: "06", title: "Executive Summary Generator", short: "500-word brief · Causal reasoning · Action items", desc: "A grounded LLM converts computed insights into a structured policy brief — no hallucination, all reasoning anchored to calculated data." },
  { n: "07", title: "Farmer Advisory System", short: "Weather API · Crop guidance · Multilingual", desc: "Combines regional crop data, soil profiles, and live weather to generate personalised irrigation, fertiliser, and pest risk guidance." },
  { n: "08", title: "Hash-Based Integrity Cert", short: "SHA256 · Timestamp · Tamper detection", desc: "Every report is hashed on generation. Any post-generation alteration triggers a mismatch — creating a verifiable chain of custody." },
  { n: "09", title: "Rural Language Support", short: "Whisper STT · TTS · Hindi + regional", desc: "Voice input in Hindi and regional languages. AI processes the query and speaks the response back, breaking literacy barriers at the last mile." },
];

export default function Features() {
  return (
    <section id="platform" className="w-full py-32 px-6" style={{ background: "#f9f8f6" }}>
      <div style={{ maxWidth: "1100px", margin:"0 auto" }}>
        <p className="text-center text-[15px] font-semibold text-[#a8a29e] tracking-[0.18em] uppercase mb-5">
          Platform Capabilities
        </p>
        <h2
          className="text-center text-[#0a0a0a] leading-[1.07] tracking-[-0.022em] mb-5"
          style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400, fontSize: "clamp(36px,5vw,58px)" }}
        >
          Nine modules.<br />One intelligence engine.
        </h2>
        <p className="text-center text-[16px] text-[#6b7280] leading-relaxed mb-20" style={{ maxWidth: "460px", margin: "0 auto 80px" }}>
          Every module is AI-core. Remove any one and the insight collapses.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((m, i) => (
            <div
              key={m.n}
              className="flex flex-col gap-4 p-8 bg-white rounded-2xl border border-[#e8e4de] transition-all duration-500 hover:bg-gradient-to-br hover:from-[#fff7ed] hover:to-white hover:shadow-2xl hover:scale-105 hover:border-[#f97316] cursor-pointer group"
            >
              <div className="flex items-start justify-end">
                <span className="text-[11px] text-[#b8b0a8] leading-relaxed text-right transition-colors duration-300 group-hover:text-[#f97316]" style={{ maxWidth: "180px" }}>{m.short}</span>
              </div>
              <h3 className="text-[16.5px] font-semibold text-[#0a0a0a] leading-snug text-center transition-colors duration-300 group-hover:text-[#f97316]">{m.title}</h3>
              <p className="text-[13.5px] text-[#7a7269] leading-relaxed text-center">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
