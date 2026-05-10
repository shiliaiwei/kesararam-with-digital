import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status") || "published";

    // Build WHERE conditions safely using Drizzle sql
    let conditions = sql`t.status = ${status}`;

    if (categoryId) {
      conditions = sql`${conditions} AND t.category_id = ${parseInt(categoryId)}`;
    }

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
        t.category_id,
        t.status
      FROM topics t
      WHERE ${conditions}
      ORDER BY t.sort_order, t.created_at DESC
    `);

    return NextResponse.json(
      { topics: result.rows },
      {
        headers: {
          // Cache at Vercel edge for 5 minutes, stale-while-revalidate for 1 hour
          // Signs don't change often — this eliminates DB hits for most requests
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching public topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch topics", topics: [] },
      { status: 500 }
    );
  }
}
