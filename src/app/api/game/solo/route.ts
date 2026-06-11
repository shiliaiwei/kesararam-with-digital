import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, answers, topics, categories } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { GAME_MODE_TYPES, mapContentToGameType } from "@/lib/game-engine";
import { selectRandomQuestions } from "@/lib/question-selector";
import { eq, and, inArray, sql } from "drizzle-orm";

function getSecureRandom(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / (0xffffffff + 1);
}

export async function POST(req: NextRequest) {
  // Solo mode works for both authenticated and non-authenticated users
  const user = await getSession();

  // Daily play limit check (authenticated students only)
  if (user?.id && user.role === "student") {
    const { getStudentPlayLimit, getSoloPlaysToday } = await import("./complete/route");
    const limitInfo = await getStudentPlayLimit(user.id);
    const playsToday = await getSoloPlaysToday(user.id);

    if (playsToday >= limitInfo.limit) {
      return NextResponse.json(
        {
          error: "daily_limit_reached",
          playsToday,
          playsAllowed: limitInfo.limit,
          tier: limitInfo.tier,
          message:
            limitInfo.tier === "student"
              ? `🛑 Daily student limit reached (${limitInfo.limit}/${limitInfo.limit} games). To continue practicing and start earning REAL claimable points for rewards, you MUST join your teacher's class immediately!`
              : limitInfo.tier === "studentClass"
              ? `⚡ Classroom daily limit reached (${limitInfo.limit}/${limitInfo.limit} games). To unlock unlimited play and host LIVE classroom games where you earn claimable points, force your teacher to upgrade to a Kesararam Subscription plan today!`
              : `🛑 Daily limit reached (${limitInfo.limit}/${limitInfo.limit} games/day). Come back tomorrow or join a live session!`,
        },
        { status: 429 }
      );
    }
  }

  const body = await req.json();
  const {
    categoryIds,
    difficulty = "mixed",
    questionCount = 10,
    timePerQuestion = 30,
    gameMode = "quick-quiz",
  } = body;

  const HIDDEN_MODES = new Set([
    "survival-quiz",
    "zen-review",
    "final-practice",
  ]);

  if (HIDDEN_MODES.has(gameMode)) {
    return NextResponse.json({ error: "Mode unavailable" }, { status: 403 });
  }

  if (!categoryIds?.length)
    return NextResponse.json({ error: "categoryIds required" }, { status: 400 });

  const allowedTypes = GAME_MODE_TYPES[gameMode] ?? ["mcq", "true_false"];

  // Text-only categories — no cover image should appear above the question
  const TEXT_ONLY_SLUGS = new Set([
    "road-traffic", "driving", "technical",
    "loading-people-goods", "general-knowledge", "emergency",
  ]);

  const allQuestions = await db
    .select({
      id: questions.id,
      questionEn: questions.questionEn,
      questionKm: questions.questionKm,
      imageUrl: questions.imageUrl,
      audioUrlEn: questions.audioUrlEn,
      audioUrlKm: questions.audioUrlKm,
      difficulty: questions.difficulty,
      categorySlug: categories.slug,
      topicCode: topics.topicCode,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .innerJoin(categories, eq(topics.categoryId, categories.id))
    .where(
      and(
        inArray(questions.status, ["approved", "draft", "published"]),
        inArray(topics.categoryId, categoryIds),
        difficulty !== "mixed" ? eq(questions.difficulty, difficulty) : undefined
      )
    );

  if (allQuestions.length === 0) {
    return NextResponse.json({
      error: "No questions found for selected categories"
    }, { status: 404 });
  }

  const qIds = allQuestions.map((q) => q.id);
  let compatible = allQuestions;

  if (qIds.length > 0) {
    const answerCounts = await db
      .select({
        questionId: answers.questionId,
        count: sql<number>`count(*)::int`,
        hasImage: sql<boolean>`bool_or(${answers.imageUrl} is not null)`,
      })
      .from(answers)
      .where(inArray(answers.questionId, qIds))
      .groupBy(answers.questionId);

    const countMap = new Map(answerCounts.map((a) => [a.questionId, { count: a.count, hasImage: a.hasImage }]));

    compatible = allQuestions.filter((q) => {
      const stats = countMap.get(q.id);
      if (!stats || stats.count === 0) return false; // Skip questions with no answers
      const gt = mapContentToGameType({
        answerCount: stats.count,
        hasImage: stats.hasImage,
        hasAudio: !!(q.audioUrlEn || q.audioUrlKm),
      });
      return allowedTypes.includes(gt);
    });
  }

  // Use the new truly random selection algorithm
  // This ensures unpredictable question selection that changes every time
  const selectedQuestions = selectRandomQuestions({
    questions: compatible.map(q => ({
      ...q,
      categoryId: categoryIds[0], // Will be properly mapped from the query
    })),
    questionCount,
    categoryIds,
    userId: user?.id,
    sessionTime: Date.now(),
  });

  // Fetch answers for each question
  const selectedIds = selectedQuestions.map((q) => q.id);
  const allAnswers =
    selectedIds.length > 0
      ? await db
        .select()
        .from(answers)
        .where(inArray(answers.questionId, selectedIds))
        .orderBy(answers.sortOrder)
      : [];

  const answersByQ = new Map<number, typeof allAnswers>();
  for (const a of allAnswers) {
    if (!answersByQ.has(a.questionId)) answersByQ.set(a.questionId, []);
    answersByQ.get(a.questionId)!.push(a);
  }

  // Get first category name for session record
  const firstCatSlug = allQuestions[0]?.categorySlug ?? "";

  const questionsPayload = selectedQuestions.map((q) => {
    const ans = answersByQ.get(q.id) ?? [];
    const isTextOnly = TEXT_ONLY_SLUGS.has(q.categorySlug ?? "");
    const gt = mapContentToGameType({
      answerCount: ans.length,
      hasImage: ans.some(a => !!a.imageUrl),
      hasAudio: !!(q.audioUrlEn || q.audioUrlKm),
    });

    // Shuffle answers
    let shuffled = ans
      .map(a => ({ ...a, _r: getSecureRandom() }))
      .sort((a, b) => a._r - b._r);

    // For image-pick (priority / right-of-way scenarios) show at most 3 large
    // images: always keep one correct answer + up to 2 distractors, then
    // re-shuffle so the correct option's position is random.
    if (gt === "image_pick" && shuffled.length > 3) {
      const correct = shuffled.find(a => a.isCorrect);
      const distractors = shuffled.filter(a => !a.isCorrect).slice(0, correct ? 2 : 3);
      shuffled = [...(correct ? [correct] : []), ...distractors]
        .map(a => ({ ...a, _r: getSecureRandom() }))
        .sort((a, b) => a._r - b._r);
    }

    return {
      id: q.id,
      questionEn: q.questionEn,
      questionKm: q.questionKm,
      topicCode: q.topicCode ?? null,
      // Strip cover image for text-only categories
      imageUrl: isTextOnly ? null : (q.imageUrl ?? null),
      audioUrlEn: q.audioUrlEn ?? null,
      audioUrlKm: q.audioUrlKm ?? null,
      gameType: gt,
      difficulty: q.difficulty,
      answers: shuffled
        .map(({ _r, ...a }) => ({
          id: a.id,
          answerEn: a.answerEn,
          answerKm: a.answerKm,
          // Strip answer images for text-only categories
          imageUrl: isTextOnly ? null : (a.imageUrl ?? null),
          isCorrect: a.isCorrect,
        })),
    };
  });

  return NextResponse.json({
    sessionId: user ? Date.now() : 0, // Temporary ID for non-authenticated users
    sessionCode: "SOLO",
    questions: questionsPayload,
    timePerQuestion,
    gameMode,
  });
}
