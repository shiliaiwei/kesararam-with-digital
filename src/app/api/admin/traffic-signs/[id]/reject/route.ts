import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trafficSigns, trafficSignApprovals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";

// POST /api/admin/traffic-signs/[id]/reject - Reject sign
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
    const { reason, comments } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

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
        status: "rejected",
        isActive: false,
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(trafficSigns.id, signId))
      .returning();

    // Create approval record
    await db.insert(trafficSignApprovals).values({
      signId,
      adminId: user.id,
      action: "rejected",
      comments: comments || reason,
    });

    return NextResponse.json({ sign: updatedSign });
  } catch (error) {
    console.error("Error rejecting traffic sign:", error);
    return NextResponse.json(
      { error: "Failed to reject traffic sign" },
      { status: 500 }
    );
  }
}
