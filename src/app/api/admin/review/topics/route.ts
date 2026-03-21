import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.id || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "pending";

    // Build WHERE conditions
    const conditions: string[] = [`t.status = '${status}'`];

    if (categoryId) {
      conditions.push(`t.category_id = ${parseInt(categoryId)}`);
    }

    if (search) {
      conditions.push(`(t.name_en ILIKE '%${search}%' OR t.name_km ILIKE '%${search}%' OR t.topic_code ILIKE '%${search}%')`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await sql`
      SELECT 
        t.*,
        c.title_en as category_name,
        u.name as creator_name,
        (SELECT COUNT(*)::int FROM questions WHERE topic_id = t.id) as question_count
      FROM topics t
      LEFT JOIN categories c ON t.category_id = c.id
      LEFT JOIN users u ON t.created_by = u.id
      ${sql.unsafe(whereClause)}
      ORDER BY t.created_at DESC
    `;

    // Get stats for today
    const statsResult = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'pending')::int as pending,
        COUNT(*) FILTER (WHERE status = 'approved' AND DATE(approved_at) = CURRENT_DATE)::int as approved,
        COUNT(*) FILTER (WHERE status = 'rejected' AND DATE(updated_at) = CURRENT_DATE)::int as rejected
      FROM topics
    `;

    return NextResponse.json({
      topics: result,
      stats: statsResult[0] || { pending: 0, approved: 0, rejected: 0 },
    });
  } catch (error) {
    console.error("Error fetching review topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics", topics: [], stats: { pending: 0, approved: 0, rejected: 0 } },
      { status: 500 }
    );
  }
}
