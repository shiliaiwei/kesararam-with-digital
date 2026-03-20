import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trafficSigns, trafficSignApprovals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";

// POST /api/admin/traffic-signs/[id]/approve - Approve sign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth(request);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signId = parseInt(params.id);
    const body = await request.json();
    const { comments } = body;

    // Check if sign exists
    const [existingSign] = await db
      .select()
      .from(trafficSigns)
      .where(eq(trafficSigns.id, signId))
      .limit(1);

    if (!existingSign) {
      return NextResponse.json({ error: "Sign not found" }, { status: 404 });
    }

    // Update sign status
    const [updatedSign] = await db
      .update(trafficSigns)
      .set({
        status: "approved",
        isActive: true,
        approvedBy: user.id,
        approvedAt: new Date(),
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(trafficSigns.id, signId))
      .returning();

    // Create approval record
    await db.insert(trafficSignApprovals).values({
      signId,
      adminId: user.id,
      action: "approved",
      comments: comments || null,
    });

    return NextResponse.json({ sign: updatedSign });
  } catch (error) {
    console.error("Error approving traffic sign:", error);
    return NextResponse.json(
      { error: "Failed to approve traffic sign" },
      { status: 500 }
    );
  }
}
