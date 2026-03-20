import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { contentItems, staffActivityMetrics } from "@/db/schema/content";
import { eq, and, desc, sql, or, like } from "drizzle-orm";

// GET /api/staff/content - List staff's own content
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [eq(contentItems.createdBy, session.user.id)];
    
    if (status) {
      conditions.push(eq(contentItems.status, status));
    }
    
    if (categoryId) {
      conditions.push(eq(contentItems.categoryId, parseInt(categoryId)));
    }
    
    if (search) {
      conditions.push(
        or(
          like(contentItems.titleEn, `%${search}%`),
          like(contentItems.titleKm, `%${search}%`),
          like(contentItems.questionEn, `%${search}%`)
        )
      );
    }

    // Fetch content
    const content = await db
      .select()
      .from(contentItems)
      .where(and(...conditions))
      .orderBy(desc(contentItems.updatedAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(contentItems)
      .where(and(...conditions));

    return NextResponse.json({
      content,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// POST /api/staff/content - Create new content
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id || session.user.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      categoryId,
      type,
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

    // Validate required fields
    if (!categoryId || !type || !titleEn) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create content
    const [newContent] = await db
      .insert(contentItems)
      .values({
        categoryId,
        type,
        status: "pending",
        titleEn,
        titleKm: titleKm || "",
        descriptionEn: descriptionEn || "",
        descriptionKm: descriptionKm || "",
        imageUrl,
        audioUrlEn,
        audioUrlKm,
        questionEn: questionEn || "",
        questionKm: questionKm || "",
        answerEn: answerEn || "",
        answerKm: answerKm || "",
        scorePoints: scorePoints || 10,
        timeLimit: timeLimit || 30,
        difficulty,
        subtopic,
        sortOrder: sortOrder || 0,
        isActive: false,
        createdBy: session.user.id,
        videoUrl,
        logoUrl,
        brandUrl,
        resourceType: resourceType || "qa",
        tags: tags || [],
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .returning();

    // Log activity
    await db.insert(staffActivityMetrics).values({
      staffId: session.user.id,
      actionType: "create",
      contentId: newContent.id,
      categoryId,
      metadata: JSON.stringify({ type, titleEn }),
    });

    return NextResponse.json({ content: newContent }, { status: 201 });
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      { error: "Failed to create content" },
      { status: 500 }
    );
  }
}
