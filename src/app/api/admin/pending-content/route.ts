import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contentItems, categories } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check role - only admin can access pending content
    if (session.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - admin access required" },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    // Build query conditions
    const conditions = [eq(contentItems.status, "pending")];
    if (categoryId) {
      conditions.push(eq(contentItems.categoryId, parseInt(categoryId)));
    }

    // Fetch pending content with pagination
    const pendingContent = await db
      .select()
      .from(contentItems)
      .where(and(...conditions))
      .orderBy(desc(contentItems.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalResult = await db
      .select()
      .from(contentItems)
      .where(and(...conditions));
    const total = totalResult.length;

    return NextResponse.json({
      data: pendingContent,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching pending content:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending content" },
      { status: 500 }
    );
  }
}
