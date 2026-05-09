import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, sql } from "@/lib/db";
import { questions, answers, topics, categories } from "@/db/schema";
import { eq, and, ilike, or, count, inArray } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");
    const topicId = searchParams.get("topicId");

    // Build where conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conditions: any[] = [];

    if (topicId) conditions.push(eq(questions.topicId, Number(topicId)));
    if (difficulty && difficulty !== "all") conditions.push(eq(questions.difficulty, difficulty));
    if (search) {
      conditions.push(or(
        ilike(questions.questionEn, `%${search}%`),
        ilike(questions.questionKm, `%${search}%`),
      ));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    // Fetch questions with topic + category info
    const rows = await db
      .select({
        id: questions.id,
        topicId: questions.topicId,
        questionEn: questions.questionEn,
        questionKm: questions.questionKm,
        difficulty: questions.difficulty,
        createdAt: questions.createdAt,
        topicName: topics.nameEn,
        categoryId: topics.categoryId,
        categoryName: categories.titleEn,
      })
      .from(questions)
      .leftJoin(topics, eq(questions.topicId, topics.id))
      .leftJoin(categories, eq(topics.categoryId, categories.id))
      .where(
        categoryId
          ? and(where, eq(topics.categoryId, Number(categoryId)))
          : where
      )
      .orderBy(questions.createdAt)
      .limit(500);

    if (rows.length === 0) {
      return NextResponse.json({ questions: [], total: 0 });
    }

    // Fetch answer counts for all questions
    const qIds = rows.map(r => r.id);
    const answerCounts = await db
      .select({
        questionId: answers.questionId,
        answerCount: count(answers.id),
        hasImage: sql<boolean>`bool_or(${answers.imageUrl} IS NOT NULL)`,
        correctCount: sql<number>`count(*) filter (where ${answers.isCorrect} = true)`,
        isTrueFalse: sql<boolean>`count(*) = 2 AND bool_and(${answers.answerEn} IN ('True','False','true','false'))`,
      })
      .from(answers)
      .where(inArray(answers.questionId, qIds))
      .groupBy(answers.questionId);

    const countMap = new Map(answerCounts.map(a => [a.questionId, a]));

    const result = rows.map(q => {
      const ac = countMap.get(q.id);
      const ansCount = Number(ac?.answerCount ?? 0);
      const hasImage = Boolean(ac?.hasImage);
      const correctCount = Number(ac?.correctCount ?? 0);
      const isTF = Boolean(ac?.isTrueFalse);

      let questionType = "mcq";
      if (isTF && ansCount === 2) questionType = "true-false";
      else if (correctCount > 1) questionType = "multi-select";
      else if (hasImage) questionType = "image-match";

      return {
        ...q,
        answerCount: ansCount,
        questionType,
      };
    });

    // Filter by type if specified
    const filtered = type && type !== "all"
      ? result.filter(q => q.questionType === type)
      : result;

    return NextResponse.json({ questions: filtered, total: filtered.length });
  } catch (error: any) {
    console.error("[GET /api/admin/questions]", error?.message ?? error);
    return NextResponse.json({ error: "Failed to fetch questions", questions: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { topicId, questionEn, questionKm, hintEn, hintKm, imageUrl, difficulty, pointsMultiplier, answers: answerList } = body;

    if (!topicId || !questionEn || !answerList || answerList.length < 2) {
      return NextResponse.json({ error: "Missing required fields: topicId, questionEn, and at least 2 answers" }, { status: 400 });
    }

    if (!answerList.some((a: any) => a.isCorrect)) {
      return NextResponse.json({ error: "At least one answer must be marked correct" }, { status: 400 });
    }

    const hasImages = answerList.some((a: any) => a.imageUrl);
    const multiCorrect = answerList.filter((a: any) => a.isCorrect).length > 1;
    let answerType = "multiple_choice";
    if (hasImages) answerType = "image_selection";
    else if (multiCorrect) answerType = "checkbox";

    const questionResult = await sql`
      INSERT INTO questions (
        topic_id, question_en, question_km, hint_en, hint_km,
        image_url, difficulty, points_multiplier, created_by, created_at
      ) VALUES (
        ${topicId}, ${questionEn}, ${questionKm || ""},
        ${hintEn || null}, ${hintKm || null},
        ${imageUrl || null}, ${difficulty || "medium"},
        ${pointsMultiplier || 2}, ${session.id}, NOW()
      )
      RETURNING id
    `;

    const questionId = questionResult[0].id;

    for (let i = 0; i < answerList.length; i++) {
      const answer = answerList[i];
      const aType = answer.imageUrl ? "image_selection" : answerType;
      await sql`
        INSERT INTO answers (
          question_id, answer_type, answer_en, answer_km,
          is_correct, image_url, sort_order, created_at
        ) VALUES (
          ${questionId}, ${aType},
          ${answer.answerEn || ""}, ${answer.answerKm || ""},
          ${answer.isCorrect === true}, ${answer.imageUrl || null},
          ${i}, NOW()
        )
      `;
    }

    return NextResponse.json({ success: true, questionId }, { status: 201 });
  } catch (error: any) {
    console.error("[POST /api/admin/questions]", error?.message ?? error);
    return NextResponse.json({ error: "Failed to create question", detail: error?.message }, { status: 500 });
  }
}
