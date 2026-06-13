import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resolveAccess } from "@/lib/gamekit/access";
import { KID_GAMES } from "@/lib/gamekit/kid-games";
import { recordTickSignAttempt } from "@/lib/gamekit/server";
import type { RoundResult } from "@/lib/gamekit/types";

export const dynamic = "force-dynamic";

interface TickPick {
    promptId: number;
    pickedId: number;
    tMs?: number;
}

/**
 * POST /api/game/tick-sign/complete — re-validate each row server-side (correct
 * iff picked image id === row prompt id), score, and record only when access
 * allows. Client correctness is cosmetic; practice-only, no leaderboard.
 */
export async function POST(req: NextRequest) {
    const spec = KID_GAMES["tick-sign"];
    const session = await getSession();
    const access = await resolveAccess(spec.accessTier, session);
    if (!access.allowed) {
        return NextResponse.json(
            { error: "locked", lockMessage: access.message },
            { status: 403 }
        );
    }

    try {
        const body = await req.json().catch(() => ({}));
        const rounds: RoundResult[] = Array.isArray(body?.rounds) ? body.rounds : [];
        const result = await recordTickSignAttempt(
            session?.id ?? null,
            access.willRecord,
            rounds.map((r) => ({ payload: r.payload as { picks?: TickPick[] } }))
        );
        return NextResponse.json(result);
    } catch (e) {
        console.error("tick-sign complete error:", e);
        return NextResponse.json({ error: "Failed to record" }, { status: 500 });
    }
}
