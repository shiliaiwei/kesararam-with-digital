import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants, gameSessionAnswers } from "@/db/schema/game";
import { questions, answers } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { broadcast, LeaderboardEntry } from "@/lib/game-event-bus";
import { mapContentToGameType, type GameStatus } from "@/lib/game-engine";
import { eq, and, asc } from "drizzle-orm";

async function buildLeaderboard(sessionId: number, prevRanks: Map<number, number>): Promise<LeaderboardEntry[]> {
  const participants = await db
    .select()
    .from(gameParticipants)
    .where(eq(gameParticipants.sessionId, sessionId));

  return participants
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((p, i) => ({
      userId: p.userId,
      displayName: p.displayName,
      avatar: p.avatar,
      totalScore: p.totalScore,
      rank: i + 1,
      rankChange: (prevRanks.get(p.userId) ?? i + 1) - (i + 1),
      correctAnswers: p.correctAnswers,
      currentStreak: p.currentStreak,
    }));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.sessionCode, code.toUpperCase()));

    if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const isHost = session.hostId === user.id;
    const isAdmin = user.role === "admin";
    if (!isHost && !isAdmin)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { action } = body as { action: "start" | "advance" | "pause" | "resume" | "end" | "terminate" };

    const currentStatus = session.status as GameStatus;

  // ── TERMINATE (delete lobby before starting) ──────────────────────────────
  if (action === "terminate") {
    if (currentStatus !== "lobby")
      return NextResponse.json({ error: "Can only terminate a lobby" }, { status: 409 });
    await db.update(gameSessions)
      .set({ status: "ended", endedAt: new Date() })
      .where(eq(gameSessions.id, session.id));
    broadcast(code.toUpperCase(), { type: "warning", message: "Session terminated by host" });
    return NextResponse.json({ status: "ended" });
  }

  // ── START ─────────────────────────────────────────────────────────────────
  if (action === "start") {
    // Allow re-start if already active (idempotent)
    if (currentStatus !== "lobby" && currentStatus !== "active")
      return NextResponse.json({ error: `Cannot start from status: ${currentStatus}` }, { status: 409 });

    if (!session.questionIds?.length)
      return NextResponse.json({ error: "No questions in session" }, { status: 400 });

    const now = new Date();
    const firstQId = session.questionIds[0];

    await db.update(gameSessions)
      .set({ status: "active", startedAt: now, currentQuestionIndex: 0, questionStartedAt: now })
      .where(eq(gameSessions.id, session.id));

    const q = await getQuestionPayload(firstQId);
    const endsAt = new Date(now.getTime() + session.timePerQuestion * 1000);

    broadcast(code.toUpperCase(), {
      type: "question_start",
      question: q,
      startsAt: now.toISOString(),
      endsAt: endsAt.toISOString(),
      index: 0,
      total: session.questionIds.length,
    });

    return NextResponse.json({ status: "active", currentQuestionIndex: 0 });
  }

  // ── ADVANCE ───────────────────────────────────────────────────────────────
  if (action === "advance") {
    if (currentStatus !== "active")
      return NextResponse.json({ error: "Session not active" }, { status: 409 });

    const idx = session.currentQuestionIndex ?? 0;
    const qIds = session.questionIds ?? [];
    const currentQId = qIds[idx];
    const now = new Date();

    // Correct answer for reveal
    const [correctAnswer] = await db
      .select({ id: answers.id })
      .from(answers)
      .where(and(eq(answers.questionId, currentQId), eq(answers.isCorrect, true)))
      .limit(1);

    // Insert timeout records for non-answerers
    const participants = await db.select().from(gameParticipants).where(eq(gameParticipants.sessionId, session.id));
    const answered = await db.select({ userId: gameSessionAnswers.userId }).from(gameSessionAnswers)
      .where(and(eq(gameSessionAnswers.sessionId, session.id), eq(gameSessionAnswers.questionId, currentQId)));
    const answeredSet = new Set(answered.map(a => a.userId));

    for (const p of participants) {
      if (!answeredSet.has(p.userId)) {
        try {
          await db.insert(gameSessionAnswers).values({
            sessionId: session.id, userId: p.userId, questionId: currentQId,
            answerId: null, answeredAt: now, isCorrect: false,
            speedScore: 0, streakBonus: 0, totalPoints: 0, remainingTimeMs: 0,
          });
          await db.update(gameParticipants).set({ currentStreak: 0 })
            .where(and(eq(gameParticipants.sessionId, session.id), eq(gameParticipants.userId, p.userId)));
        } catch { /* already answered */ }
      }
    }

    const prevRanks = new Map([...participants].sort((a, b) => b.totalScore - a.totalScore).map((p, i) => [p.userId, i + 1]));
    const leaderboard = await buildLeaderboard(session.id, prevRanks);

    broadcast(code.toUpperCase(), {
      type: "question_end",
      correctAnswerId: correctAnswer?.id ?? null,
      leaderboard,
    });

    const nextIdx = idx + 1;

    // Last question — end game
    if (nextIdx >= qIds.length) {
      await db.update(gameSessions).set({ status: "ended", endedAt: now }).where(eq(gameSessions.id, session.id));
      for (const entry of leaderboard) {
        await db.update(gameParticipants).set({ rank: entry.rank })
          .where(and(eq(gameParticipants.sessionId, session.id), eq(gameParticipants.userId, entry.userId)));
      }
      // Small delay so clients see question_end before session_end
      await new Promise(r => setTimeout(r, 2000));
      broadcast(code.toUpperCase(), { type: "session_end", podium: leaderboard.slice(0, 3), finalLeaderboard: leaderboard });
      
      // After 30 seconds, send a final close event
      setTimeout(() => {
        broadcast(code.toUpperCase(), { type: "warning", message: "Session closed. Please exit." });
      }, 30000);
      
      return NextResponse.json({ status: "ended" });
    }

    // Next question
    const nextQId = qIds[nextIdx];
    const nextNow = new Date();
    await db.update(gameSessions).set({ currentQuestionIndex: nextIdx, questionStartedAt: nextNow }).where(eq(gameSessions.id, session.id));
    const q = await getQuestionPayload(nextQId);
    const endsAt = new Date(nextNow.getTime() + session.timePerQuestion * 1000);

    broadcast(code.toUpperCase(), {
      type: "question_start", question: q,
      startsAt: nextNow.toISOString(), endsAt: endsAt.toISOString(),
      index: nextIdx, total: qIds.length,
    });

    return NextResponse.json({ status: "active", currentQuestionIndex: nextIdx });
  }

  // ── PAUSE ─────────────────────────────────────────────────────────────────
  if (action === "pause") {
    if (currentStatus !== "active") return NextResponse.json({ error: "Not active" }, { status: 409 });
    await db.update(gameSessions).set({ status: "paused" }).where(eq(gameSessions.id, session.id));
    broadcast(code.toUpperCase(), { type: "session_paused" });
    return NextResponse.json({ status: "paused" });
  }

  // ── RESUME ────────────────────────────────────────────────────────────────
  if (action === "resume") {
    if (currentStatus !== "paused") return NextResponse.json({ error: "Not paused" }, { status: 409 });
    await db.update(gameSessions).set({ status: "active" }).where(eq(gameSessions.id, session.id));
    broadcast(code.toUpperCase(), { type: "session_resumed" });
    return NextResponse.json({ status: "active" });
  }

  // ── END ───────────────────────────────────────────────────────────────────
  if (action === "end") {
    if (currentStatus === "ended") return NextResponse.json({ status: "ended" });
    const now = new Date();
    await db.update(gameSessions).set({ status: "ended", endedAt: now }).where(eq(gameSessions.id, session.id));
    const participants = await db.select().from(gameParticipants).where(eq(gameParticipants.sessionId, session.id));
    const prevRanks = new Map([...participants].sort((a, b) => b.totalScore - a.totalScore).map((p, i) => [p.userId, i + 1]));
    const leaderboard = await buildLeaderboard(session.id, prevRanks);
    
    // Save final ranks
    for (const entry of leaderboard) {
      await db.update(gameParticipants).set({ rank: entry.rank })
        .where(and(eq(gameParticipants.sessionId, session.id), eq(gameParticipants.userId, entry.userId)));
    }
    
    broadcast(code.toUpperCase(), { type: "session_end", podium: leaderboard.slice(0, 3), finalLeaderboard: leaderboard });
    
    // After 30 seconds, send a final close event to disconnect all clients
    setTimeout(() => {
      broadcast(code.toUpperCase(), { type: "warning", message: "Session closed. Please exit." });
    }, 30000);
    
    return NextResponse.json({ status: "ended" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("Control route error:", error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}

async function getQuestionPayload(questionId: number) {
  try {
    const [q] = await db.select().from(questions).where(eq(questions.id, questionId));
    if (!q) throw new Error(`Question ${questionId} not found`);

    const ans = await db.select().from(answers).where(eq(answers.questionId, questionId)).orderBy(asc(answers.sortOrder));
    const gameType = mapContentToGameType({ answerCount: ans.length, hasImage: !!q.imageUrl, hasAudio: !!(q.audioUrlEn || q.audioUrlKm) });

    return {
      id: q.id,
      questionEn: q.questionEn,
      questionKm: q.questionKm,
      imageUrl: q.imageUrl ?? null,
      audioUrlEn: q.audioUrlEn ?? null,
      audioUrlKm: q.audioUrlKm ?? null,
      gameType,
      answers: ans.map(a => ({ id: a.id, answerEn: a.answerEn, answerKm: a.answerKm, imageUrl: a.imageUrl ?? null })),
    };
  } catch (error) {
    console.error("getQuestionPayload error:", error);
    throw error;
  }
}
