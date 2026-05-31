import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

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
      const hasImages = answers.some((a: any) => a.imageUrl);
      const multiCorrect = answers.filter((a: any) => a.isCorrect).length > 1;
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
