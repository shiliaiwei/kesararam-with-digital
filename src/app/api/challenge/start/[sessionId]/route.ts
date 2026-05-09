import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions } from "@/db/schema/quizzes";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { selectQuestions } from "@/lib/fair-algorithm";

/**
 * POST /api/challenge/start/[sessionId]
 * 
 * Starts a challenge session by changing status to 'active' and selecting questions.
 * Only the session creator (teacher) can start the session.
 * 
 * Requirements validated: 28.4
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to start a challenge session" },
        { status: 401 }
      );
    }

    // 2. Get sessionId from params
    const { sessionId } = await params;
    const sessionIdNum = parseInt(sessionId);

    if (isNaN(sessionIdNum)) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid session ID",
        },
        { status: 400 }
      );
    }

    // 3. Find the challenge session
    const [challengeSession] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionIdNum));

    if (!challengeSession) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Challenge session not found",
        },
        { status: 404 }
      );
    }

    // 4. Verify user is the session creator
    if (challengeSession.teacherId !== session.id) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Only the session creator can start the session",
        },
        { status: 403 }
      );
    }

    // 5. Check if session is in waiting status
    if (challengeSession.status !== "waiting") {
      return NextResponse.json(
        {
          error: "Conflict",
          message: `Cannot start session. Session is already ${challengeSession.status}`,
        },
        { status: 409 }
      );
    }

    // 6. Parse request body for question configuration
    const body = await request.json();
    const { questionCount = 10, difficulty } = body;

    // 7. Validate categoryId exists
    if (!challengeSession.categoryId) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Session does not have a category assigned",
        },
        { status: 400 }
      );
    }

    // 8. Use Fair Algorithm to select questions
    // For challenge mode, we use the first participant as the user context
    // or default to the teacher if no participants yet
    let questions;
    try {
      questions = await selectQuestions({
        categoryId: challengeSession.categoryId,
        questionCount: parseInt(questionCount),
        difficulty: difficulty as "beginner" | "intermediate" | "advanced" | undefined,
        userId: challengeSession.teacherId, // Use teacher's history for question selection
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("No available questions")) {
        return NextResponse.json(
          {
            error: "Insufficient Questions",
            message: "Not enough questions available for the specified criteria",
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // 9. Update session status to 'active' and set startedAt
    await db
      .update(sessions)
      .set({
        status: "active",
        startedAt: new Date(),
      })
      .where(eq(sessions.id, sessionIdNum));

    // 10. Return questions and session details
    return NextResponse.json({
      sessionId: challengeSession.id,
      status: "active",
      startedAt: new Date(),
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
    console.error("Error starting challenge session:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while starting the challenge session",
      },
      { status: 500 }
    );
  }
}
