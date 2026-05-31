import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProgress, contentItems, categories } from "@/db/schema/content";
import { quizAttempts } from "@/db/schema/quizzes";
import { getSession } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // 1. Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = await params;
    const targetUserId = parseInt(userId);
    
    // 2. Check authorization: user can view own progress, admin can view all
    if (session.id !== targetUserId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Get categoryId filter from query params
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    // 4. Calculate completion statistics by category
    const progressQuery = db
      .select({
        categoryId: contentItems.categoryId,
        categorySlug: categories.slug,
        categoryTitleEn: categories.titleEn,
        categoryTitleKm: categories.titleKm,
        totalItems: sql<number>`COUNT(DISTINCT ${contentItems.id})`,
        completedItems: sql<number>`COUNT(DISTINCT CASE WHEN ${userProgress.completed} = true THEN ${contentItems.id} END)`,
      })
      .from(contentItems)
      .leftJoin(
        userProgress,
        and(
          eq(userProgress.contentId, contentItems.id),
          eq(userProgress.userId, targetUserId)
        )
      )
      .innerJoin(categories, eq(contentItems.categoryId, categories.id))
      .where(
        and(
          eq(contentItems.status, "active"),
          eq(contentItems.isActive, true),
          categoryId ? eq(contentItems.categoryId, parseInt(categoryId)) : undefined
        )
      )
      .groupBy(
        contentItems.categoryId,
        categories.slug,
        categories.titleEn,
        categories.titleKm
      );

    const progressData = await progressQuery;

    // 5. Calculate average scores by category
    const scoresQuery = db
      .select({
        categoryId: quizAttempts.categoryId,
        averageScore: sql<number>`AVG(${quizAttempts.percentage})`,
        totalAttempts: sql<number>`COUNT(${quizAttempts.id})`,
      })
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.userId, targetUserId),
          categoryId ? eq(quizAttempts.categoryId, parseInt(categoryId)) : undefined
        )
      )
      .groupBy(quizAttempts.categoryId);

    const scoresData = await scoresQuery;

    // 6. Merge progress and scores data
    const result = progressData.map((progress) => {
      const scores = scoresData.find((s) => s.categoryId === progress.categoryId);
      const completionPercentage = progress.totalItems > 0
        ? Math.floor((progress.completedItems / progress.totalItems) * 100)
        : 0;

      return {
        categoryId: progress.categoryId,
        categorySlug: progress.categorySlug,
        categoryTitleEn: progress.categoryTitleEn,
        categoryTitleKm: progress.categoryTitleKm,
        totalItems: progress.totalItems,
        completedItems: progress.completedItems,
        completionPercentage,
        averageScore: scores ? Math.round(scores.averageScore) : 0,
        totalAttempts: scores ? scores.totalAttempts : 0,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
