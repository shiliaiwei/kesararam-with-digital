import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sessions, sessionParticipants } from "@/db/schema/quizzes";
import { users } from "@/db/schema/users";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

/**
 * GET /api/challenge/session/[sessionId]
 * 
 * Retrieves challenge session details including participants and current scores.
 * Accessible by session creator and participants.
 * 
 * Requirements validated: 28.3
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // 1. Authenticate user
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be logged in to view session details" },
        { status: 401 }
      );
    }

    const userId = session.id;

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

    // 4. Verify user is either the creator or a participant
    const [participant] = await db
      .select()
      .from(sessionParticipants)
      .where(
        eq(sessionParticipants.sessionId, sessionIdNum)
      );

    const isCreator = challengeSession.teacherId === userId;
    const isParticipant = await db
      .select()
      .from(sessionParticipants)
      .where(eq(sessionParticipants.sessionId, sessionIdNum))
      .then((participants) => participants.some((p) => p.studentId === userId));

    if (!isCreator && !isParticipant) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "You do not have access to this session",
        },
        { status: 403 }
      );
    }

    // 5. Get all participants with user details
    const participants = await db
      .select({
        id: sessionParticipants.id,
        studentId: sessionParticipants.studentId,
        score: sessionParticipants.score,
        rank: sessionParticipants.rank,
        joinedAt: sessionParticipants.joinedAt,
        displayName: users.displayName,
        username: users.username,
        avatar: users.avatar,
      })
      .from(sessionParticipants)
      .leftJoin(users, eq(sessionParticipants.studentId, users.id))
      .where(eq(sessionParticipants.sessionId, sessionIdNum));

    // Sort by score descending for current rankings
    const sortedParticipants = participants.sort((a, b) => b.score - a.score);

    // 6. Get teacher details
    const [teacher] = await db
      .select({
        id: users.id,
        displayName: users.displayName,
        username: users.username,
      })
      .from(users)
      .where(eq(users.id, challengeSession.teacherId));

    // 7. Return session details
    return NextResponse.json({
      sessionId: challengeSession.id,
      roomCode: challengeSession.roomCode,
      status: challengeSession.status,
      categoryId: challengeSession.categoryId,
      challengeType: challengeSession.challengeType,
      level: challengeSession.level,
      maxStudents: challengeSession.maxStudents,
      participantCount: participants.length,
      startedAt: challengeSession.startedAt,
      endedAt: challengeSession.endedAt,
      createdAt: challengeSession.createdAt,
      teacher: teacher
        ? {
            id: teacher.id,
            displayName: teacher.displayName,
            username: teacher.username,
          }
        : null,
      participants: sortedParticipants.map((p, index) => ({
        id: p.id,
        studentId: p.studentId,
        displayName: p.displayName,
        username: p.username,
        avatar: p.avatar,
        score: p.score,
        rank: p.rank || index + 1, // Use stored rank or calculate from position
        joinedAt: p.joinedAt,
      })),
    });
  } catch (error) {
    console.error("Error retrieving challenge session:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred while retrieving the session",
      },
      { status: 500 }
    );
  }
}
