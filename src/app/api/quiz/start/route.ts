import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quizAttempts } from "@/db/schema/quizzes";
import { selectQuestions } from "@/lib/fair-algorithm";
import { getSession } from "@/lib/auth";

/**
 * POST /api/quiz/start
 * 
 * Starts a new quiz session using the Fair Algorithm for question selection.
 * Creates a quiz_attempts record and returns selected questions.
 * 
 * Requirements validated: 13.1, 14.1, 16.1
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to start a quiz" },
        { status: 401 }
      );
    }

    const userId = session.id;

    // 2. Parse request body
    const body = await request.json();
    const { categoryId, mode, difficulty, questionCount } = body;

    // 3. Validate required fields
    if (!categoryId || !mode || !questionCount) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Missing required fields: categoryId, mode, and questionCount are required",
        },
        { status: 400 }
      );
    }

    // 4. Validate mode
    const validModes = ["quiz", "practice_test", "challenge"];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: `Invalid mode. Must be one of: ${validModes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // 5. Validate difficulty if provided
    if (difficulty) {
      const validDifficulties = ["beginner", "intermediate", "advanced"];
      if (!validDifficulties.includes(difficulty)) {
        return NextResponse.json(
          {
            error: "Validation Error",
            message: `Invalid difficulty. Must be one of: ${validDifficulties.join(", ")}`,
          },
          { status: 400 }
        );
      }
    }

    // 6. Use Fair Algorithm to select questions
    let questions;
    try {
      questions = await selectQuestions({
        categoryId: parseInt(categoryId),
        questionCount: parseInt(questionCount),
        difficulty: difficulty as "beginner" | "intermediate" | "advanced" | undefined,
        userId,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("No available questions")) {
        return NextResponse.json(
          {
            error: "Insufficient Questions",
            message: "Not enough questions available for the specified criteria. Please try a different category or difficulty level.",
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // 7. Create quiz_attempts record with initial data
    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        userId,
        categoryId: parseInt(categoryId),
        mode,
        totalQuestions: questions.length,
        correctAnswers: 0,
        score: 0,
        percentage: 0,
        timeSpent: 0,
      })
      .returning();

    // 8. Return attemptId and selected questions
    return NextResponse.json({
      attemptId: attempt.id,
      questions: questions.map((q) => ({
        id: q.id,
        questionEn: q.questionEn,
        questionKm: q.questionKm,
        answerEn: q.answerEn,
        answerKm: q.answerKm,
        imageUrl: q.imageUrl,
        audioUrlEn: q.audioUrlEn,
        audioUrlKm: q.audioUrlKm,
        scorePoints: q.scorePoints,
        timeLimit: q.timeLimit,
        difficulty: q.difficulty,
        subtopic: q.subtopic,
      })),
    });
  } catch (error) {
    console.error("Error starting quiz:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while starting the quiz",
      },
      { status: 500 }
    );
  }
}
