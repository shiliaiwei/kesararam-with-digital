import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { calculateScore, PLAY_LIMITS } from "@/lib/game-engine";
import { awardStorePoints } from "@/lib/store-points/award";
import { db } from "@/lib/db";
import { answers, gameScores, pointsLedger } from "@/db/schema/content";
import { users, classEnrollments, classes } from "@/db/schema/users";
import { eq, sql, and, gte, count, inArray } from "drizzle-orm";
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
export async function getStudentPlayLimit(userId: number): Promise<{
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
    const isPro = plan !== "free";
    return isPro
      ? { limit: PLAY_LIMITS.studentPro, tier: "studentPro" }
      : { limit: PLAY_LIMITS.studentClass, tier: "studentClass" };
  } catch {
    return { limit: PLAY_LIMITS.studentClass, tier: "studentClass" };
  }
}

/** Count today's solo gameScores rows for this student (Asia/Phnom_Penh = UTC+7). */
export async function getSoloPlaysToday(userId: number): Promise<number> {
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
 *   soloPoints = rawScore   ← full value; solo is a SEPARATE practice currency
 *
 * Solo points are:
 *   ❌ NOT added to users.lifetimePoints (that is LIVE priority points only / rank)
 *   ✅ Written to pointsLedger with source="solo"  (separate solo board column)
 *   ❌ NOT counted for reward claiming (only source="live-session:%" counts)
 *      → exchanging solo points for store items is a planned future update.
 *
 * ── Daily play limits (server-enforced for students) ─────────────────────────
 *   student (no class)       → 67 games/day
 *   student (class, free)    → 100 games/day
 *   student (class, pro)     → 200 games/day
 *   guest (no account)       → 9 games/day — enforced client-side via localStorage
 */
export async function POST(req: NextRequest) {
  const session = await getSession();

  const body = await req.json();
  const {
    answers: answerInputs,
    totalQuestions,
    timeTakenSeconds,
    timePerQuestion = 30,
    scoringMode = "speed",
    gameMode = "quick-quiz",
  } = body as {
    answers: AnswerInput[];
    totalQuestions?: number;
    timeTakenSeconds: number;
    gameMode?: string;
    timePerQuestion?: number;
    scoringMode?: string;
  };
  const submittedAnswers = Array.isArray(answerInputs) ? answerInputs : [];
  const declaredTotalQuestions = Number.isFinite(totalQuestions)
    ? Math.max(0, Math.floor(Number(totalQuestions)))
    : 0;
  const totalUnits = Math.max(submittedAnswers.length, declaredTotalQuestions);

  // ── Server-side daily limit check (authenticated students) ──────────────────
  let playsToday = 0;
  let playsAllowed: number = PLAY_LIMITS.guest;
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
              ? `You've reached today's ${playsAllowed} plays. Solo practice helps you learn, but those points can't be redeemed for rewards — join your teacher's class to earn claimable points in live games.`
              : tier === "studentClass"
              ? `Your class has reached today's ${playsAllowed} plays. To unlock unlimited play and host live classroom games with premium claimable points, ask your teacher about a Kesararam plan.`
              : `Daily limit reached (${playsAllowed}/${playsAllowed} games). Come back tomorrow, or join a live session to keep earning.`,
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

  const submittedAnswerIds = [
    ...new Set(
      submittedAnswers
        .map((ans) => ans.answerId)
        .filter((id): id is number => typeof id === "number"),
    ),
  ];
  const verifiedAnswers = submittedAnswerIds.length > 0
    ? await db
        .select({
          id: answers.id,
          questionId: answers.questionId,
          isCorrect: answers.isCorrect,
        })
        .from(answers)
        .where(inArray(answers.id, submittedAnswerIds))
    : [];
  const verifiedAnswerById = new Map(verifiedAnswers.map((ans) => [ans.id, ans]));

  const perQuestion: {
    questionId: number;
    isCorrect: boolean;
    rawPoints: number;
    soloPoints: number;
    timeTakenMs: number;
  }[] = [];

  for (const ans of submittedAnswers) {
    const verified = typeof ans.answerId === "number"
      ? verifiedAnswerById.get(ans.answerId)
      : undefined;
    const isCorrect = !!verified && verified.questionId === ans.questionId && verified.isCorrect;

    if (isCorrect) streak++;
    else streak = 0;

    const remainingTimeMs = Math.max(0, totalTimeMs - ans.timeTakenMs);
    const scoreResult = calculateScore({
      isCorrect,
      difficulty: ans.difficulty ?? "medium",
      scoringMode: scoringMode as "speed" | "equal",
      remainingTimeMs,
      totalTimeMs,
      currentStreak: streak,
    });

    rawScore += scoreResult.totalPoints;
    if (isCorrect) correctCount++;

    perQuestion.push({
      questionId: ans.questionId,
      isCorrect,
      rawPoints: scoreResult.totalPoints,
      soloPoints: scoreResult.totalPoints,
      timeTakenMs: ans.timeTakenMs,
    });
  }

  // Solo points = full raw score (separate practice currency, not claimable yet)
  const soloPoints = rawScore;

  const accuracyPercentage =
    totalUnits > 0
      ? Math.round((correctCount / totalUnits) * 100)
      : 0;

  let isNewPersonalBest = false;
  let newLifetimePoints: number | undefined;

  // ── Persist to DB (logged-in students only) ─────────────────────────────────
  // A completed game ALWAYS counts as a play (recorded + counted toward the daily
  // limit + totalGamesPlayed) even when the student scored 0 — otherwise an
  // all-wrong run would silently bypass the daily limit and skew totals. Only the
  // points writes (ledger row + lifetimePoints) are gated on soloPoints > 0 so we
  // never insert a zero-point ledger row.
  if (session?.id && session.role === "student") {
    try {
      const [scoreRow] = await db
        .insert(gameScores)
        .values({
          userId: session.id,
          gameMode,
          score: rawScore,                          // raw score stored for display/audit
          totalQuestions: totalUnits,
          correctAnswers: correctCount,
          timeTaken: timeTakenSeconds,
          categoryBreakdown: JSON.stringify(perQuestion),
          scoreDifference: 0,                        // solo records at full value now
          scoreType: "solo",
          gameType: gameMode,
        })
        .returning({ id: gameScores.id });

      // Store Points: solo is NOT claimable in the live-only economy — this call
      // is rejected by the source="solo" guard in awardStorePoints (and is also
      // inert until STORE_POINTS_ENABLED). Kept so solo can be re-enabled later
      // without re-threading the call. Runs alongside the legacy solo ledger.
      try {
        await awardStorePoints({
          userId: session.id,
          gameType: gameMode,
          source: "solo",
          attemptId: scoreRow ? String(scoreRow.id) : null,
          correctUnits: correctCount,
          totalUnits,
          valid: true,
          idempotencyKey: `${session.id}:${gameMode}:${scoreRow?.id ?? rawScore}`,
        });
      } catch (err) {
        console.error("[solo/complete] store-points award failed:", err);
      }

      // source="solo" → its OWN board column; excluded from claimable balance and
      // from lifetimePoints (live priority points only). Skip zero-point runs.
      if (soloPoints > 0) {
        await db.insert(pointsLedger).values({
          userId: session.id,
          source: "solo",
          gameType: gameMode,
          points: soloPoints,                     // full raw score to the solo ledger
        });
      }

      // NOTE: solo does NOT touch lifetimePoints anymore. We only update the
      // play counter + personal-best (highestScore) for display.
      const [updatedUser] = await db
        .update(users)
        .set({
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
      console.log(`[solo/complete] DB write success for user ${session.id}: RawScore=${rawScore}, PointsAwarded=${soloPoints}, Diff=${rawScore - soloPoints}, GameType=${gameMode}, ScoreType=solo`);
    } catch (err) {
      console.error("[solo/complete] DB write failed:", err);
    }
  }

  const scoreDifference = 0; // solo now records at full value
  console.log(`[solo/complete] Scoring audit recorded: GameMode/GameType=${gameMode}, ScoreType=solo, RawScore=${rawScore}, SoloPoints=${soloPoints} (full value, separate currency)`);

  return NextResponse.json({
    rawScore,
    soloPoints,
    scoreDifference,
    scoreType: "solo",
    gameType: gameMode,
    accuracyPercentage,
    timeTakenSeconds,
    correctAnswers: correctCount,
    totalQuestions: totalUnits,
    isNewPersonalBest,
    newLifetimePoints,
    perQuestion,
    // Limit state — client uses this for limit widget
    playsToday,
    playsAllowed,
    remainingPlays: Math.max(0, playsAllowed - playsToday),
    tier,
    note: "Solo scores are a separate practice currency (full value). Only live game scores count toward rank and reward claiming. Spending solo points is a planned future update.",
  });
}
