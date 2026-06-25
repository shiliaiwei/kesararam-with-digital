import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, sql as raw } from "@/lib/db";
import { sql } from "drizzle-orm";

/**
 * GET /api/admin/questions/pending
 * Lists individual questions awaiting review (status = 'pending'), regardless of
 * the parent topic's status. This surfaces questions that staff added to topics
 * that are already published — they never appear in the topic-level review queue.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const creator = searchParams.get("creator");

    let conditions = sql`q.status = 'pending'`;
    if (categoryId) {
      conditions = sql`${conditions} AND t.category_id = ${parseInt(categoryId)}`;
    }
    if (search) {
      const likeSearch = `%${search}%`;
      conditions = sql`${conditions} AND (q.question_en ILIKE ${likeSearch} OR q.question_km ILIKE ${likeSearch})`;
    }
    if (creator) {
      conditions = sql`${conditions} AND u.display_name = ${creator}`;
    }

    const result = await db.execute(sql`
      SELECT
        q.id,
        q.topic_id,
        q.question_en,
        q.question_km,
        q.hint_en,
        q.hint_km,
        q.image_url,
        q.difficulty,
        q.status,
        q.created_at,
        t.topic_code,
        t.name_en   AS topic_name_en,
        t.status    AS topic_status,
        t.category_id,
        c.title_en  AS category_name,
        u.display_name AS creator_name
      FROM questions q
      LEFT JOIN topics t     ON t.id = q.topic_id
      LEFT JOIN categories c ON c.id = t.category_id
      LEFT JOIN users u      ON u.id = q.created_by
      WHERE ${conditions}
      ORDER BY q.created_at DESC
    `);

    const questions = result.rows as Record<string, unknown>[];

    // Attach answers per question
    for (const q of questions) {
      const answers = await raw`
        SELECT
          a.id,
          a.answer_en  AS "answerEn",
          a.answer_km  AS "answerKm",
          a.is_correct AS "isCorrect",
          a.image_url  AS "imageUrl",
          a.sort_order
        FROM answers a
        WHERE a.question_id = ${q.id as number}
        ORDER BY a.sort_order
      `;
      q.answers = answers;
    }

    const statsResult = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE status = 'pending')::int  AS pending,
        COUNT(*) FILTER (WHERE status = 'published' AND DATE(created_at) = CURRENT_DATE)::int AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected'  AND DATE(created_at) = CURRENT_DATE)::int AS rejected
      FROM questions
    `);

    return NextResponse.json({
      questions,
      stats: statsResult.rows[0] || { pending: 0, approved: 0, rejected: 0 },
    });
  } catch (error) {
    console.error("[GET /api/admin/questions/pending]", error);
    return NextResponse.json(
      { error: "Failed to fetch pending questions", questions: [], stats: { pending: 0, approved: 0, rejected: 0 } },
      { status: 500 }
    );
  }
}
