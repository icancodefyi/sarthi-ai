import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { MOCK_USER } from "@/lib/mockUser";

// GET /api/datasets/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataset = await db.collection("datasets").findOne(
      { _id: id as any, userId: MOCK_USER.id },
      { projection: { csvContent: 0 } }
    );

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    return NextResponse.json({ dataset });
  } catch (err) {
    console.error("Dataset fetch error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/datasets/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db
      .collection("datasets")
      .deleteOne({ _id: id as any, userId: MOCK_USER.id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Dataset delete error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
