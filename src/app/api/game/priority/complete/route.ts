import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { validatePriority } from "@/lib/gamekit/server";
import type { RoundResult } from "@/lib/gamekit/types";

export const dynamic = "force-dynamic";

/** POST /api/game/priority/complete — validate orders, score, reveal correctOrder. */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        const body = await req.json().catch(() => ({}));
        const raw: RoundResult[] = Array.isArray(body?.rounds) ? body.rounds : [];

        const rounds = raw.map((r) => ({
            sceneId: r.refId,
            submittedOrder: Array.isArray(
                (r.payload as { submittedOrder?: unknown })?.submittedOrder
            )
                ? ((r.payload as { submittedOrder: string[] }).submittedOrder)
                : [],
            timeTakenMs: r.timeTakenMs ?? 30_000,
        }));

        const result = await validatePriority(session?.id ?? null, rounds);
        return NextResponse.json(result);
    } catch (e) {
        console.error("priority complete error:", e);
        return NextResponse.json({ error: "Failed to record" }, { status: 500 });
    }
}
