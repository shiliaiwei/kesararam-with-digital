import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contentItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// PUT /api/admin/content/[id] - Update content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !["admin", "staff"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const contentId = parseInt(id);
    const body = await request.json();

    // Check if content exists
    const [existingContent] = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, contentId))
      .limit(1);

    if (!existingContent) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Staff can only edit their own pending/rejected content
    if (session.role === "staff") {
      if (existingContent.createdBy !== session.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      if (!["pending", "rejected"].includes(existingContent.status)) {
        return NextResponse.json(
          { error: "Cannot edit approved content" },
          { status: 403 }
        );
      }
    }

    // Update title and description from question/answer if provided
    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    };

    if (body.questionEn) {
      updateData.titleEn = body.questionEn.substring(0, 100);
    }
    if (body.questionKm) {
      updateData.titleKm = body.questionKm.substring(0, 100);
    }
    if (body.answerEn) {
      updateData.descriptionEn = body.answerEn.substring(0, 200);
    }
    if (body.answerKm) {
      updateData.descriptionKm = body.answerKm.substring(0, 200);
    }

    const [updatedContent] = await db
      .update(contentItems)
      .set(updateData)
      .where(eq(contentItems.id, contentId))
      .returning();

    return NextResponse.json({ content: updatedContent });
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/content/[id] - Delete content (admin only)
export async function DELETE(
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

    await db.delete(contentItems).where(eq(contentItems.id, contentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 }
    );
  }
}
