import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trafficSigns } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/traffic-signs/[id] - Get single sign details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const signId = parseInt(id);

    const [sign] = await db
      .select()
      .from(trafficSigns)
      .where(eq(trafficSigns.id, signId))
      .limit(1);

    if (!sign) {
      return NextResponse.json({ error: "Sign not found" }, { status: 404 });
    }

    // Only return approved signs for public access
    if (sign.status !== "approved" || !sign.isActive) {
      return NextResponse.json({ error: "Sign not available" }, { status: 404 });
    }

    return NextResponse.json({ sign });
  } catch (error) {
    console.error("Error fetching traffic sign:", error);
    return NextResponse.json(
      { error: "Failed to fetch traffic sign" },
      { status: 500 }
    );
  }
}
