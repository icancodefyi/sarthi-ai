import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/mongodb";
import { MOCK_USER } from "@/lib/mockUser";
import { generateIntegrityHash } from "@/lib/hash";
import { generateQRCode } from "@/lib/qr";
import type { Report, Analytics, AIReport } from "@/types";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();

    // Load full dataset
    const dataset = await db
      .collection("datasets")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .findOne({ _id: id as any, userId: MOCK_USER.id }, { projection: { csvContent: 0 } });

    if (!dataset) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    if (!dataset.analytics) {
      return NextResponse.json({ error: "Analytics not ready" }, { status: 400 });
    }

    if (!dataset.aiReport) {
      return NextResponse.json(
        { error: "Run AI interpretation first before generating a report" },
        { status: 400 }
      );
    }

    const reportId = uuidv4();
    const now = new Date();

    // Build snapshot (immutable frozen copy)
    const snapshotData = {
      analytics: dataset.analytics as Analytics,
      aiReport: dataset.aiReport as AIReport,
      user: {
        id: MOCK_USER.id,
        name: MOCK_USER.name,
        email: MOCK_USER.email,
      },
      dataset: {
        filename: dataset.filename as string,
        originalName: dataset.originalName as string,
        metadata: dataset.metadata,
      },
    };

    // Generate integrity hash from snapshot + timestamp + IDs
    const hashPayload = {
      reportId,
      datasetId: id,
      userId: MOCK_USER.id,
      timestamp: now.toISOString(),
      analyticsHash: JSON.stringify(dataset.analytics),
      aiReportHash: JSON.stringify(dataset.aiReport),
    };

    const integrityHash = generateIntegrityHash(hashPayload as Record<string, unknown>);

    // Generate QR code linking to public verification page
    const verifyUrl = `${APP_URL}/verify/${reportId}`;
    const qrCodeUrl = await generateQRCode(verifyUrl);

    const report: Report = {
      _id: reportId,
      reportId,
      userId: MOCK_USER.id,
      datasetId: id,
      snapshotData,
      integrityHash,
      certificateObject: {
        reportId,
        userId: MOCK_USER.id,
        userName: MOCK_USER.name,
        userEmail: MOCK_USER.email,
        datasetId: id,
        datasetName: dataset.originalName as string,
        generatedDate: now,
        integrityHash,
        aiConfidenceScore: (dataset.aiReport as AIReport).confidenceScore,
        qrCodeUrl: verifyUrl,
        snapshotSummary: {
          totalRecords: (dataset.analytics as Analytics).totalRecords ?? 0,
          growthRate: (dataset.analytics as Analytics).growthPercent ?? 0,
          riskScore: (dataset.analytics as Analytics).riskScore ?? 0,
          anomalyCount: ((dataset.analytics as Analytics).anomalies ?? []).length,
        },
        aiSummary: (dataset.aiReport as AIReport).executiveSummary ?? "",
        certificationNotes: (dataset.aiReport as AIReport).certificationReasoning
          ? [(dataset.aiReport as AIReport).certificationReasoning as string]
          : [],
      },
      qrCodeUrl,
      createdAt: now,
    };

    // Store hash payload for future verification
    const reportDoc = { ...report, hashPayload };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection("reports").insertOne(reportDoc as any);

    // Update dataset status to completed
    await db
      .collection("datasets")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .updateOne({ _id: id as any }, { $set: { status: "completed", updatedAt: now } });

    return NextResponse.json({ success: true, reportId, report }, { status: 201 });
  } catch (err) {
    console.error("Report generation error:", err);
    return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
  }
}
