import { NextRequest, NextResponse } from "next/server";
import { validateTrafficCommander } from "@/lib/gamekit/server";
import type { RoundResult } from "@/lib/gamekit/types";
import type { Pt } from "@/lib/gamekit/formats/traffic-commander/geometry";

export const dynamic = "force-dynamic";

/**
 * POST /api/game/traffic-commander/check — validate ONE round for instant
 * per-round feedback (right/wrong + points). Never persists; the authoritative
 * record still happens once at /complete.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const r = (body?.round ?? {}) as RoundResult;
        const payload = (r.payload ?? {}) as {
            paths?: Record<string, Pt[]>;
            drawOrder?: unknown;
        };
        const rounds = [
            {
                sceneId: r.refId,
                paths:
                    payload.paths && typeof payload.paths === "object"
                        ? payload.paths
                        : {},
                drawOrder: Array.isArray(payload.drawOrder)
                    ? (payload.drawOrder as string[])
                    : [],
                timeTakenMs: r.timeTakenMs ?? 30_000,
            },
        ];
        // userId null → compute only, do NOT persist.
        const result = await validateTrafficCommander(null, rounds);
        const scene = result.scenes[0] ?? null;
        const points = result.perRound[0]?.pointsEarned ?? 0;
        return NextResponse.json({ scene, points, isCorrect: scene?.isCorrect ?? false });
    } catch (e) {
        console.error("traffic-commander check error:", e);
        return NextResponse.json({ error: "Failed to check" }, { status: 500 });
    }
}
