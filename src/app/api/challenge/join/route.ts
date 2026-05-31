import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { liveSessions, sessionParticipants } from "@/db/schema/quizzes";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { rateLimit, getClientIP, createRateLimitResponse } from "@/lib/simple-rate-limit";

/**
 * POST /api/challenge/join
 * 
 * Allows a student to join a challenge session using a room code.
 * Validates participant limit and session status.
 * 
 * Requirements validated: 28.2
 */
export async function POST(request: NextRequest) {
  try {
    // 0. Apply rate limiting (5 attempts per minute per IP)
    const ip = getClientIP(request);
    const limit = rateLimit(`join:${ip}`, 5, 60000);
    if (!limit.success) {
      return createRateLimitResponse(limit.resetTime);
    }

    // 1. Authenticate user
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to join a challenge session" },
        { status: 401 }
      );
    }

    const studentId = session.id;

    // 2. Parse request body
    const body = await request.json();
    const { roomCode } = body;

    // 3. Validate required fields
    if (!roomCode) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "roomCode is required",
        },
        { status: 400 }
      );
    }

    // 4. Find the challenge session by room code
    const [challengeSession] = await db
      .select()
      .from(liveSessions)
      .where(eq(liveSessions.roomCode, roomCode.toUpperCase()));

    if (!challengeSession) {
      return NextResponse.json(
        {
          error: "Not Found",
          message: "Challenge session not found with the provided room code",
        },
        { status: 404 }
      );
    }

    // 5. Check if session is in waiting status
    if (challengeSession.status !== "waiting") {
      return NextResponse.json(
        {
          error: "Conflict",
          message: `Cannot join session. Session is ${challengeSession.status}`,
        },
        { status: 409 }
      );
    }

    // 6. Check if student is already a participant
    const [existingParticipant] = await db
      .select()
      .from(sessionParticipants)
      .where(
        and(
          eq(sessionParticipants.sessionId, challengeSession.id),
          eq(sessionParticipants.studentId, studentId)
        )
      );

    if (existingParticipant) {
      // Student already joined, return session info
      return NextResponse.json({
        sessionId: challengeSession.id,
        status: challengeSession.status,
        participantCount: await getParticipantCount(challengeSession.id),
        message: "You have already joined this session",
      });
    }

    // 7. Check participant limit
    const currentParticipantCount = await getParticipantCount(challengeSession.id);
    
    if (currentParticipantCount >= challengeSession.maxStudents) {
      return NextResponse.json(
        {
          error: "Conflict",
          message: `Session is full. Maximum ${challengeSession.maxStudents} participants allowed`,
        },
        { status: 409 }
      );
    }

    // 8. Add student as participant
    await db.insert(sessionParticipants).values({
      sessionId: challengeSession.id,
      studentId,
      score: 0,
    });

    // 9. Return session details
    return NextResponse.json({
      sessionId: challengeSession.id,
      status: challengeSession.status,
      participantCount: currentParticipantCount + 1,
      maxStudents: challengeSession.maxStudents,
      categoryId: challengeSession.categoryId,
    });
  } catch (error) {
    console.error("Error joining challenge session:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while joining the challenge session",
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get participant count for a session
 */
async function getParticipantCount(sessionId: number): Promise<number> {
  const participants = await db
    .select()
    .from(sessionParticipants)
    .where(eq(sessionParticipants.sessionId, sessionId));
  
  return participants.length;
}
