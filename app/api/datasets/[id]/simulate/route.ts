import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { MOCK_USER } from "@/lib/mockUser";

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    // Verify dataset belongs to user
    const dataset = await db
      .collection("datasets")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .findOne({ _id: id as any, userId: MOCK_USER.id }, { projection: { _id: 1 } });

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
    return NextResponse.json({ success: true, simulation: result });
  } catch (err) {
    console.error("Simulate error:", err);
    return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  }
}
