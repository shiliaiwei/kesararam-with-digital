import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants, gameSessionAnswers } from "@/db/schema/game";
import { answers, questions } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { calculateScore } from "@/lib/game-engine";
import { eq, and, sql } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { questionId, answerId, answeredAt } = body as {
    questionId: number;
    answerId: number | null;
    answeredAt: string;
  };

  if (!questionId) return NextResponse.json({ error: "Missing questionId" }, { status: 400 });

  const serverReceivedAt = new Date();

  // 1. Validate session
  const [session] = await db
    .select()
    .from(gameSessions)
    .where(eq(gameSessions.sessionCode, code.toUpperCase()));

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.status !== "active")
    return NextResponse.json({ error: "Session not active" }, { status: 422 });

  // 2. Validate current question matches
  const qIds = session.questionIds ?? [];
  const currentQId = qIds[session.currentQuestionIndex ?? 0];
  if (currentQId !== questionId)
    return NextResponse.json({ error: "Question mismatch" }, { status: 422 });

  // 3. Check time window (server clock + 2s grace)
  const questionStartedAt = session.questionStartedAt;
  if (questionStartedAt) {
    const windowEnd = new Date(
      questionStartedAt.getTime() + session.timePerQuestion * 1000 + 2000
    );
    if (serverReceivedAt > windowEnd)
      return NextResponse.json({ error: "Answer window closed" }, { status: 422 });
  }

  // 4. Validate participant
  const [participant] = await db
    .select()
    .from(gameParticipants)
    .where(
      and(
        eq(gameParticipants.sessionId, session.id),
        eq(gameParticipants.userId, user.id)
      )
    );

  if (!participant)
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });

  // 5/6. Difficulty + correctness. Click the Sign (tick-sign) is an image-pick
  // game whose answer key derives from the prompt: a pick is correct iff the
  // chosen sign's topic id equals the prompt's topic id — which IS the step's
  // questionId. MCQ sessions read the answers table as before.
  const isTickSign = session.gameMode === "tick-sign";
  let difficulty: string | null = "easy";
  let isCorrect = false;
  if (isTickSign) {
    isCorrect = answerId !== null && answerId !== undefined && answerId === questionId;
  } else {
    const [question] = await db
      .select({ difficulty: questions.difficulty })
      .from(questions)
      .where(eq(questions.id, questionId));
    difficulty = question?.difficulty ?? null;
    if (answerId !== null && answerId !== undefined) {
      const [ans] = await db
        .select({ isCorrect: answers.isCorrect })
        .from(answers)
        .where(eq(answers.id, answerId));
      isCorrect = ans?.isCorrect ?? false;
    }
  }

  // 7. Calculate score (server-side only) with new difficulty-based system
  const remainingTimeMs = questionStartedAt
    ? Math.max(
      0,
      questionStartedAt.getTime() +
      session.timePerQuestion * 1000 -
      serverReceivedAt.getTime()
    )
    : 0;

  // 7a. Look for an existing answer to THIS question (allow changing before time ends)
  const [existing] = await db
    .select()
    .from(gameSessionAnswers)
    .where(
      and(
        eq(gameSessionAnswers.sessionId, session.id),
        eq(gameSessionAnswers.userId, user.id),
        eq(gameSessionAnswers.questionId, questionId)
      )
    );

  // The streak this answer builds on: prior answers' streak is preserved across
  // re-answers via the stored prevStreak (so changing answers can't inflate it).
  const baseStreak = existing ? existing.prevStreak : participant.currentStreak;

  const scoreResult = calculateScore({
    isCorrect,
    difficulty,
    scoringMode: session.scoringMode as "speed" | "equal",
    remainingTimeMs,
    totalTimeMs: session.timePerQuestion * 1000,
    currentStreak: isCorrect ? baseStreak + 1 : 0,
  });

  // 8. Insert or UPDATE the answer (students may change choice before time ends)
  if (existing) {
    // Reverse the previous answer's contribution, then apply the new one.
    await db
      .update(gameSessionAnswers)
      .set({
        answerId: answerId ?? null,
        answeredAt: new Date(answeredAt),
        isCorrect,
        speedScore: scoreResult.speedBonus,
        streakBonus: scoreResult.streakBonus,
        totalPoints: scoreResult.totalPoints,
        remainingTimeMs,
        prevStreak: baseStreak,
      })
      .where(eq(gameSessionAnswers.id, existing.id));

    // participant.totalScore: remove old points, add new
    // currentStreak: recompute from baseStreak (the streak before this question)
    await db
      .update(gameParticipants)
      .set({
        totalScore: sql`${gameParticipants.totalScore} - ${existing.totalPoints} + ${scoreResult.totalPoints}`,
        correctAnswers: sql`${gameParticipants.correctAnswers} - ${existing.isCorrect ? 1 : 0} + ${isCorrect ? 1 : 0}`,
        currentStreak: isCorrect ? baseStreak + 1 : 0,
        lastSeenAt: serverReceivedAt,
      })
      .where(
        and(
          eq(gameParticipants.sessionId, session.id),
          eq(gameParticipants.userId, user.id)
        )
      );

    return NextResponse.json({
      accepted: true,
      changed: true,
      isCorrect,
      pointsEarned: scoreResult.totalPoints,
      baseScore: scoreResult.baseScore,
      speedBonus: scoreResult.speedBonus,
      streakBonus: scoreResult.streakBonus,
      difficulty,
    });
  }

  // First answer for this question
  try {
    await db.insert(gameSessionAnswers).values({
      sessionId: session.id,
      userId: user.id,
      questionId,
      answerId: answerId ?? null,
      answeredAt: new Date(answeredAt),
      isCorrect,
      speedScore: scoreResult.speedBonus,
      streakBonus: scoreResult.streakBonus,
      totalPoints: scoreResult.totalPoints,
      remainingTimeMs,
      prevStreak: baseStreak,
    });
  } catch {
    return NextResponse.json({ error: "Already answered" }, { status: 409 });
  }

  // Update participant totals atomically
  await db
    .update(gameParticipants)
    .set({
      totalScore: sql`${gameParticipants.totalScore} + ${scoreResult.totalPoints}`,
      correctAnswers: isCorrect
        ? sql`${gameParticipants.correctAnswers} + 1`
        : gameParticipants.correctAnswers,
      currentStreak: isCorrect
        ? sql`${gameParticipants.currentStreak} + 1`
        : 0,
      lastSeenAt: serverReceivedAt,
    })
    .where(
      and(
        eq(gameParticipants.sessionId, session.id),
        eq(gameParticipants.userId, user.id)
      )
    );

  return NextResponse.json({
    accepted: true,
    isCorrect,
    pointsEarned: scoreResult.totalPoints,
    baseScore: scoreResult.baseScore,
    speedBonus: scoreResult.speedBonus,
    streakBonus: scoreResult.streakBonus,
    difficulty,
  });
}
