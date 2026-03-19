import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leaderboardEntries } from "@/db/schema/quizzes";
import { users } from "@/db/schema/users";
import { getSession } from "@/lib/auth";
import { eq, and, isNull, desc } from "drizzle-orm";
import { getPeriodStart, type RankingPeriod } from "@/lib/ranking";

/**
 * GET /api/leaderboard
 * 
 * Returns ranked list of students with scores for a specific period and category.
 * Supports filtering by categoryId and period (weekly, monthly, all-time).
 * 
 * Query params:
 * - categoryId: number (optional) - Filter by category, omit for overall rankings
 * - period: 'weekly' | 'monthly' | 'all-time' (optional, default: 'all-time')
 * - limit: number (optional, default: 100) - Maximum number of entries to return
 * 
 * Requirements validated: 17.3, 17.5
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to view leaderboards" },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const categoryIdParam = searchParams.get("categoryId");
    const periodParam = searchParams.get("period") || "all-time";
    const limitParam = searchParams.get("limit") || "100";

    // Validate period
    const validPeriods: RankingPeriod[] = ["weekly", "monthly", "all-time"];
    if (!validPeriods.includes(periodParam as RankingPeriod)) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid period. Must be 'weekly', 'monthly', or 'all-time'",
        },
        { status: 400 }
      );
    }

    const period = periodParam as RankingPeriod;
    const limit = parseInt(limitParam);
    const categoryId = categoryIdParam ? parseInt(categoryIdParam) : null;

    if (isNaN(limit) || limit < 1 || limit > 1000) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid limit. Must be between 1 and 1000",
        },
        { status: 400 }
      );
    }

    if (categoryIdParam && isNaN(categoryId as number)) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid categoryId",
        },
        { status: 400 }
      );
    }

    // 3. Get period start date
    const periodStart = getPeriodStart(period);

    // 4. Build where conditions
    const conditions = [
      eq(leaderboardEntries.period, period),
      eq(leaderboardEntries.periodStart, periodStart),
    ];

    // Handle categoryId which can be null for overall rankings
    if (categoryId === null) {
      conditions.push(isNull(leaderboardEntries.categoryId));
    } else {
      conditions.push(eq(leaderboardEntries.categoryId, categoryId));
    }

    // 5. Query leaderboard entries with user information
    const entries = await db
      .select({
        id: leaderboardEntries.id,
        studentId: leaderboardEntries.studentId,
        categoryId: leaderboardEntries.categoryId,
        score: leaderboardEntries.score,
        correctAnswers: leaderboardEntries.correctAnswers,
        totalAttempts: leaderboardEntries.totalAttempts,
        rank: leaderboardEntries.rank,
        updatedAt: leaderboardEntries.updatedAt,
        displayName: users.displayName,
        username: users.username,
        avatar: users.avatar,
      })
      .from(leaderboardEntries)
      .leftJoin(users, eq(leaderboardEntries.studentId, users.id))
      .where(and(...conditions))
      .orderBy(desc(leaderboardEntries.rank))
      .limit(limit);

    // 6. Format response
    const rankings = entries.map((entry) => ({
      rank: entry.rank,
      studentId: entry.studentId,
      displayName: entry.displayName || entry.username || "Unknown User",
      avatar: entry.avatar,
      score: entry.score,
      correctAnswers: entry.correctAnswers,
      totalAttempts: entry.totalAttempts,
      updatedAt: entry.updatedAt,
    }));

    return NextResponse.json({
      period,
      categoryId,
      periodStart,
      totalEntries: rankings.length,
      rankings,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while fetching the leaderboard",
      },
      { status: 500 }
    );
  }
}
