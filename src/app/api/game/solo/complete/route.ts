import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { calculateScore } from "@/lib/game-engine";
import { db } from "@/lib/db";
import { gameScores, pointsLedger } from "@/db/schema/content";
import { users } from "@/db/schema/users";
import { eq, sql } from "drizzle-orm";

interface AnswerInput {
  questionId: number;
  answerId: number | null;
  isCorrect: boolean;
  timeTakenMs: number;
  /** Actual difficulty of this question — sent from the client question data */
  difficulty?: string | null;
}

/**
 * Solo game completion — calculates score AND records to DB for authenticated students.
 *
 * Score recording:
 *  - gameScores row → per-session historical record
 *  - pointsLedger row → time-windowed leaderboard feed (source="solo", gameType=<mode>)
 *  - users.lifetimePoints += soloPoints (for all-time rank)
 *  - users.highestScore = max(highestScore, totalScore)
 *  - users.totalGamesPlayed += 1
 *
 * Guest plays (no session) get the score calculated and returned but nothing is persisted.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();

  const body = await req.json();
  const {
    answers: answerInputs,
    timeTakenSeconds,
    timePerQuestion = 30,
    scoringMode = "speed",
    targetGroup = "university",
    gameMode = "quick-quiz",
  } = body as {
    sessionId: number;
    answers: AnswerInput[];
    timeTakenSeconds: number;
    gameMode?: string;
    difficulty?: string;
    timePerQuestion?: number;
    scoringMode?: string;
    targetGroup?: string;
  };

  const totalTimeMs = timePerQuestion * 1000;

  let totalScore = 0;
  let correctCount = 0;
  let streak = 0;
  const perQuestion: { questionId: number; isCorrect: boolean; pointsEarned: number; timeTakenMs: number }[] = [];

  for (const ans of answerInputs) {
    if (ans.isCorrect) streak++;
    else streak = 0;

    const remainingTimeMs = Math.max(0, totalTimeMs - ans.timeTakenMs);
    const scoreResult = calculateScore({
      isCorrect: ans.isCorrect,
      difficulty: ans.difficulty ?? "medium",
      scoringMode: (scoringMode as "speed" | "equal"),
      remainingTimeMs,
      totalTimeMs,
      currentStreak: streak,
    });

    totalScore += scoreResult.totalPoints;
    if (ans.isCorrect) correctCount++;

    perQuestion.push({
      questionId: ans.questionId,
      isCorrect: ans.isCorrect,
      pointsEarned: scoreResult.totalPoints,
      timeTakenMs: ans.timeTakenMs,
    });
  }

  const accuracyPercentage =
    answerInputs.length > 0
      ? Math.round((correctCount / answerInputs.length) * 100)
      : 0;

  let isNewPersonalBest = false;
  let newLifetimePoints: number | undefined = undefined;

  // ── Persist to DB for authenticated students only ──────────────────────────
  if (session?.id && session.role === "student" && totalScore > 0) {
    try {
      // 1. Record game score history
      await db.insert(gameScores).values({
        userId: session.id,
        gameMode,
        score: totalScore,
        totalQuestions: answerInputs.length,
        correctAnswers: correctCount,
        timeTaken: timeTakenSeconds,
        categoryBreakdown: JSON.stringify(perQuestion),
      });

      // 2. Record to points ledger (feeds time-windowed leaderboard)
      await db.insert(pointsLedger).values({
        userId: session.id,
        source: "solo",
        gameType: gameMode,
        points: totalScore,
      });

      // 3. Update user aggregate stats atomically
      //    - lifetimePoints: always increment
      //    - highestScore: only update if this game's score beats the record
      //    - totalGamesPlayed: always increment
      const [updatedUser] = await db
        .update(users)
        .set({
          lifetimePoints: sql`${users.lifetimePoints} + ${totalScore}`,
          highestScore: sql`GREATEST(${users.highestScore}, ${totalScore})`,
          totalGamesPlayed: sql`${users.totalGamesPlayed} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.id))
        .returning({
          lifetimePoints: users.lifetimePoints,
          highestScore: users.highestScore,
        });

      if (updatedUser) {
        newLifetimePoints = updatedUser.lifetimePoints;
        // If the user's new highestScore equals totalScore AND it's greater than
        // what they had before (prior value = highestScore - totalScore when equal),
        // it's a new personal best.
        isNewPersonalBest = updatedUser.highestScore === totalScore;
      }
    } catch (err) {
      // Log but don't fail the response — score calculation is still returned
      console.error("[solo/complete] DB write failed:", err);
    }
  }

  return NextResponse.json({
    totalScore,
    accuracyPercentage,
    timeTakenSeconds,
    correctAnswers: correctCount,
    totalQuestions: answerInputs.length,
    personalBest: totalScore,
    isNewPersonalBest,
    // Return updated lifetime points so client can refresh leaderboard display
    newLifetimePoints,
    perQuestion,
  });
}
