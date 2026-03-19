import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leaderboardEntries } from "@/db/schema/quizzes";
import { users } from "@/db/schema/users";
import { getSession } from "@/lib/auth";
import { eq, and, isNull } from "drizzle-orm";
import { getPeriodStart, type RankingPeriod } from "@/lib/ranking";

/**
 * GET /api/leaderboard/user/[userId]
 * 
 * Returns a specific user's rank and score for a given period and category.
 * 
 * Query params:
 * - categoryId: number (optional) - Filter by category, omit for overall rankings
 * - period: 'weekly' | 'monthly' | 'all-time' (optional, default: 'all-time')
 * 
 * Requirements validated: 17.4
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to view rankings" },
        { status: 401 }
      );
    }

    // 2. Get userId from params
    const { userId } = await params;
    const userIdNum = parseInt(userId);

    if (isNaN(userIdNum)) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    // 3. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const categoryIdParam = searchParams.get("categoryId");
    const periodParam = searchParams.get("period") || "all-time";

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
    const categoryId = categoryIdParam ? parseInt(categoryIdParam) : null;

    if (categoryIdParam && isNaN(categoryId as number)) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid categoryId",
        },
        { status: 400 }
      );
    }

    // 4. Get period start date
    const periodStart = getPeriodStart(period);

    // 5. Build where conditions
    const conditions = [
      eq(leaderboardEntries.studentId, userIdNum),
      eq(leaderboardEntries.period, period),
      eq(leaderboardEntries.periodStart, periodStart),
    ];

    // Handle categoryId which can be null for overall rankings
    if (categoryId === null) {
      conditions.push(isNull(leaderboardEntries.categoryId));
    } else {
      conditions.push(eq(leaderboardEntries.categoryId, categoryId));
    }

    // 6. Query user's leaderboard entry
    const [entry] = await db
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
      .where(and(...conditions));

    // 7. If no entry found, user has no ranking for this period/category
    if (!entry) {
      return NextResponse.json({
        period,
        categoryId,
        periodStart,
        hasRanking: false,
        message: "User has no ranking for this period and category",
      });
    }

    // 8. Return user's ranking information
    return NextResponse.json({
      period,
      categoryId,
      periodStart,
      hasRanking: true,
      ranking: {
        rank: entry.rank,
        studentId: entry.studentId,
        displayName: entry.displayName || entry.username || "Unknown User",
        avatar: entry.avatar,
        score: entry.score,
        correctAnswers: entry.correctAnswers,
        totalAttempts: entry.totalAttempts,
        updatedAt: entry.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user ranking:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while fetching user ranking",
      },
      { status: 500 }
    );
  }
}
