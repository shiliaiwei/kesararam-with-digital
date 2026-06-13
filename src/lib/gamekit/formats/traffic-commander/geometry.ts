/**
 * Traffic Commander geometry — PURE, client + server safe (no DB / React imports).
 *
 * All coordinates live in a 0..100 SVG space (same as the priority JunctionView):
 * roads occupy x/y 36..64, centre is (50,50), lane offset from centre is 7.
 *
 * Mode A derives each vehicle's correct path (entry → centre → exit) from its
 * approach + intent, so the existing "Who Goes First" scenes (which only store a
 * priority order in correctOrder) become playable WITHOUT a schema change.
 */

export type LaneDir = "north" | "south" | "east" | "west";
export type Intent = "straight" | "left" | "right";

export interface Pt {
    x: number;
    y: number;
}

const DIRS: LaneDir[] = ["north", "east", "south", "west"]; // clockwise
const OPPOSITE: Record<LaneDir, LaneDir> = {
    north: "south",
    south: "north",
    east: "west",
    west: "east",
};

/** Sprite facing angle (deg) for a vehicle waiting on a given approach arm. */
export const HEADING_ANGLE: Record<LaneDir, number> = {
    south: 0, // travelling up
    west: 90, // travelling right
    north: 180, // travelling down
    east: 270, // travelling left
};

/** Where the vehicle sits on its approach arm (right-hand lane). */
export function entryPoint(approach: LaneDir, pos: number): Pt {
    const near = 28 + pos * 14; // distance from centre toward the edge
    switch (approach) {
        case "north":
            return { x: 43, y: 50 - near };
        case "south":
            return { x: 57, y: 50 + near };
        case "east":
            return { x: 50 + near, y: 43 };
        case "west":
            return { x: 50 - near, y: 57 };
    }
}

/** Which arm the vehicle leaves by, given its approach + turn intent (RHT). */
export function exitArm(approach: LaneDir, intent: Intent): LaneDir {
    const heading = OPPOSITE[approach];
    const idx = DIRS.indexOf(heading);
    const delta = intent === "right" ? 1 : intent === "left" ? -1 : 0;
    return DIRS[(idx + delta + 4) % 4];
}

/** Point on the exit arm, in the correct outgoing (right-hand) lane, near the edge. */
export function exitPoint(approach: LaneDir, intent: Intent): Pt {
    switch (exitArm(approach, intent)) {
        case "north":
            return { x: 57, y: 14 };
        case "south":
            return { x: 43, y: 86 };
        case "east":
            return { x: 86, y: 57 };
        case "west":
            return { x: 14, y: 43 };
    }
}

/** Full correct path polyline: entry → junction centre → exit. */
export function correctPath(approach: LaneDir, intent: Intent, pos: number): Pt[] {
    return [entryPoint(approach, pos), { x: 50, y: 50 }, exitPoint(approach, intent)];
}

export function dist(a: Pt, b: Pt): number {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

/** SVG path "d" string from a list of points. */
export function toPathD(points: Pt[]): string {
    if (!points.length) return "";
    return points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
        .join(" ");
}
