import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { calculateScore } from "@/lib/game-engine";

interface AnswerInput {
  questionId: number;
  answerId: number | null;
  isCorrect: boolean;
  timeTakenMs: number;
}

// Solo mode — no DB recording for anyone. Just calculate and return session stats.
export async function POST(req: NextRequest) {
  await getSession(); // auth check only, result not used

  const body = await req.json();
  const { answers: answerInputs, timeTakenSeconds } = body as {
    sessionId: number;
    answers: AnswerInput[];
    timeTakenSeconds: number;
    gameMode: string;
    difficulty: string;
  };

  let totalScore = 0;
  let correctCount = 0;
  let streak = 0;
  const perQuestion: { questionId: number; isCorrect: boolean; pointsEarned: number; timeTakenMs: number }[] = [];

  for (const ans of answerInputs) {
    if (ans.isCorrect) streak++;
    else streak = 0;

    const remainingTimeMs = Math.max(0, 30000 - ans.timeTakenMs);
    const scoreResult = calculateScore({
      isCorrect: ans.isCorrect,
      difficulty: "medium",
      scoringMode: "speed",
      remainingTimeMs,
      totalTimeMs: 30000,
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

  return NextResponse.json({
    totalScore,
    accuracyPercentage,
    timeTakenSeconds,
    correctAnswers: correctCount,
    totalQuestions: answerInputs.length,
    personalBest: totalScore,
    isNewPersonalBest: false,
    perQuestion,
  });
}
