import { NextRequest, NextResponse } from "next/server";
import { getPriorityScenes } from "@/lib/gamekit/server";
import { db } from "@/lib/db";
import { topics } from "@/db/schema/content";
import { inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

// Real road-sign topic ids (category 1) mapped to scenarios. Verified present
// with images in the DB.
const SIGN = {
    giveWayIntersection: 172, // GIVE WAY (at Intersection)
    giveWayRoundabout: 173,   // GIVE WAY (at Roundabout)
    crossRoad: 748,           // CROSS ROAD
    roundabout: 749,          // ROUNDABOUT
    trafficLights: 775,       // TRAFFIC LIGHTS
    roadJunction: 740,        // ROAD JUNCTION ON THE RIGHT
} as const;

/** Pick the real signs that match a scene's junction + signalisation. */
function signIdsForScene(junction: string, hasLight: boolean): number[] {
    if (junction === "roundabout") return [SIGN.roundabout, SIGN.giveWayRoundabout];
    if (junction === "t_junction") return [SIGN.roadJunction, SIGN.giveWayIntersection];
    if (hasLight) return [SIGN.trafficLights, SIGN.crossRoad];
    return [SIGN.giveWayIntersection, SIGN.crossRoad];
}

/**
 * GET /api/game/traffic-commander?count=5 — random approved scenes WITHOUT the
 * answer key. Each scene is enriched with the REAL road signs that match its
 * scenario (pulled from the topics table). Phase 1 serves Mode A.
 */
export async function GET(req: NextRequest) {
    try {
        const count = parseInt(req.nextUrl.searchParams.get("count") || "5", 10) || 5;
        const scenes = await getPriorityScenes(count);

        // Collect every sign id we need, fetch once, build a lookup.
        const allIds = Array.from(
            new Set(
                scenes.flatMap((s) =>
                    signIdsForScene(s.layout.junction, s.layout.hasTrafficLight)
                )
            )
        );
        const signRows = allIds.length
            ? await db
                .select({
                    id: topics.id,
                    nameEn: topics.nameEn,
                    nameKm: topics.nameKm,
                    imageUrl: topics.primaryImageUrl,
                })
                .from(topics)
                .where(inArray(topics.id, allIds))
            : [];
        const signById = new Map(signRows.map((r) => [r.id, r]));

        const rounds = scenes.map((s) => ({
            ...s,
            mode: "A" as const,
            signs: signIdsForScene(s.layout.junction, s.layout.hasTrafficLight)
                .map((id) => signById.get(id))
                .filter((r): r is NonNullable<typeof r> => !!r && !!r.imageUrl)
                .map((r) => ({ imageUrl: r.imageUrl as string, nameEn: r.nameEn, nameKm: r.nameKm })),
        }));

        return NextResponse.json({ rounds });
    } catch (e) {
        console.error("traffic-commander GET error:", e);
        return NextResponse.json({ error: "Failed to load" }, { status: 500 });
    }
}
