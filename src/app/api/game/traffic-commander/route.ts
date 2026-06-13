import { NextRequest, NextResponse } from "next/server";
import { getPriorityScenes } from "@/lib/gamekit/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/game/traffic-commander?count=5 — random approved scenes WITHOUT the
 * answer key (correctOrder). Phase 1 serves Mode A for every scene.
 */
export async function GET(req: NextRequest) {
    try {
        const count = parseInt(req.nextUrl.searchParams.get("count") || "5", 10) || 5;
        const scenes = await getPriorityScenes(count);
        const rounds = scenes.map((s) => ({ ...s, mode: "A" as const }));
        return NextResponse.json({ rounds });
    } catch (e) {
        console.error("traffic-commander GET error:", e);
        return NextResponse.json({ error: "Failed to load" }, { status: 500 });
    }
}
