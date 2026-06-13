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

// Word Bank — N rounds, each 8 (sign image ↔ name) items. Player drags each name
// chip onto its matching picture. The chip's id equals the picture's topic id; the
// complete route re-checks equality on submit (see recordWordBankAttempt).
//
// Content: live published road-sign topics via getSignItems(). Folding in the 321
// revived "ផ្គូផ្គង" matching questions needs a dedicated adapter + safe re-enable
// (scripts/disable-matching-questions.ts) — treated as a follow-up; live sign topics
// are the authoritative source so the game ships either way (per the spec's fallback).
async function buildWordBankRounds(count: number) {
    const rounds = Math.max(1, Math.min(count, 5));
    const items = await getSignItems(rounds * 8);
    const built: unknown[] = [];
    for (let i = 0; i < rounds && items.length >= 8; i++) {
        const group = items.splice(0, 8);
        built.push({
            kind: "word-bank",
            id: i + 1,
            items: group.map((s) => ({
                id: s.id,
                nameEn: (s.nameEn || "").trim(),
                nameKm: (s.nameKm || "").trim(),
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

// ── Safe Street Smart ─────────────────────────────────────────────────────────
// Multiple-choice (3 options) quiz about road safety rules for kids.
// All answers are static (no DB dependency); correctId is the right letter.

interface SSSQuestion {
    id: number;
    promptEn: string;
    promptKm: string;
    choices: { id: string; en: string; km: string }[];
    correctId: string;
}

const SSS_QUESTIONS: SSSQuestion[] = [
    {
        id: 1,
        promptEn: "What do we do when the traffic light is RED?",
        promptKm: "យើងធ្វើអ្វីនៅពេលភ្លើងចរាចរណ៍ពណ៌ក្រហម?",
        choices: [
            { id: "A", en: "Go", km: "ទៅ" },
            { id: "B", en: "Stop", km: "ឈប់" },
            { id: "C", en: "Dance", km: "រាំ" },
        ],
        correctId: "B",
    },
    {
        id: 2,
        promptEn: "What should we wear when riding a bicycle or bike?",
        promptKm: "យើងគួរពាក់អ្វីនៅពេលជិះកង់ ឬម៉ូតូ?",
        choices: [
            { id: "A", en: "Shoes", km: "ស្បែកជើង" },
            { id: "B", en: "Helmet", km: "មួកសុវត្ថិភាព" },
            { id: "C", en: "Hat", km: "មួកស្លឹក" },
        ],
        correctId: "B",
    },
    {
        id: 3,
        promptEn: "Where should we cross the road?",
        promptKm: "យើងគួរឆ្លងផ្លូវនៅឯណា?",
        choices: [
            { id: "A", en: "Anywhere we want", km: "ណាក៏បាន" },
            { id: "B", en: "At zebra crossing", km: "នៅផ្លូវឆ្លងកាត់" },
            { id: "C", en: "Behind a tree", km: "នៅខាងក្រោយដើមឈើ" },
        ],
        correctId: "B",
    },
    {
        id: 4,
        promptEn: "Why do we wear seatbelts in a car?",
        promptKm: "ហេតុអ្វីបានជាយើងពាក់ខ្សែក្រវ៉ាត់សុវត្ថិភាពក្នុងឡាន?",
        choices: [
            { id: "A", en: "To look nice", km: "ដើម្បីមើលទៅស្អាត" },
            { id: "B", en: "To be safe", km: "ដើម្បីសុវត្ថិភាព" },
            { id: "C", en: "To sleep", km: "ដើម្បីដេក" },
        ],
        correctId: "B",
    },
    {
        id: 5,
        promptEn: "Which of these is NOT safe on the road?",
        promptKm: "អ្វីមួយក្នុងចំណោមនេះ មិនមានសុវត្ថិភាពនៅលើផ្លូវ?",
        choices: [
            { id: "A", en: "Walking on footpath", km: "ដើរលើចិញ្ចើមថ្នល់" },
            { id: "B", en: "Crossing at zebra crossing", km: "ឆ្លងនៅផ្លូវឆ្លងកាត់" },
            { id: "C", en: "Running in the middle of the road", km: "រត់នៅកណ្ដាលផ្លូវ" },
        ],
        correctId: "C",
    },
    {
        id: 6,
        promptEn: "What should you do to be seen at night?",
        promptKm: "តើអ្នកគួរធ្វើអ្វីដើម្បីឱ្យគេមើលឃើញអ្នកពេលយប់?",
        choices: [
            { id: "A", en: "Wear dark clothes", km: "ពាក់សម្លៀកបំពាក់ពណ៌ងងឹត" },
            { id: "B", en: "Wear bright or reflective clothes", km: "ពាក់ សម្លៀក​ ភ្លឺ​ ឬ ឆ្លុះ​ ពន្លឺ" },
            { id: "C", en: "Stay home", km: "នៅផ្ទះ" },
        ],
        correctId: "B",
    },
    {
        id: 7,
        promptEn: "Is it safe to use your phone while crossing the road?",
        promptKm: "តើការប្រើទូរស័ព្ទពេលឆ្លងផ្លូវមានសុវត្ថិភាពទេ?",
        choices: [
            { id: "A", en: "Yes, it is fine", km: "បាទ/ចាស ដូចម្ដេចក៏បាន" },
            { id: "B", en: "No, put the phone away", km: "ទេ គួរទុកទូរស័ព្ទ" },
            { id: "C", en: "Only if texting", km: "ត្រឹមតែផ្ញើសារប៉ុណ្ណោះ" },
        ],
        correctId: "B",
    },
    {
        id: 8,
        promptEn: "You hear an ambulance siren. What should you do?",
        promptKm: "អ្នកឮស៊ីផ្លុំឡានពេទ្យ។ តើអ្នកគួរធ្វើអ្វី?",
        choices: [
            { id: "A", en: "Speed up", km: "បង្កើនល្បឿន" },
            { id: "B", en: "Block the road", km: "រារាំងផ្លូវ" },
            { id: "C", en: "Move aside and let it pass", km: "គេចទៅម្ខាង ឱ្យវាឆ្លង" },
        ],
        correctId: "C",
    },
    {
        id: 9,
        promptEn: "A ball rolls into the street. What do you do?",
        promptKm: "បាល់រមៀលចូលក្នុងផ្លូវ។ តើអ្នកធ្វើអ្វី?",
        choices: [
            { id: "A", en: "Run after it right away", km: "រត់ដេញតាមភ្លាមៗ" },
            { id: "B", en: "Stop and wait for adult help", km: "ឈប់ ហើយរង់ចាំជំនួយ" },
            { id: "C", en: "Ignore it", km: "មិនខ្វល់" },
        ],
        correctId: "B",
    },
    {
        id: 10,
        promptEn: "You just got off the bus. How do you cross the road?",
        promptKm: "អ្នកទើបចុះពីឡានក្រុង។ តើអ្នកឆ្លងផ្លូវយ៉ាងដូចម្ដេច?",
        choices: [
            { id: "A", en: "Cross right in front of the bus", km: "ឆ្លងពីមុខឡានភ្លាមៗ" },
            { id: "B", en: "Wait for the bus to leave, look, then cross", km: "រង់ចាំឡានចេញ មើល ហើយឆ្លង" },
            { id: "C", en: "Run as fast as you can", km: "រត់ឱ្យបានលឿន" },
        ],
        correctId: "B",
    },
    {
        id: 11,
        promptEn: "There is no footpath. Where do you walk?",
        promptKm: "គ្មានចិញ្ចើមថ្នល់។ តើអ្នកដើរនៅឯណា?",
        choices: [
            { id: "A", en: "In the middle of the road", km: "នៅកណ្ដាលផ្លូវ" },
            { id: "B", en: "Facing oncoming traffic", km: "បែរមុខទៅរកចរាចរណ៍" },
            { id: "C", en: "With your back to traffic", km: "បែរខ្នងដាក់ចរាចរណ៍" },
        ],
        correctId: "B",
    },
    {
        id: 12,
        promptEn: "What does a YELLOW traffic light mean?",
        promptKm: "ភ្លើងចរាចរណ៍ពណ៌លឿងមានន័យថាអ្វី?",
        choices: [
            { id: "A", en: "Speed up", km: "បង្កើនល្បឿន" },
            { id: "B", en: "Go fast before red", km: "ទៅលឿនមុនភ្លើងក្រហម" },
            { id: "C", en: "Slow down and prepare to stop", km: "បន្ថយល្បឿន ត្រៀមឈប់" },
        ],
        correctId: "C",
    },
    {
        id: 13,
        promptEn: "What do you do at a STOP sign?",
        promptKm: "អ្នកធ្វើអ្វីនៅសញ្ញាឈប់?",
        choices: [
            { id: "A", en: "Come to a full stop", km: "ឈប់ទាំងស្រុង" },
            { id: "B", en: "Slow a little and roll through", km: "បន្ថយបន្តិចហើយបន្ត" },
            { id: "C", en: "Honk and go", km: "បោ ហើយទៅ" },
        ],
        correctId: "A",
    },
    {
        id: 14,
        promptEn: "Before crossing the road you should look…",
        promptKm: "មុនឆ្លងផ្លូវ អ្នកគួរមើល…",
        choices: [
            { id: "A", en: "Only left", km: "ខាងឆ្វេងតែម្ខាង" },
            { id: "B", en: "Only right", km: "ខាងស្ដាំតែម្ខាង" },
            { id: "C", en: "Left, right, then left again", km: "ឆ្វេង ស្ដាំ ហើយឆ្វេងម្ដងទៀត" },
        ],
        correctId: "C",
    },
    {
        id: 15,
        promptEn: "It is raining. Why should you be extra careful near roads?",
        promptKm: "ភ្លៀងកំពុងធ្លាក់។ ហេតុអ្វីត្រូវប្រយ័ត្នជាងធម្មតានៅជិតផ្លូវ?",
        choices: [
            { id: "A", en: "Roads are prettier", km: "ផ្លូវស្អាតជាង" },
            { id: "B", en: "Roads are slippery and visibility is lower", km: "ផ្លូវរអិល ហើយការមើលឃើញថយចុះ" },
            { id: "C", en: "Cars go slower automatically", km: "ឡានថយល្បឿនដោយស្វ័យប្រវត្តិ" },
        ],
        correctId: "B",
    },
];

function shuffleInPlaceSS<T>(a: T[]): T[] {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

async function buildSafeStreetSmartRounds(count: number) {
    const rounds = Math.max(1, Math.min(count, 3));
    const pool = shuffleInPlaceSS([...SSS_QUESTIONS]);
    const questionsPerRound = 5;
    const built: unknown[] = [];

    for (let i = 0; i < rounds; i++) {
        const group = pool.splice(0, questionsPerRound);
        if (group.length === 0) break;
        built.push({
            kind: "safe-street-smart",
            id: i + 1,
            questions: group,
        });
    }
    return built;
}

export const KID_GAMES: Record<string, KidGameSpec> = {
    "sign-match": { accessTier: "user", buildRounds: buildSignMatchRounds },
    "sign-connect": { accessTier: "user", buildRounds: buildSignConnectRounds },
    "tick-sign": { accessTier: "user", buildRounds: buildTickSignRounds },
    "word-bank": { accessTier: "user", buildRounds: buildWordBankRounds },
    "catch-sign": { accessTier: "user", buildRounds: buildCatchSignRounds },
    "light-hero": { accessTier: "user", buildRounds: buildLightHeroRounds },
    "safety-adventure": { accessTier: "user", buildRounds: buildSafetyAdventureRounds },
    "safe-street-smart": { accessTier: "user", buildRounds: buildSafeStreetSmartRounds },
};
