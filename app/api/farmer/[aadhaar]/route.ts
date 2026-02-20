import { NextRequest, NextResponse } from "next/server";
import { getFarmerByAadhaar } from "@/lib/mockAadhaar";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ aadhaar: string }> }
) {
  const { aadhaar } = await params;
  const farmer = getFarmerByAadhaar(aadhaar);

  if (!farmer) {
    return NextResponse.json(
      { error: "Aadhaar number not found in records" },
      { status: 404 }
    );
  }

  // Mask phone for privacy
  return NextResponse.json({ farmer });
}
