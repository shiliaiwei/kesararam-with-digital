import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contentItems, categories } from "@/db/schema";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categorySlug: string }> }
) {
  try {
    const { categorySlug } = await params;
    const session = await getSession();
    const searchParams = request.nextUrl.searchParams;

    // Get pagination params
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Get filter params
    const status = searchParams.get("status");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");

    // Find category by slug
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);

    if (!category.length) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Build query conditions
    const conditions = [eq(contentItems.categoryId, category[0].id)];

    // Students see only active content, Staff/Admin see all
    if (!session || session.role === "student") {
      conditions.push(eq(contentItems.status, "active"));
      conditions.push(eq(contentItems.isActive, true));
    } else if (status) {
      conditions.push(eq(contentItems.status, status));
    }

    // Add difficulty filter
    if (difficulty) {
      conditions.push(eq(contentItems.difficulty, difficulty));
    }

    // Add search filter
    if (search) {
      conditions.push(
        or(
          ilike(contentItems.titleEn, `%${search}%`),
          ilike(contentItems.titleKm, `%${search}%`),
          ilike(contentItems.descriptionEn, `%${search}%`),
          ilike(contentItems.descriptionKm, `%${search}%`)
        )!
      );
    }

    // Fetch content items
    const items = await db
      .select()
      .from(contentItems)
      .where(and(...conditions))
      .orderBy(desc(contentItems.sortOrder), desc(contentItems.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalItems = await db
      .select()
      .from(contentItems)
      .where(and(...conditions));

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total: totalItems.length,
        totalPages: Math.ceil(totalItems.length / limit),
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
