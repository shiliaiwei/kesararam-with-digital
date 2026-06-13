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

// Connect the Signs — N rounds, each 4 distinct (sign image ↔ meaning) pairs.
// The right-column meaning's id equals the sign's topic id; the server re-checks
// equality on submit (see recordSignConnectAttempt) so client picks are cosmetic.
//
// Content: live published road-sign topics via getSignItems(). The spec also wants
// to fold in the 321 revived "ផ្គូផ្គង" matching questions; that data shape needs a
// dedicated adapter + re-enable step (scripts/disable-matching-questions.ts) and the
// quiz renderer regression must be avoided — treated as a follow-up. Live sign topics
// are the authoritative source so the game ships either way (per the spec's fallback).
async function buildSignConnectRounds(count: number) {
    const rounds = Math.max(1, Math.min(count, 8));
    const items = await getSignItems(rounds * 4);
    const built: unknown[] = [];
    for (let i = 0; i < rounds && items.length >= 4; i++) {
        const group = items.splice(0, 4);
        built.push({
            kind: "sign-connect",
            id: i + 1,
            pairs: group.map((s) => ({
                id: s.id,
                nameEn: s.nameEn,
                nameKm: s.nameKm,
                imageUrl: s.imageUrl,
            })),
        });
    }
    return built;
}

// Tick the Sign — worksheet pages: each row shows a sign name + 4 image choices
// (1 correct + 3 random decoys); tick the correct one. Default 2 pages × 6 rows.
// The correct choice's id equals the row's prompt topic id; the complete route
// re-checks each row server-side (see recordTickSignAttempt).
function shuffleInPlace<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

async function buildTickSignRounds(count: number) {
    const pages = Math.max(1, Math.min(count, 4));
    const need = pages * 6;
    const pool = await getSignItems(Math.min(40, need + 12));
    if (pool.length < 4) return [];

    const rounds: unknown[] = [];
    let promptIdx = 0;
    for (let p = 0; p < pages; p++) {
        const rows: unknown[] = [];
        for (let r = 0; r < 6 && promptIdx < pool.length; r++) {
            const prompt = pool[promptIdx++];
            const decoys = shuffleInPlace(pool.filter((s) => s.id !== prompt.id)).slice(0, 3);
            const choices = shuffleInPlace([prompt, ...decoys]).map((c) => ({
                id: c.id,
                imageUrl: c.imageUrl,
            }));
            rows.push({
                promptId: prompt.id,
                promptEn: prompt.nameEn,
                promptKm: prompt.nameKm,
                choices,
            });
        }
        if (rows.length) rounds.push({ kind: "tick-sign", id: p + 1, rows });
    }
    return rounds;
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

// Traffic Light Hero — light state + a short real-world scenario → correct action.
const LIGHT_HERO_SCENARIOS: { light: "green" | "red" | "yellow"; en: string; km: string }[] = [
    { light: "green", en: "The light is green at the crossing.", km: "ភ្លើងពណ៌បៃតងនៅផ្លូវឆ្លងកាត់។" },
    { light: "red", en: "The light just turned red.", km: "ភ្លើងទើបតែប្ដូរទៅពណ៌ក្រហម។" },
    { light: "yellow", en: "The light is yellow as you reach it.", km: "ភ្លើងពណ៌លឿងពេលអ្នកមកដល់។" },
    { light: "green", en: "You are walking and the pedestrian light is green.", km: "អ្នកកំពុងដើរ ហើយភ្លើងអ្នកថ្មើរជើងពណ៌បៃតង។" },
    { light: "red", en: "A car ahead stopped at a red light.", km: "ឡានខាងមុខបានឈប់នៅភ្លើងក្រហម។" },
    { light: "yellow", en: "The light blinks yellow near a school.", km: "ភ្លើងលោតពណ៌លឿងនៅជិតសាលា។" },
    { light: "green", en: "The light turns green after waiting.", km: "ភ្លើងប្ដូរទៅពណ៌បៃតងបន្ទាប់ពីរង់ចាំ។" },
    { light: "red", en: "You arrive and the light is red.", km: "អ្នកមកដល់ ហើយភ្លើងពណ៌ក្រហម។" },
    { light: "yellow", en: "The light changes to yellow ahead of you.", km: "ភ្លើងប្ដូរទៅពណ៌លឿងនៅខាងមុខ។" },
];

async function buildLightHeroRounds(count: number) {
    const pool = [...LIGHT_HERO_SCENARIOS];
    // Fisher–Yates shuffle for variety each play.
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const rounds: unknown[] = [];
    for (let i = 0; i < count; i++) {
        const s = pool[i % pool.length];
        rounds.push({ kind: "light-hero", light: s.light, scenarioEn: s.en, scenarioKm: s.km });
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
        {
            kind: "safety-adventure",
            promptEn: "You are riding a bike. What keeps your head safe?",
            promptKm: "អ្នកកំពុងជិះកង់។ តើអ្វីការពារក្បាលរបស់អ្នក?",
            choices: [
                { id: 1, en: "Wear a helmet", km: "ពាក់មួកសុវត្ថិភាព", correct: true },
                { id: 2, en: "Ride with no helmet", km: "ជិះដោយគ្មានមួក", correct: false },
            ],
        },
        {
            kind: "safety-adventure",
            promptEn: "You want to cross the road. Where is the safest place?",
            promptKm: "អ្នកចង់ឆ្លងផ្លូវ។ តើកន្លែងណាមានសុវត្ថិភាពបំផុត?",
            choices: [
                { id: 1, en: "At the zebra crossing", km: "នៅផ្លូវឆ្លងកាត់ (សញ្ញាសេះ)", correct: true },
                { id: 2, en: "Between parked cars", km: "ចន្លោះឡានចត", correct: false },
            ],
        },
        {
            kind: "safety-adventure",
            promptEn: "It is dark and you walk near the road. What helps drivers see you?",
            promptKm: "ពេលងងឹត អ្នកដើរនៅជិតផ្លូវ។ តើអ្វីជួយឱ្យអ្នកបើកបរមើលឃើញអ្នក?",
            choices: [
                { id: 1, en: "Wear bright or reflective clothes", km: "ពាក់សម្លៀកបំពាក់ភ្លឺ ឬឆ្លុះពន្លឺ", correct: true },
                { id: 2, en: "Wear dark clothes", km: "ពាក់សម្លៀកបំពាក់ពណ៌ខ្មៅ", correct: false },
            ],
        },
        {
            kind: "safety-adventure",
            promptEn: "You ride in a car. What should you do first?",
            promptKm: "អ្នកជិះក្នុងឡាន។ តើអ្នកគួរធ្វើអ្វីមុនគេ?",
            choices: [
                { id: 1, en: "Fasten your seatbelt", km: "ពាក់ខ្សែក្រវាត់សុវត្ថិភាព", correct: true },
                { id: 2, en: "Put your head out the window", km: "លៀនក្បាលចេញក្រៅបង្អួច", correct: false },
            ],
        },
        {
            kind: "safety-adventure",
            promptEn: "A ball rolls into the street. What do you do?",
            promptKm: "បាល់រមៀលចូលផ្លូវ។ តើអ្នកធ្វើអ្វី?",
            choices: [
                { id: 1, en: "Stop and ask an adult for help", km: "ឈប់ ហើយសុំជំនួយពីមនុស្សពេញវ័យ", correct: true },
                { id: 2, en: "Run after it right away", km: "រត់ដេញតាមភ្លាមៗ", correct: false },
            ],
        },
        {
            kind: "safety-adventure",
            promptEn: "You hear a siren from an ambulance. What do you do?",
            promptKm: "អ្នកឮសំឡេងស៊ីផ្លុំពីឡានពេទ្យ។ តើអ្នកធ្វើអ្វី?",
            choices: [
                { id: 1, en: "Move aside and let it pass", km: "គេចទៅម្ខាង ឱ្យវាឆ្លងកាត់", correct: true },
                { id: 2, en: "Stay in the middle of the road", km: "ឈរនៅកណ្ដាលផ្លូវ", correct: false },
            ],
        },
        {
            kind: "safety-adventure",
            promptEn: "You walk along a road with no sidewalk. Where do you walk?",
            promptKm: "អ្នកដើរតាមផ្លូវដែលគ្មានចិញ្ចើមថ្នល់។ តើអ្នកដើរនៅឯណា?",
            choices: [
                { id: 1, en: "Facing oncoming traffic", km: "បែរមុខទៅរកចរាចរណ៍ដែលមកដល់", correct: true },
                { id: 2, en: "With your back to traffic", km: "បែរខ្នងដាក់ចរាចរណ៍", correct: false },
            ],
        },
        {
            kind: "safety-adventure",
            promptEn: "You are crossing while using your phone. What is safer?",
            promptKm: "អ្នកកំពុងឆ្លងផ្លូវ ខណៈប្រើទូរស័ព្ទ។ តើអ្វីមានសុវត្ថិភាពជាង?",
            choices: [
                { id: 1, en: "Put the phone away and watch the road", km: "ទុកទូរស័ព្ទ ហើយមើលផ្លូវ", correct: true },
                { id: 2, en: "Keep texting while crossing", km: "បន្តផ្ញើសារពេលឆ្លង", correct: false },
            ],
        },
        {
            kind: "safety-adventure",
            promptEn: "You get off a bus. How do you cross the road?",
            promptKm: "អ្នកចុះពីឡានក្រុង។ តើអ្នកឆ្លងផ្លូវយ៉ាងដូចម្ដេច?",
            choices: [
                { id: 1, en: "Wait for the bus to leave, then look and cross", km: "រង់ចាំឡានចេញ រួចមើល ហើយឆ្លង", correct: true },
                { id: 2, en: "Cross right in front of the bus", km: "ឆ្លងពីមុខឡានក្រុងភ្លាមៗ", correct: false },
            ],
        },
    ];
    // Shuffle so each adventure feels different, then take the requested count.
    for (let i = steps.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [steps[i], steps[j]] = [steps[j], steps[i]];
    }
    return steps.slice(0, Math.max(1, Math.min(count, steps.length)));
}

export const KID_GAMES: Record<string, KidGameSpec> = {
    "sign-match": { accessTier: "user", buildRounds: buildSignMatchRounds },
    "sign-connect": { accessTier: "user", buildRounds: buildSignConnectRounds },
    "tick-sign": { accessTier: "user", buildRounds: buildTickSignRounds },
    "catch-sign": { accessTier: "user", buildRounds: buildCatchSignRounds },
    "light-hero": { accessTier: "user", buildRounds: buildLightHeroRounds },
    "safety-adventure": { accessTier: "user", buildRounds: buildSafetyAdventureRounds },
};
