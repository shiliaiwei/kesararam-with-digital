import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

// GET - Retrieve details of a single question and its answers
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || (session.role !== "staff" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: topicId, qid } = await params;
    const questionId = parseInt(qid);

    // Verify question belongs to this topic
    const existing = await sql`SELECT id FROM questions WHERE id = ${questionId} AND topic_id = ${topicId}`;
    if (!existing[0]) return NextResponse.json({ error: "Question not found" }, { status: 404 });

    const questionResult = await sql`
      SELECT * FROM questions WHERE id = ${questionId}
    `;
    const question = questionResult[0];
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const answers = await sql`
      SELECT * FROM answers WHERE question_id = ${questionId} ORDER BY sort_order
    `;
    question.answers = answers;

    return NextResponse.json({ question });
  } catch (error) {
    console.error("[GET /api/staff/topics/[id]/questions/[qid]]", error);
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 });
  }
}

// PUT - Update a question and its answers
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || (session.role !== "staff" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: topicId, qid } = await params;
    const questionId = parseInt(qid);
    const body = await request.json();

    // Authorization check: Admin can edit anything. Staff can edit draft/rejected topics they created
    if (session.role !== "admin") {
      const topicResult = await sql`SELECT created_by, status FROM topics WHERE id = ${topicId}`;
      const topic = topicResult[0];
      if (!topic) {
        return NextResponse.json({ error: "Topic not found" }, { status: 404 });
      }

      const isOwner = topic.created_by === Number(session.id);
      const isRejected = topic.status === "rejected";
      const isDraft = topic.status === "draft";

      if (!isOwner && !isRejected && !isDraft) {
        return NextResponse.json({ error: "Forbidden - topic is not editable" }, { status: 403 });
      }
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

    // Verify question belongs to this topic
    const existing = await sql`SELECT id FROM questions WHERE id = ${questionId} AND topic_id = ${topicId}`;
    if (!existing[0]) return NextResponse.json({ error: "Question not found" }, { status: 404 });

    const status = session.role === "admin" ? "published" : "pending";

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
        difficulty = ${difficulty || "medium"},
        points_multiplier = ${pointsMultiplier || 2},
        status = ${status}
      WHERE id = ${questionId}
    `;

    // Replace answers
    const answerList: Record<string, unknown>[] = Array.isArray(answers) ? answers as Record<string, unknown>[] : [];
    if (answerList.length > 0) {
      await sql`DELETE FROM answers WHERE question_id = ${questionId}`;
      const aType = answerList.some((a) => Boolean(a['imageUrl'])) ? 'image_selection' : answerList.length === 2 ? 'multiple_choice' : 'multiple_choice';
      for (let i = 0; i < answerList.length; i++) {
        const a = answerList[i];
        await sql`
          INSERT INTO answers (question_id, answer_type, answer_en, answer_km, is_correct, image_url, sort_order, created_at)
          VALUES (${questionId}, ${aType}, ${a.answerEn}, ${a.answerKm || ""}, ${a.isCorrect || false}, ${a.imageUrl || null}, ${i}, NOW())
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

// DELETE - Delete a question and its answers
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; qid: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || (session.role !== "staff" && session.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: topicId, qid } = await params;
    const questionId = parseInt(qid);

    // Authorization check: Admin can edit anything. Staff can edit draft/rejected topics they created
    if (session.role !== "admin") {
      const topicResult = await sql`SELECT created_by, status FROM topics WHERE id = ${topicId}`;
      const topic = topicResult[0];
      if (!topic) {
        return NextResponse.json({ error: "Topic not found" }, { status: 404 });
      }

      const isOwner = topic.created_by === Number(session.id);
      const isRejected = topic.status === "rejected";
      const isDraft = topic.status === "draft";

      if (!isOwner && !isRejected && !isDraft) {
        return NextResponse.json({ error: "Forbidden - topic is not editable" }, { status: 403 });
      }
    }

    const existing = await sql`SELECT id FROM questions WHERE id = ${questionId} AND topic_id = ${topicId}`;
    if (!existing[0]) return NextResponse.json({ error: "Question not found" }, { status: 404 });

    await sql`DELETE FROM answers WHERE question_id = ${questionId}`;
    await sql`DELETE FROM questions WHERE id = ${questionId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
