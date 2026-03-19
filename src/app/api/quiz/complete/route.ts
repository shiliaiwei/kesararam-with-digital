import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizAnswers, quizAttempts, leaderboardEntries } from "@/db/schema/quizzes";
import { userProgress } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { eq, and, sql } from "drizzle-orm";

/**
 * POST /api/quiz/complete
 * 
 * Completes a quiz session, calculates final score and statistics,
 * updates user progress, and updates leaderboard entries.
 * 
 * Requirements validated: 13.4, 13.5, 18.1, 26.3
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to complete a quiz" },
        { status: 401 }
      );
    }

    const userId = session.id;

    // 2. Parse request body
    const body = await request.json();
    const { attemptId } = body;

    // 3. Validate required fields
    if (!attemptId) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Missing required field: attemptId",
        },
        { status: 400 }
      );
    }

    // 4. Verify quiz attempt belongs to user
    const [attempt] = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.id, parseInt(attemptId)));

    if (!attempt) {
      return NextResponse.json(
        { error: "Not Found", message: "Quiz attempt not found" },
        { status: 404 }
      );
    }

    if (attempt.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden", message: "You can only complete your own quizzes" },
        { status: 403 }
      );
    }

    // 5. Get all answers for this attempt
    const answers = await db
      .select()
      .from(quizAnswers)
      .where(eq(quizAnswers.attemptId, parseInt(attemptId)));

    // 6. Calculate total score and statistics
    const totalScore = answers.reduce((sum, answer) => sum + answer.points, 0);
    const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
    const totalQuestions = attempt.totalQuestions;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const totalTimeSpent = answers.reduce((sum, answer) => sum + (answer.timeSpent || 0), 0);

    // 7. Update quiz_attempts record with final results
    await db
      .update(quizAttempts)
      .set({
        score: totalScore,
        correctAnswers,
        percentage,
        timeSpent: totalTimeSpent,
      })
      .where(eq(quizAttempts.id, parseInt(attemptId)));

    // 8. Update user_progress for completed content items (correct answers)
    const correctContentIds = answers
      .filter((answer) => answer.isCorrect)
      .map((answer) => answer.contentId);

    for (const contentId of correctContentIds) {
      // Check if progress record exists
      const [existingProgress] = await db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.contentId, contentId)
          )
        );

      if (existingProgress) {
        // Update existing progress
        await db
          .update(userProgress)
          .set({
            completed: true,
            lastViewedAt: new Date(),
          })
          .where(eq(userProgress.id, existingProgress.id));
      } else {
        // Create new progress record
        await db.insert(userProgress).values({
          userId,
          contentId,
          completed: true,
          lastViewedAt: new Date(),
        });
      }
    }

    // 9. Update leaderboard entries
    await updateLeaderboards(userId, attempt.categoryId, totalScore, correctAnswers);

    // 10. Prepare detailed breakdown
    const breakdown = answers.map((answer) => ({
      contentId: answer.contentId,
      isCorrect: answer.isCorrect,
      points: answer.points,
      timeSpent: answer.timeSpent,
    }));

    // 11. Return detailed results
    return NextResponse.json({
      score: totalScore,
      percentage,
      correctAnswers,
      totalQuestions,
      timeSpent: totalTimeSpent,
      breakdown,
    });
  } catch (error) {
    console.error("Error completing quiz:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while completing the quiz",
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to update leaderboard entries for all periods
 */
async function updateLeaderboards(
  userId: number,
  categoryId: number | null,
  scoreChange: number,
  correctAnswersChange: number
) {
  const periods: Array<"weekly" | "monthly" | "all-time"> = ["weekly", "monthly", "all-time"];

  for (const period of periods) {
    const periodStart = getPeriodStart(period);

    // Check if entry exists
    const [existingEntry] = await db
      .select()
      .from(leaderboardEntries)
      .where(
        and(
          eq(leaderboardEntries.studentId, userId),
          categoryId !== null
            ? eq(leaderboardEntries.categoryId, categoryId)
            : sql`${leaderboardEntries.categoryId} IS NULL`,
          eq(leaderboardEntries.period, period),
          eq(leaderboardEntries.periodStart, periodStart)
        )
      );

    if (existingEntry) {
      // Update existing entry
      await db
        .update(leaderboardEntries)
        .set({
          score: existingEntry.score + scoreChange,
          correctAnswers: existingEntry.correctAnswers + correctAnswersChange,
          totalAttempts: existingEntry.totalAttempts + 1,
          updatedAt: new Date(),
        })
        .where(eq(leaderboardEntries.id, existingEntry.id));
    } else {
      // Create new entry
      await db.insert(leaderboardEntries).values({
        studentId: userId,
        categoryId: categoryId,
        score: scoreChange,
        correctAnswers: correctAnswersChange,
        totalAttempts: 1,
        period,
        periodStart,
      });
    }

    // Recalculate ranks for this period/category
    await recalculateRanks(categoryId, period, periodStart);
  }
}

/**
 * Helper function to get period start date
 */
function getPeriodStart(period: "weekly" | "monthly" | "all-time"): string {
  const now = new Date();

  if (period === "weekly") {
    const day = now.getDay();
    const diff = now.getDate() - day;
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart.toISOString().split("T")[0];
  }

  if (period === "monthly") {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return monthStart.toISOString().split("T")[0];
  }

  // all-time uses epoch
  return "1970-01-01";
}

/**
 * Helper function to recalculate ranks for a leaderboard
 */
async function recalculateRanks(
  categoryId: number | null,
  period: string,
  periodStart: string
) {
  // Get all entries for this leaderboard, ordered by score and correct answers
  const entries = await db
    .select()
    .from(leaderboardEntries)
    .where(
      and(
        categoryId !== null
          ? eq(leaderboardEntries.categoryId, categoryId)
          : sql`${leaderboardEntries.categoryId} IS NULL`,
        eq(leaderboardEntries.period, period),
        eq(leaderboardEntries.periodStart, periodStart)
      )
    )
    .orderBy(
      sql`${leaderboardEntries.score} DESC`,
      sql`${leaderboardEntries.correctAnswers} DESC`,
      sql`${leaderboardEntries.updatedAt} ASC`
    );

  // Update ranks
  for (let i = 0; i < entries.length; i++) {
    await db
      .update(leaderboardEntries)
      .set({ rank: i + 1 })
      .where(eq(leaderboardEntries.id, entries[i].id));
  }
}
