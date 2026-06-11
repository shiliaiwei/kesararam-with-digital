import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contentItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    const contentId = parseInt(id);

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (isNaN(contentId)) {
      return NextResponse.json(
        { error: "Invalid content ID" },
        { status: 400 }
      );
    }

    // Fetch existing content
    const existing = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, contentId))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json(
        { error: "Content not found" },
        { status: 404 }
      );
    }

    const content = existing[0];

    // Check permissions
    // Creator can edit pending content
    // Admin can edit any content
    if (session.role === "admin") {
      // Admin can edit anything
    } else if (session.role === "staff") {
      if (content.createdBy !== session.id) {
        return NextResponse.json(
          { error: "Forbidden - you can only edit your own content" },
          { status: 403 }
        );
      }
      if (content.status !== "pending") {
        return NextResponse.json(
          { error: "Forbidden - you can only edit pending content" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Forbidden - insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Only allow certain fields to be updated
    const allowedFields = [
      "categoryId",
      "type",
      "titleEn",
      "titleKm",
      "descriptionEn",
      "descriptionKm",
      "questionEn",
      "questionKm",
      "answerEn",
      "answerKm",
      "imageUrl",
      "audioUrlEn",
      "audioUrlKm",
      "scorePoints",
      "timeLimit",
      "difficulty",
      "subtopic",
      "sortOrder",
    ];

    // Admin can also update status and isActive
    if (session.role === "admin") {
      allowedFields.push("status", "isActive");
    }

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Update content
    const updated = await db
      .update(contentItems)
      .set(updateData)
      .where(eq(contentItems.id, contentId))
      .returning();

    // TODO: Create audit log entry

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}
