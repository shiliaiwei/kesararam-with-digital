import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions } from "@/db/schema/game";
import { questions, answers, topics, categories } from "@/db/schema/content";
import { getSession } from "@/lib/auth";
import { generateSessionCode, GAME_MODE_TYPES, mapContentToGameType } from "@/lib/game-engine";
import { eq, and, inArray, sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["teacher", "admin"].includes(user.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const {
    categoryIds,
    difficulty = "mixed",
    questionCount = 10,
    timePerQuestion = 30,
    scoringMode = "speed",
    gameType = "quick-quiz",
  } = body;

  if (!categoryIds?.length) {
    return NextResponse.json({ error: "Select at least one category" }, { status: 400 });
  }

  // Fetch questions — allow draft + approved so test data works
  const allQuestions = await db
    .select({
      id: questions.id,
      imageUrl: questions.imageUrl,
      audioUrlEn: questions.audioUrlEn,
      audioUrlKm: questions.audioUrlKm,
      difficulty: questions.difficulty,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .where(
      and(
        inArray(questions.status, ["approved", "draft"]),
        inArray(topics.categoryId, categoryIds),
        difficulty !== "mixed" ? eq(questions.difficulty, difficulty) : undefined
      )
    );

  if (allQuestions.length === 0) {
    return NextResponse.json(
      { error: "No questions found for the selected categories. Add questions first." },
      { status: 422 }
    );
  }

  // Filter by game mode compatibility
  const allowedTypes = GAME_MODE_TYPES[gameType] ?? ["mcq", "true_false", "image_pick"];
  const qIds = allQuestions.map((q) => q.id);

  const answerCounts = await db
    .select({ questionId: answers.questionId, count: sql<number>`count(*)::int` })
    .from(answers)
    .where(inArray(answers.questionId, qIds))
    .groupBy(answers.questionId);

  const countMap = new Map(answerCounts.map((a) => [a.questionId, a.count]));

  const compatible = allQuestions.filter((q) => {
    const cnt = countMap.get(q.id) ?? 0;
    const gt = mapContentToGameType({
      answerCount: cnt,
      hasImage: !!q.imageUrl,
      hasAudio: !!(q.audioUrlEn || q.audioUrlKm),
    });
    return allowedTypes.includes(gt);
  });

  if (compatible.length === 0) {
    return NextResponse.json(
      { error: `No compatible questions for "${gameType}" mode. Try a different mode or category.` },
      { status: 422 }
    );
  }

  const shuffled = compatible.sort(() => Math.random() - 0.5).slice(0, questionCount);
  const questionIds = shuffled.map((q) => q.id);

  // Get first category name for the session record
  const [firstCat] = await db
    .select({ slug: categories.slug })
    .from(categories)
    .where(eq(categories.id, categoryIds[0]));

  // Generate unique session code
  let sessionCode = "";
  for (let i = 0; i < 10; i++) {
    const code = generateSessionCode();
    const existing = await db
      .select({ id: gameSessions.id })
      .from(gameSessions)
      .where(and(eq(gameSessions.sessionCode, code), eq(gameSessions.status, "lobby")));
    if (!existing.length) { sessionCode = code; break; }
  }
  if (!sessionCode)
    return NextResponse.json({ error: "Could not generate unique code" }, { status: 500 });

  // Insert using actual schema columns only
  const [session] = await db
    .insert(gameSessions)
    .values({
      sessionCode,
      hostId: user.id,
      gameMode: gameType,
      category: firstCat?.slug ?? null,
      difficulty: difficulty === "mixed" ? null : difficulty,
      questionIds,
      timePerQuestion,
      scoringMode,
      status: "lobby",
    })
    .returning();

  const warning =
    questionIds.length < questionCount
      ? `Only ${questionIds.length} questions found (requested ${questionCount})`
      : undefined;

  return NextResponse.json(
    { sessionCode: session.sessionCode, sessionId: session.id, status: "lobby", warning },
    { status: 201 }
  );
}

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(gameSessions)
    .where(user.role === "admin" ? undefined : eq(gameSessions.hostId, user.id))
    .orderBy(sql`${gameSessions.createdAt} desc`)
    .limit(50);

  return NextResponse.json({ sessions: rows });
}
