import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants } from "@/db/schema/game";
import { getSession } from "@/lib/auth";
import { broadcast } from "@/lib/game-event-bus";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const displayName = body.displayName || user.name || "Player";

  const [session] = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.sessionCode, code.toUpperCase()));

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.status === "ended")
    return NextResponse.json({ error: "Session has ended" }, { status: 410 });
  if (session.status === "active" && !session.allowLateJoin)
    return NextResponse.json({ error: "Late join not allowed" }, { status: 403 });

  const existing = await db
    .select()
    .from(gameParticipants)
    .where(eq(gameParticipants.sessionId, session.id));

  if (existing.length >= (session.maxPlayers ?? 50))
    return NextResponse.json({ error: `Session is full (max ${session.maxPlayers ?? 50} players)` }, { status: 409 });

  const alreadyIn = existing.find((p) => p.userId === user.id);
  let participant;

  if (alreadyIn) {
    [participant] = await db
      .update(gameParticipants)
      .set({ isConnected: true, lastSeenAt: new Date() })
      .where(
        and(
          eq(gameParticipants.sessionId, session.id),
          eq(gameParticipants.userId, user.id)
        )
      )
      .returning();
  } else {
    [participant] = await db
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
  }

  const allParticipants = await db
    .select()
    .from(gameParticipants)
    .where(eq(gameParticipants.sessionId, session.id));

  broadcast(code.toUpperCase(), {
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
    sessionId: session.id,
    currentState: {
      status: session.status,
      currentQuestionIndex: session.currentQuestionIndex,
    },
  });
}
