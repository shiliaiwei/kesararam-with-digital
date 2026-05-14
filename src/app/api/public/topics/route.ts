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

    // 2. Fetch Aggregates (total count, counts by subGroup, and code ranges)
    // We do this BEFORE adding search/subGroup filters so the UI always has the total baseline counts
    const aggResult = await db.execute(sql`
      SELECT sub_group, COUNT(*) as count, MIN(topic_code) as min_code, MAX(topic_code) as max_code
      FROM topics t 
      WHERE ${conditions} 
      GROUP BY sub_group
    `);

    let total = 0;
    const subGroupCounts: Record<string, number> = {};
    const subGroupRanges: Record<string, { min: string; max: string }> = {};
    for (const row of aggResult.rows) {
      const count = parseInt(row.count as string);
      if (row.sub_group) {
        subGroupCounts[row.sub_group as string] = count;
        subGroupRanges[row.sub_group as string] = {
          min: row.min_code as string,
          max: row.max_code as string,
        };
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
    // When viewing "All Signs" (no subGroup filter, no search), order by a custom priority:
    // Informative → Supplementary → Priority → Warning → Temporary → Area/Street →
    // then Prohibitory → rest → markings/lights/police (alphabetical within each group)
    const orderExpr = (!subGroup && !search)
      ? sql`
          CASE t.sub_group
            WHEN 'Informative Signs'             THEN 1
            WHEN 'Supplementary Signs'           THEN 2
            WHEN 'Priority Signs'                THEN 3
            WHEN 'Warning Signs'                 THEN 4
            WHEN 'Temporary Signs'               THEN 5
            WHEN 'Buildup Area Boundary Signs'   THEN 6
            WHEN 'Street Name Signs'             THEN 7
            WHEN 'Prohibitory Signs'             THEN 8
            WHEN 'Mandatory Signs'               THEN 9
            WHEN 'Direction Signs'               THEN 10
            WHEN 'Sign Posts'                    THEN 11
            WHEN 'Transverse Markings'           THEN 12
            WHEN 'Longitudinal Markings'         THEN 13
            WHEN 'Arrows Markings'               THEN 14
            WHEN 'Other Road Markings'           THEN 15
            WHEN 'Traffic Lights'                THEN 16
            WHEN 'Traffic Police Signals'        THEN 17
            ELSE 99
          END ASC, t.topic_code ASC`
      : sql`t.topic_code ASC, t.sort_order ASC`;

    const result = await db.execute(sql`
      SELECT 
        t.id, t.topic_code, t.name_en, t.name_km, t.description_en, t.description_km, 
        t.primary_image_url, t.sub_group, t.law_reference, t.audio_url_en, t.audio_url_km, 
        t.category_id, t.status, COUNT(*) OVER() AS filtered_count
      FROM topics t
      WHERE ${conditions}
      ORDER BY ${orderExpr}
      LIMIT ${limit} OFFSET ${offset}
    `);

    // The filtered_count tells us how many items match the current search/filter
    const filteredTotal = result.rows.length > 0 ? parseInt(result.rows[0].filtered_count as string) : 0;
    const topics = result.rows.map(({ filtered_count, ...topic }: { filtered_count: unknown; [key: string]: unknown }) => topic);

    return NextResponse.json(
      { 
        topics,
        aggregates: {
          total,
          subGroups: subGroupCounts,
          subGroupRanges,
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
