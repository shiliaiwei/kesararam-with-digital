import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions } from "@/db/schema/game";
import { questions, answers, topics } from "@/db/schema/content";
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
    sessionName,
    categoryIds,
    difficulty = "mixed",
    questionCount = 10,
    timePerQuestion = 30,
    scoringMode = "speed",
    language = "both",
    gameType = "mixed",
    allowLateJoin = true,
  } = body;

  if (!sessionName || !categoryIds?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Fetch approved questions from requested categories
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
        eq(questions.status, "approved"),
        inArray(topics.categoryId, categoryIds),
        difficulty !== "mixed" ? eq(questions.difficulty, difficulty) : undefined
      )
    );

  // Filter by game type compatibility
  const allowedTypes = GAME_MODE_TYPES[gameType] ?? ["mcq", "true_false", "image_pick"];

  // Get answer counts per question to determine game type
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
  const questionIds = shuffled.map((q) => q.id);

  // Generate unique session code
  let sessionCode = "";
  for (let i = 0; i < 10; i++) {
    const code = generateSessionCode();
    const existing = await db
      .select({ id: gameSessions.id })
      .from(gameSessions)
      .where(and(eq(gameSessions.sessionCode, code), eq(gameSessions.status, "lobby")));
    if (!existing.length) {
      sessionCode = code;
      break;
    }
  }
  if (!sessionCode)
    return NextResponse.json({ error: "Could not generate unique code" }, { status: 500 });

  const [session] = await db
    .insert(gameSessions)
    .values({
      sessionCode,
      hostId: user.id,
      sessionName,
      categoryIds,
      difficulty,
      questionCount: questionIds.length || questionCount,
      timePerQuestion,
      scoringMode,
      language,
      gameType,
      allowLateJoin,
      questionIds,
      status: "lobby",
    })
    .returning();

  const warning =
    questionIds.length < questionCount
      ? `Only ${questionIds.length} compatible questions found (requested ${questionCount})`
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
