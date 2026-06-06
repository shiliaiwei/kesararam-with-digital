import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants } from "@/db/schema/game";
import { users } from "@/db/schema/users";
import { getSession } from "@/lib/auth";
import { broadcastEvent } from "@/lib/realtime-bus";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.role === "student") {
    const [dbUser] = await db
      .select({
        schoolName: users.schoolName,
        province: users.province,
        gradeLevel: users.gradeLevel,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!dbUser || !dbUser.schoolName || !dbUser.province || !dbUser.gradeLevel) {
      return NextResponse.json(
        { error: "Please complete your profile details (School, Province, Grade) before joining a live game. / សូមបំពេញព័ត៌មានគណនីរបស់អ្នក (សាលារៀន ខេត្ត ថ្នាក់ទី) មុននឹងចូលរួមលេងហ្គេមផ្ទាល់។" },
        { status: 403 }
      );
    }
  }

  const body = await req.json().catch(() => ({}));
  const displayName = body.displayName || user.name || "Player";

  const [session] = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.sessionCode, code.toUpperCase()));

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.status === "ended")
    return NextResponse.json({ error: "Session has ended" }, { status: 410 });
  if (session.status === "active")
    return NextResponse.json({ error: "Game already started — late join not allowed" }, { status: 403 });

  const existing = await db
    .select()
    .from(gameParticipants)
    .where(eq(gameParticipants.sessionId, session.id));

  if (existing.length >= (session.maxPlayers ?? 50))
    return NextResponse.json({ error: `Session is full (max ${session.maxPlayers ?? 50} players)` }, { status: 409 });

  const alreadyIn = existing.find((p) => p.userId === user.id);
  let participant;

  if (alreadyIn) {
    const updated = await db
      .update(gameParticipants)
      .set({ isConnected: true, lastSeenAt: new Date() })
      .where(
        and(
          eq(gameParticipants.sessionId, session.id),
          eq(gameParticipants.userId, user.id)
        )
      )
      .returning();
    participant = updated[0] || alreadyIn;
  } else {
    const inserted = await db
      .insert(gameParticipants)
      .values({
        sessionId: session.id,
        userId: user.id,
        displayName,
        avatar: user.avatar ?? null,
        totalScore: 0,
        correctAnswers: 0,
        currentStreak: 0,
        isConnected: true,
      })
      .returning();
    participant = inserted[0];
  }

  if (!participant) {
    console.error(`[JOIN] Failed to insert or update participant in session ${session.id} for user ${user.id}`);
    return NextResponse.json({ error: "Failed to join session" }, { status: 500 });
  }

  const allParticipants = await db
    .select()
    .from(gameParticipants)
    .where(eq(gameParticipants.sessionId, session.id));

  await broadcastEvent(code.toUpperCase(), {
    type: "lobby_update",
    participants: allParticipants.map((p) => ({
      userId: p.userId,
      displayName: p.displayName,
      avatar: p.avatar,
      totalScore: p.totalScore,
      isConnected: p.isConnected ?? true,
    })),
  });

  return NextResponse.json({
    participantId: participant.id,
    userId: user.id,
    sessionId: session.id,
    currentState: {
      status: session.status,
      currentQuestionIndex: session.currentQuestionIndex,
    },
  });
}
