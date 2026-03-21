import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status") || "published";

    const conditions: any[] = [sql`t.status = ${status}`];

    if (categoryId) {
      conditions.push(sql`t.category_id = ${parseInt(categoryId)}`);
    }

    const whereClause = sql`WHERE ${sql.join(conditions, sql` AND `)}`;

    const result = await db.execute(sql`
      SELECT 
        t.id,
        t.topic_code,
        t.name_en,
        t.name_km,
        t.description_en,
        t.description_km,
        t.primary_image_url,
        t.sub_group,
        t.law_reference,
        t.audio_url_en,
        t.audio_url_km,
        c.title_en as category_name,
        c.slug as category_slug
      FROM topics t
      LEFT JOIN categories c ON t.category_id = c.id
      ${whereClause}
      ORDER BY t.sort_order, t.created_at DESC
    `);

    return NextResponse.json({
      topics: result.rows,
    });
  } catch (error) {
    console.error("Error fetching public topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics", topics: [] },
      { status: 500 }
    );
  }
}
