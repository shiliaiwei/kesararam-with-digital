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

  // 5. Get question difficulty
  const [question] = await db
    .select({ difficulty: questions.difficulty })
    .from(questions)
    .where(eq(questions.id, questionId));

  // 6. Check if answer is correct
  let isCorrect = false;
  if (answerId !== null && answerId !== undefined) {
    const [ans] = await db
      .select({ isCorrect: answers.isCorrect })
      .from(answers)
      .where(eq(answers.id, answerId));
    isCorrect = ans?.isCorrect ?? false;
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

  const scoreResult = calculateScore({
    isCorrect,
    difficulty: question?.difficulty,
    scoringMode: session.scoringMode as "speed" | "equal",
    remainingTimeMs,
    totalTimeMs: session.timePerQuestion * 1000,
    // Pass the streak AFTER this answer so the bonus formula is correct
    currentStreak: isCorrect ? participant.currentStreak + 1 : 0,
  });

  // 8. Insert answer (unique constraint prevents replay)
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
    });
  } catch {
    return NextResponse.json({ error: "Already answered" }, { status: 409 });
  }

  // 9. Update participant totals atomically
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
    difficulty: question?.difficulty,
  });
}
