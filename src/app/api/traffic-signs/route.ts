import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trafficSigns } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// GET /api/traffic-signs - Public endpoint for approved signs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const signType = searchParams.get("signType");
    const category = searchParams.get("category");

    let query = db
      .select()
      .from(trafficSigns)
      .where(
        and(
          eq(trafficSigns.status, "approved"),
          eq(trafficSigns.isActive, true)
        )
      )
      .orderBy(trafficSigns.sortOrder, desc(trafficSigns.createdAt));

    const signs = await query;

    // Filter by type/category if provided
    let filtered = signs;
    if (signType) {
      filtered = filtered.filter((s) => s.signType === signType);
    }
    if (category) {
      filtered = filtered.filter((s) => s.category === category);
    }

    return NextResponse.json({ signs: filtered });
  } catch (error) {
    console.error("Error fetching traffic signs:", error);
    return NextResponse.json(
      { error: "Failed to fetch traffic signs" },
      { status: 500 }
    );
  }
}
