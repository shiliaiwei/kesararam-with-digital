import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants, gameSessionAnswers } from "@/db/schema/game";
import { questions, answers } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { broadcast, LeaderboardEntry } from "@/lib/game-event-bus";
import { isValidTransition, mapContentToGameType, type GameStatus } from "@/lib/game-engine";
import { eq, and } from "drizzle-orm";

async function buildLeaderboard(sessionId: number, prevRanks: Map<number, number>): Promise<LeaderboardEntry[]> {
  const participants = await db
    .select()
    .from(gameParticipants)
    .where(eq(gameParticipants.sessionId, sessionId));

  const sorted = participants
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

  return sorted;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
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
  const { action } = body as {
    action: "start" | "advance" | "pause" | "resume" | "end";
  };

  const currentStatus = session.status as GameStatus;

  if (action === "start") {
    if (!isValidTransition(currentStatus, "active"))
      return NextResponse.json({ error: "Invalid transition" }, { status: 409 });

    if (!session.questionIds?.length)
      return NextResponse.json({ error: "No questions in session" }, { status: 400 });

    const firstQId = session.questionIds[0];
    const now = new Date();

    await db
      .update(gameSessions)
      .set({
        status: "active",
        startedAt: now,
        currentQuestionIndex: 0,
        questionStartedAt: now,
      })
      .where(and(eq(gameSessions.id, session.id), eq(gameSessions.status, "lobby")));

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

  if (action === "advance") {
    if (currentStatus !== "active")
      return NextResponse.json({ error: "Session not active" }, { status: 409 });

    const idx = session.currentQuestionIndex ?? 0;
    const qIds = session.questionIds ?? [];

    // Get current question's correct answer for reveal
    const currentQId = qIds[idx];
    const correctAnswer = await db
      .select({ id: answers.id })
      .from(answers)
      .where(and(eq(answers.questionId, currentQId), eq(answers.isCorrect, true)))
      .limit(1);

    // Insert timeout records for participants who didn't answer
    const participants = await db
      .select()
      .from(gameParticipants)
      .where(eq(gameParticipants.sessionId, session.id));

    const answered = await db
      .select({ userId: gameSessionAnswers.userId })
      .from(gameSessionAnswers)
      .where(
        and(
          eq(gameSessionAnswers.sessionId, session.id),
          eq(gameSessionAnswers.questionId, currentQId)
        )
      );

    const answeredUserIds = new Set(answered.map((a) => a.userId));
    const now = new Date();

    for (const p of participants) {
      if (!answeredUserIds.has(p.userId)) {
        try {
          await db.insert(gameSessionAnswers).values({
            sessionId: session.id,
            userId: p.userId,
            questionId: currentQId,
            answerId: null,
            answeredAt: now,
            isCorrect: false,
            speedScore: 0,
            streakBonus: 0,
            totalPoints: 0,
            remainingTimeMs: 0,
          });
          // Reset streak for timeout
          await db
            .update(gameParticipants)
            .set({ currentStreak: 0 })
            .where(
              and(
                eq(gameParticipants.sessionId, session.id),
                eq(gameParticipants.userId, p.userId)
              )
            );
        } catch {
          // already answered — unique constraint
        }
      }
    }

    // Build leaderboard with rank changes — sort participants by score BEFORE this round to get accurate prev ranks
    const prevSorted = [...participants].sort((a, b) => b.totalScore - a.totalScore);
    const prevRanks = new Map(prevSorted.map((p, i) => [p.userId, i + 1]));
    const leaderboard = await buildLeaderboard(session.id, prevRanks);

    broadcast(code.toUpperCase(), {
      type: "question_end",
      correctAnswerId: correctAnswer[0]?.id ?? null,
      leaderboard,
    });

    // Check if last question
    const nextIdx = idx + 1;
    if (nextIdx >= qIds.length) {
      await db
        .update(gameSessions)
        .set({ status: "ended", endedAt: now })
        .where(eq(gameSessions.id, session.id));

      // Persist final ranks
      for (const entry of leaderboard) {
        await db
          .update(gameParticipants)
          .set({ rank: entry.rank })
          .where(
            and(
              eq(gameParticipants.sessionId, session.id),
              eq(gameParticipants.userId, entry.userId)
            )
          );
      }

      broadcast(code.toUpperCase(), {
        type: "session_end",
        podium: leaderboard.slice(0, 3),
        finalLeaderboard: leaderboard,
      });

      return NextResponse.json({ status: "ended", currentQuestionIndex: idx });
    }

    // Advance to next question
    const nextQId = qIds[nextIdx];
    const nextNow = new Date();
    await db
      .update(gameSessions)
      .set({ currentQuestionIndex: nextIdx, questionStartedAt: nextNow })
      .where(eq(gameSessions.id, session.id));

    const q = await getQuestionPayload(nextQId);
    const endsAt = new Date(nextNow.getTime() + session.timePerQuestion * 1000);

    broadcast(code.toUpperCase(), {
      type: "question_start",
      question: q,
      startsAt: nextNow.toISOString(),
      endsAt: endsAt.toISOString(),
      index: nextIdx,
      total: qIds.length,
    });

    return NextResponse.json({ status: "active", currentQuestionIndex: nextIdx });
  }

  if (action === "pause") {
    if (!isValidTransition(currentStatus, "paused"))
      return NextResponse.json({ error: "Invalid transition" }, { status: 409 });
    await db
      .update(gameSessions)
      .set({ status: "paused" })
      .where(and(eq(gameSessions.id, session.id), eq(gameSessions.status, "active")));
    broadcast(code.toUpperCase(), { type: "session_paused" });
    return NextResponse.json({ status: "paused" });
  }

  if (action === "resume") {
    if (!isValidTransition(currentStatus, "active"))
      return NextResponse.json({ error: "Invalid transition" }, { status: 409 });
    await db
      .update(gameSessions)
      .set({ status: "active" })
      .where(and(eq(gameSessions.id, session.id), eq(gameSessions.status, "paused")));
    broadcast(code.toUpperCase(), { type: "session_resumed" });
    return NextResponse.json({ status: "active" });
  }

  if (action === "end") {
    if (!isValidTransition(currentStatus, "ended"))
      return NextResponse.json({ error: "Invalid transition" }, { status: 409 });
    const now = new Date();
    await db
      .update(gameSessions)
      .set({ status: "ended", endedAt: now })
      .where(eq(gameSessions.id, session.id));

    const participants = await db
      .select()
      .from(gameParticipants)
      .where(eq(gameParticipants.sessionId, session.id));
    const prevSorted = [...participants].sort((a, b) => b.totalScore - a.totalScore);
    const prevRanks = new Map(prevSorted.map((p, i) => [p.userId, i + 1]));
    const leaderboard = await buildLeaderboard(session.id, prevRanks);

    broadcast(code.toUpperCase(), {
      type: "session_end",
      podium: leaderboard.slice(0, 3),
      finalLeaderboard: leaderboard,
    });

    return NextResponse.json({ status: "ended" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

async function getQuestionPayload(questionId: number) {
  const [q] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, questionId));

  const ans = await db
    .select()
    .from(answers)
    .where(eq(answers.questionId, questionId))
    .orderBy(answers.sortOrder);

  const answerCount = ans.length;
  const gameType = mapContentToGameType({
    answerCount,
    hasImage: !!q.imageUrl,
    hasAudio: !!(q.audioUrlEn || q.audioUrlKm),
  });

  return {
    id: q.id,
    questionEn: q.questionEn,
    questionKm: q.questionKm,
    imageUrl: q.imageUrl ?? null,
    audioUrlEn: q.audioUrlEn ?? null,
    audioUrlKm: q.audioUrlKm ?? null,
    gameType,
    answers: ans.map((a) => ({
      id: a.id,
      answerEn: a.answerEn,
      answerKm: a.answerKm,
      imageUrl: a.imageUrl ?? null,
    })),
  };
}
