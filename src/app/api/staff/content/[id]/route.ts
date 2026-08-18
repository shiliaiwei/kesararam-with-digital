import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentItems, staffActivityMetrics } from "@/db/schema/content";
import { users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET /api/staff/content/[id] - Get single content item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const contentId = parseInt(id);

    const [content] = await db
      .select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.id, contentId),
          eq(contentItems.createdBy, session.id)
        )
      );

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// PUT /api/staff/content/[id] - Update own content (pending/rejected only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const contentId = parseInt(id);

    // Check if content exists and belongs to staff
    const [existing] = await db
      .select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.id, contentId),
          eq(contentItems.createdBy, session.id)
        )
      );

    if (!existing) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Staff can only edit pending or rejected content
    if (existing.status !== "pending" && existing.status !== "rejected") {
      return NextResponse.json(
        { error: "Cannot edit approved or inactive content" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      titleEn,
      titleKm,
      descriptionEn,
      descriptionKm,
      imageUrl,
      audioUrlEn,
      audioUrlKm,
      questionEn,
      questionKm,
      answerEn,
      answerKm,
      scorePoints,
      timeLimit,
      difficulty,
      subtopic,
      sortOrder,
      videoUrl,
      logoUrl,
      brandUrl,
      resourceType,
      tags,
      metadata,
    } = body;

    // Update content
    const [updated] = await db
      .update(contentItems)
      .set({
        titleEn: titleEn ?? existing.titleEn,
        titleKm: titleKm ?? existing.titleKm,
        descriptionEn: descriptionEn ?? existing.descriptionEn,
        descriptionKm: descriptionKm ?? existing.descriptionKm,
        imageUrl: imageUrl ?? existing.imageUrl,
        audioUrlEn: audioUrlEn ?? existing.audioUrlEn,
        audioUrlKm: audioUrlKm ?? existing.audioUrlKm,
        questionEn: questionEn ?? existing.questionEn,
        questionKm: questionKm ?? existing.questionKm,
        answerEn: answerEn ?? existing.answerEn,
        answerKm: answerKm ?? existing.answerKm,
        scorePoints: scorePoints ?? existing.scorePoints,
        timeLimit: timeLimit ?? existing.timeLimit,
        difficulty: difficulty ?? existing.difficulty,
        subtopic: subtopic ?? existing.subtopic,
        sortOrder: sortOrder ?? existing.sortOrder,
        status: "pending", // Reset to pending after edit
        updatedAt: new Date(),
      })
      .where(eq(contentItems.id, contentId))
      .returning();

    // Log activity
    await db.insert(staffActivityMetrics).values({
      staffId: session.id,
      actionType: "update",
      contentId,
      categoryId: existing.categoryId,
      metadata: JSON.stringify({ titleEn: updated.titleEn }),
    });

    return NextResponse.json({ content: updated });
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}

// DELETE /api/staff/content/[id] - Delete own pending content
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const contentId = parseInt(id);

    // Check if content exists and belongs to staff
    const [existing] = await db
      .select()
      .from(contentItems)
      .where(
        and(
          eq(contentItems.id, contentId),
          eq(contentItems.createdBy, session.id)
        )
      );

    if (!existing) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    // Staff can only delete pending content
    if (existing.status !== "pending") {
      return NextResponse.json(
        { error: "Can only delete pending content" },
        { status: 403 }
      );
    }

    // Check if inserted by staff and approved by admin
    if (existing.createdBy) {
      const creator = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, existing.createdBy))
        .then((r) => r[0]);

      if (
        creator?.role === "staff" &&
        ((existing.status as string) === "approved" || existing.approvedBy !== null)
      ) {
        return NextResponse.json(
          { error: "Cannot delete content created by staff and approved by admin" },
          { status: 400 }
        );
      }
    }

    // Delete content
    await db.delete(contentItems).where(eq(contentItems.id, contentId));

    // Log activity
    await db.insert(staffActivityMetrics).values({
      staffId: session.id,
      actionType: "delete",
      contentId,
      categoryId: existing.categoryId,
      metadata: JSON.stringify({ titleEn: existing.titleEn }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting content:", error);
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 }
    );
  }
}
