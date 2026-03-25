import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const topicResult = await sql`
      SELECT * FROM topics WHERE id = ${id}
    `;
    const topic = topicResult[0];

    if (!topic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Staff can only submit their own content
    if (
      session.role !== "admin" &&
      topic.created_by !== Number(session.id)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if at least one question exists
    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM questions WHERE topic_id = ${id}
    `;
    const count = countResult[0]?.count || 0;

    if (count === 0) {
      return NextResponse.json(
        { error: "Cannot submit topic without questions" },
        { status: 400 }
      );
    }

    const updateResult = await sql`
      UPDATE topics 
      SET status = 'pending', submitted_at = NOW(), updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ topic: updateResult[0] });
  } catch (error) {
    console.error("Error submitting topic:", error);
    return NextResponse.json(
      { error: "Failed to submit topic" },
      { status: 500 }
    );
  }
}
