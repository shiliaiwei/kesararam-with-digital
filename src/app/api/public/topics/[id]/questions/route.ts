import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get questions for this topic
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
        q.difficulty
      FROM questions q
      WHERE q.topic_id = ${id}
        AND q.status = 'published'
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
          a.image_url
        FROM answers a
        WHERE a.question_id = ${question.id}
        ORDER BY a.sort_order
      `;
      (question as any).answers = answers;
    }

    return NextResponse.json({
      questions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions", questions: [] },
      { status: 500 }
    );
  }
}
