import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questions, topics, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
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
    return NextResponse.json({ questions: results });
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
    } = body;

    if (!topicId || !questionEn) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const [newQuestion] = await db
      .insert(questions)
      .values({
        topicId: parseInt(topicId, 10),
        questionType: questionType || "quiz",
        questionEn,
        questionKm: questionKm || "",
        hintEn,
        hintKm,
        difficulty: difficulty || "medium",
        status: status || "published",
        createdBy: session.id,
      })
      .returning();

    return NextResponse.json({ question: newQuestion }, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
