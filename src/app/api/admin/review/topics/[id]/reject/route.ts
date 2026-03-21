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
    const body = await request.json();
    const { reason } = body;

    if (!reason) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Update topic status to rejected
    const result = await sql`
      UPDATE topics 
      SET 
        status = 'rejected',
        rejection_reason = ${reason},
        reviewed_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      topic: result[0]
    });
  } catch (error) {
    console.error("Error rejecting topic:", error);
    return NextResponse.json(
      { error: "Failed to reject topic" },
      { status: 500 }
    );
  }
}
