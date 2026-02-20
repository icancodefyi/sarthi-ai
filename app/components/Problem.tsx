const S = { fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400 };
const label = "text-[11px] font-semibold text-[#a8a29e] tracking-[0.18em] uppercase";
const h2 = "text-[#0a0a0a] leading-[1.07] tracking-[-0.022em]";
const body = "text-[16px] text-[#6b7280] leading-[1.75]";

const problems = [
  {
    n: "01",
    title: "Data Overload",
    desc: "Officers receive CSV files with thousands of rows across 20+ departments. There is no layer that surfaces patterns — finding a signal takes days, not minutes.",
    stat: "20+ departments per district",
  },
  {
    n: "02",
    title: "No Intelligence Layer",
    desc: "Existing BI tools render charts. They never explain why something changed, what action to take, or what happens if you intervene. All reasoning falls on the officer.",
    stat: "0 causal insights generated",
  },
  {
    n: "03",
    title: "Lack of Trust & Integrity",
    desc: "Reports pass through multiple hands with no tamper detection, no explainability, and no multilingual access — creating accountability gaps at every level.",
    stat: "No verifiable audit trail",
  },
];

export default function Problem() {
  return (
    <section className="w-full bg-white py-32 px-6">
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <p className={`text-center ${label} mb-5`}>The Core Problem</p>
        <h2
          className={`text-center ${h2} mb-5`}
          style={{ ...S, fontSize: "clamp(36px,5vw,58px)", maxWidth: "700px", margin: "0 auto 20px" }}
        >
          Indian governance drowns in data,<br />starved of insight.
        </h2>
        <p className={`text-center ${body} mb-20`} style={{ maxWidth: "480px", margin: "0 auto 80px" }}>
          Public officers face three structural barriers that prevent evidence-based decision-making at scale.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0" style={{ borderTop: "1px solid #e8e4de" }}>
          {problems.map((p, i) => (
            <div
              key={p.n}
              className="flex flex-col gap-5 py-10"
              style={{
                paddingRight: i < 2 ? "48px" : "0",
                paddingLeft: i > 0 ? "48px" : "0",
                borderRight: i < 2 ? "1px solid #e8e4de" : "none",
              }}
            >
              <span className="text-[13px] font-mono font-medium text-[#f97316]">{p.n}</span>
              <div>
                <h3 className="text-[22px] font-semibold text-[#0a0a0a] mb-3 leading-snug">{p.title}</h3>
                <p className="text-[15px] text-[#6b7280] leading-relaxed">{p.desc}</p>
              </div>
              <div className="mt-auto pt-6" style={{ borderTop: "1px solid #f0ece6" }}>
                <span className="text-[12px] font-medium text-[#a8a29e]">{p.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
