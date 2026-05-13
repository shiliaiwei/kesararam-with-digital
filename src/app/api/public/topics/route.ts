import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status") || "published";
    const search = searchParams.get("search");
    const subGroup = searchParams.get("subGroup");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "40"));
    const offset = (page - 1) * limit;

    // 1. Base conditions for both queries
    let conditions = sql`t.status = ${status}`;
    if (categoryId) {
      conditions = sql`${conditions} AND t.category_id = ${parseInt(categoryId)}`;
    }

    // 2. Fetch Aggregates (total count and counts by subGroup)
    // We do this BEFORE adding search/subGroup filters so the UI always has the total baseline counts
    const aggResult = await db.execute(sql`
      SELECT sub_group, COUNT(*) as count 
      FROM topics t 
      WHERE ${conditions} 
      GROUP BY sub_group
    `);

    let total = 0;
    const subGroupCounts: Record<string, number> = {};
    for (const row of aggResult.rows) {
      const count = parseInt(row.count as string);
      if (row.sub_group) {
        subGroupCounts[row.sub_group as string] = count;
      }
      total += count;
    }

    // 3. Add Search & SubGroup filters for the main paginated query
    if (search) {
      const searchPattern = `%${search}%`;
      conditions = sql`${conditions} AND (t.name_en ILIKE ${searchPattern} OR t.name_km ILIKE ${searchPattern} OR t.topic_code ILIKE ${searchPattern})`;
    }
    if (subGroup) {
      conditions = sql`${conditions} AND t.sub_group = ${subGroup}`;
    }

    // 4. Fetch Paginated Topics
    const result = await db.execute(sql`
      SELECT 
        t.id, t.topic_code, t.name_en, t.name_km, t.description_en, t.description_km, 
        t.primary_image_url, t.sub_group, t.law_reference, t.audio_url_en, t.audio_url_km, 
        t.category_id, t.status, COUNT(*) OVER() AS filtered_count
      FROM topics t
      WHERE ${conditions}
      ORDER BY t.topic_code ASC, t.sort_order ASC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // The filtered_count tells us how many items match the current search/filter
    const filteredTotal = result.rows.length > 0 ? parseInt(result.rows[0].filtered_count as string) : 0;
    const topics = result.rows.map(({ filtered_count, ...topic }) => topic);

    return NextResponse.json(
      { 
        topics,
        aggregates: {
          total,
          subGroups: subGroupCounts,
          filteredTotal
        },
        pagination: {
          page,
          limit,
          hasMore: offset + topics.length < filteredTotal
        }
      },
      {
        headers: {
          // Since the results now depend on many query params, caching at the edge is tricky.
          // For now, we will cache heavily but vary by query string (Vercel handles this by default).
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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
