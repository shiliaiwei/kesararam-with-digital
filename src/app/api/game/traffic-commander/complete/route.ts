import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { validateTrafficCommander } from "@/lib/gamekit/server";
import type { RoundResult } from "@/lib/gamekit/types";
import type { Pt } from "@/lib/gamekit/formats/traffic-commander/geometry";

export const dynamic = "force-dynamic";

/** POST /api/game/traffic-commander/complete — validate drawn paths + order, score. */
export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        const body = await req.json().catch(() => ({}));
        const raw: RoundResult[] = Array.isArray(body?.rounds) ? body.rounds : [];

        const rounds = raw.map((r) => {
            const payload = (r.payload ?? {}) as {
                paths?: Record<string, Pt[]>;
                drawOrder?: unknown;
            };
            return {
                sceneId: r.refId,
                paths:
                    payload.paths && typeof payload.paths === "object"
                        ? payload.paths
                        : {},
                drawOrder: Array.isArray(payload.drawOrder)
                    ? (payload.drawOrder as string[])
                    : [],
                timeTakenMs: r.timeTakenMs ?? 30_000,
            };
        });

        const result = await validateTrafficCommander(session?.id ?? null, rounds);
        return NextResponse.json(result);
    } catch (e) {
        console.error("traffic-commander complete error:", e);
        return NextResponse.json({ error: "Failed to record" }, { status: 500 });
    }
}
