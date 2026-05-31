import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

// PUT - Update a question and its answers — ADMIN ONLY
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Only admins can edit questions" }, { status: 403 });
    }

    const { id: topicId, qid } = await params;
    const body = await request.json();
    const { questionEn, questionKm, hintEn, hintKm, imageUrl, audioUrlEn, audioUrlKm, difficulty, answers } = body;

    // Verify question belongs to this topic
    const existing = await sql`SELECT id FROM questions WHERE id = ${qid} AND topic_id = ${topicId}`;
    if (!existing[0]) return NextResponse.json({ error: "Question not found" }, { status: 404 });

    // Update question
    await sql`
      UPDATE questions SET
        question_en = ${questionEn},
        question_km = ${questionKm || ""},
        hint_en = ${hintEn || null},
        hint_km = ${hintKm || null},
        image_url = ${imageUrl || null},
        audio_url_en = ${audioUrlEn || null},
        audio_url_km = ${audioUrlKm || null},
        difficulty = ${difficulty || "medium"}
      WHERE id = ${qid}
    `;

    // Replace answers
    const answerList: Record<string, unknown>[] = Array.isArray(answers) ? answers as Record<string, unknown>[] : [];
    if (answerList.length > 0) {
      await sql`DELETE FROM answers WHERE question_id = ${qid}`;
      const aType = answerList.some((a) => Boolean(a['imageUrl'])) ? 'image_selection' : answerList.length === 2 ? 'multiple_choice' : 'multiple_choice';
      for (let i = 0; i < answerList.length; i++) {
        const a = answerList[i];
        await sql`
          INSERT INTO answers (question_id, answer_type, answer_en, answer_km, is_correct, image_url, sort_order, created_at)
          VALUES (${qid}, ${aType}, ${a.answerEn}, ${a.answerKm || ""}, ${a.isCorrect || false}, ${a.imageUrl || null}, ${i}, NOW())
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

// DELETE - Delete a question and its answers — ADMIN ONLY
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Only admins can delete questions" }, { status: 403 });
    }

    const { id: topicId, qid } = await params;

    const existing = await sql`SELECT id FROM questions WHERE id = ${qid} AND topic_id = ${topicId}`;
    if (!existing[0]) return NextResponse.json({ error: "Question not found" }, { status: 404 });

    await sql`DELETE FROM answers WHERE question_id = ${qid}`;
    await sql`DELETE FROM questions WHERE id = ${qid}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
