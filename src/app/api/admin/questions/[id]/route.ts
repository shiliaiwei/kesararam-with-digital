import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const questionId = parseInt(id);

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
    console.error("[GET /api/admin/questions/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const questionId = parseInt(id);

    // Delete question (answers will cascade delete)
    await sql`DELETE FROM questions WHERE id = ${questionId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/admin/questions/[id]]", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const questionId = parseInt(id);
    const body = await request.json();

    const {
      questionEn,
      questionKm,
      hintEn,
      hintKm,
      imageUrl,
      difficulty,
      answers,
    } = body;

    // Update question
    await sql`
      UPDATE questions SET
        question_en = ${questionEn},
        question_km = ${questionKm || ""},
        hint_en = ${hintEn || null},
        hint_km = ${hintKm || null},
        image_url = ${imageUrl || null},
        difficulty = ${difficulty || "medium"}
      WHERE id = ${questionId}
    `;

    // Delete old answers
    await sql`DELETE FROM answers WHERE question_id = ${questionId}`;

    // Create new answers
    if (answers && answers.length > 0) {
      const answerArray = Array.isArray(answers) ? (answers as unknown[]).map(x => x as { imageUrl?: string; isCorrect?: boolean }) : [];
      const hasImages = answerArray.some(a => Boolean(a.imageUrl));
      const multiCorrect = answerArray.filter(a => a.isCorrect).length > 1;
      const defaultType = hasImages ? "image_selection" : multiCorrect ? "checkbox" : "multiple_choice";

      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];
        const aType = answer.imageUrl ? "image_selection" : defaultType;
        await sql`
          INSERT INTO answers (
            question_id, answer_type, answer_en, answer_km, is_correct,
            image_url, sort_order, created_at
          ) VALUES (
            ${questionId}, ${aType}, ${answer.answerEn}, ${answer.answerKm || ""},
            ${answer.isCorrect || false}, ${answer.imageUrl || null},
            ${i}, NOW()
          )
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PUT /api/admin/questions/[id]]", error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}
