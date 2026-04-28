import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, answers, topics, users } from "@/db/schema";
import { eq, desc, inArray, count } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const query = db
      .select({
        question: questions,
        topic: {
          id: topics.id,
          nameEn: topics.nameEn,
          topicCode: topics.topicCode,
        },
        creator: {
          id: users.id,
          username: users.username,
        },
      })
      .from(questions)
      .leftJoin(topics, eq(questions.topicId, topics.id))
      .leftJoin(users, eq(questions.createdBy, users.id))
      .orderBy(desc(questions.createdAt));

    const results = await query;
    
    // Fetch answers for all questions
    const questionIds = results.map(r => r.question.id);
    let allAnswers: typeof answers.$inferSelect[] = [];
    if (questionIds.length > 0) {
      allAnswers = await db.select().from(answers).where(inArray(answers.questionId, questionIds));
    }

    const formattedResults = results.map(r => ({
      ...r,
      answers: allAnswers.filter(a => a.questionId === r.question.id).sort((a, b) => a.sortOrder - b.sortOrder),
    }));

    return NextResponse.json({ questions: formattedResults });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      topicId,
      questionType,
      questionEn,
      questionKm,
      hintEn,
      hintKm,
      difficulty,
      status,
      answers: requestAnswers,
    } = body;

    if (!topicId || !questionEn) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check limit
    const [{ qCount }] = await db
      .select({ qCount: count() })
      .from(questions)
      .where(eq(questions.topicId, parseInt(topicId, 10)));
      
    if (qCount >= 5) {
      return NextResponse.json(
        { error: "A topic can have a maximum of 5 questions." },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      const [newQuestion] = await tx
        .insert(questions)
        .values({
          topicId: parseInt(topicId, 10),
          questionType: questionType || "mcq",
          questionEn,
          questionKm: questionKm || "",
          hintEn,
          hintKm,
          difficulty: difficulty || "medium",
          status: status || "published",
          createdBy: session.id,
        })
        .returning();

      if (requestAnswers && Array.isArray(requestAnswers) && requestAnswers.length > 0) {
        const answersToInsert = requestAnswers.map((a: any, i: number) => ({
          questionId: newQuestion.id,
          answerType: a.answerType || "multiple_choice",
          answerEn: a.answerEn || "",
          answerKm: a.answerKm || "",
          isCorrect: !!a.isCorrect,
          sortOrder: i,
        }));
        await tx.insert(answers).values(answersToInsert);
      }
      
      return newQuestion;
    });

    return NextResponse.json({ question: result }, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
