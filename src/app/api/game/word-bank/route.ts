import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { resolveAccess } from "@/lib/gamekit/access";
import { KID_GAMES } from "@/lib/gamekit/kid-games";

export const dynamic = "force-dynamic";

/** GET /api/game/word-bank — gated rounds (8 sign pictures + a word bank each). */
export async function GET(req: NextRequest) {
    const spec = KID_GAMES["word-bank"];
    const session = await getSession();
    const access = await resolveAccess(spec.accessTier, session);
    if (!access.allowed) {
        return NextResponse.json(
            { error: "locked", locked: true, lockMessage: access.message },
            { status: 403 }
        );
    }

    try {
        const count = parseInt(req.nextUrl.searchParams.get("count") || "2", 10) || 2;
        const rounds = await spec.buildRounds(count);
        return NextResponse.json({ rounds });
    } catch (e) {
        console.error("word-bank GET error:", e);
        return NextResponse.json({ error: "Failed to load" }, { status: 500 });
    }
}
