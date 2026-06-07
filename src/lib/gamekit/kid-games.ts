/**
 * Server-side registry of kid-game ids → access tier + round builder.
 * Keeps the dynamic API route generic while staying authoritative about tiers.
 */

import type { AccessTier } from "./types";
import { getSignItems } from "./kid-rounds";

export interface KidGameSpec {
    accessTier: AccessTier;
    buildRounds: (count: number) => Promise<unknown[]>;
}

// Sign Match — pairs of (sign image, meaning) to match.
async function buildSignMatchRounds(count: number) {
    const items = await getSignItems(Math.max(4, Math.min(count, 8)));
    return [
        {
            kind: "sign-match",
            pairs: items.map((s) => ({
                id: s.id,
                nameEn: s.nameEn,
                nameKm: s.nameKm,
                imageUrl: s.imageUrl,
            })),
        },
    ];
}

// Catch the Sign — each round: a prompt sign + decoys; tap the prompt.
async function buildCatchSignRounds(count: number) {
    const items = await getSignItems(count * 4);
    const rounds: unknown[] = [];
    for (let i = 0; i < count && items.length >= 4; i++) {
        const choices = items.splice(0, 4);
        const target = choices[Math.floor(Math.random() * choices.length)];
        rounds.push({
            kind: "catch-sign",
            targetId: target.id,
            promptEn: target.nameEn,
            promptKm: target.nameKm,
            choices: choices.map((c) => ({ id: c.id, imageUrl: c.imageUrl })),
        });
    }
    return rounds;
}

// Traffic Light Hero — light state → correct action (no DB needed).
async function buildLightHeroRounds(count: number) {
    const lights: ("green" | "red" | "yellow")[] = ["green", "red", "yellow"];
    const rounds: unknown[] = [];
    for (let i = 0; i < count; i++) {
        const light = lights[Math.floor(Math.random() * lights.length)];
        rounds.push({ kind: "light-hero", light });
    }
    return rounds;
}

// Road Safety Adventure — stepped scenario journey (premium).
async function buildSafetyAdventureRounds(count: number) {
    const steps = [
        {
            kind: "safety-adventure",
            promptEn: "You reach a crossing. What do you do?",
            promptKm: "អ្នកមកដល់ផ្លូវឆ្លងកាត់។ តើអ្នកធ្វើអ្វី?",
            choices: [
                { id: 1, en: "Stop, look both ways, then cross", km: "ឈប់ មើលសងខាង រួចឆ្លង", correct: true },
                { id: 2, en: "Run across quickly", km: "រត់ឆ្លងឱ្យលឿន", correct: false },
            ],
        },
        {
            kind: "safety-adventure",
            promptEn: "The light turns yellow as you approach. What do you do?",
            promptKm: "ភ្លើងប្ដូរទៅពណ៌លឿងពេលអ្នកជិតដល់។ តើអ្នកធ្វើអ្វី?",
            choices: [
                { id: 1, en: "Slow down and prepare to stop", km: "បន្ថយល្បឿន រៀបចំឈប់", correct: true },
                { id: 2, en: "Speed up to beat the red", km: "បង្កើនល្បឿនឆ្លងមុនភ្លើងក្រហម", correct: false },
            ],
        },
        {
            kind: "safety-adventure",
            promptEn: "You see a STOP sign. What do you do?",
            promptKm: "អ្នកឃើញសញ្ញាឈប់។ តើអ្នកធ្វើអ្វី?",
            choices: [
                { id: 1, en: "Come to a full stop", km: "ឈប់ទាំងស្រុង", correct: true },
                { id: 2, en: "Slow a little and roll through", km: "បន្ថយបន្តិច រួចបន្ត", correct: false },
            ],
        },
    ];
    return steps.slice(0, Math.max(1, Math.min(count, steps.length)));
}

export const KID_GAMES: Record<string, KidGameSpec> = {
    "sign-match": { accessTier: "user", buildRounds: buildSignMatchRounds },
    "catch-sign": { accessTier: "user", buildRounds: buildCatchSignRounds },
    "light-hero": { accessTier: "user", buildRounds: buildLightHeroRounds },
    "safety-adventure": { accessTier: "class-pro", buildRounds: buildSafetyAdventureRounds },
};
