import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

// GET - Fetch questions for a topic
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || (session.role !== "staff" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const questions = await sql`
      SELECT 
        q.id,
        q.topic_id,
        q.question_en,
        q.question_km,
        q.hint_en,
        q.hint_km,
        q.image_url,
        q.audio_url_en,
        q.audio_url_km,
        q.difficulty,
        q.status,
        q.sort_order
      FROM questions q
      WHERE q.topic_id = ${id}
      ORDER BY q.sort_order, q.created_at
    `;

    // Get answers for each question
    for (const question of questions) {
      const answers = await sql`
        SELECT 
          a.id,
          a.answer_en,
          a.answer_km,
          a.is_correct,
          a.image_url,
          a.sort_order
        FROM answers a
        WHERE a.question_id = ${question.id}
        ORDER BY a.sort_order
      `;
      (question as any).answers = answers;
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST - Create a new question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: topicId } = await params;
    const body = await request.json();

    const {
      questionEn,
      questionKm,
      hintEn,
      hintKm,
      imageUrl,
      audioUrlEn,
      audioUrlKm,
      difficulty,
      answers,
    } = body;

    // Create question
    const questionResult = await sql`
      INSERT INTO questions (
        topic_id,
        question_en,
        question_km,
        hint_en,
        hint_km,
        image_url,
        audio_url_en,
        audio_url_km,
        difficulty,
        status,
        created_by,
        created_at,
        updated_at
      ) VALUES (
        ${topicId},
        ${questionEn},
        ${questionKm || null},
        ${hintEn || null},
        ${hintKm || null},
        ${imageUrl || null},
        ${audioUrlEn || null},
        ${audioUrlKm || null},
        ${difficulty || 'medium'},
        'draft',
        ${session.id},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const question = questionResult[0];

    // Create answers
    if (answers && answers.length > 0) {
      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        await sql`
          INSERT INTO answers (
            question_id,
            answer_en,
            answer_km,
            is_correct,
            image_url,
            sort_order,
            created_at,
            updated_at
          ) VALUES (
            ${question.id},
            ${answer.answerEn},
            ${answer.answerKm || null},
            ${answer.isCorrect || false},
            ${answer.imageUrl || null},
            ${i},
            NOW(),
            NOW()
          )
        `;
      }
    }

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
