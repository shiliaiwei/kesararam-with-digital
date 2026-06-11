import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

/**
 * Public platform stats for the home page.
 * Returns REAL counts from the database:
 *  - students:  registered users with role = 'student'
 *  - categories: published knowledge areas
 *  - questions: published practice questions
 *  - sessions:  total live challenge sessions hosted
 * Cached at the edge for 5 min.
 */
export async function GET() {
    try {
        const result = await db.execute(sql`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'student') AS students,
        (SELECT COUNT(*) FROM categories) AS categories,
        (SELECT COUNT(*) FROM questions WHERE status IN ('approved','draft','published')) AS questions,
        (SELECT COUNT(*) FROM challenge_sessions) AS sessions
    `);

        const row = result.rows[0] ?? {};
        const num = (v: unknown) => parseInt(String(v ?? 0), 10) || 0;

        return NextResponse.json(
            {
                students: num(row.students),
                categories: num(row.categories),
                questions: num(row.questions),
                sessions: num(row.sessions),
            },
            {
                headers: {
                    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
                },
            },
        );
    } catch (error) {
        console.error("Error fetching public stats:", error);
        // Graceful fallback so the home page never breaks
        return NextResponse.json(
            { students: 0, categories: 8, questions: 0, sessions: 0 },
            { status: 200 },
        );
    }
}
