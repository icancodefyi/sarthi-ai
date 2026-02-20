import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyIntegrityHash } from "@/lib/hash";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;
    const db = await getDb();

    const report = await db.collection("reports").findOne({ reportId });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Re-verify integrity hash
    const storedHash = report.integrityHash as string;
    const hashPayload = report.hashPayload as Record<string, unknown>;
    const isValid = hashPayload ? verifyIntegrityHash(hashPayload, storedHash) : false;

    return NextResponse.json({ report, isValid });
  } catch (err) {
    console.error("Report fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
