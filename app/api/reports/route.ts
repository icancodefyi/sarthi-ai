import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { MOCK_USER } from "@/lib/mockUser";

export async function GET() {
  try {
    const db = await getDb();
    const reports = await db
      .collection("reports")
      .find(
        { userId: MOCK_USER.id },
        {
          projection: {
            qrCodeUrl: 0,       // exclude large base64
            "snapshotData.analytics.movingAverages": 0,
          },
        }
      )
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ reports });
  } catch (err) {
    console.error("Reports list error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
