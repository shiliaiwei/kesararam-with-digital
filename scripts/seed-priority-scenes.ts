import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");
const sql = neon(dbUrl);

interface Scene {
    titleEn: string;
    titleKm: string;
    layout: unknown;
    correctOrder: string[];
    explanationEn: string;
    explanationKm: string;
    difficulty: string;
}

const SCENES: Scene[] = [
    {
        titleEn: "Two cars at a crossroad",
        titleKm: "រថយន្តពីរនៅផ្លូវបំបែក",
        layout: {
            junction: "cross",
            hasTrafficLight: false,
            vehicles: [
                { id: "v1", approach: "south", intent: "straight", kind: "car", pos: 0.5 },
                { id: "v2", approach: "west", intent: "straight", kind: "car", pos: 0.5 },
            ],
        },
        correctOrder: ["v2", "v1"],
        explanationEn: "At an uncontrolled crossroad, give way to the vehicle on your right. v2 (on the right) goes first.",
        explanationKm: "នៅផ្លូវបំបែកគ្មានភ្លើងសញ្ញា ត្រូវផ្ដល់ផ្លូវឱ្យរថយន្តខាងស្ដាំ។ v2 (ខាងស្ដាំ) ទៅមុនគេ។",
        difficulty: "easy",
    },
    {
        titleEn: "Ambulance approaching",
        titleKm: "រថយន្តសង្គ្រោះកំពុងមកដល់",
        layout: {
            junction: "cross",
            hasTrafficLight: false,
            vehicles: [
                { id: "v1", approach: "north", intent: "straight", kind: "car", pos: 0.5 },
                { id: "v2", approach: "east", intent: "straight", kind: "ambulance", pos: 0.5 },
                { id: "v3", approach: "west", intent: "straight", kind: "car", pos: 0.5 },
            ],
        },
        correctOrder: ["v2", "v3", "v1"],
        explanationEn: "Emergency vehicles always go first. Then give way to the right.",
        explanationKm: "រថយន្តអាសន្នតែងតែទៅមុនគេ។ បន្ទាប់មកផ្ដល់ផ្លូវឱ្យខាងស្ដាំ។",
        difficulty: "medium",
    },
    {
        titleEn: "Three cars, turning left",
        titleKm: "រថយន្តបី បត់ឆ្វេង",
        layout: {
            junction: "cross",
            hasTrafficLight: false,
            vehicles: [
                { id: "v1", approach: "south", intent: "left", kind: "car", pos: 0.5 },
                { id: "v2", approach: "north", intent: "straight", kind: "car", pos: 0.5 },
                { id: "v3", approach: "east", intent: "straight", kind: "moto", pos: 0.5 },
            ],
        },
        correctOrder: ["v3", "v2", "v1"],
        explanationEn: "Give way to the right first (v3), then straight traffic (v2). The left-turning car (v1) yields and goes last.",
        explanationKm: "ផ្ដល់ផ្លូវឱ្យខាងស្ដាំមុន (v3) បន្ទាប់មករថយន្តផ្លូវត្រង់ (v2)។ រថយន្តបត់ឆ្វេង (v1) ទៅក្រោយគេ។",
        difficulty: "hard",
    },
    {
        titleEn: "T-junction",
        titleKm: "ផ្លូវបំបែករាង T",
        layout: {
            junction: "t_junction",
            hasTrafficLight: false,
            vehicles: [
                { id: "v1", approach: "south", intent: "left", kind: "car", pos: 0.5 },
                { id: "v2", approach: "west", intent: "straight", kind: "bus", pos: 0.5 },
            ],
        },
        correctOrder: ["v2", "v1"],
        explanationEn: "Traffic on the main road (v2) has priority over the vehicle joining from the minor road (v1).",
        explanationKm: "ចរាចរណ៍លើផ្លូវធំ (v2) មានអាទិភាពជាងរថយន្តចូលពីផ្លូវតូច (v1)។",
        difficulty: "easy",
    },
];

async function seed() {
    try {
        for (const s of SCENES) {
            const existing = await sql`SELECT id FROM priority_scenes WHERE title_en = ${s.titleEn} LIMIT 1`;
            if (existing.length) {
                console.log(`Skip (exists): ${s.titleEn}`);
                continue;
            }
            await sql`
        INSERT INTO priority_scenes
          (title_en, title_km, layout, correct_order, explanation_en, explanation_km, difficulty, status)
        VALUES
          (${s.titleEn}, ${s.titleKm}, ${JSON.stringify(s.layout)}, ${JSON.stringify(s.correctOrder)},
           ${s.explanationEn}, ${s.explanationKm}, ${s.difficulty}, 'approved')
      `;
            console.log(`Inserted: ${s.titleEn}`);
        }
        console.log("✅ Priority scenes seeded.");
    } catch (e) {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    }
}

seed();
