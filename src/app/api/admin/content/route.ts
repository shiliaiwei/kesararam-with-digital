import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contentItems, users, categories } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// GET /api/admin/content - Admin: Get all content with filters
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["admin", "staff"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const categorySlug = searchParams.get("categorySlug");
    const status = searchParams.get("status");

    // Get category ID from slug
    let categoryId: number | null = null;
    if (categorySlug) {
      const [category] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);
      
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
      categoryId = category.id;
    }

    // Build query
    let query = db
      .select({
        content: contentItems,
        creator: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
      })
      .from(contentItems)
      .leftJoin(users, eq(contentItems.createdBy, users.id))
      .orderBy(desc(contentItems.createdAt));

    const results = await query;

    // Filter results
    let filtered = results;
    if (categoryId) {
      filtered = filtered.filter((r) => r.content.categoryId === categoryId);
    }
    if (status) {
      filtered = filtered.filter((r) => r.content.status === status);
    }

    return NextResponse.json({ content: filtered });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// POST /api/admin/content - Admin/Staff: Create new content
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !["admin", "staff"].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      categoryId,
      questionEn,
      questionKm,
      answerEn,
      answerKm,
      imageUrl,
      audioUrlEn,
      audioUrlKm,
      difficulty,
      subtopic,
      scorePoints,
      timeLimit,
    } = body;

    // Validation
    if (!categoryId || !questionEn || !questionKm || !answerEn || !answerKm) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newContent] = await db
      .insert(contentItems)
      .values({
        categoryId,
        type: "qa",
        status: "pending",
        titleEn: questionEn.substring(0, 100), // Use question as title
        titleKm: questionKm.substring(0, 100),
        descriptionEn: answerEn.substring(0, 200),
        descriptionKm: answerKm.substring(0, 200),
        questionEn,
        questionKm,
        answerEn,
        answerKm,
        imageUrl: imageUrl || null,
        audioUrlEn: audioUrlEn || null,
        audioUrlKm: audioUrlKm || null,
        difficulty: difficulty || "medium",
        subtopic: subtopic || null,
        scorePoints: scorePoints || 10,
        timeLimit: timeLimit || 30,
        isActive: false,
        createdBy: session.id,
      })
      .returning();

    return NextResponse.json({ content: newContent }, { status: 201 });
  } catch (error) {
    console.error("Error creating content:", error);
    return NextResponse.json(
      { error: "Failed to create content" },
      { status: 500 }
    );
  }
}
