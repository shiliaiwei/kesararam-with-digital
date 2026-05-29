import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { liveSessions, sessionParticipants, sessionAnswers } from "@/db/schema/quizzes";
import { contentItems } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/challenge/answer
 * 
 * Records a participant's answer in a challenge session.
 * Calculates points with time bonus and updates participant score.
 * 
 * Requirements validated: 15.3
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to submit an answer" },
        { status: 401 }
      );
    }

    const studentId = session.id;

    // 2. Parse request body
    const body = await request.json();
    const { sessionId, contentId, answer, timeSpent } = body;

    // 3. Validate required fields
    if (!sessionId || !contentId || answer === undefined || timeSpent === undefined) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "sessionId, contentId, answer, and timeSpent are required",
        },
        { status: 400 }
      );
    }

    // 4. Find the challenge session
    const [challengeSession] = await db
      .select()
      .from(liveSessions)
      .where(eq(liveSessions.id, parseInt(sessionId)));

    if (!challengeSession) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Challenge session not found",
        },
        { status: 404 }
      );
    }

    // 5. Check if session is active
    if (challengeSession.status !== "active") {
      return NextResponse.json(
        {
          error: "Conflict",
          message: `Cannot submit answer. Session is ${challengeSession.status}`,
        },
        { status: 409 }
      );
    }

    // 6. Verify user is a participant
    const [participant] = await db
      .select()
      .from(sessionParticipants)
      .where(
        and(
          eq(sessionParticipants.sessionId, parseInt(sessionId)),
          eq(sessionParticipants.studentId, studentId)
        )
      );

    if (!participant) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You are not a participant in this session",
        },
        { status: 403 }
      );
    }

    // 7. Get the content item to check correct answer
    const [content] = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, parseInt(contentId)));

    if (!content) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Question not found",
        },
        { status: 404 }
      );
    }

    // 8. Check if answer is correct (case-insensitive comparison)
    const isCorrect = answer.trim().toLowerCase() === content.answerEn.trim().toLowerCase();

    // 9. Calculate points with time bonus
    let points = 0;
    let timeBonus = 0;

    if (isCorrect) {
      const basePoints = content.scorePoints;
      points = basePoints;

      // Calculate time bonus: up to 50% bonus for quick answers
      // Formula: timeBonus = basePoints * (1 - timeSpent/timeLimit) * 0.5
      const timeLimit = content.timeLimit;
      if (timeSpent < timeLimit) {
        const timeRatio = 1 - (timeSpent / timeLimit);
        timeBonus = Math.floor(basePoints * timeRatio * 0.5);
        points += timeBonus;
      }
    }

    // 10. Record the answer
    await db.insert(sessionAnswers).values({
      sessionId: parseInt(sessionId),
      studentId,
      contentId: parseInt(contentId),
      isCorrect,
      points: isCorrect ? content.scorePoints : 0,
      timeBonus,
    });

    // 11. Update participant score
    await db
      .update(sessionParticipants)
      .set({
        score: participant.score + points,
      })
      .where(eq(sessionParticipants.id, participant.id));

    // 12. Get current rank (calculate based on scores)
    const allParticipants = await db
      .select()
      .from(sessionParticipants)
      .where(eq(sessionParticipants.sessionId, parseInt(sessionId)));

    // Sort by score descending
    const sortedParticipants = allParticipants.sort((a, b) => b.score - a.score);
    const currentRank = sortedParticipants.findIndex((p) => p.studentId === studentId) + 1;

    // 13. Return result
    return NextResponse.json({
      isCorrect,
      points: isCorrect ? content.scorePoints : 0,
      timeBonus,
      totalPoints: points,
      currentScore: participant.score + points,
      currentRank,
      correctAnswer: content.answerEn,
    });
  } catch (error) {
    console.error("Error submitting challenge answer:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while submitting the answer",
      },
      { status: 500 }
    );
  }
}
