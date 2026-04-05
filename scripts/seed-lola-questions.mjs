/**
 * seed-lola-questions.mjs
 * Seeds topics + questions + answers from the lola JSON files.
 *
 * Structure per topic:
 *   Easy   × 4  (MCQ 4-option)
 *   Medium × 4  (MCQ 4-option)
 *   Hard   × 2  (MCQ 4-option)
 *   True/False × 2  (2-option)
 *   ─────────────────────────
 *   Total  = 12 questions per topic
 *
 * Answer types:
 *   3-option original JSON  → multiple_choice
 *   2-option True/False     → multiple_choice
 *
 * image_url / audio_url_en / audio_url_km are left NULL — fill via admin.
 *
 * Run:  node scripts/seed-lola-questions.mjs
 * Safe: skips topics that already have questions.
 */

import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

// ─── Category map (matches seed-categories.ts) ───────────────────────────────
// lola JSON category_id → DB categories.id
// DB ids from seed-categories.ts:
//   1=Traffic Signs, 2=Road Traffic Law, 3=Right of Way,
//   4=Driving Skills, 5=Vehicle Technology, 6=Loading People & Goods,
//   7=General Knowledge, 8=Emergency
const CAT_MAP = {
  "1": 2,  // lola Road Traffic       → DB Road Traffic Law
  "4": 4,  // lola Driving Skills     → DB Driving Skills
  "5": 5,  // lola Vehicle Technology → DB Vehicle Technology
  "6": 8,  // lola Emergency          → DB Emergency
  "7": 6,  // lola Loading            → DB Loading People & Goods
  "8": 7,  // lola General Knowledge  → DB General Knowledge
};

// ─── Difficulty assignment helper ────────────────────────────────────────────
// Given a 0-based index within a topic's question list, assign difficulty.
// First 4 → easy, next 4 → medium, last 2+ → hard
function difficultyFor(idx) {
  if (idx < 4) return "easy";
  if (idx < 8) return "medium";
  return "hard";
}

// ─── Score / time by difficulty ──────────────────────────────────────────────
function scoreFor(diff) {
  return diff === "easy" ? 5 : diff === "medium" ? 10 : 15;
}
function timeFor(diff) {
  return diff === "easy" ? 20 : diff === "medium" ? 30 : 45;
}

// ─── Build topic code ────────────────────────────────────────────────────────
function topicCode(catId, qId) {
  return `CAT${catId}-Q${qId}`;
}

// ─── Insert helpers ──────────────────────────────────────────────────────────
async function upsertTopic(t) {
  const rows = await sql`
    INSERT INTO topics (
      topic_code, category_id, name_en, name_km,
      description_en, description_km,
      status, sort_order, created_at, updated_at
    ) VALUES (
      ${t.topicCode}, ${t.categoryId}, ${t.nameEn}, ${t.nameKm},
      ${t.descriptionEn}, ${t.descriptionKm},
      'draft', ${t.sortOrder}, NOW(), NOW()
    )
    ON CONFLICT (topic_code) DO UPDATE SET
      name_en        = EXCLUDED.name_en,
      name_km        = EXCLUDED.name_km,
      description_en = EXCLUDED.description_en,
      description_km = EXCLUDED.description_km,
      updated_at     = NOW()
    RETURNING id
  `;
  return rows[0].id;
}

async function insertQuestion(q) {
  const rows = await sql`
    INSERT INTO questions (
      topic_id, question_en, question_km,
      difficulty, status, sort_order, created_at
    ) VALUES (
      ${q.topicId}, ${q.questionEn}, ${q.questionKm},
      ${q.difficulty}, 'draft', ${q.sortOrder}, NOW()
    )
    RETURNING id
  `;
  return rows[0].id;
}

async function insertAnswer(a) {
  await sql`
    INSERT INTO answers (
      question_id, answer_type, answer_en, answer_km,
      is_correct, sort_order, created_at
    ) VALUES (
      ${a.questionId}, ${a.answerType}, ${a.answerEn}, ${a.answerKm},
      ${a.isCorrect}, ${a.sortOrder}, NOW()
    )
  `;
}

// ─── True/False questions generated per topic ────────────────────────────────
// We derive 2 T/F questions from the first 2 correct answers of the topic.
function buildTrueFalseQuestions(lolaQuestions) {
  const tf = [];
  for (let i = 0; i < Math.min(2, lolaQuestions.length); i++) {
    const q = lolaQuestions[i];
    const correctAns = q.answers.find(a => a.is_correct);
    if (!correctAns) continue;
    tf.push({
      questionEn: `True or False: "${correctAns.en}" is the correct answer to: "${q.question.en}"`,
      questionKm: `ពិត ឬ មិនពិត: "${correctAns.km}" ជាចម្លើយត្រឹមត្រូវចំពោះ: "${q.question.km}"`,
      answers: [
        { en: "True",  km: "ពិត",    isCorrect: true  },
        { en: "False", km: "មិនពិត", isCorrect: false },
      ],
    });
  }
  return tf;
}

// ─── Process one lola JSON file ───────────────────────────────────────────────
async function processCategory(data) {
  const lolaId   = String(data.category_id);
  const dbCatId  = CAT_MAP[lolaId];
  if (!dbCatId) {
    console.warn(`  ⚠ No DB category mapping for lola id=${lolaId}, skipping`);
    return;
  }

  const questions = data.questions;
  console.log(`\n📂 [${data.category_en}] — ${questions.length} source questions`);

  // Group questions into topics of ~10 each (we use each original question as its own topic)
  // Each lola question becomes ONE topic with:
  //   - The original question (MCQ, difficulty by index)
  //   - 1 extra easy MCQ (rephrased)
  //   - 1 extra medium MCQ (rephrased)
  //   - 1 T/F derived from correct answer
  // This gives 4 questions per topic minimum.
  // For the full composition (Easy4/Med4/Hard2/TF2) we batch every 10 lola questions into 1 topic.

  // ── Strategy: batch every 10 lola questions → 1 topic ──────────────────────
  const BATCH = 10;
  let topicIdx = 0;

  for (let start = 0; start < questions.length; start += BATCH) {
    const batch = questions.slice(start, start + BATCH);
    const firstQ = batch[0];

    const tCode = topicCode(lolaId, firstQ.question_id);
    const tNameEn = `${data.category_en} — Part ${topicIdx + 1}`;
    const tNameKm = `${data.category_km} — ផ្នែក ${topicIdx + 1}`;
    const tDescEn = batch.map(q => q.question.en).join(" | ").slice(0, 300);
    const tDescKm = batch.map(q => q.question.km).join(" | ").slice(0, 300);

    // Check if topic already has questions
    const existing = await sql`
      SELECT t.id, COUNT(q.id)::int as q_count
      FROM topics t
      LEFT JOIN questions q ON q.topic_id = t.id
      WHERE t.topic_code = ${tCode}
      GROUP BY t.id
    `;

    if (existing.length > 0 && existing[0].q_count > 0) {
      console.log(`  SKIP  ${tCode} (already has ${existing[0].q_count} questions)`);
      topicIdx++;
      continue;
    }

    const topicId = await upsertTopic({
      topicCode: tCode,
      categoryId: dbCatId,
      nameEn: tNameEn,
      nameKm: tNameKm,
      descriptionEn: tDescEn,
      descriptionKm: tDescKm,
      sortOrder: topicIdx,
    });

    let qSortOrder = 0;

    // ── Insert MCQ questions from batch (up to 10) ──────────────────────────
    for (let i = 0; i < batch.length; i++) {
      const lq = batch[i];
      const diff = difficultyFor(i);

      const qId = await insertQuestion({
        topicId,
        questionEn: lq.question.en,
        questionKm: lq.question.km,
        difficulty: diff,
        sortOrder: qSortOrder++,
      });

      // Insert original answers (3-option MCQ)
      for (let ai = 0; ai < lq.answers.length; ai++) {
        const ans = lq.answers[ai];
        await insertAnswer({
          questionId: qId,
          answerType: "multiple_choice",
          answerEn: ans.en,
          answerKm: ans.km,
          isCorrect: ans.is_correct,
          sortOrder: ai,
        });
      }
    }

    // ── Insert 2 True/False questions derived from batch ───────────────────
    const tfQuestions = buildTrueFalseQuestions(batch);
    for (const tfq of tfQuestions) {
      const qId = await insertQuestion({
        topicId,
        questionEn: tfq.questionEn,
        questionKm: tfq.questionKm,
        difficulty: "easy",
        sortOrder: qSortOrder++,
      });
      for (let ai = 0; ai < tfq.answers.length; ai++) {
        const ans = tfq.answers[ai];
        await insertAnswer({
          questionId: qId,
          answerType: "multiple_choice",
          answerEn: ans.en,
          answerKm: ans.km,
          isCorrect: ans.isCorrect,
          sortOrder: ai,
        });
      }
    }

    console.log(`  ✅  ${tCode} — ${qSortOrder} questions inserted (topic_id=${topicId})`);
    topicIdx++;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const { readFile } = await import("fs/promises");
  const { resolve } = await import("path");

  const files = [
    "lola/1_Road_Traffic.json",
    "lola/4_Driving_Skills.json",
    "lola/5_Vehicle_Technology.json",
    "lola/6_Emergency.json",
    "lola/7_Loading.json",
    "lola/8_General_Knowledge.json",
  ];

  for (const f of files) {
    const raw = await readFile(resolve(f), "utf8");
    const data = JSON.parse(raw);
    await processCategory(data);
  }

  console.log("\n✅ Done. All lola questions seeded.");
  console.log("   image_url / audio_url_en / audio_url_km are NULL — fill via admin panel.");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
