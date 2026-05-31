import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizAnswers, quizAttempts } from "@/db/schema/quizzes";
import { contentItems } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

/**
 * POST /api/quiz/answer
 * 
 * Submits an answer for a quiz question, validates it, calculates points,
 * and records the answer in the database.
 * 
 * Requirements validated: 13.3, 26.1, 26.2
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to submit answers" },
        { status: 401 }
      );
    }

    const userId = session.id;

    // 2. Parse request body
    const body = await request.json();
    const { attemptId, contentId, answer, timeSpent } = body;

    // 3. Validate required fields
    if (!attemptId || !contentId || answer === undefined) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Missing required fields: attemptId, contentId, and answer are required",
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
        { error: "Forbidden", message: "You can only submit answers for your own quizzes" },
        { status: 403 }
      );
    }

    // 5. Get content item to validate answer
    const [content] = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, parseInt(contentId)));

    if (!content) {
      return NextResponse.json(
        { error: "Not Found", message: "Question not found" },
        { status: 404 }
      );
    }

    // 6. Validate answer (case-insensitive comparison)
    const userAnswer = String(answer).trim().toLowerCase();
    const correctAnswerEn = content.answerEn.trim().toLowerCase();
    const correctAnswerKm = content.answerKm.trim().toLowerCase();
    
    const isCorrect = userAnswer === correctAnswerEn || userAnswer === correctAnswerKm;

    // 7. Calculate points
    let points = 0;
    if (isCorrect) {
      // Base points from content configuration
      points = content.scorePoints;

      // Add time bonus for challenge mode
      if (attempt.mode === "challenge" && timeSpent && content.timeLimit) {
        if (timeSpent < content.timeLimit) {
          const timeRatio = 1 - timeSpent / content.timeLimit;
          const timeBonus = Math.floor(content.scorePoints * timeRatio * 0.5); // Up to 50% bonus
          points += timeBonus;
        }
      }
    }

    // 8. Create quiz_answers record
    const [answerRecord] = await db
      .insert(quizAnswers)
      .values({
        attemptId: parseInt(attemptId),
        contentId: parseInt(contentId),
        isCorrect,
        points,
        timeSpent: timeSpent || null,
      })
      .returning();

    // 9. Return result with correct answer
    return NextResponse.json({
      isCorrect,
      points,
      correctAnswer: content.answerEn, // Return English answer as reference
      correctAnswerKm: content.answerKm,
    });
  } catch (error) {
    console.error("Error submitting quiz answer:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while submitting your answer",
      },
      { status: 500 }
    );
  }
}
