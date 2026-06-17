import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameAttempts } from "@/db/schema/content";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/game/play-counts → { counts: { [gameId]: number } }
 * Total recorded plays per GameKit game (from gameAttempts). Powers the hub's
 * most-played ordering. Counts logged-in plays only (guests aren't persisted).
 */
export async function GET() {
    try {
        const rows = await db
            .select({
                gameId: gameAttempts.gameId,
                count: sql<number>`count(*)::int`,
            })
            .from(gameAttempts)
            .groupBy(gameAttempts.gameId);

        const counts: Record<string, number> = {};
        for (const r of rows) if (r.gameId) counts[r.gameId] = r.count;
        return NextResponse.json({ counts });
    } catch (e) {
        console.error("play-counts error:", e);
        return NextResponse.json({ counts: {} });
    }
}
