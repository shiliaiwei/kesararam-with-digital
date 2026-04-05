import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "staff" && session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = Number(session.id);
    const isAdmin = session.role === "admin";

    const rows = await sql`
      SELECT
        COUNT(*)::int                                                        AS total,
        COUNT(*) FILTER (WHERE status = 'pending')::int                     AS pending,
        COUNT(*) FILTER (WHERE status = 'approved')::int                    AS approved,
        COUNT(*) FILTER (WHERE status = 'rejected')::int                    AS rejected,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int AS this_week
      FROM topics
      WHERE ${isAdmin ? sql`1=1` : sql`created_by = ${userId}`}
    `;

    const r = rows[0] ?? { total: 0, pending: 0, approved: 0, rejected: 0, this_week: 0 };
    const reviewed = (r.approved ?? 0) + (r.rejected ?? 0);
    const approvalRate = reviewed > 0 ? Math.round(((r.approved ?? 0) / reviewed) * 100) : 0;

    return NextResponse.json({
      stats: {
        totalContent:    r.total      ?? 0,
        pendingApproval: r.pending    ?? 0,
        approved:        r.approved   ?? 0,
        rejected:        r.rejected   ?? 0,
        thisWeek:        r.this_week  ?? 0,
        approvalRate,
      },
    });
  } catch (error) {
    console.error("Staff analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
