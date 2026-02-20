const personas = [
  {
    role: "District Magistrate",
    dept: "Executive Administration",
    emoji: "🏛",
    challenge: "Oversees 20+ departments and reviews weekly scheme progress under severe time pressure. Needs executive clarity, not rows of numbers.",
    uses: ["Weekly anomaly summary across departments", "Auto-generated executive brief in 60 seconds", "Tamper-proof certified progress report"],
    quote: "What took my team 3 days now surfaces in a single brief.",
  },
  {
    role: "Agriculture Officer",
    dept: "Department of Agriculture",
    emoji: "🌾",
    challenge: "Tracks crop yield across thousands of farms in multiple blocks. Needs early warning on drops and fertiliser intervention guidance.",
    uses: ["KCI alerts on yield anomalies by block", "+5% fertiliser simulation with yield prediction", "Personalised farmer advisories in Hindi"],
    quote: "The news correlation flagged the yield drop before my field report arrived.",
  },
  {
    role: "Chief Medical Officer",
    dept: "District Health Services",
    emoji: "🏥",
    challenge: "Monitors disease incidence and immunisation coverage across the district. Outbreaks demand faster intelligence than manual registers allow.",
    uses: ["Disease spike alerting with confidence scores", "Regional news correlation for outbreak context", "Voice query support for field health workers"],
    quote: "Sarthi flagged a dengue cluster 4 days before it reached our registers.",
  },
];

export default function UseCases() {
  return (
    <section className="w-full bg-white py-32 px-6">
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <p className="text-center text-[11px] font-semibold text-[#a8a29e] tracking-[0.18em] uppercase mb-5">
          Who Uses Sarthi
        </p>
        <h2
          className="text-center text-[#0a0a0a] leading-[1.07] tracking-[-0.022em] mb-5"
          style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400, fontSize: "clamp(36px,5vw,58px)" }}
        >
          Built for the officers<br />who govern India.
        </h2>
        <p className="text-center text-[16px] text-[#6b7280] leading-relaxed mb-20" style={{ maxWidth: "440px", margin: "0 auto 80px" }}>
          From the Collectorate to the field — decision support at every level.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((p) => (
            <div key={p.role} className="flex flex-col gap-6 p-8 rounded-2xl" style={{ border: "1px solid #e8e4de", background: "#fdfcfa" }}>
              <div>
                <div className="text-3xl mb-4">{p.emoji}</div>
                <div className="text-[11px] font-semibold text-[#a8a29e] tracking-[0.12em] uppercase mb-1">{p.dept}</div>
                <h3 className="text-[20px] font-semibold text-[#0a0a0a] leading-snug">{p.role}</h3>
              </div>
              <p className="text-[14px] text-[#6b7280] leading-relaxed" style={{ borderTop: "1px solid #f0ece6", paddingTop: "20px" }}>{p.challenge}</p>
              <ul className="flex flex-col gap-2.5">
                {p.uses.map((u) => (
                  <li key={u} className="flex items-start gap-2.5">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#f97316] shrink-0" />
                    <span className="text-[13.5px] text-[#4a4540] leading-relaxed">{u}</span>
                  </li>
                ))}
              </ul>
              <blockquote className="mt-auto pt-5 text-[13px] text-[#a8a29e] italic leading-relaxed" style={{ borderTop: "1px solid #f0ece6" }}>
                &ldquo;{p.quote}&rdquo;
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
