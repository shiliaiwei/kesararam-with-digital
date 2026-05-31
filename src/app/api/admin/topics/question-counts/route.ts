import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sql } from "@/lib/db";

/**
 * GET /api/admin/topics/question-counts
 *
 * Returns real-time question counts per topic, broken down by difficulty.
 * Used by the admin questions panel to show accurate "Q" counts in the topics list
 * and the metrics bar (total / easy / medium / hard) in the topic detail view.
 *
 * Optional query params:
 *   - categoryId: filter to a specific category
 *   - topicId: get counts for a single topic
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.id || session.role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const categoryId = searchParams.get("categoryId");
        const topicId = searchParams.get("topicId");

        // Single query: count questions per topic, grouped by difficulty
        // Returns one row per (topic_id, difficulty) combination
        const rows = await sql`
      SELECT
        q.topic_id,
        q.difficulty,
        COUNT(*)::int AS cnt
      FROM questions q
      INNER JOIN topics t ON t.id = q.topic_id
      WHERE
        ${categoryId ? sql`t.category_id = ${parseInt(categoryId)}` : sql`TRUE`}
        AND ${topicId ? sql`q.topic_id = ${parseInt(topicId)}` : sql`TRUE`}
      GROUP BY q.topic_id, q.difficulty
      ORDER BY q.topic_id
    `;

        // Aggregate into a map: topicId → { total, easy, medium, hard }
        const counts: Record<number, { total: number; easy: number; medium: number; hard: number }> = {};

        for (const row of rows) {
            const tid = Number(row.topic_id);
            if (!counts[tid]) counts[tid] = { total: 0, easy: 0, medium: 0, hard: 0 };
            const diff = (row.difficulty as string) || "medium";
            const n = Number(row.cnt);
            counts[tid].total += n;
            if (diff === "easy") counts[tid].easy += n;
            else if (diff === "medium") counts[tid].medium += n;
            else if (diff === "hard") counts[tid].hard += n;
        }

        return NextResponse.json(
            { counts },
            {
                headers: {
                    // Short cache — refresh every 10s, stale for 30s
                    "Cache-Control": "private, s-maxage=10, stale-while-revalidate=30",
                },
            }
        );
    } catch (error) {
        console.error("[GET /api/admin/topics/question-counts]", error);
        return NextResponse.json({ error: "Failed to fetch counts", counts: {} }, { status: 500 });
    }
}
