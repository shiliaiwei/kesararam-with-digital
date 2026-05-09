import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contentItems } from "@/db/schema";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role - only staff and admin can create content
    if (session.role !== "staff" && session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = ["categoryId", "type", "titleEn", "titleKm"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Set status to 'pending' for staff users
    const status = session.role === "staff" ? "pending" : body.status || "pending";

    // Create content item
    const newContent = await db
      .insert(contentItems)
      .values({
        categoryId: body.categoryId,
        type: body.type,
        status,
        titleEn: body.titleEn,
        titleKm: body.titleKm,
        descriptionEn: body.descriptionEn || "",
        descriptionKm: body.descriptionKm || "",
        questionEn: body.questionEn || "",
        questionKm: body.questionKm || "",
        answerEn: body.answerEn || "",
        answerKm: body.answerKm || "",
        imageUrl: body.imageUrl,
        audioUrlEn: body.audioUrlEn,
        audioUrlKm: body.audioUrlKm,
        scorePoints: body.scorePoints || 10,
        timeLimit: body.timeLimit || 30,
        difficulty: body.difficulty,
        subtopic: body.subtopic,
        sortOrder: body.sortOrder || 0,
        isActive: false, // New content starts as inactive
        createdBy: session.id,
      })
      .returning();

    // TODO: Create audit log entry

    return NextResponse.json(newContent[0], { status: 201 });
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      { error: "Failed to create content" },
      { status: 500 }
    );
  }
}
