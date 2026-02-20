import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getDb } from "@/lib/mongodb";
import { MOCK_USER } from "@/lib/mockUser";
import type { Analytics, AIReport } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    const dataset = await db
      .collection("datasets")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .findOne({ _id: id as any, userId: MOCK_USER.id }, { projection: { csvContent: 0 } });

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    const analytics = dataset.analytics as Analytics;
    if (!analytics) {
      return NextResponse.json(
        { error: "Analytics not ready yet. Wait for processing to complete." },
        { status: 400 }
      );
    }

    const prompt = buildPrompt(dataset.originalName as string, analytics);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const aiReport: AIReport = JSON.parse(raw);

    // Validate required fields, fill defaults if AI omitted any
    const report: AIReport = {
      executiveSummary: aiReport.executiveSummary ?? "No summary available.",
      insightHighlights: aiReport.insightHighlights ?? [],
      anomalyExplanations: aiReport.anomalyExplanations ?? [],
      riskReasoning: aiReport.riskReasoning ?? "No risk reasoning available.",
      forecastNarrative: aiReport.forecastNarrative ?? "No forecast narrative available.",
      contextualNews: aiReport.contextualNews ?? [],
      certificationReasoning: aiReport.certificationReasoning ?? "No certification reasoning available.",
      confidenceScore: typeof aiReport.confidenceScore === "number" ? aiReport.confidenceScore : 75,
    };

    await db.collection("datasets").updateOne(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _id: id as any },
      { $set: { aiReport: report, status: "completed", updatedAt: new Date() } }
    );

    return NextResponse.json({ success: true, aiReport: report });
  } catch (err) {
    console.error("AI interpret error:", err);
    return NextResponse.json({ error: "AI interpretation failed" }, { status: 500 });
  }
}

function buildPrompt(filename: string, analytics: Analytics): string {
  const topAnomalies = analytics.anomalies.slice(0, 5).map((a) =>
    `Row ${a.rowIndex}: ${a.column} = ${a.value} (Z-score: ${a.zScore})`
  );

  const numericSummaryText = Object.entries(analytics.numericSummary)
    .slice(0, 4)
    .map(([col, s]) =>
      `${col}: mean=${s.mean}, stdDev=${s.stdDev}, min=${s.min}, max=${s.max}`
    )
    .join("\n");

  return `You are an expert data analyst. Analyze the following dataset statistics and return a JSON object with EXACTLY these keys:

Dataset: "${filename}"
Total Records: ${analytics.totalRecords}
Date Range: ${analytics.dateRange ? `${analytics.dateRange.min} to ${analytics.dateRange.max}` : "Not detected"}
Growth %: ${analytics.growthPercent ?? "N/A"}
Risk Score: ${analytics.riskScore}/100
Anomaly Count: ${analytics.anomalies.length}

Numeric Summary:
${numericSummaryText}

Top Anomalies:
${topAnomalies.length > 0 ? topAnomalies.join("\n") : "None detected"}

Forecast (next 5 periods): ${analytics.forecast.map((f) => f.value).join(", ")}

Return ONLY valid JSON with this exact structure:
{
  "executiveSummary": "2-3 sentence executive summary of the dataset and key findings",
  "insightHighlights": ["insight 1", "insight 2", "insight 3", "insight 4"],
  "anomalyExplanations": ["explanation for each anomaly group in plain language"],
  "riskReasoning": "1-2 sentences explaining the risk score in context",
  "forecastNarrative": "1-2 sentences interpreting the forecast trend",
  "contextualNews": ["possible real-world factor 1", "possible real-world factor 2"],
  "certificationReasoning": "1 sentence on data quality and certification eligibility",
  "confidenceScore": 85
}`;
}
