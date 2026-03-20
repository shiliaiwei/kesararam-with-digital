import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trafficSigns } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// PUT /api/admin/traffic-signs/[id] - Update sign
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || !["admin", "staff"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signId = parseInt(params.id);
    const body = await request.json();

    // Check if sign exists
    const [existingSign] = await db
      .select()
      .from(trafficSigns)
      .where(eq(trafficSigns.id, signId))
      .limit(1);

    if (!existingSign) {
      return NextResponse.json({ error: "Sign not found" }, { status: 404 });
    }

    // Staff can only edit their own pending/rejected signs
    if (session.role === "staff") {
      if (existingSign.createdBy !== session.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (!["pending", "rejected"].includes(existingSign.status)) {
        return NextResponse.json(
          { error: "Cannot edit approved signs" },
          { status: 403 }
        );
      }
    }

    const [updatedSign] = await db
      .update(trafficSigns)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(trafficSigns.id, signId))
      .returning();

    return NextResponse.json({ sign: updatedSign });
  } catch (error) {
    console.error("Error updating traffic sign:", error);
    return NextResponse.json(
      { error: "Failed to update traffic sign" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/traffic-signs/[id] - Delete sign (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const signId = parseInt(params.id);

    await db.delete(trafficSigns).where(eq(trafficSigns.id, signId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting traffic sign:", error);
    return NextResponse.json(
      { error: "Failed to delete traffic sign" },
      { status: 500 }
    );
  }
}
