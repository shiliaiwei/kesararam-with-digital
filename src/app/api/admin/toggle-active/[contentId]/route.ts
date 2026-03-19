import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contentItems, auditLogs } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  try {
    const session = await getSession();

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role - only admin can toggle content active status
    if (session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - admin access required" },
        { status: 403 }
      );
    }

    const { contentId } = await params;
    const contentIdNum = parseInt(contentId);

    if (isNaN(contentIdNum)) {
      return NextResponse.json(
        { error: "Invalid content ID" },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const isActive = body.isActive;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be a boolean value" },
        { status: 400 }
      );
    }

    // Check if content exists
    const existingContent = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, contentIdNum))
      .limit(1);

    if (existingContent.length === 0) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    // Update content isActive flag
    const updatedContent = await db
      .update(contentItems)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(contentItems.id, contentIdNum))
      .returning();

    // Create audit log entry
    await db.insert(auditLogs).values({
      userId: session.id,
      action: isActive ? "content_activated" : "content_deactivated",
      entityType: "content_item",
      entityId: contentIdNum,
      details: JSON.stringify({
        contentId: contentIdNum,
        isActive,
      }),
    });

    return NextResponse.json(updatedContent[0]);
  } catch (error) {
    console.error("Error toggling content active status:", error);
    return NextResponse.json(
      { error: "Failed to toggle content active status" },
      { status: 500 }
    );
  }
}
