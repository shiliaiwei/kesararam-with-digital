import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { liveSessions, sessionParticipants } from "@/db/schema/quizzes";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { updateRankingsForAllPeriods } from "@/lib/ranking";

/**
 * POST /api/challenge/complete/[sessionId]
 * 
 * Completes a challenge session, calculates final rankings, and updates leaderboards.
 * Only the session creator (teacher) can complete the session.
 * 
 * Requirements validated: 15.4, 17.2
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
        { error: "Unauthorized", message: "You must be logged in to complete a challenge session" },
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
      .from(liveSessions)
      .where(eq(liveSessions.id, sessionIdNum));

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
          message: "Only the session creator can complete the session",
        },
        { status: 403 }
      );
    }

    // 5. Check if session is active
    if (challengeSession.status !== "active") {
      return NextResponse.json(
        {
          error: "Conflict",
          message: `Cannot complete session. Session is ${challengeSession.status}`,
        },
        { status: 409 }
      );
    }

    // 6. Get all participants and calculate final rankings
    const participants = await db
      .select()
      .from(sessionParticipants)
      .where(eq(sessionParticipants.sessionId, sessionIdNum));

    // Sort by score descending
    const sortedParticipants = participants.sort((a, b) => b.score - a.score);

    // 7. Update participant ranks
    for (let i = 0; i < sortedParticipants.length; i++) {
      await db
        .update(sessionParticipants)
        .set({
          rank: i + 1,
        })
        .where(eq(sessionParticipants.id, sortedParticipants[i].id));
    }

    // 8. Update session status to 'completed' and set endedAt
    await db
      .update(liveSessions)
      .set({
        status: "completed",
        endedAt: new Date(),
      })
      .where(eq(liveSessions.id, sessionIdNum));

    // 9. Update leaderboards for each participant (all three periods)
    const categoryId = challengeSession.categoryId;

    for (const participant of sortedParticipants) {
      // Update rankings for all periods (weekly, monthly, all-time)
      // Note: correctAnswers will be calculated from session_answers in a future enhancement
      await updateRankingsForAllPeriods(
        participant.studentId,
        categoryId,
        participant.score,
        0 // correctAnswers - to be calculated from session_answers
      );
    }

    // 10. Return final rankings
    return NextResponse.json({
      sessionId: challengeSession.id,
      status: "completed",
      endedAt: new Date(),
      rankings: sortedParticipants.map((p, index) => ({
        rank: index + 1,
        studentId: p.studentId,
        score: p.score,
      })),
    });
  } catch (error) {
    console.error("Error completing challenge session:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while completing the challenge session",
      },
      { status: 500 }
    );
  }
}
