import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { MOCK_USER } from "@/lib/mockUser";

// GET /api/datasets — list all datasets for the mock user
export async function GET() {
  try {
    const db = await getDb();
    const datasets = await db
      .collection("datasets")
      .find(
        { userId: MOCK_USER.id },
        {
          projection: {
            csvContent: 0, // never return raw CSV to frontend
          },
        }
      )
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ datasets });
  } catch (err) {
    console.error("Datasets list error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
