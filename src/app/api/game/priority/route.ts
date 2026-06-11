import { NextRequest, NextResponse } from "next/server";
import { getPriorityScenes } from "@/lib/gamekit/server";

export const dynamic = "force-dynamic";

/** GET /api/game/priority?count=5 — random approved scenes WITHOUT correctOrder. */
export async function GET(req: NextRequest) {
    try {
        const count = parseInt(req.nextUrl.searchParams.get("count") || "5", 10) || 5;
        const rounds = await getPriorityScenes(count);
        return NextResponse.json({ rounds });
    } catch (e) {
        console.error("priority GET error:", e);
        return NextResponse.json({ error: "Failed to load" }, { status: 500 });
    }
}
