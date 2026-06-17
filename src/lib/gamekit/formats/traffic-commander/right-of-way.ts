/**
 * Right-of-way resolver — PURE, client + server + script safe (no DB / React).
 *
 * SINGLE SOURCE OF TRUTH for the priority order ("who goes first") at an
 * uncontrolled junction in RIGHT-HAND traffic (Cambodia). The seed script
 * derives every scene's correctOrder from this, so the answer key can never
 * drift from the rule we actually teach.
 *
 * Rule hierarchy (applied in this order, highest priority first):
 *   1. Emergency vehicles (ambulance) always go first.
 *   2. Main road before minor road (T-junction: the stem yields).
 *   3. Priorité à droite — give way to the vehicle approaching from your RIGHT.
 *   4. Straight-ahead before turning; a left turn yields last.
 *   5. Stable by declaration order (vehicle id), for vehicles that never conflict
 *      (e.g. two straights on opposite arms).
 *
 * Scenes that produce a real cycle (the classic 4-way standoff, where the rules
 * above cannot break the tie) THROW — they must not ship, because there is no
 * single correct answer to teach.
 */

import type { LaneDir, Intent } from "./geometry";

export interface RoWVehicle {
    id: string;
    approach: LaneDir;
    intent: Intent;
    kind: string;
}

export interface RoWOptions {
    junction: "cross" | "t_junction" | "roundabout";
    /** For a T-junction: the approach arm that is the minor road (the stem). */
    minorApproach?: LaneDir;
}

/** Rules that actually decided an ordering — drives the generated explanation. */
export type RoWRule = "emergency" | "main_road" | "right_hand" | "straight_vs_turn";

const DIRS: LaneDir[] = ["north", "east", "south", "west"]; // clockwise
const OPPOSITE: Record<LaneDir, LaneDir> = {
    north: "south",
    south: "north",
    east: "west",
    west: "east",
};

const EMERGENCY_KINDS = new Set(["ambulance", "fire", "police"]);
const INTENT_RANK: Record<Intent, number> = { straight: 0, right: 1, left: 2 };

/**
 * The approach arm that sits to the RIGHT of a driver on `approach`.
 * Heading = opposite(approach); the right-hand arm is heading rotated +90° CW.
 * e.g. approaching from south → heading north → your right is the EAST arm,
 * so a vehicle approaching from the east is "on your right".
 */
export function rightArmApproach(approach: LaneDir): LaneDir {
    const heading = OPPOSITE[approach];
    return DIRS[(DIRS.indexOf(heading) + 1) % 4];
}

/** True iff `other` is approaching from the arm to `self`'s right. */
export function isOnRightOf(other: RoWVehicle, self: RoWVehicle): boolean {
    return other.approach === rightArmApproach(self.approach);
}

function isEmergency(v: RoWVehicle): boolean {
    return EMERGENCY_KINDS.has(v.kind);
}

/**
 * Decide which of two vehicles goes first.
 * Returns -1 (a first), 1 (b first), or 0 (no decisive rule — they don't conflict).
 * Records the deciding rule into `used`.
 */
function decide(
    a: RoWVehicle,
    b: RoWVehicle,
    opts: RoWOptions,
    used: Set<RoWRule>
): -1 | 0 | 1 {
    // 1. Emergency wins outright.
    if (isEmergency(a) !== isEmergency(b)) {
        used.add("emergency");
        return isEmergency(a) ? -1 : 1;
    }

    // 2. Main road before minor road (T-junction stem yields).
    if (opts.minorApproach) {
        const aMinor = a.approach === opts.minorApproach;
        const bMinor = b.approach === opts.minorApproach;
        if (aMinor !== bMinor) {
            used.add("main_road");
            return aMinor ? 1 : -1;
        }
    }

    // 3. Priorité à droite — yield to the vehicle on your right.
    if (isOnRightOf(b, a)) {
        used.add("right_hand");
        return 1; // b is on a's right → a yields → b first
    }
    if (isOnRightOf(a, b)) {
        used.add("right_hand");
        return -1; // a is on b's right → b yields → a first
    }

    // 4. Straight beats turning; left turn yields last.
    if (INTENT_RANK[a.intent] !== INTENT_RANK[b.intent]) {
        used.add("straight_vs_turn");
        return INTENT_RANK[a.intent] < INTENT_RANK[b.intent] ? -1 : 1;
    }

    // 5. No conflict (e.g. opposite-arm straights) — caller breaks ties by id.
    return 0;
}

export interface RoWResult {
    order: string[];
    rules: RoWRule[];
}

/**
 * Resolve the full priority order. Deterministic topological emit: repeatedly
 * release every vehicle that nothing remaining decisively precedes, choosing the
 * lowest declaration index among ready vehicles. Throws on a true cycle.
 */
export function resolveRightOfWay(
    vehicles: RoWVehicle[],
    opts: RoWOptions
): RoWResult {
    const used = new Set<RoWRule>();
    const index = new Map(vehicles.map((v, i) => [v.id, i]));
    const remaining = [...vehicles];
    const order: string[] = [];

    while (remaining.length) {
        // A vehicle is "ready" if no other remaining vehicle decisively precedes it.
        const ready = remaining.filter(
            (cand) =>
                !remaining.some(
                    (other) =>
                        other.id !== cand.id &&
                        decide(other, cand, opts, used) === -1
                )
        );
        if (ready.length === 0) {
            throw new Error(
                `Ambiguous right-of-way (cycle) among: ${remaining
                    .map((v) => v.id)
                    .join(", ")}`
            );
        }
        // Determinism: earliest-declared ready vehicle goes next.
        ready.sort((x, y) => (index.get(x.id) ?? 0) - (index.get(y.id) ?? 0));
        const next = ready[0];
        order.push(next.id);
        remaining.splice(remaining.indexOf(next), 1);
    }

    // Canonical rule ordering for a stable, readable explanation.
    const RULE_ORDER: RoWRule[] = [
        "emergency",
        "main_road",
        "right_hand",
        "straight_vs_turn",
    ];
    return { order, rules: RULE_ORDER.filter((r) => used.has(r)) };
}

/** Bilingual one-liner per rule (reuses approved scene phrasing — plain Khmer). */
const RULE_TEXT: Record<RoWRule, { en: string; km: string }> = {
    emergency: {
        en: "Emergency vehicles always go first.",
        km: "រថយន្តសង្គ្រោះតែងតែទៅមុនគេ។",
    },
    main_road: {
        en: "Vehicles on the main road go before those joining from a minor road.",
        km: "រថយន្តលើផ្លូវធំទៅមុនរថយន្តដែលចេញពីផ្លូវតូច។",
    },
    right_hand: {
        en: "At an uncontrolled junction, give way to the vehicle on your right.",
        km: "នៅផ្លូវប្រសព្វគ្មានភ្លើងសញ្ញា ត្រូវផ្ដល់ផ្លូវឱ្យរថយន្តខាងស្ដាំ។",
    },
    straight_vs_turn: {
        en: "Straight-ahead traffic goes before turning vehicles; a left turn gives way.",
        km: "រថយន្តផ្លូវត្រង់ទៅមុនរថយន្តដែលបត់ ហើយការបត់ឆ្វេងត្រូវផ្ដល់ផ្លូវ។",
    },
};

/** Build the bilingual explanation from the rules that governed a scene. */
export function explainRules(rules: RoWRule[]): { en: string; km: string } {
    if (rules.length === 0) {
        return {
            en: "These vehicles do not cross paths, so order does not matter.",
            km: "រថយន្តទាំងនេះមិនកាត់ផ្លូវគ្នាទេ ដូច្នេះលំដាប់មិនសំខាន់។",
        };
    }
    return {
        en: rules.map((r) => RULE_TEXT[r].en).join(" "),
        km: rules.map((r) => RULE_TEXT[r].km).join(" "),
    };
}
