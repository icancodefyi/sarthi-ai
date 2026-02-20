import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { MOCK_USER } from "@/lib/mockUser";
import { getFarmerByAadhaar } from "@/lib/mockAadhaar";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { aadhaar } = await req.json();
    if (!aadhaar) return NextResponse.json({ error: "aadhaar is required" }, { status: 400 });

    const farmer = getFarmerByAadhaar(aadhaar);
    if (!farmer) return NextResponse.json({ error: "Aadhaar not found in records" }, { status: 404 });

    const db = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await db.collection("datasets").updateOne(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _id: id as any, userId: MOCK_USER.id },
      {
        $set: {
          linkedFarmer: {
            aadhaar: farmer.aadhaar,
            name: farmer.name,
            village: farmer.village,
            district: farmer.district,
            state: farmer.state,
            lat: farmer.lat,
            lon: farmer.lon,
            crops: farmer.crops,
            landAcres: farmer.landAcres,
            soilType: farmer.soilType,
            irrigationType: farmer.irrigationType,
          },
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, farmer });
  } catch (err) {
    console.error("Link farmer error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    await db.collection("datasets").updateOne(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { _id: id as any, userId: MOCK_USER.id },
      { $unset: { linkedFarmer: "" }, $set: { updatedAt: new Date() } }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unlink farmer error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
