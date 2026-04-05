/**
 * seed-game-modes.mjs
 * Seeds game_modes table with solo + live modes.
 *
 * Composition per mode:
 *   Easy   4Q  (MCQ)
 *   Medium 4Q  (MCQ)
 *   Hard   2Q  (MCQ)
 *   T/F    2Q
 *   ─────────────
 *   Total  12Q
 *
 * Run:  node scripts/seed-game-modes.mjs
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

const modes = [
  // ── SOLO modes ──────────────────────────────────────────────────────────────
  {
    modeKey: "solo_practice",
    nameEn: "Solo Practice",
    nameKm: "អនុវត្តតែម្នាក់",
    descriptionEn: "Practice at your own pace. No timer pressure.",
    descriptionKm: "អនុវត្តតាមល្បឿនខ្លួនឯង។ គ្មានសម្ពាធម៉ោង។",
    tagLabel: "Solo",
    questionCount: 12,
    timeLimit: null,
    timerPerQuestion: false,
    categoriesIncluded: ["road-traffic","driving","technical","emergency","loading-people-goods","general-knowledge"],
    difficultyLevels: ["easy","medium","hard"],
    scoringMode: "equal",
    language: "both",
    composition: JSON.stringify({ easy: 4, medium: 4, hard: 2, true_false: 2 }),
    isActive: true,
  },
  {
    modeKey: "solo_speed",
    nameEn: "Speed Quiz",
    nameKm: "ប្រណាំងល្បឿន",
    descriptionEn: "Race against the clock. Faster answers = more points.",
    descriptionKm: "ប្រណាំងជាមួយម៉ោង។ ចម្លើយលឿន = ពិន្ទុច្រើន។",
    tagLabel: "Speed",
    questionCount: 12,
    timeLimit: 300,
    timerPerQuestion: true,
    categoriesIncluded: ["road-traffic","driving","technical","emergency","loading-people-goods","general-knowledge"],
    difficultyLevels: ["easy","medium","hard"],
    scoringMode: "speed",
    language: "both",
    composition: JSON.stringify({ easy: 4, medium: 4, hard: 2, true_false: 2 }),
    isActive: true,
  },
  {
    modeKey: "solo_exam",
    nameEn: "Exam Simulation",
    nameKm: "ការប្រឡងក្លែងធ្វើ",
    descriptionEn: "Simulate the real driving license exam. Mixed difficulty.",
    descriptionKm: "ក្លែងធ្វើការប្រឡងបណ្ណបើកបរពិតប្រាកដ។",
    tagLabel: "Exam",
    questionCount: 12,
    timeLimit: 600,
    timerPerQuestion: false,
    categoriesIncluded: ["road-traffic","driving","technical","emergency","loading-people-goods","general-knowledge"],
    difficultyLevels: ["easy","medium","hard"],
    scoringMode: "equal",
    language: "both",
    composition: JSON.stringify({ easy: 4, medium: 4, hard: 2, true_false: 2 }),
    isActive: true,
  },
  {
    modeKey: "solo_category",
    nameEn: "Category Focus",
    nameKm: "ផ្តោតលើប្រភេទ",
    descriptionEn: "Deep-dive into one category at a time.",
    descriptionKm: "ស្វែងយល់ស៊ីជម្រៅក្នុងប្រភេទមួយ។",
    tagLabel: "Focus",
    questionCount: 12,
    timeLimit: null,
    timerPerQuestion: false,
    categoriesIncluded: ["road-traffic","driving","technical","emergency","loading-people-goods","general-knowledge"],
    difficultyLevels: ["easy","medium","hard"],
    scoringMode: "equal",
    language: "both",
    composition: JSON.stringify({ easy: 4, medium: 4, hard: 2, true_false: 2 }),
    isActive: true,
  },

  // ── LIVE / multiplayer modes ─────────────────────────────────────────────────
  {
    modeKey: "live_challenge",
    nameEn: "Live Challenge",
    nameKm: "ប្រកួតផ្ទាល់",
    descriptionEn: "Compete live with classmates. Teacher-hosted.",
    descriptionKm: "ប្រកួតផ្ទាល់ជាមួយមិត្តរួមថ្នាក់។ គ្រូជាម្ចាស់ផ្ទះ។",
    tagLabel: "Live",
    questionCount: 12,
    timeLimit: null,
    timerPerQuestion: true,
    categoriesIncluded: ["road-traffic","driving","technical","emergency","loading-people-goods","general-knowledge"],
    difficultyLevels: ["easy","medium","hard"],
    scoringMode: "speed",
    language: "both",
    composition: JSON.stringify({ easy: 4, medium: 4, hard: 2, true_false: 2 }),
    isActive: true,
  },
  {
    modeKey: "live_team",
    nameEn: "Team Battle",
    nameKm: "ប្រកួតក្រុម",
    descriptionEn: "Team vs team live competition.",
    descriptionKm: "ការប្រកួតផ្ទាល់ក្រុមមួយទល់ក្រុមមួយ។",
    tagLabel: "Team",
    questionCount: 12,
    timeLimit: null,
    timerPerQuestion: true,
    categoriesIncluded: ["road-traffic","driving","technical","emergency","loading-people-goods","general-knowledge"],
    difficultyLevels: ["easy","medium","hard"],
    scoringMode: "speed",
    language: "both",
    composition: JSON.stringify({ easy: 4, medium: 4, hard: 2, true_false: 2 }),
    isActive: true,
  },
];

async function main() {
  console.log("Seeding game_modes...\n");

  for (const m of modes) {
    await sql`
      INSERT INTO game_modes (
        mode_key, name_en, name_km,
        description_en, description_km,
        tag_label, question_count, time_limit,
        timer_per_question, categories_included,
        difficulty_levels, is_active,
        created_at, updated_at
      ) VALUES (
        ${m.modeKey}, ${m.nameEn}, ${m.nameKm},
        ${m.descriptionEn}, ${m.descriptionKm},
        ${m.tagLabel}, ${m.questionCount}, ${m.timeLimit},
        ${m.timerPerQuestion}, ${m.categoriesIncluded},
        ${m.difficultyLevels}, ${m.isActive},
        NOW(), NOW()
      )
      ON CONFLICT (mode_key) DO UPDATE SET
        name_en              = EXCLUDED.name_en,
        name_km              = EXCLUDED.name_km,
        description_en       = EXCLUDED.description_en,
        description_km       = EXCLUDED.description_km,
        tag_label            = EXCLUDED.tag_label,
        question_count       = EXCLUDED.question_count,
        time_limit           = EXCLUDED.time_limit,
        timer_per_question   = EXCLUDED.timer_per_question,
        categories_included  = EXCLUDED.categories_included,
        difficulty_levels    = EXCLUDED.difficulty_levels,
        is_active            = EXCLUDED.is_active,
        updated_at           = NOW()
    `;
    console.log(`  ✅  ${m.modeKey} — ${m.nameEn}`);
  }

  console.log("\nDone. Game modes seeded.");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
