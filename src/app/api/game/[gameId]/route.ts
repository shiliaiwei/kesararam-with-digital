import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resolveAccess } from "@/lib/gamekit/access";
import { KID_GAMES } from "@/lib/gamekit/kid-games";

export const dynamic = "force-dynamic";

/** GET /api/game/[gameId] — gated rounds for a kid game. */
export async function GET(
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
            { error: "locked", locked: true, lockMessage: access.message },
            { status: 403 }
        );
    }

    try {
        const count = parseInt(req.nextUrl.searchParams.get("count") || "5", 10) || 5;
        const rounds = await spec.buildRounds(count);
        return NextResponse.json({ rounds });
    } catch (e) {
        console.error(`kid game ${gameId} GET error:`, e);
        return NextResponse.json({ error: "Failed to load" }, { status: 500 });
    }
}
