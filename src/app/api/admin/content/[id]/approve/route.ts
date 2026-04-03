import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contentItems, contentApprovals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// POST /api/admin/content/[id]/approve - Approve content
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const contentId = parseInt(id);
    const body = await request.json();
    const { comments } = body;

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
        status: "approved",
        isActive: true,
        approvedBy: session.id,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(contentItems.id, contentId))
      .returning();

    // Create approval record
    await db.insert(contentApprovals).values({
      contentId,
      adminId: session.id,
      action: "approved",
      comments: comments || null,
    });

    return NextResponse.json({ content: updatedContent });
  } catch (error) {
    console.error("Error approving content:", error);
    return NextResponse.json(
      { error: "Failed to approve content" },
      { status: 500 }
    );
  }
}
