import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizAnswers, quizAttempts } from "@/db/schema/quizzes";
import { userProgress } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { updateRankingsForAllPeriods } from "@/lib/ranking";

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

    // 9. Update leaderboard entries for all periods
    await updateRankingsForAllPeriods(userId, attempt.categoryId, totalScore, correctAnswers);

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
