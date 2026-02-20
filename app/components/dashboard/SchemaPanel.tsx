import type { Analytics } from "@/types";

const AG_KEYWORDS = [
  "crop", "yield", "harvest", "soil", "fertilizer", "rainfall",
  "irrigation", "farm", "kharif", "rabi", "wheat", "rice", "cotton",
  "sugarcane", "pulses", "agri", "sowing", "pesticide", "manure",
];

type ColType = "Numeric" | "Date" | "Categorical" | "Text";

interface ColInfo {
  name: string;
  type: ColType;
}

function detectTypes(analytics: Analytics): ColInfo[] {
  const numericCols = new Set(Object.keys(analytics.numericSummary));
  const dateCol = analytics.dateRange ? analytics.columns.find((c) =>
    /date|time|year|month|day|period/.test(c.toLowerCase())
  ) : null;

  return analytics.columns.map((col) => {
    if (numericCols.has(col)) return { name: col, type: "Numeric" as ColType };
    if (col === dateCol) return { name: col, type: "Date" as ColType };
    const lower = col.toLowerCase();
    if (/name|description|notes|remarks|text|comment/.test(lower))
      return { name: col, type: "Text" as ColType };
    return { name: col, type: "Categorical" as ColType };
  });
}

export function isAgriculturalDataset(columns: string[]): boolean {
  return columns.some((col) =>
    AG_KEYWORDS.some((kw) => col.toLowerCase().includes(kw))
  );
}

const TYPE_STYLE: Record<ColType, { bg: string; text: string; icon: string }> = {
  Numeric: { bg: "bg-indigo-50", text: "text-indigo-700", icon: "123" },
  Date: { bg: "bg-blue-50", text: "text-blue-700", icon: "📅" },
  Categorical: { bg: "bg-amber-50", text: "text-amber-700", icon: "≡" },
  Text: { bg: "bg-gray-100", text: "text-gray-600", icon: "T" },
};

export default function SchemaPanel({ analytics }: { analytics: Analytics }) {
  const cols = detectTypes(analytics);
  const counts: Record<ColType, number> = { Numeric: 0, Date: 0, Categorical: 0, Text: 0 };
  cols.forEach((c) => counts[c.type]++);

  return (
    <div className="bg-white border border-[#f0ede8] rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0a0a0a]">Schema Detection</h3>
          <p className="text-[12px] text-[#9ca3af]">
            {cols.length} columns auto-detected · {counts.Numeric} numeric · {counts.Date} date · {counts.Categorical} categorical
          </p>
        </div>
        {analytics.dateRange && (
          <div className="text-right">
            <p className="text-[11px] text-[#9ca3af] uppercase tracking-wide">Date Range</p>
            <p className="text-[12.5px] font-medium text-[#0a0a0a]">
              {analytics.dateRange.min} → {analytics.dateRange.max}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {cols.map(({ name, type }) => {
          const s = TYPE_STYLE[type];
          return (
            <div
              key={name}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${s.bg} border-transparent`}
            >
              <span className={`text-[11px] font-mono font-bold ${s.text}`}>{s.icon}</span>
              <span className="text-[12.5px] font-medium text-[#0a0a0a]">{name}</span>
              <span className={`text-[10px] font-semibold ${s.text} ml-0.5`}>{type}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
