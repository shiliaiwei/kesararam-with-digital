import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, answers, topics, categories } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { GAME_MODE_TYPES, mapContentToGameType } from "@/lib/game-engine";
import { eq, and, inArray, sql } from "drizzle-orm";

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
  } = body;

  if (!categoryIds?.length)
    return NextResponse.json({ error: "categoryIds required" }, { status: 400 });

  const allowedTypes = GAME_MODE_TYPES[gameMode] ?? ["mcq", "true_false"];

  const allQuestions = await db
    .select({
      id: questions.id,
      questionEn: questions.questionEn,
      questionKm: questions.questionKm,
      imageUrl: questions.imageUrl,
      audioUrlEn: questions.audioUrlEn,
      audioUrlKm: questions.audioUrlKm,
      difficulty: questions.difficulty,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .where(
      and(
        inArray(questions.status, ["approved", "draft", "published"]), // Include all non-rejected
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
      })
      .from(answers)
      .where(inArray(answers.questionId, qIds))
      .groupBy(answers.questionId);

    const countMap = new Map(answerCounts.map((a) => [a.questionId, a.count]));

    compatible = allQuestions.filter((q) => {
      const cnt = countMap.get(q.id) ?? 0;
      if (cnt === 0) return false; // Skip questions with no answers
      const gt = mapContentToGameType({
        answerCount: cnt,
        hasImage: !!q.imageUrl,
        hasAudio: !!(q.audioUrlEn || q.audioUrlKm),
      });
      return allowedTypes.includes(gt);
    });
  }

  if (compatible.length === 0) {
    return NextResponse.json({
      error: `No compatible questions for "${gameMode}" mode`
    }, { status: 404 });
  }

  // Fisher-Yates shuffle — truly random, prevents students seeing same order
  for (let i = compatible.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [compatible[i], compatible[j]] = [compatible[j], compatible[i]];
  }
  const shuffled = compatible.slice(0, questionCount);

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
  const [firstCat] = await db
    .select({ slug: categories.slug })
    .from(categories)
    .where(eq(categories.id, categoryIds[0]));

  // For solo mode, we don't create a session in the database for non-authenticated users
  // We just return the questions directly
  const questionsPayload = shuffled.map((q) => {
    const ans = answersByQ.get(q.id) ?? [];
    const gt = mapContentToGameType({
      answerCount: ans.length,
      hasImage: !!q.imageUrl,
      hasAudio: !!(q.audioUrlEn || q.audioUrlKm),
    });
    return {
      id: q.id,
      questionEn: q.questionEn,
      questionKm: q.questionKm,
      imageUrl: q.imageUrl ?? null,
      audioUrlEn: q.audioUrlEn ?? null,
      audioUrlKm: q.audioUrlKm ?? null,
      gameType: gt,
      difficulty: q.difficulty,
      answers: ans
        .map(a => ({ ...a, _r: Math.random() }))
        .sort((a, b) => a._r - b._r)
        .map(({ _r, ...a }) => ({
          id: a.id,
          answerEn: a.answerEn,
          answerKm: a.answerKm,
          imageUrl: a.imageUrl ?? null,
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
