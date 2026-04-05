import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || (session.role !== "admin" && session.role !== "staff")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Per-category stats with sub-group breakdown
    const categoryStats = await sql`
      SELECT
        c.id as category_id,
        c.title_en as category_name,
        c.slug as category_slug,
        COUNT(t.id)::int as total,
        COUNT(t.id) FILTER (WHERE t.status = 'published')::int as published,
        COUNT(t.id) FILTER (WHERE t.status = 'pending')::int as pending,
        COUNT(t.id) FILTER (WHERE t.status = 'draft')::int as draft,
        COUNT(t.id) FILTER (WHERE t.status = 'rejected')::int as rejected,
        COUNT(t.id) FILTER (WHERE t.status = 'approved')::int as approved
      FROM categories c
      LEFT JOIN topics t ON t.category_id = c.id
      GROUP BY c.id, c.title_en, c.slug
      ORDER BY c.id
    `;

    // Sub-group breakdown per category
    const subGroupStats = await sql`
      SELECT
        t.category_id,
        t.sub_group,
        COUNT(t.id)::int as total,
        COUNT(t.id) FILTER (WHERE t.status = 'published')::int as published,
        COUNT(t.id) FILTER (WHERE t.status = 'pending')::int as pending,
        COUNT(t.id) FILTER (WHERE t.status = 'draft')::int as draft,
        COUNT(t.id) FILTER (WHERE t.status = 'rejected')::int as rejected
      FROM topics t
      WHERE t.sub_group IS NOT NULL
      GROUP BY t.category_id, t.sub_group
      ORDER BY t.category_id, t.sub_group
    `;

    // Overall totals
    const totals = await sql`
      SELECT
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'published')::int as published,
        COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
        COUNT(*) FILTER (WHERE status = 'draft')::int as draft,
        COUNT(*) FILTER (WHERE status = 'rejected')::int as rejected,
        COUNT(*) FILTER (WHERE status = 'approved')::int as approved
      FROM topics
    `;

    // Recent activity (last 10 updated topics)
    const recent = await sql`
      SELECT
        t.id, t.topic_code, t.name_en, t.status, t.updated_at,
        c.title_en as category_name, c.slug as category_slug,
        u.display_name as updated_by_name
      FROM topics t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.updated_at DESC
      LIMIT 10
    `;

    return NextResponse.json({
      totals: totals[0] || {},
      categoryStats,
      subGroupStats,
      recent,
    });
  } catch (error) {
    console.error("Error fetching content overview:", error);
    return NextResponse.json({ error: "Failed to fetch overview" }, { status: 500 });
  }
}
