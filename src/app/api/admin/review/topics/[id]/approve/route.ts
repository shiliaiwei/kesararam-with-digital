import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Update topic status to approved and published
    const result = await sql`
      UPDATE topics 
      SET 
        status = 'published',
        approved_by = ${session.id},
        approved_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Also update all questions for this topic to published
    await sql`
      UPDATE questions 
      SET status = 'published'
      WHERE topic_id = ${id}
    `;

    return NextResponse.json({ 
      success: true,
      topic: result[0]
    });
  } catch (error) {
    console.error("Error approving topic:", error);
    return NextResponse.json(
      { error: "Failed to approve topic" },
      { status: 500 }
    );
  }
}
