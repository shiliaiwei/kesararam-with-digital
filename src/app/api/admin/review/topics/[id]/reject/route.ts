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

    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Add rejection_reason column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE topics 
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
    `);

    // Update topic status to rejected
    const result = await db.execute(sql`
      UPDATE topics 
      SET 
        status = 'rejected',
        rejection_reason = ${reason},
        updated_at = NOW()
      WHERE id = ${params.id}
      RETURNING *
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      topic: result.rows[0]
    });
  } catch (error) {
    console.error("Error rejecting topic:", error);
    return NextResponse.json(
      { error: "Failed to reject topic" },
      { status: 500 }
    );
  }
}
