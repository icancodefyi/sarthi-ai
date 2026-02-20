import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyIntegrityHash } from "@/lib/hash";

// Public verification endpoint — no auth required
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

    const storedHash = report.integrityHash as string;
    const hashPayload = report.hashPayload as Record<string, unknown>;
    const isValid = hashPayload ? verifyIntegrityHash(hashPayload, storedHash) : false;

    // Return only public-facing fields
    return NextResponse.json({
      reportId,
      isValid,
      integrityStatus: isValid ? "verified" : "tampered",
      owner: report.snapshotData?.user?.name ?? "Unknown",
      datasetName: report.certificateObject?.datasetName ?? "Unknown",
      generatedDate: report.createdAt,
      aiConfidenceScore: report.certificateObject?.aiConfidenceScore ?? null,
      integrityHash: storedHash,
    });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
