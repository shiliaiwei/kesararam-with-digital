import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, answers, topics, categories } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { GAME_MODE_TYPES, mapContentToGameType } from "@/lib/game-engine";
import { eq, and, inArray, sql } from "drizzle-orm";

function getSecureRandom(): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / (0xffffffff + 1);
}

export async function POST(req: NextRequest) {
  // Solo mode works for both authenticated and non-authenticated users
  const user = await getSession();

  const body = await req.json();
  const {
    categoryIds,
    difficulty = "mixed",
    questionCount = 10,
    timePerQuestion = 30,
    gameMode = "quick-quiz",
    targetGroup = "university",
  } = body;

  const HIDDEN_MODES = new Set([
    "daily-challenge",
    "exam-simulation",
    "survival-quiz",
    "zen-review",
    "final-practice",
    "mixed-practice",
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

  // Filter/prioritize questions based on targetGroup
  let targetedQuestions = compatible;

  if (targetGroup === "kid_k6") {
    // Kid (K-6): Focus on low difficulty, short questions, and prioritize image-based questions
    let filtered = compatible.filter(q => {
      const isEasy = q.difficulty === "easy" || q.difficulty === "beginner" || !q.difficulty;
      const isShort = (q.questionEn || "").length < 80;
      return isEasy && isShort;
    });

    if (filtered.length < questionCount) {
      // Fallback: relax difficulty but keep it relatively short
      filtered = compatible.filter(q => (q.questionEn || "").length < 110);
    }

    if (filtered.length > 0) {
      targetedQuestions = filtered;
    }

    // Sort so questions with images are placed first
    targetedQuestions.sort((a, b) => {
      const aImg = !!a.imageUrl ? 1 : 0;
      const bImg = !!b.imageUrl ? 1 : 0;
      return bImg - aImg;
    });
  } else if (targetGroup === "kid_k12") {
    // Kid (K-12): Prioritize signs and basic driving rules (easy/medium difficulty)
    let filtered = compatible.filter(q => q.difficulty === "easy" || q.difficulty === "medium" || !q.difficulty);
    if (filtered.length > 0) {
      targetedQuestions = filtered;
    }
  } else if (targetGroup === "university") {
    // University: standard full theory (medium/hard difficulty prioritized)
    let filtered = compatible.filter(q => q.difficulty === "medium" || q.difficulty === "hard");
    if (filtered.length >= questionCount) {
      targetedQuestions = filtered;
    }
  } else if (targetGroup === "professional") {
    // Professional: technical driving rules, priority rules, hard/advanced difficulty
    let filtered = compatible.filter(q => q.difficulty === "hard" || q.difficulty === "advanced");
    if (filtered.length < questionCount) {
      filtered = compatible.filter(q => q.difficulty === "hard" || q.difficulty === "medium");
    }
    if (filtered.length > 0) {
      targetedQuestions = filtered;
    }
  }

  // Fisher-Yates shuffle — truly random, prevents students seeing same order
  for (let i = targetedQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(getSecureRandom() * (i + 1));
    [targetedQuestions[i], targetedQuestions[j]] = [targetedQuestions[j], targetedQuestions[i]];
  }
  const shuffled = targetedQuestions.slice(0, questionCount);

  // Fetch answers for each question
  const selectedIds = shuffled.map((q) => q.id);
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

  const questionsPayload = shuffled.map((q) => {
    const ans = answersByQ.get(q.id) ?? [];
    const isTextOnly = TEXT_ONLY_SLUGS.has(q.categorySlug ?? "");
    const gt = mapContentToGameType({
      answerCount: ans.length,
      hasImage: ans.some(a => !!a.imageUrl),
      hasAudio: !!(q.audioUrlEn || q.audioUrlKm),
    });
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
      answers: ans
        .map(a => ({ ...a, _r: getSecureRandom() }))
        .sort((a, b) => a._r - b._r)
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
    targetGroup,
  });
}
