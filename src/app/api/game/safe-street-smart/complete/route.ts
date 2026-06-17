import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resolveAccess } from "@/lib/gamekit/access";
import { KID_GAMES } from "@/lib/gamekit/kid-games";
import { recordGameAttempt } from "@/lib/gamekit/server";
import type { RoundResult } from "@/lib/gamekit/types";

export const dynamic = "force-dynamic";

/**
 * POST /api/game/safe-street-smart/complete
 * Server-side scoring for the Safe Street Smart MCQ quiz.
 * Correctness is validated server-side by comparing picked choice id against
 * the correct answer in the static question bank.
 */
export async function POST(req: NextRequest) {
    const spec = KID_GAMES["safe-street-smart"];
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
        const result = await recordGameAttempt(
            "safe-street-smart",
            session?.id ?? null,
            access.willRecord,
            rounds,
            spec.scoringMode
        );
        return NextResponse.json(result);
    } catch (e) {
        console.error("safe-street-smart complete error:", e);
        return NextResponse.json({ error: "Failed to record" }, { status: 500 });
    }
}
