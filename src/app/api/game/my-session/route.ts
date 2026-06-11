import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gameSessions, gameParticipants } from "@/db/schema/game";
import { getSession } from "@/lib/auth";
import { eq, and, inArray, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

/**
 * GET /api/game/my-session
 * Returns the room code of an in-progress session the logged-in student is a
 * participant of (status lobby | active | paused), so the Play hub can auto-
 * rejoin without re-entering the code. Returns { code: null } when none.
 */
export async function GET() {
    const user = await getSession();
    if (!user) return NextResponse.json({ code: null });

    try {
        const rows = await db
            .select({
                code: gameSessions.sessionCode,
                status: gameSessions.status,
                startedAt: gameSessions.startedAt,
            })
            .from(gameParticipants)
            .innerJoin(gameSessions, eq(gameParticipants.sessionId, gameSessions.id))
            .where(
                and(
                    eq(gameParticipants.userId, user.id),
                    inArray(gameSessions.status, ["lobby", "active", "paused"])
                )
            )
            .orderBy(desc(gameSessions.startedAt))
            .limit(1);

        if (rows.length === 0) return NextResponse.json({ code: null });
        return NextResponse.json({ code: rows[0].code, status: rows[0].status });
    } catch {
        return NextResponse.json({ code: null });
    }
}
