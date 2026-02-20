import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getDb } from "@/lib/mongodb";
import { MOCK_USER } from "@/lib/mockUser";
import type { Dataset } from "@/types";

const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are supported" },
        { status: 400 }
      );
    }

    const csvContent = await file.text();
    const datasetId = uuidv4();
    const now = new Date();

    const dataset: Dataset & { csvContent: string } = {
      _id: datasetId,
      userId: MOCK_USER.id,
      filename: `${datasetId}.csv`,
      originalName: file.name,
      status: "processing",
      metadata: {
        rowCount: 0,
        columnCount: 0,
        columns: [],
        fileSize: file.size,
      },
      analytics: null,
      aiReport: null,
      csvContent,
      createdAt: now,
      updatedAt: now,
    };

    const db = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection("datasets").insertOne(dataset as any);

    // Trigger Python analytics engine (fire-and-forget for fast response)
    fetch(`${PYTHON_SERVICE_URL}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dataset_id: datasetId }),
    }).catch((err) => {
      console.error("Python service error:", err);
    });

    return NextResponse.json(
      {
        success: true,
        datasetId,
        message: "Dataset uploaded. Analytics processing started.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
