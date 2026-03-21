import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update topic status to approved and published
    const result = await db.execute(sql`
      UPDATE topics 
      SET 
        status = 'published',
        approved_by = ${session.id},
        approved_at = NOW(),
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // Also update all questions for this topic to published
    await db.execute(sql`
      UPDATE questions 
      SET status = 'published'
      WHERE topic_id = ${params.id}
    `);

    return NextResponse.json({ 
      success: true,
      topic: result.rows[0]
    });
  } catch (error) {
    console.error("Error approving topic:", error);
    return NextResponse.json(
      { error: "Failed to approve topic" },
      { status: 500 }
    );
  }
}
