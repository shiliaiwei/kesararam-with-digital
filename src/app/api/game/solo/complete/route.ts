import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { calculateScore, SOLO_SCORE_MULTIPLIER, PLAY_LIMITS } from "@/lib/game-engine";
import { db } from "@/lib/db";
import { gameScores, pointsLedger } from "@/db/schema/content";
import { users, classEnrollments, classes } from "@/db/schema/users";
import { eq, sql, and, gte, count } from "drizzle-orm";
import { getUserSubscription } from "@/lib/subscription";

interface AnswerInput {
  questionId: number;
  answerId: number | null;
  isCorrect: boolean;
  timeTakenMs: number;
  difficulty?: string | null;
}

/**
 * Determine the play-limit tier for an authenticated student.
 * Joins classEnrollments → classes to get the teacher, then checks subscription.
 */
async function getStudentPlayLimit(userId: number): Promise<{
  limit: number;
  tier: "student" | "studentClass" | "studentPro";
}> {
  // Check if enrolled in any class
  const [row] = await db
    .select({ teacherId: classes.teacherId })
    .from(classEnrollments)
    .innerJoin(classes, eq(classes.id, classEnrollments.classId))
    .where(eq(classEnrollments.studentId, userId))
    .limit(1);

  if (!row) return { limit: PLAY_LIMITS.student, tier: "student" };

  try {
    const { plan } = await getUserSubscription(row.teacherId);
    const isPro = plan !== "free" && plan !== "trial";
    return isPro
      ? { limit: PLAY_LIMITS.studentPro, tier: "studentPro" }
      : { limit: PLAY_LIMITS.studentClass, tier: "studentClass" };
  } catch {
    return { limit: PLAY_LIMITS.studentClass, tier: "studentClass" };
  }
}

/** Count today's solo gameScores rows for this student (Asia/Phnom_Penh = UTC+7). */
async function getSoloPlaysToday(userId: number): Promise<number> {
  const now = new Date();
  const todayOffset = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const dateStr = todayOffset.toISOString().slice(0, 10);
  const startOfDay = new Date(`${dateStr}T00:00:00+07:00`);

  const [row] = await db
    .select({ cnt: count() })
    .from(gameScores)
    .where(and(eq(gameScores.userId, userId), gte(gameScores.createdAt, startOfDay)));

  return Number(row?.cnt ?? 0);
}

/**
 * POST /api/game/solo/complete
 *
 * ── Score system ─────────────────────────────────────────────────────────────
 *   rawScore   = calculateScore() per question (base + speed + streak bonus)
 *   soloPoints = CEIL(rawScore × 0.20)   ← 20% of raw, practice-only
 *
 * Solo points are:
 *   ✅ Added to users.lifetimePoints (leaderboard rank)
 *   ✅ Written to pointsLedger with source="solo"
 *   ❌ NOT counted for reward claiming (only source="live" counts)
 *
 * ── Daily play limits (server-enforced for students) ─────────────────────────
 *   student (no class)       → 5 games/day
 *   student (class, free)    → 7 games/day
 *   student (class, pro)     → 10 games/day
 *   guest (no account)       → 3 games/day — enforced client-side via localStorage
 */
export async function POST(req: NextRequest) {
  const session = await getSession();

  const body = await req.json();
  const {
    answers: answerInputs,
    timeTakenSeconds,
    timePerQuestion = 30,
    scoringMode = "speed",
    gameMode = "quick-quiz",
  } = body as {
    answers: AnswerInput[];
    timeTakenSeconds: number;
    gameMode?: string;
    timePerQuestion?: number;
    scoringMode?: string;
  };

  // ── Server-side daily limit check (authenticated students) ──────────────────
  let playsToday = 0;
  let playsAllowed = PLAY_LIMITS.guest;
  let tier: string = "guest";

  if (session?.id && session.role === "student") {
    const limitInfo = await getStudentPlayLimit(session.id);
    playsAllowed = limitInfo.limit;
    tier = limitInfo.tier;
    playsToday = await getSoloPlaysToday(session.id);

    if (playsToday >= playsAllowed) {
      return NextResponse.json(
        {
          error: "daily_limit_reached",
          playsToday,
          playsAllowed,
          tier,
          message:
            tier === "student"
              ? `Daily limit reached (${playsAllowed} games). Join your teacher's class to unlock ${PLAY_LIMITS.studentClass} games/day!`
              : tier === "studentClass"
              ? `Daily limit reached (${playsAllowed} games). Your teacher can upgrade their plan to unlock ${PLAY_LIMITS.studentPro} games/day!`
              : `Daily limit reached (${playsAllowed} games/day). Come back tomorrow or join a live session!`,
        },
        { status: 429 }
      );
    }
  }

  // ── Score calculation ───────────────────────────────────────────────────────
  const totalTimeMs = timePerQuestion * 1000;
  let rawScore = 0;
  let correctCount = 0;
  let streak = 0;

  const perQuestion: {
    questionId: number;
    isCorrect: boolean;
    rawPoints: number;
    soloPoints: number;
    timeTakenMs: number;
  }[] = [];

  for (const ans of answerInputs) {
    if (ans.isCorrect) streak++;
    else streak = 0;

    const remainingTimeMs = Math.max(0, totalTimeMs - ans.timeTakenMs);
    const scoreResult = calculateScore({
      isCorrect: ans.isCorrect,
      difficulty: ans.difficulty ?? "medium",
      scoringMode: scoringMode as "speed" | "equal",
      remainingTimeMs,
      totalTimeMs,
      currentStreak: streak,
    });

    rawScore += scoreResult.totalPoints;
    if (ans.isCorrect) correctCount++;

    perQuestion.push({
      questionId: ans.questionId,
      isCorrect: ans.isCorrect,
      rawPoints: scoreResult.totalPoints,
      soloPoints: Math.ceil(scoreResult.totalPoints * SOLO_SCORE_MULTIPLIER),
      timeTakenMs: ans.timeTakenMs,
    });
  }

  // Solo points = 20% of raw, always rounded up
  const soloPoints = Math.ceil(rawScore * SOLO_SCORE_MULTIPLIER);

  const accuracyPercentage =
    answerInputs.length > 0
      ? Math.round((correctCount / answerInputs.length) * 100)
      : 0;

  let isNewPersonalBest = false;
  let newLifetimePoints: number | undefined;

  // ── Persist to DB (logged-in students only) ─────────────────────────────────
  if (session?.id && session.role === "student" && soloPoints > 0) {
    try {
      await db.insert(gameScores).values({
        userId: session.id,
        gameMode,
        score: rawScore,                          // raw score stored for display/audit
        totalQuestions: answerInputs.length,
        correctAnswers: correctCount,
        timeTaken: timeTakenSeconds,
        categoryBreakdown: JSON.stringify(perQuestion),
      });

      // source="solo" → excluded from claimable balance in /api/user/claim
      await db.insert(pointsLedger).values({
        userId: session.id,
        source: "solo",
        gameType: gameMode,
        points: soloPoints,                       // only 20% goes to ledger
      });

      const [updatedUser] = await db
        .update(users)
        .set({
          lifetimePoints: sql`${users.lifetimePoints} + ${soloPoints}`,
          highestScore: sql`GREATEST(${users.highestScore}, ${rawScore})`,
          totalGamesPlayed: sql`${users.totalGamesPlayed} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, session.id))
        .returning({ lifetimePoints: users.lifetimePoints, highestScore: users.highestScore });

      if (updatedUser) {
        newLifetimePoints = updatedUser.lifetimePoints;
        isNewPersonalBest = updatedUser.highestScore === rawScore;
      }

      playsToday += 1;
    } catch (err) {
      console.error("[solo/complete] DB write failed:", err);
    }
  }

  return NextResponse.json({
    rawScore,
    soloPoints,
    accuracyPercentage,
    timeTakenSeconds,
    correctAnswers: correctCount,
    totalQuestions: answerInputs.length,
    isNewPersonalBest,
    newLifetimePoints,
    perQuestion,
    // Limit state — client uses this for limit widget
    playsToday,
    playsAllowed,
    remainingPlays: Math.max(0, playsAllowed - playsToday),
    tier,
    note: "Solo scores are practice-only (20% of raw). Only live game scores count for reward claiming.",
  });
}
