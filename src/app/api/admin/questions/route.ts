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

    const params: any[] = [];
    const conditions: string[] = [];

    if (categoryId) {
      params.push(Number(categoryId));
      conditions.push(`t.category_id = $${params.length}`);
    }

    if (topicId) {
      params.push(Number(topicId));
      conditions.push(`q.topic_id = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      const p = `$${params.length}`;
      conditions.push(`(q.question_en ILIKE ${p} OR q.question_km ILIKE ${p} OR t.name_en ILIKE ${p})`);
    }

    if (difficulty && difficulty !== "all") {
      params.push(difficulty);
      conditions.push(`q.difficulty = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        q.id,
        q.topic_id        AS "topicId",
        q.question_en     AS "questionEn",
        q.question_km     AS "questionKm",
        q.difficulty,
        q.created_at      AS "createdAt",
        t.name_en         AS "topicName",
        t.category_id     AS "categoryId",
        c.title_en        AS "categoryName",
        COUNT(a.id)::int  AS "answerCount",
        CASE
          WHEN COUNT(a.id) = 2
               AND COUNT(a.id) FILTER (WHERE a.answer_en IN ('True','False')) = 2
            THEN 'true-false'
          WHEN COUNT(a.id) FILTER (WHERE a.is_correct = true) > 1
            THEN 'multi-select'
          WHEN COUNT(a.id) FILTER (WHERE a.image_url IS NOT NULL) > 0
            THEN 'image-match'
          ELSE 'mcq'
        END AS "questionType"
      FROM questions q
      LEFT JOIN topics    t ON q.topic_id    = t.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN answers   a ON q.id          = a.question_id
      ${whereClause}
      GROUP BY q.id, t.name_en, t.category_id, c.title_en
      ORDER BY q.created_at DESC
      LIMIT 500
    `;

    const rows = await sql.unsafe(query, params);
    let filteredQuestions = Array.isArray(rows) ? rows : [];

    if (type && type !== "all") {
      filteredQuestions = filteredQuestions.filter((q: any) => q.questionType === type);
    }

    return NextResponse.json({ questions: filteredQuestions, total: filteredQuestions.length });
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
    const { topicId, questionEn, questionKm, hintEn, hintKm, imageUrl, difficulty, pointsMultiplier, answers } = body;

    if (!topicId || !questionEn || !answers || answers.length < 2) {
      return NextResponse.json({ error: "Missing required fields: topicId, questionEn, and at least 2 answers" }, { status: 400 });
    }

    if (!answers.some((a: any) => a.isCorrect)) {
      return NextResponse.json({ error: "At least one answer must be marked correct" }, { status: 400 });
    }

    const hasImages = answers.some((a: any) => a.imageUrl);
    const multiCorrect = answers.filter((a: any) => a.isCorrect).length > 1;
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

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
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
