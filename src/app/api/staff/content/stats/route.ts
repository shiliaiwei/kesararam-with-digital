import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Per-category counts (all content, not just own)
    const categoryStats = await sql`
      SELECT
        c.id as category_id,
        c.slug as category_slug,
        COUNT(t.id)::int as total,
        COUNT(t.id) FILTER (WHERE t.status = 'published')::int as published,
        COUNT(t.id) FILTER (WHERE t.status = 'pending')::int as pending,
        COUNT(t.id) FILTER (WHERE t.status = 'draft')::int as draft
      FROM categories c
      LEFT JOIN topics t ON t.category_id = c.id
      GROUP BY c.id, c.slug
      ORDER BY c.id
    `;

    // Own submissions stats
    const userId = Number(session.id);
    const myStats = await sql`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
        COUNT(*) FILTER (WHERE status = 'published')::int as published,
        COUNT(*) FILTER (WHERE status = 'draft')::int as draft,
        COUNT(*) FILTER (WHERE status = 'rejected')::int as rejected,
        COUNT(*) FILTER (WHERE status = 'approved')::int as approved
      FROM topics
      WHERE created_by = ${userId}
    `;

    return NextResponse.json({
      categoryStats,
      myStats: myStats[0] || {},
    });
  } catch (error) {
    console.error("Error fetching staff stats:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
