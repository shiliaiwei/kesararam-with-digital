import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get questions for this topic
    const questionsResult = await db.execute(sql`
      SELECT 
        q.id,
        q.question_en,
        q.question_km,
        q.hint_en,
        q.hint_km,
        q.image_url,
        q.audio_url_en,
        q.audio_url_km,
        q.difficulty
      FROM questions q
      WHERE q.topic_id = ${params.id}
        AND q.status = 'published'
      ORDER BY q.sort_order, q.created_at
    `);

    const questions = questionsResult.rows;

    // Get answers for each question
    for (const question of questions) {
      const answersResult = await db.execute(sql`
        SELECT 
          a.id,
          a.answer_en,
          a.answer_km,
          a.is_correct,
          a.image_url
        FROM answers a
        WHERE a.question_id = ${question.id}
        ORDER BY a.sort_order
      `);
      (question as any).answers = answersResult.rows;
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
