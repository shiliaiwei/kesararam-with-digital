import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

// Admin requests staff to edit — sets topic back to draft
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const existing = await sql`SELECT id, status FROM topics WHERE id = ${parseInt(id)}`;
    if (!existing[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await sql`
      UPDATE topics SET
        status = 'draft',
        rejection_reason = 'Admin requested revision — please update and resubmit.',
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
    `;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/admin/topics/[id]/request-edit]", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
