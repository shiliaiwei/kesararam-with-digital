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

    // Get answers for each question - map to camelCase for frontend
    for (const question of questions) {
      const answers = await sql`
        SELECT 
          a.id,
          a.answer_en   AS "answerEn",
          a.answer_km   AS "answerKm",
          a.is_correct  AS "isCorrect",
          a.image_url   AS "imageUrl",
          a.sort_order
        FROM answers a
        WHERE a.question_id = ${question.id}
        ORDER BY a.sort_order
      `;
      (question as Record<string, unknown>)['answers'] = answers;
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
    if (!session?.id || (session.role !== "staff" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: topicId } = await params;
    const body = await request.json();

    // Verify topic exists
    const topicResult = await sql`SELECT id FROM topics WHERE id = ${topicId}`;
    const topic = topicResult[0];
    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const {
      questionEn,
      questionKm,
      hintEn,
      hintKm,
      imageUrl,
      audioUrlEn,
      audioUrlKm,
      difficulty,
      pointsMultiplier,
      answers,
    } = body;

    const status = session.role === "admin" ? "published" : "pending";

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
        points_multiplier,
        status,
        created_by,
        created_at
      ) VALUES (
        ${topicId},
        ${questionEn},
        ${questionKm || ""},
        ${hintEn || null},
        ${hintKm || null},
        ${imageUrl || null},
        ${audioUrlEn || null},
        ${audioUrlKm || null},
        ${difficulty || 'medium'},
        ${pointsMultiplier || 2},
        ${status},
        ${session.id},
        NOW()
      )
      RETURNING *
    `;

    const question = questionResult[0];

    // Derive answer_type from answer count + image presence
    const answerType = (answers: Record<string, unknown>[]) => {
      if (answers.length === 2) return 'multiple_choice'; // true/false
      if (answers.some((a) => Boolean(a['imageUrl']))) return 'image_selection';
      return 'multiple_choice';
    };

    // Create answers (answer_type is NOT NULL)
    if (answers && answers.length > 0) {
      const aType = answerType(answers);
      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        await sql`
          INSERT INTO answers (
            question_id,
            answer_type,
            answer_en,
            answer_km,
            is_correct,
            image_url,
            sort_order
          ) VALUES (
            ${question.id},
            ${aType},
            ${answer.answerEn},
            ${answer.answerKm || ""},
            ${answer.isCorrect || false},
            ${answer.imageUrl || null},
            ${i}
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
