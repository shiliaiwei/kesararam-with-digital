import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants, gameSessionAnswers } from "@/db/schema/game";
import { gameScores, userStreaks } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { calculateScore } from "@/lib/game-engine";
import { eq, and, sql } from "drizzle-orm";

const BASE_POINTS = 1000;

interface AnswerInput {
  questionId: number;
  answerId: number | null;
  isCorrect: boolean;
  timeTakenMs: number;
}

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { sessionId, answers: answerInputs, timeTakenSeconds, gameMode, difficulty } = body as {
    sessionId: number;
    answers: AnswerInput[];
    timeTakenSeconds: number;
    gameMode: string;
    difficulty: string;
  };

  const [session] = await db
    .select()
    .from(gameSessions)
    .where(and(eq(gameSessions.id, sessionId), eq(gameSessions.isSoloPractice, true)));

  if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  if (session.hostId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let totalScore = 0;
  let correctCount = 0;
  let streak = 0;
  const perQuestion = [];

  for (const ans of answerInputs) {
    const isCorrect = ans.isCorrect;
    if (isCorrect) streak++;
    else streak = 0;

    const remainingTimeMs = Math.max(0, session.timePerQuestion * 1000 - ans.timeTakenMs);
    const scoreResult = calculateScore({
      isCorrect,
      scoringMode: "speed",
      basePoints: BASE_POINTS,
      remainingTimeMs,
      totalTimeMs: session.timePerQuestion * 1000,
      currentStreak: streak,
    });

    totalScore += scoreResult.totalPoints;
    if (isCorrect) correctCount++;

    try {
      await db.insert(gameSessionAnswers).values({
        sessionId: session.id,
        userId: user.id,
        questionId: ans.questionId,
        answerId: ans.answerId,
        answeredAt: new Date(),
        isCorrect,
        speedScore: scoreResult.speedScore,
        streakBonus: scoreResult.streakBonus,
        totalPoints: scoreResult.totalPoints,
        remainingTimeMs,
      });
    } catch {}

    perQuestion.push({
      questionId: ans.questionId,
      isCorrect,
      pointsEarned: scoreResult.totalPoints,
      timeTakenMs: ans.timeTakenMs,
    });
  }

  // Update participant
  await db
    .update(gameParticipants)
    .set({ totalScore, correctAnswers: correctCount })
    .where(
      and(
        eq(gameParticipants.sessionId, session.id),
        eq(gameParticipants.userId, user.id)
      )
    );

  // End session
  await db
    .update(gameSessions)
    .set({ status: "ended", endedAt: new Date() })
    .where(eq(gameSessions.id, session.id));

  // Persist game score
  await db.insert(gameScores).values({
    userId: user.id,
    gameMode,
    score: totalScore,
    totalQuestions: answerInputs.length,
    correctAnswers: correctCount,
    timeTaken: timeTakenSeconds,
    difficulty,
  });

  // Update streak
  const today = new Date().toISOString().split("T")[0];
  const [existingStreak] = await db
    .select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, user.id));

  if (existingStreak) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const newStreak =
      existingStreak.lastPlayDate === yesterday
        ? (existingStreak.currentStreak ?? 0) + 1
        : existingStreak.lastPlayDate === today
        ? existingStreak.currentStreak ?? 1
        : 1;
    await db
      .update(userStreaks)
      .set({
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, existingStreak.longestStreak ?? 0),
        lastPlayDate: today,
        updatedAt: new Date(),
      })
      .where(eq(userStreaks.userId, user.id));
  } else {
    await db.insert(userStreaks).values({
      userId: user.id,
      currentStreak: 1,
      longestStreak: 1,
      lastPlayDate: today,
    });
  }

  // Personal best
  const [pb] = await db
    .select({ best: sql<number>`max(score)` })
    .from(gameScores)
    .where(and(eq(gameScores.userId, user.id), eq(gameScores.gameMode, gameMode)));

  const accuracyPercentage =
    answerInputs.length > 0
      ? Math.round((correctCount / answerInputs.length) * 100)
      : 0;

  return NextResponse.json({
    totalScore,
    accuracyPercentage,
    timeTakenSeconds,
    correctAnswers: correctCount,
    totalQuestions: answerInputs.length,
    personalBest: pb?.best ?? totalScore,
    isNewPersonalBest: totalScore >= (pb?.best ?? 0),
    perQuestion,
  });
}
