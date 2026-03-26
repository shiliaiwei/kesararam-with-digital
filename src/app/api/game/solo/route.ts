import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants } from "@/db/schema/game";
import { questions, answers, topics } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { generateSessionCode, GAME_MODE_TYPES, mapContentToGameType } from "@/lib/game-engine";
import { eq, and, inArray, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    categoryIds,
    difficulty = "mixed",
    questionCount = 10,
    timePerQuestion = 30,
    gameMode = "quick-quiz",
    language = "both",
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
        eq(questions.status, "approved"),
        inArray(topics.categoryId, categoryIds),
        difficulty !== "mixed" ? eq(questions.difficulty, difficulty) : undefined
      )
    );

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
      const gt = mapContentToGameType({
        answerCount: cnt,
        hasImage: !!q.imageUrl,
        hasAudio: !!(q.audioUrlEn || q.audioUrlKm),
      });
      return allowedTypes.includes(gt);
    });
  }

  const shuffled = compatible.sort(() => Math.random() - 0.5).slice(0, questionCount);

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

  // Create solo session
  const sessionCode = generateSessionCode();
  const [session] = await db
    .insert(gameSessions)
    .values({
      sessionCode,
      hostId: user.id,
      sessionName: `Solo - ${gameMode}`,
      categoryIds,
      difficulty,
      questionCount: shuffled.length,
      timePerQuestion,
      scoringMode: "speed",
      language,
      gameType: gameMode,
      allowLateJoin: false,
      questionIds: selectedIds,
      status: "active",
      isSoloPractice: true,
      startedAt: new Date(),
    })
    .returning();

  await db.insert(gameParticipants).values({
    sessionId: session.id,
    userId: user.id,
    displayName: user.name,
    avatar: user.avatar ?? null,
    totalScore: 0,
    correctAnswers: 0,
    currentStreak: 0,
    isConnected: true,
  });

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
      answers: ans.map((a) => ({
        id: a.id,
        answerEn: a.answerEn,
        answerKm: a.answerKm,
        imageUrl: a.imageUrl ?? null,
        isCorrect: a.isCorrect, // revealed only in solo mode
      })),
    };
  });

  return NextResponse.json({
    sessionId: session.id,
    sessionCode: session.sessionCode,
    questions: questionsPayload,
    timePerQuestion,
    gameMode,
  });
}
