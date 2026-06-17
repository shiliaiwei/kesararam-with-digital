/**
 * Seed/refresh Traffic Commander + Priority Puzzle scenes (`priority_scenes`).
 *
 * The answer key is NEVER hand-typed. Each scene declares only its layout; the
 * priority order + bilingual explanation are derived from the single source of
 * truth, resolveRightOfWay() (RIGHT-hand traffic, Cambodia). This both scales the
 * content pool and CORRECTS the two original scenes whose stored order violated
 * priorité à droite ("Two cars at a crossroad", "Three cars, turning left").
 *
 * Idempotent upsert keyed by title_en: existing rows are updated in place (so the
 * fixes land without dupes), new rows are inserted, all as status 'approved'.
 *
 * DRY RUN by default — prints the computed table. Set APPLY=1 to write.
 *   npx tsx scripts/seed-priority-scenes.ts        # preview
 *   APPLY=1 npx tsx scripts/seed-priority-scenes.ts # write
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import {
    resolveRightOfWay,
    explainRules,
    type RoWVehicle,
} from "../src/lib/gamekit/formats/traffic-commander/right-of-way";
import type { LaneDir } from "../src/lib/gamekit/formats/traffic-commander/geometry";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");
const sql = neon(dbUrl);
const APPLY = process.env.APPLY === "1";

interface SceneDef {
    titleEn: string;
    titleKm: string;
    junction: "cross" | "t_junction" | "roundabout";
    hasTrafficLight: boolean;
    minorApproach?: LaneDir; // T-junction: which arm is the minor stem
    difficulty: "easy" | "medium" | "hard";
    vehicles: RoWVehicle[];
}

// Vehicles carry pos 0.5 in the stored layout (spawn distance); the resolver and
// the renderer only need id/approach/intent/kind, so we add pos at write time.
const SCENES: SceneDef[] = [
    // ── Corrections to the original four (matched by title_en) ──────────────────
    {
        titleEn: "Two cars at a crossroad",
        titleKm: "រថយន្តពីរនៅផ្លូវប្រសព្វ",
        junction: "cross", hasTrafficLight: false, difficulty: "easy",
        vehicles: [
            { id: "v1", approach: "south", intent: "straight", kind: "car" },
            { id: "v2", approach: "west", intent: "straight", kind: "car" },
        ],
    },
    {
        titleEn: "Ambulance approaching",
        titleKm: "រថយន្តសង្គ្រោះកំពុងមកដល់",
        junction: "cross", hasTrafficLight: false, difficulty: "medium",
        vehicles: [
            { id: "v1", approach: "north", intent: "straight", kind: "car" },
            { id: "v2", approach: "east", intent: "straight", kind: "ambulance" },
            { id: "v3", approach: "west", intent: "straight", kind: "car" },
        ],
    },
    {
        titleEn: "Three cars, turning left",
        titleKm: "រថយន្តបី បត់ឆ្វេង",
        junction: "cross", hasTrafficLight: false, difficulty: "hard",
        vehicles: [
            { id: "v1", approach: "south", intent: "left", kind: "car" },
            { id: "v2", approach: "north", intent: "straight", kind: "car" },
            { id: "v3", approach: "east", intent: "straight", kind: "moto" },
        ],
    },
    {
        titleEn: "T-junction",
        titleKm: "ផ្លូវបំបែករាង T",
        junction: "t_junction", hasTrafficLight: false, minorApproach: "south", difficulty: "easy",
        vehicles: [
            { id: "v1", approach: "south", intent: "left", kind: "car" },
            { id: "v2", approach: "west", intent: "straight", kind: "bus" },
        ],
    },

    // ── New scenes ──────────────────────────────────────────────────────────────
    {
        titleEn: "Give way to your right",
        titleKm: "ផ្ដល់ផ្លូវខាងស្ដាំ",
        junction: "cross", hasTrafficLight: false, difficulty: "easy",
        vehicles: [
            { id: "v1", approach: "east", intent: "straight", kind: "car" },
            { id: "v2", approach: "north", intent: "straight", kind: "moto" },
        ],
    },
    {
        titleEn: "Truck and car meet",
        titleKm: "ឡានធំនិងរថយន្តជួបគ្នា",
        junction: "cross", hasTrafficLight: false, difficulty: "easy",
        vehicles: [
            { id: "v1", approach: "south", intent: "straight", kind: "truck" },
            { id: "v2", approach: "east", intent: "straight", kind: "car" },
        ],
    },
    {
        titleEn: "Two motos meet",
        titleKm: "ម៉ូតូពីរជួបគ្នា",
        junction: "cross", hasTrafficLight: false, difficulty: "easy",
        vehicles: [
            { id: "v1", approach: "west", intent: "straight", kind: "moto" },
            { id: "v2", approach: "north", intent: "straight", kind: "moto" },
        ],
    },
    {
        titleEn: "Joining a side road",
        titleKm: "ចូលពីផ្លូវចំហៀង",
        junction: "t_junction", hasTrafficLight: false, minorApproach: "north", difficulty: "easy",
        vehicles: [
            { id: "v1", approach: "north", intent: "straight", kind: "car" },
            { id: "v2", approach: "east", intent: "straight", kind: "car" },
        ],
    },
    {
        titleEn: "Let the ambulance pass",
        titleKm: "ឱ្យរថយន្តសង្គ្រោះឆ្លងកាត់",
        junction: "cross", hasTrafficLight: false, difficulty: "medium",
        vehicles: [
            { id: "v1", approach: "south", intent: "straight", kind: "bus" },
            { id: "v2", approach: "north", intent: "straight", kind: "ambulance" },
        ],
    },
    {
        titleEn: "Straight before the left turn",
        titleKm: "ផ្លូវត្រង់មុនការបត់ឆ្វេង",
        junction: "cross", hasTrafficLight: false, difficulty: "medium",
        vehicles: [
            { id: "v1", approach: "north", intent: "straight", kind: "car" },
            { id: "v2", approach: "south", intent: "left", kind: "car" },
        ],
    },
    {
        titleEn: "Three cars take turns",
        titleKm: "រថយន្តបីផ្លាស់វេនគ្នា",
        junction: "cross", hasTrafficLight: false, difficulty: "medium",
        vehicles: [
            { id: "v1", approach: "west", intent: "straight", kind: "car" },
            { id: "v2", approach: "north", intent: "straight", kind: "car" },
            { id: "v3", approach: "east", intent: "straight", kind: "moto" },
        ],
    },
    {
        titleEn: "Right turn still yields",
        titleKm: "បត់ស្ដាំក៏ត្រូវផ្ដល់ផ្លូវ",
        junction: "cross", hasTrafficLight: false, difficulty: "medium",
        vehicles: [
            { id: "v1", approach: "north", intent: "right", kind: "moto" },
            { id: "v2", approach: "east", intent: "straight", kind: "car" },
        ],
    },
    {
        titleEn: "Bus turns, car goes straight",
        titleKm: "ឡានក្រុងបត់ រថយន្តទៅត្រង់",
        junction: "cross", hasTrafficLight: false, difficulty: "medium",
        vehicles: [
            { id: "v1", approach: "east", intent: "straight", kind: "car" },
            { id: "v2", approach: "west", intent: "left", kind: "bus" },
        ],
    },
    {
        titleEn: "Ambulance then give way",
        titleKm: "រថយន្តសង្គ្រោះ រួចផ្ដល់ផ្លូវ",
        junction: "cross", hasTrafficLight: false, difficulty: "hard",
        vehicles: [
            { id: "v1", approach: "west", intent: "straight", kind: "car" },
            { id: "v2", approach: "north", intent: "straight", kind: "ambulance" },
            { id: "v3", approach: "east", intent: "straight", kind: "car" },
        ],
    },
    {
        titleEn: "Busy crossroad",
        titleKm: "ផ្លូវប្រសព្វមមាញឹក",
        junction: "cross", hasTrafficLight: false, difficulty: "hard",
        vehicles: [
            { id: "v1", approach: "south", intent: "straight", kind: "truck" },
            { id: "v2", approach: "west", intent: "left", kind: "car" },
            { id: "v3", approach: "north", intent: "left", kind: "moto" },
        ],
    },
    {
        titleEn: "Ambulance at the T",
        titleKm: "រថយន្តសង្គ្រោះនៅផ្លូវ T",
        junction: "t_junction", hasTrafficLight: false, minorApproach: "south", difficulty: "hard",
        vehicles: [
            { id: "v1", approach: "south", intent: "straight", kind: "ambulance" },
            { id: "v2", approach: "west", intent: "straight", kind: "car" },
            { id: "v3", approach: "east", intent: "straight", kind: "car" },
        ],
    },
];

interface Built {
    def: SceneDef;
    layout: string;
    correctOrder: string[];
    explanationEn: string;
    explanationKm: string;
}

function build(def: SceneDef): Built {
    // resolveRightOfWay throws on an ambiguous (cyclic) scene → we never ship one.
    const { order, rules } = resolveRightOfWay(def.vehicles, {
        junction: def.junction,
        minorApproach: def.minorApproach,
    });
    const ex = explainRules(rules);
    const layout = JSON.stringify({
        junction: def.junction,
        hasTrafficLight: def.hasTrafficLight,
        vehicles: def.vehicles.map((v) => ({
            id: v.id, approach: v.approach, intent: v.intent, kind: v.kind, pos: 0.5,
        })),
    });
    return { def, layout, correctOrder: order, explanationEn: ex.en, explanationKm: ex.km };
}

async function main() {
    // Build + validate all scenes up front (any ambiguous scene aborts the run).
    const built: Built[] = [];
    for (const def of SCENES) {
        try {
            built.push(build(def));
        } catch (e) {
            console.error(`✗ "${def.titleEn}" — ${(e as Error).message}`);
            process.exit(1);
        }
    }

    console.log(`Computed ${built.length} scenes (${APPLY ? "APPLY" : "DRY RUN"}):\n`);
    for (const b of built) {
        console.log(
            `  [${b.def.difficulty.padEnd(6)}] ${b.def.titleEn.padEnd(30)} order=${JSON.stringify(
                b.correctOrder
            )}`
        );
        console.log(`           ${b.explanationEn}`);
    }

    if (!APPLY) {
        console.log("\nDRY RUN — set APPLY=1 to write.");
        process.exit(0);
    }

    let inserted = 0, updated = 0;
    for (const b of built) {
        const existing = await sql`SELECT id FROM priority_scenes WHERE title_en = ${b.def.titleEn} LIMIT 1`;
        if (existing.length) {
            await sql`
                UPDATE priority_scenes SET
                    title_km = ${b.def.titleKm},
                    layout = ${b.layout},
                    correct_order = ${JSON.stringify(b.correctOrder)},
                    explanation_en = ${b.explanationEn},
                    explanation_km = ${b.explanationKm},
                    difficulty = ${b.def.difficulty},
                    status = 'approved',
                    updated_at = now()
                WHERE id = ${existing[0].id}`;
            updated++;
            console.log(`↻ updated: ${b.def.titleEn}`);
        } else {
            await sql`
                INSERT INTO priority_scenes
                    (title_en, title_km, layout, correct_order, explanation_en, explanation_km, difficulty, status)
                VALUES
                    (${b.def.titleEn}, ${b.def.titleKm}, ${b.layout}, ${JSON.stringify(b.correctOrder)},
                     ${b.explanationEn}, ${b.explanationKm}, ${b.def.difficulty}, 'approved')`;
            inserted++;
            console.log(`+ inserted: ${b.def.titleEn}`);
        }
    }
    console.log(`\n✅ Done. ${inserted} inserted, ${updated} updated.`);
    process.exit(0);
}

main().catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
});
