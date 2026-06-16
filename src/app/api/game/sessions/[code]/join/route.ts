import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants } from "@/db/schema/game";
import { users, classEnrollments } from "@/db/schema/users";
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

  // Always source the avatar from the database — the JWT payload may be stale
  // or missing the avatar, which is why students render as plain initials.
  const [dbUser] = await db
    .select({
      schoolName: users.schoolName,
      province: users.province,
      avatar: users.avatar,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (user.role === "student") {
    if (!dbUser || !dbUser.schoolName || !dbUser.province) {
      return NextResponse.json(
        { error: "Please complete your profile details (School, Province) before joining a live game. / សូមបំពេញព័ត៌មានគណនីរបស់អ្នក (សាលារៀន ខេត្ត) មុននឹងចូលរួមលេងហ្គេមផ្ទាល់។" },
        { status: 403 }
      );
    }
  }

  const resolvedAvatar = dbUser?.avatar ?? user.avatar ?? null;

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

  // ── Class-membership gates (students only) ──
  if (user.role === "student") {
    // A student must belong to a class to play live games.
    const studentEnrollments = await db
      .select({ classId: classEnrollments.classId })
      .from(classEnrollments)
      .where(eq(classEnrollments.studentId, user.id));

    if (studentEnrollments.length === 0) {
      return NextResponse.json(
        {
          error:
            "You are not in a class yet. Ask your teacher to add you with your class join code before playing a live game. / អ្នកមិនទាន់មានថ្នាក់រៀននៅឡើយទេ។ សូមសុំគ្រូបញ្ចូលអ្នកដោយប្រើលេខកូដថ្នាក់ មុននឹងលេងហ្គេមផ្ទាល់។",
          needsClass: true,
        },
        { status: 403 }
      );
    }

    // If the session is scoped to a specific class, only that class's students may join.
    if (session.classId != null) {
      const inClass = studentEnrollments.some((e) => e.classId === session.classId);
      if (!inClass) {
        return NextResponse.json(
          {
            error:
              "This live game is restricted to a specific class. You are not enrolled in that class. / ហ្គេមផ្ទាល់នេះកំណត់សម្រាប់តែថ្នាក់ជាក់លាក់ប៉ុណ្ណោះ។ អ្នកមិនមែនជាសិស្សក្នុងថ្នាក់នោះទេ។",
          },
          { status: 403 }
        );
      }
    }
  }

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
      .set({ isConnected: true, lastSeenAt: new Date(), avatar: resolvedAvatar })
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
        avatar: resolvedAvatar,
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
