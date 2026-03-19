import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contentItems, contentApprovals, auditLogs } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(
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

    // Check role - only admin can approve content
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
    const body = await request.json().catch(() => ({}));
    const comments = body.comments || null;

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

    // Update content status to 'active'
    const updatedContent = await db
      .update(contentItems)
      .set({
        status: "active",
        approvedBy: session.id,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contentItems.id, contentIdNum))
      .returning();

    // Create content_approvals record
    await db.insert(contentApprovals).values({
      contentId: contentIdNum,
      adminId: session.id,
      action: "approved",
      comments,
    });

    // Create audit log entry
    await db.insert(auditLogs).values({
      userId: session.id,
      action: "content_approved",
      entityType: "content_item",
      entityId: contentIdNum,
      details: JSON.stringify({
        contentId: contentIdNum,
        comments,
      }),
    });

    return NextResponse.json(updatedContent[0]);
  } catch (error) {
    console.error("Error approving content:", error);
    return NextResponse.json(
      { error: "Failed to approve content" },
      { status: 500 }
    );
  }
}
