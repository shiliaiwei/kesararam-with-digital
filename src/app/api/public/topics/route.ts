import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status") || "published";

    const conditions: string[] = [`t.status = '${status}'`];

    if (categoryId) {
      conditions.push(`t.category_id = ${parseInt(categoryId)}`);
    }

    const whereClause = conditions.length > 0 
      ? sql.unsafe(`WHERE ${conditions.join(' AND ')}`)
      : sql``;

    const result = await sql`
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
        t.category_id,
        t.status
      FROM topics t
      ${whereClause}
      ORDER BY t.sort_order, t.created_at DESC
    `;

    return NextResponse.json({
      topics: result,
    });
  } catch (error) {
    console.error("Error fetching public topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics", topics: [] },
      { status: 500 }
    );
  }
}
