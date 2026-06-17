import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions } from "@/db/schema/game";
import { questions, answers, topics, categories } from "@/db/schema/content";
import { classes } from "@/db/schema/users";
import { getSession } from "@/lib/auth";
import { generateSessionCode, GAME_MODE_TYPES, mapContentToGameType } from "@/lib/game-engine";
import { selectRandomQuestions } from "@/lib/question-selector";
import { buildTickSignLiveRows } from "@/lib/gamekit/live-tick-sign";
import { enforceSessionCreation, getUserSubscription } from "@/lib/subscription";
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
    maxPlayers = 50,
    language = "both",
    classId = null,
  } = body;

  // Click the Sign sources signs directly (no category bank), so it needs no category.
  if (gameType !== "tick-sign" && !categoryIds?.length) {
    return NextResponse.json({ error: "Select at least one category" }, { status: 400 });
  }

  // ── Validate optional class scoping ──
  // When a classId is provided, only that class's students may join the game.
  // The host must own the class (admins may scope to any class).
  let scopedClassId: number | null = null;
  if (classId != null) {
    const parsedClassId = Number(classId);
    if (!Number.isInteger(parsedClassId)) {
      return NextResponse.json({ error: "Invalid class selection" }, { status: 400 });
    }
    const [cls] = await db
      .select({ id: classes.id, teacherId: classes.teacherId })
      .from(classes)
      .where(eq(classes.id, parsedClassId))
      .limit(1);
    if (!cls) {
      return NextResponse.json({ error: "Selected class not found" }, { status: 404 });
    }
    if (user.role !== "admin" && cls.teacherId !== user.id) {
      return NextResponse.json({ error: "You do not own the selected class" }, { status: 403 });
    }
    scopedClassId = cls.id;
  }

  // ── Subscription enforcement (skip for admin) ──
  if (user.role !== "admin") {
    try {
      const blockReason = await enforceSessionCreation(user.id, maxPlayers);
      if (blockReason) {
        return NextResponse.json({ error: blockReason, upgradeRequired: true }, { status: 403 });
      }

      const { limits } = await getUserSubscription(user.id);
      if (maxPlayers > limits.maxPlayersPerSession) {
        return NextResponse.json(
          { error: `Your plan allows max ${limits.maxPlayersPerSession} players.`, upgradeRequired: true },
          { status: 403 }
        );
      }
    } catch (subErr) {
      console.warn("[sessions] subscription check failed, allowing session:", subErr);
    }
  }

  // ── Click the Sign (tick-sign): official non-MCQ live game ──
  // Build image-pick rows from published sign topics and store them in roundData
  // (no question bank). questionIds holds the per-row prompt ids so the existing
  // index/timer/scoring/sync machinery works unchanged.
  if (gameType === "tick-sign") {
    const rows = await buildTickSignLiveRows(questionCount);
    if (rows.length < 4) {
      return NextResponse.json(
        { error: "Not enough published signs for Click the Sign." },
        { status: 422 }
      );
    }
    let tsCode = "";
    for (let i = 0; i < 10; i++) {
      const c = generateSessionCode();
      const existing = await db
        .select({ id: gameSessions.id })
        .from(gameSessions)
        .where(and(eq(gameSessions.sessionCode, c), eq(gameSessions.status, "lobby")));
      if (!existing.length) { tsCode = c; break; }
    }
    if (!tsCode)
      return NextResponse.json({ error: "Could not generate unique code" }, { status: 500 });

    const [tsSession] = await db
      .insert(gameSessions)
      .values({
        sessionCode: tsCode,
        hostId: user.id,
        gameMode: "tick-sign",
        category: null,
        classId: scopedClassId,
        difficulty: null,
        questionIds: rows.map((r) => r.promptId),
        roundData: JSON.stringify({ rows }),
        timePerQuestion,
        scoringMode,
        maxPlayers: Math.min(Math.max(maxPlayers, 1), 200),
        language,
        status: "lobby",
      })
      .returning();

    return NextResponse.json(
      { sessionCode: tsSession.sessionCode, sessionId: tsSession.id, status: "lobby", questionCount: rows.length },
      { status: 201 }
    );
  }

  // Fetch questions — allow draft + approved so test data works
  const allQuestions = await db
    .select({
      id: questions.id,
      imageUrl: questions.imageUrl,
      audioUrlEn: questions.audioUrlEn,
      audioUrlKm: questions.audioUrlKm,
      difficulty: questions.difficulty,
      categoryId: topics.categoryId,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .where(
      and(
        inArray(questions.status, ["approved", "draft", "published"]),
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
    .select({
      questionId: answers.questionId,
      count: sql<number>`count(*)::int`,
      hasImage: sql<boolean>`bool_or(${answers.imageUrl} is not null)`,
    })
    .from(answers)
    .where(inArray(answers.questionId, qIds))
    .groupBy(answers.questionId);

  const countMap = new Map(answerCounts.map((a) => [a.questionId, { count: a.count, hasImage: a.hasImage }]));

  const compatible = allQuestions.filter((q) => {
    const stats = countMap.get(q.id);
    if (!stats || stats.count === 0) return false;
    const gt = mapContentToGameType({
      answerCount: stats.count,
      hasImage: stats.hasImage,
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

  // Use the new truly random selection algorithm
  // This ensures unpredictable question selection that changes every time
  const selectedQuestions = selectRandomQuestions({
    questions: compatible,
    questionCount,
    categoryIds,
    userId: user.id,
    sessionTime: Date.now(),
  });

  const questionIds = selectedQuestions.map((q) => q.id);

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
      classId: scopedClassId,
      difficulty: difficulty === "mixed" ? null : difficulty,
      questionIds,
      timePerQuestion,
      scoringMode,
      maxPlayers: Math.min(Math.max(maxPlayers, 1), 200),
      language,
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
