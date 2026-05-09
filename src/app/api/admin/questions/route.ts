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

    // Build query with filters
    let query = `
      SELECT 
        q.id,
        q.topic_id as "topicId",
        q.question_en as "questionEn",
        q.question_km as "questionKm",
        q.difficulty,
        q.created_at as "createdAt",
        t.name_en as "topicName",
        c.title_en as "categoryName",
        COUNT(a.id)::int as "answerCount",
        CASE 
          WHEN COUNT(a.id) = 2 THEN 'true-false'
          WHEN COUNT(a.id) FILTER (WHERE a.is_correct = true) > 1 THEN 'multi-select'
          WHEN COUNT(a.id) FILTER (WHERE a.image_url IS NOT NULL) > 0 THEN 'image-match'
          ELSE 'mcq'
        END as "questionType"
      FROM questions q
      LEFT JOIN topics t ON q.topic_id = t.id
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN answers a ON q.id = a.question_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (search) {
      query += ` AND (q.question_en ILIKE $${params.length + 1} OR q.question_km ILIKE $${params.length + 1} OR t.name_en ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (difficulty && difficulty !== "all") {
      query += ` AND q.difficulty = $${params.length + 1}`;
      params.push(difficulty);
    }

    query += `
      GROUP BY q.id, t.name_en, c.title_en
      ORDER BY q.created_at DESC
      LIMIT 500
    `;

    const questions = await sql.unsafe(query, params);

    // Filter by type if specified (post-query since it's computed)
    let filteredQuestions = questions;
    if (type && type !== "all") {
      filteredQuestions = questions.filter((q: any) => q.questionType === type);
    }

    return NextResponse.json({ questions: filteredQuestions });
  } catch (error) {
    console.error("[GET /api/admin/questions]", error);
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      topicId,
      questionEn,
      questionKm,
      hintEn,
      hintKm,
      imageUrl,
      difficulty,
      answers,
    } = body;

    if (!topicId || !questionEn || !answers || answers.length < 2) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create question
    const questionResult = await sql`
      INSERT INTO questions (
        topic_id, question_en, question_km, hint_en, hint_km,
        image_url, difficulty, created_by, created_at
      ) VALUES (
        ${topicId}, ${questionEn}, ${questionKm || ""}, ${hintEn || null}, ${hintKm || null},
        ${imageUrl || null}, ${difficulty || "medium"}, ${session.id}, NOW()
      )
      RETURNING id
    `;

    const questionId = questionResult[0].id;

    // Create answers
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      await sql`
        INSERT INTO answers (
          question_id, answer_en, answer_km, is_correct,
          image_url, sort_order, created_at
        ) VALUES (
          ${questionId}, ${answer.answerEn}, ${answer.answerKm || ""},
          ${answer.isCorrect || false}, ${answer.imageUrl || null},
          ${i}, NOW()
        )
      `;
    }

    return NextResponse.json({ success: true, questionId }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/questions]", error);
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
