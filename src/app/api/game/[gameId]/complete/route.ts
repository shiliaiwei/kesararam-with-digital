import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resolveAccess } from "@/lib/gamekit/access";
import { KID_GAMES } from "@/lib/gamekit/kid-games";
import { recordGameAttempt } from "@/lib/gamekit/server";
import type { RoundResult } from "@/lib/gamekit/types";

export const dynamic = "force-dynamic";

/** POST /api/game/[gameId]/complete — score + record only when access allows. */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ gameId: string }> }
) {
    const { gameId } = await params;
    const spec = KID_GAMES[gameId];
    if (!spec) {
        return NextResponse.json({ error: "Unknown game" }, { status: 404 });
    }

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
            gameId,
            session?.id ?? null,
            access.willRecord,
            rounds
        );
        return NextResponse.json(result);
    } catch (e) {
        console.error(`kid game ${gameId} complete error:`, e);
        return NextResponse.json({ error: "Failed to record" }, { status: 500 });
    }
}
