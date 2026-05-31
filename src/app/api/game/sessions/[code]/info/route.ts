import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions } from "@/db/schema/game";
import { users } from "@/db/schema/users";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const [session] = await db
    .select({
      id: gameSessions.id,
      status: gameSessions.status,
      gameMode: gameSessions.gameMode,
      category: gameSessions.category,
      difficulty: gameSessions.difficulty,
      scoringMode: gameSessions.scoringMode,
      timePerQuestion: gameSessions.timePerQuestion,
      maxPlayers: gameSessions.maxPlayers,
      questionCount: gameSessions.questionIds,
      hostId: gameSessions.hostId,
      language: gameSessions.language,
      targetGroup: gameSessions.targetGroup,
    })
    .from(gameSessions)
    .where(eq(gameSessions.sessionCode, code.toUpperCase()));

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [host] = await db
    .select({ displayName: users.displayName, username: users.username, avatar: users.avatar })
    .from(users)
    .where(eq(users.id, session.hostId));

  return NextResponse.json({
    status: session.status,
    gameMode: session.gameMode,
    category: session.category,
    difficulty: session.difficulty,
    scoringMode: session.scoringMode,
    timePerQuestion: session.timePerQuestion,
    maxPlayers: session.maxPlayers,
    questionCount: Array.isArray(session.questionCount) ? session.questionCount.length : 0,
    hostName: host?.displayName || host?.username || "Teacher",
    hostAvatar: host?.avatar || null,
    language: session.language,
    targetGroup: session.targetGroup,
  });
}
