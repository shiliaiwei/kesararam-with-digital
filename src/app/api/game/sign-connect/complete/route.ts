import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resolveAccess } from "@/lib/gamekit/access";
import { KID_GAMES } from "@/lib/gamekit/kid-games";
import { recordSignConnectAttempt } from "@/lib/gamekit/server";
import type { RoundResult } from "@/lib/gamekit/types";

export const dynamic = "force-dynamic";

interface SignConnectPick {
    signId: number;
    meaningId: number;
}

/**
 * POST /api/game/sign-connect/complete — re-validate every submitted pair
 * server-side (correct iff meaning id === sign id), score, and record only when
 * access allows. Client correctness is cosmetic; practice-only, no leaderboard.
 */
export async function POST(req: NextRequest) {
    const spec = KID_GAMES["sign-connect"];
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
        const result = await recordSignConnectAttempt(
            session?.id ?? null,
            access.willRecord,
            rounds.map((r) => ({
                payload: r.payload as { picks?: SignConnectPick[] },
            }))
        );
        return NextResponse.json(result);
    } catch (e) {
        console.error("sign-connect complete error:", e);
        return NextResponse.json({ error: "Failed to record" }, { status: 500 });
    }
}
