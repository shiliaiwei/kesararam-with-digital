import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameScores, userStreaks } from "@/db/schema/content";
import { users } from "@/db/schema/users";
import { getSession } from "@/lib/auth";
import { calculateScore } from "@/lib/game-engine";
import { eq, and, sql } from "drizzle-orm";

interface AnswerInput {
  questionId: number;
  answerId: number | null;
  isCorrect: boolean;
  timeTakenMs: number;
}

export async function POST(req: NextRequest) {
  // Solo mode works for both authenticated and non-authenticated users
  const user = await getSession();

  const body = await req.json();
  const { answers: answerInputs, timeTakenSeconds, gameMode, difficulty } = body as {
    sessionId: number;
    answers: AnswerInput[];
    timeTakenSeconds: number;
    gameMode: string;
    difficulty: string;
  };

  let totalScore = 0;
  let correctCount = 0;
  let streak = 0;
  const perQuestion = [];

  // Calculate scores for all answers
  for (const ans of answerInputs) {
    const isCorrect = ans.isCorrect;
    if (isCorrect) streak++;
    else streak = 0;

    const remainingTimeMs = Math.max(0, 30000 - ans.timeTakenMs); // Assume 30s per question
    const scoreResult = calculateScore({
      isCorrect,
      difficulty: "medium", // Default for solo mode
      scoringMode: "speed",
      remainingTimeMs,
      totalTimeMs: 30000,
      currentStreak: streak,
    });

    totalScore += scoreResult.totalPoints;
    if (isCorrect) correctCount++;

    perQuestion.push({
      questionId: ans.questionId,
      isCorrect,
      pointsEarned: scoreResult.totalPoints,
      timeTakenMs: ans.timeTakenMs,
    });
  }

  const accuracyPercentage =
    answerInputs.length > 0
      ? Math.round((correctCount / answerInputs.length) * 100)
      : 0;

  // If user is authenticated, save their score and update streak
  let personalBest = totalScore;
  let isNewPersonalBest = true;

  if (user) {
    try {
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

      // Update user profile stats
      await db
        .update(users)
        .set({
          totalGamesPlayed: sql`${users.totalGamesPlayed} + 1`,
          lifetimePoints: sql`${users.lifetimePoints} + ${totalScore}`,
          highestScore: sql`GREATEST(${users.highestScore}, ${totalScore})`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

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

      // Get personal best
      const [pb] = await db
        .select({ best: sql<number>`max(score)` })
        .from(gameScores)
        .where(and(eq(gameScores.userId, user.id), eq(gameScores.gameMode, gameMode)));

      personalBest = pb?.best ?? totalScore;
      isNewPersonalBest = totalScore >= personalBest;
    } catch (error) {
      console.error("Error saving solo game results:", error);
      // Continue even if saving fails
    }
  }

  return NextResponse.json({
    totalScore,
    accuracyPercentage,
    timeTakenSeconds,
    correctAnswers: correctCount,
    totalQuestions: answerInputs.length,
    personalBest,
    isNewPersonalBest,
    perQuestion,
  });
}
