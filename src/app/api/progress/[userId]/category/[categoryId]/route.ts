import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProgress, contentItems } from "@/db/schema/content";
import { quizAttempts, quizAnswers } from "@/db/schema/quizzes";
import { getSession } from "@/lib/auth";
import { eq, and, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; categoryId: string }> }
) {
  try {
    // 1. Verify authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, categoryId } = await params;
    const targetUserId = parseInt(userId);
    const categoryIdNum = parseInt(categoryId);

    // 2. Check authorization: user can view own progress, admin can view all
    if (session.id !== targetUserId && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Get completed items with details
    const completedItems = await db
      .select({
        contentId: userProgress.contentId,
        completed: userProgress.completed,
        lastViewedAt: userProgress.lastViewedAt,
        titleEn: contentItems.titleEn,
        titleKm: contentItems.titleKm,
        type: contentItems.type,
        difficulty: contentItems.difficulty,
        subtopic: contentItems.subtopic,
      })
      .from(userProgress)
      .innerJoin(contentItems, eq(userProgress.contentId, contentItems.id))
      .where(
        and(
          eq(userProgress.userId, targetUserId),
          eq(contentItems.categoryId, categoryIdNum),
          eq(userProgress.completed, true)
        )
      )
      .orderBy(desc(userProgress.lastViewedAt));

    // 4. Get quiz attempts for this category
    const attempts = await db
      .select({
        id: quizAttempts.id,
        mode: quizAttempts.mode,
        totalQuestions: quizAttempts.totalQuestions,
        correctAnswers: quizAttempts.correctAnswers,
        score: quizAttempts.score,
        percentage: quizAttempts.percentage,
        timeSpent: quizAttempts.timeSpent,
        completedAt: quizAttempts.completedAt,
      })
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.userId, targetUserId),
          eq(quizAttempts.categoryId, categoryIdNum)
        )
      )
      .orderBy(desc(quizAttempts.completedAt))
      .limit(10);

    // 5. Calculate trends (last 5 attempts)
    const recentAttempts = attempts.slice(0, 5);
    const trend = recentAttempts.length >= 2
      ? recentAttempts[0].percentage - recentAttempts[recentAttempts.length - 1].percentage
      : 0;

    // 6. Get subtopic performance
    const subtopicPerformance = await db
      .select({
        subtopic: contentItems.subtopic,
        totalAnswers: db.$count(quizAnswers.id),
        correctAnswers: db.$count(quizAnswers.id, eq(quizAnswers.isCorrect, true)),
      })
      .from(quizAnswers)
      .innerJoin(quizAttempts, eq(quizAnswers.attemptId, quizAttempts.id))
      .innerJoin(contentItems, eq(quizAnswers.contentId, contentItems.id))
      .where(
        and(
          eq(quizAttempts.userId, targetUserId),
          eq(contentItems.categoryId, categoryIdNum)
        )
      )
      .groupBy(contentItems.subtopic);

    // 7. Calculate overall statistics
    const totalAttempts = attempts.length;
    const averageScore = totalAttempts > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts)
      : 0;

    return NextResponse.json({
      completedItems,
      recentAttempts: attempts,
      statistics: {
        totalAttempts,
        averageScore,
        trend: trend > 0 ? "improving" : trend < 0 ? "declining" : "stable",
        trendPercentage: Math.abs(trend),
      },
      subtopicPerformance: subtopicPerformance.map((sp) => ({
        subtopic: sp.subtopic || "general",
        accuracy: sp.totalAnswers > 0
          ? Math.round((sp.correctAnswers / sp.totalAnswers) * 100)
          : 0,
        totalAnswers: sp.totalAnswers,
      })),
    });
  } catch (error) {
    console.error("Error fetching category progress:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
