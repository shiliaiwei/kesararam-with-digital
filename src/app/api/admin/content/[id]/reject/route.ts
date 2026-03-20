import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contentItems, contentApprovals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// POST /api/admin/content/[id]/reject - Reject content
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentId = parseInt(params.id);
    const body = await request.json();
    const { reason, comments } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Check if content exists
    const [existingContent] = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, contentId))
      .limit(1);

    if (!existingContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Update content status
    const [updatedContent] = await db
      .update(contentItems)
      .set({
        status: "rejected",
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(contentItems.id, contentId))
      .returning();

    // Create approval record
    await db.insert(contentApprovals).values({
      contentId,
      adminId: session.id,
      action: "rejected",
      comments: comments || reason,
    });

    return NextResponse.json({ content: updatedContent });
  } catch (error) {
    console.error("Error rejecting content:", error);
    return NextResponse.json(
      { error: "Failed to reject content" },
      { status: 500 }
    );
  }
}
