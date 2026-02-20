import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getDb } from "@/lib/mongodb";
import { MOCK_USER } from "@/lib/mockUser";
import type { Analytics } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const KPI_PROMPTS: Record<
  string,
  (name: string, a: Analytics) => string
> = {
  totalRecords: (name, a) =>
    `You are a data analyst. The dataset "${name}" has ${a.totalRecords.toLocaleString()} rows.${
      a.dateRange
        ? ` It spans from ${a.dateRange.min} to ${a.dateRange.max}.`
        : " No date column was detected."
    } It has ${a.columns.length} columns total (${Object.keys(a.numericSummary).length} numeric).

In 2–3 plain sentences, explain what this record count means for the reliability of the analysis. Mention whether this is enough data for meaningful anomaly detection and forecasting. Be specific to these numbers.`,

  growth: (name, a) => {
    const g = a.growthPercent;
    if (g == null)
      return `The dataset "${name}" has no detectable numeric column for growth calculation. In 2 sentences explain what "N/A growth" means and what the user should do.`;
    const direction = g > 0 ? "increased" : g < 0 ? "decreased" : "stayed flat";
    const numericCols = Object.entries(a.numericSummary);
    const primaryCol =
      numericCols.length > 0
        ? numericCols.reduce((best, cur) =>
            cur[1].variance > best[1].variance ? cur : best
          )[0]
        : "the primary column";
    return `You are a data analyst. In dataset "${name}", the value of "${primaryCol}" ${direction} by ${Math.abs(g)}% from the first to the last record. The column has mean=${a.numericSummary[primaryCol]?.mean ?? "?"}, min=${a.numericSummary[primaryCol]?.min ?? "?"}, max=${a.numericSummary[primaryCol]?.max ?? "?"}.

In 2–3 plain sentences, explain what this specific growth figure tells us about this dataset's trend. Is ${Math.abs(g)}% significant? What could be driving it? Be direct and specific.`;
  },

  riskScore: (name, a) => {
    const anomalyCount = a.anomalies.length;
    const affectedCols = [...new Set(a.anomalies.map((x) => x.column))];
    const avgZ =
      anomalyCount > 0
        ? (
            a.anomalies.reduce((s, x) => s + x.zScore, 0) / anomalyCount
          ).toFixed(2)
        : "0";
    return `You are a risk analyst reviewing dataset "${name}". It received a risk score of ${a.riskScore}/100 (${
      a.riskScore < 30 ? "low" : a.riskScore < 60 ? "moderate" : "high"
    } risk). Key contributors: ${anomalyCount} anomal${anomalyCount === 1 ? "y" : "ies"} across columns [${affectedCols.join(", ") || "none"}], average Z-score of flagged values = ${avgZ}, growth = ${a.growthPercent != null ? `${a.growthPercent}%` : "N/A"}.

In 3–4 plain sentences, explain specifically WHY this dataset got a score of ${a.riskScore}. Which factors pushed it up or kept it low? What does this score mean practically for this data? Be direct, reference the actual numbers.`;
  },

  anomalies: (name, a) => {
    const count = a.anomalies.length;
    const byCols = a.anomalies.reduce((acc, x) => {
      acc[x.column] = (acc[x.column] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const colSummary = Object.entries(byCols)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([c, n]) => `${c} (${n})`)
      .join(", ");
    const topAnomaly = a.anomalies.sort((a, b) => b.zScore - a.zScore)[0];
    return `You are a data quality analyst. Dataset "${name}" has ${count} anomal${count === 1 ? "y" : "ies"} detected at a Z-score threshold of 2.5. ${
      count > 0
        ? `Most affected columns: ${colSummary}. Worst single anomaly: row ${topAnomaly.rowIndex}, column "${topAnomaly.column}", value = ${topAnomaly.value}, Z-score = ${topAnomaly.zScore.toFixed(2)} (${topAnomaly.label}).`
        : "No anomalies were detected."
    }

In 3 plain sentences, explain what these specific anomaly numbers mean for this dataset's quality. Are ${count} anomalies a lot or a little for a ${a.totalRecords}-row dataset? What should the user investigate? Be concrete and use the actual numbers.`;
  },
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { kpiKey } = await req.json();

    if (!kpiKey || !KPI_PROMPTS[kpiKey]) {
      return NextResponse.json({ error: "Invalid kpiKey" }, { status: 400 });
    }

    const db = await getDb();
    const dataset = await db.collection("datasets").findOne(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _id: id as any, userId: MOCK_USER.id },
      { projection: { originalName: 1, analytics: 1 } }
    );

    if (!dataset?.analytics) {
      return NextResponse.json({ error: "Analytics not ready" }, { status: 404 });
    }

    const analytics = dataset.analytics as Analytics;
    const prompt = KPI_PROMPTS[kpiKey](dataset.originalName as string, analytics);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 240,
    });

    const explanation =
      completion.choices[0]?.message?.content?.trim() ?? "No explanation available.";

    return NextResponse.json({ explanation });
  } catch (err) {
    console.error("Explain KPI error:", err);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
