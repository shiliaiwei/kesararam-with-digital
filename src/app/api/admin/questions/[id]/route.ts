import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, answers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      topicId,
      questionType,
      questionEn,
      questionKm,
      hintEn,
      hintKm,
      difficulty,
      timeLimit,
      pointsMultiplier,
      status,
      answers: requestAnswers,
    } = body;

    const result = await db.transaction(async (tx) => {
      const [updatedQuestion] = await tx
        .update(questions)
        .set({
          topicId: topicId ? parseInt(topicId, 10) : undefined,
          questionType,
          questionEn,
          questionKm,
          hintEn,
          hintKm,
          difficulty,
          timeLimit: timeLimit ? parseInt(timeLimit, 10) : undefined,
          pointsMultiplier: pointsMultiplier !== undefined ? parseInt(pointsMultiplier, 10) : undefined,
          status,
        })
        .where(eq(questions.id, parseInt(id, 10)))
        .returning();

      if (!updatedQuestion) {
        return null;
      }

      if (requestAnswers && Array.isArray(requestAnswers)) {
        // Delete old answers
        await tx.delete(answers).where(eq(answers.questionId, updatedQuestion.id));

        // Insert new answers
        if (requestAnswers.length > 0) {
          const answersToInsert = requestAnswers.map((a: any, i: number) => ({
            questionId: updatedQuestion.id,
            answerType: a.answerType || "multiple_choice",
            answerEn: a.answerEn || "",
            answerKm: a.answerKm || "",
            isCorrect: !!a.isCorrect,
            sortOrder: i,
          }));
          await tx.insert(answers).values(answersToInsert);
        }
      }

      return updatedQuestion;
    });

    if (!result) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ question: result });
  } catch (error) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: "Failed to update question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [deletedQuestion] = await db
      .delete(questions)
      .where(eq(questions.id, parseInt(id, 10)))
      .returning();

    if (!deletedQuestion) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: "Failed to delete question" },
      { status: 500 }
    );
  }
}
