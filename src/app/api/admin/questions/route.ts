import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

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
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam) : topicId ? 9999 : 500;

    // Build raw SQL — avoids any Drizzle ORM schema mismatch
    const rows = await sql`
      SELECT
        q.id,
        q.topic_id        AS "topicId",
        q.question_en     AS "questionEn",
        q.question_km     AS "questionKm",
        q.difficulty,
        q.status,
        q.created_at      AS "createdAt",
        t.name_en         AS "topicName",
        t.category_id     AS "categoryId",
        c.title_en        AS "categoryName",
        -- answer stats
        COUNT(a.id)::int                                                        AS "answerCount",
        BOOL_OR(a.image_url IS NOT NULL)                                        AS "hasImage",
        COUNT(a.id) FILTER (WHERE a.is_correct = true)::int                     AS "correctCount",
        COALESCE(
          (COUNT(a.id) = 2 AND BOOL_AND(a.answer_en IN ('True','False','true','false'))),
          false
        )                                                                        AS "isTrueFalse"
      FROM questions q
      LEFT JOIN topics    t ON t.id = q.topic_id
      LEFT JOIN categories c ON c.id = t.category_id
      LEFT JOIN answers   a ON a.question_id = q.id
      WHERE TRUE
        ${topicId ? sql`AND q.topic_id = ${parseInt(topicId)}` : sql``}
        ${categoryId ? sql`AND t.category_id = ${parseInt(categoryId)}` : sql``}
        ${difficulty && difficulty !== "all" ? sql`AND q.difficulty = ${difficulty}` : sql``}
        ${search ? sql`AND (q.question_en ILIKE ${'%' + search + '%'} OR q.question_km ILIKE ${'%' + search + '%'})` : sql``}
      GROUP BY q.id, q.topic_id, q.question_en, q.question_km, q.difficulty, q.status, q.created_at,
               t.name_en, t.category_id, c.title_en
      ORDER BY q.created_at ASC
      LIMIT ${limit}
    `;

    // Derive question type from answer stats
    type Row = Record<string, unknown> & {
      id: number; questionEn: string; questionKm?: string; topicId?: number; topicName?: string; categoryId?: number; categoryName?: string; answerCount?: number; hasImage?: boolean; correctCount?: number; isTrueFalse?: boolean; difficulty?: string; status?: string; createdAt?: string;
    };

    const result = (rows as Row[]).map((q) => {
      const ansCount = Number(q.answerCount ?? 0);
      const hasImage = Boolean(q.hasImage);
      const correctCount = Number(q.correctCount ?? 0);
      const isTF = Boolean(q.isTrueFalse);

      let questionType = "mcq";
      if (isTF && ansCount === 2) questionType = "true-false";
      else if (correctCount > 1) questionType = "multi-select";
      else if (hasImage) questionType = "image-match";

      return {
        id: Number(q.id),
        topicId: Number(q.topicId),
        questionEn: q.questionEn,
        questionKm: q.questionKm,
        difficulty: q.difficulty || "medium",
        status: q.status || "draft",
        createdAt: q.createdAt,
        topicName: q.topicName,
        categoryId: q.categoryId ? Number(q.categoryId) : null,
        categoryName: q.categoryName,
        answerCount: ansCount,
        questionType,
      };
    });

    // Filter by type if specified
    const filtered = type && type !== "all"
      ? result.filter((q) => q.questionType === type)
      : result;

    return NextResponse.json({ questions: filtered, total: filtered.length });
  } catch (error: unknown) {
    console.error("[GET /api/admin/questions]", error);
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
    type AnswerIn = { answerEn?: string; answerKm?: string; isCorrect?: boolean; imageUrl?: string };
    const { topicId, questionEn, questionKm, hintEn, hintKm, imageUrl, difficulty, pointsMultiplier, answers: answerList } = body as { topicId?: number; questionEn?: string; questionKm?: string; hintEn?: string; hintKm?: string; imageUrl?: string; difficulty?: string; pointsMultiplier?: number; answers?: unknown };
    const answersArray = Array.isArray(answerList) ? (answerList as unknown[]).map(a => a as AnswerIn) : [];

    if (!topicId || !questionEn || !answerList || answerList.length < 2) {
      return NextResponse.json({ error: "Missing required fields: topicId, questionEn, and at least 2 answers" }, { status: 400 });
    }

    if (!answersArray.some((a) => a.isCorrect)) {
      return NextResponse.json({ error: "At least one answer must be marked correct" }, { status: 400 });
    }
    const hasImages = answersArray.some((a) => Boolean(a.imageUrl));
    const multiCorrect = answersArray.filter((a) => a.isCorrect).length > 1;
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
  } catch (error: unknown) {
    console.error("[POST /api/admin/questions]", error);
    const maybeErr = typeof error === 'object' && error !== null ? error as { message?: unknown } : undefined;
    return NextResponse.json({ error: "Failed to create question", detail: typeof maybeErr?.message === 'string' ? maybeErr.message : String(error) }, { status: 500 });
  }
}
