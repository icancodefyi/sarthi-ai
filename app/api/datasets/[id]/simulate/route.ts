import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getDb } from "@/lib/mongodb";
import { MOCK_USER } from "@/lib/mockUser";

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    // Fetch dataset + original metrics for comparison
    const dataset = await db
      .collection("datasets")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .findOne({ _id: id as any, userId: MOCK_USER.id }, {
        projection: { _id: 1, originalName: 1, "analytics.riskScore": 1, "analytics.anomalies": 1 }
      });

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    const body = await req.json();
    const { forecastPeriods = 5, zThreshold = 2.5, growthAdjustment = 0 } = body;

    const pyRes = await fetch(`${PYTHON_SERVICE_URL}/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dataset_id: id,
        forecast_periods: forecastPeriods,
        z_threshold: zThreshold,
        growth_adjustment: growthAdjustment,
      }),
    });

    if (!pyRes.ok) {
      const err = await pyRes.json().catch(() => ({ detail: "Python service error" }));
      return NextResponse.json({ error: err.detail }, { status: 500 });
    }

    const result = await pyRes.json();

    // Original values for before/after comparison
    const originalAnomalyCount = Array.isArray(dataset.analytics?.anomalies)
      ? (dataset.analytics.anomalies as unknown[]).length
      : 0;
    const originalRiskScore: number = dataset.analytics?.riskScore ?? 0;
    const newAnomalyCount: number = result.filteredAnomalyCount ?? 0;
    const newRiskScore: number = result.filteredRiskScore ?? 0;
    const anomalyDelta = newAnomalyCount - originalAnomalyCount;
    const riskDelta = newRiskScore - originalRiskScore;

    // Generate AI explanation in plain language
    let explanation = "";
    try {
      const directionWord = (delta: number, lowerIsBetter = true) =>
        delta === 0 ? "unchanged" : (delta < 0) === lowerIsBetter ? "improved" : "worsened";

      const prompt = `A user ran a "what-if" simulation on dataset "${dataset.originalName as string}" by changing these three parameters:

1. Forecast Periods = ${forecastPeriods}: predicting ${forecastPeriods} time steps into the future.
2. Anomaly Z-Score Threshold = ${zThreshold}: a data point must deviate ${zThreshold}× the standard deviation from the mean to be flagged as an anomaly. Lower value = catches more anomalies; higher value = only flags the most extreme ones.
3. Forecast Growth Adjustment = ${growthAdjustment > 0 ? "+" : ""}${growthAdjustment}%: all future predicted values are shifted ${growthAdjustment > 0 ? "upward" : growthAdjustment < 0 ? "downward" : "by 0%"} to model an optimistic/pessimistic scenario.

Before simulation → After simulation:
- Anomaly Count: ${originalAnomalyCount} → ${newAnomalyCount} (${anomalyDelta === 0 ? "no change" : `${anomalyDelta > 0 ? "+" : ""}${anomalyDelta}`}, ${directionWord(anomalyDelta)})
- Risk Score: ${originalRiskScore} → ${newRiskScore} (${riskDelta === 0 ? "no change" : `${riskDelta > 0 ? "+" : ""}${riskDelta}`}, ${directionWord(riskDelta)})

Write 3–4 sentences in plain, jargon-free English. Explain: (1) in simple words what each changed parameter actually means for the data, (2) why the anomaly count and risk score changed the way they did, (3) whether this scenario is better or worse than the original, and (4) what practical action or insight this suggests. Do not use bullet points — write as a short paragraph.`;

      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 320,
      });
      explanation = completion.choices[0]?.message?.content?.trim() ?? "";
    } catch { /* non-blocking — results still returned */ }

    return NextResponse.json({
      success: true,
      simulation: {
        ...result,
        explanation,
        originalAnomalyCount,
        originalRiskScore,
      },
    });
  } catch (err) {
    console.error("Simulate error:", err);
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}
