import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const [, , ...args] = process.argv;
const replace = args.includes("--replace");
const sourcePath = "docs/qa-rewrite/categories/cat-01-road-sign.json";
const DATABASE_URL = readEnvValue("DATABASE_URL");

if (!DATABASE_URL) throw new Error("DATABASE_URL not found in .env.local");

const sql = neon(DATABASE_URL);
const data = JSON.parse(readFileSync(sourcePath, "utf8"));
const items = data.items ?? [];

function readEnvValue(key) {
  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(new RegExp(`^${key}=([\\s\\S]*)$`));
    if (!match) continue;
    return match[1].trim().replace(/^['"]|['"]$/g, "");
  }
  return "";
}

function slotFromId(id) {
  const slot = Number(String(id).split("-").at(-1));
  if (!Number.isInteger(slot) || slot < 1 || slot > 9) {
    throw new Error(`Bad question id slot: ${id}`);
  }
  return slot;
}

function assertReady() {
  const byTopic = new Map();
  for (const q of items) {
    if (q.categorySlug !== "road-sign") throw new Error(`${q.id}: not road-sign`);
    if (!q.questionImageUrl) throw new Error(`${q.id}: missing question image`);
    if ((q.answers ?? []).filter((a) => a.isCorrect).length !== 1) {
      throw new Error(`${q.id}: must have exactly one correct answer`);
    }
    if (q.answers.length > 4) throw new Error(`${q.id}: more than 4 answers`);
    if (q.questionType === "true_false" && q.answers.length !== 2) {
      throw new Error(`${q.id}: true_false must have 2 answers`);
    }
    if (q.questionType !== "true_false" && q.answers.length !== 4) {
      throw new Error(`${q.id}: non true_false must have 4 answers`);
    }
    if (q.questionType === "image_selection" && q.answers.some((a) => !a.imageUrl)) {
      throw new Error(`${q.id}: image_selection answer missing image`);
    }
    const list = byTopic.get(q.topicId) ?? [];
    list.push(q);
    byTopic.set(q.topicId, list);
  }

  if (byTopic.size !== 247) throw new Error(`Expected 247 topics, got ${byTopic.size}`);
  if (items.length !== 2223) throw new Error(`Expected 2223 questions, got ${items.length}`);
}

async function countRoadSignRows() {
  const [row] = await sql.query(`
    SELECT
      COUNT(DISTINCT t.id)::int AS topics,
      COUNT(DISTINCT q.id)::int AS questions,
      COUNT(a.id)::int AS answers
    FROM topics t
    JOIN categories c ON c.id = t.category_id
    LEFT JOIN questions q ON q.topic_id = t.id
    LEFT JOIN answers a ON a.question_id = q.id
    WHERE c.slug = 'road-sign'
  `);
  return row;
}

function gameTypeFor(q) {
  if (q.answers.length === 2) return "true_false";
  if (q.answers.some((a) => a.imageUrl)) return "image_pick";
  return "mcq";
}

assertReady();

const before = await countRoadSignRows();
console.log("Before:", before);

if (before.questions > 0) {
  if (!replace) {
    throw new Error("Road-sign questions already exist. Re-run with --replace to replace only this category.");
  }
  await sql.query(`
    DELETE FROM questions
    WHERE topic_id IN (
      SELECT t.id
      FROM topics t
      JOIN categories c ON c.id = t.category_id
      WHERE c.slug = 'road-sign'
    )
  `);
  console.log(`Deleted existing road-sign questions: ${before.questions}`);
}

const questionRows = items.map((q) => ({
  topic_id: q.topicId,
  question_type: q.questionType,
  question_en: q.questionEn,
  question_km: q.questionKm,
  hint_en: q.explanationEn ?? null,
  hint_km: q.explanationKm ?? null,
  image_url: q.questionImageUrl,
  difficulty: q.difficulty,
  status: "approved",
  sort_order: slotFromId(q.id),
}));

await sql.query(
  `
    INSERT INTO questions (
      topic_id, question_type, question_en, question_km,
      hint_en, hint_km, image_url, difficulty, status, sort_order
    )
    SELECT
      topic_id, question_type, question_en, question_km,
      hint_en, hint_km, image_url, difficulty, status, sort_order
    FROM jsonb_to_recordset($1::jsonb) AS q(
      topic_id int,
      question_type text,
      question_en text,
      question_km text,
      hint_en text,
      hint_km text,
      image_url text,
      difficulty text,
      status text,
      sort_order int
    )
  `,
  [JSON.stringify(questionRows)]
);

const insertedQuestions = await sql.query(`
  SELECT q.id, q.topic_id, q.sort_order
  FROM questions q
  JOIN topics t ON t.id = q.topic_id
  JOIN categories c ON c.id = t.category_id
  WHERE c.slug = 'road-sign'
`);
const questionIdByTopicSlot = new Map(
  insertedQuestions.map((q) => [`${q.topic_id}:${q.sort_order}`, q.id])
);

const answerRows = [];
for (const q of items) {
  const questionId = questionIdByTopicSlot.get(`${q.topicId}:${slotFromId(q.id)}`);
  if (!questionId) throw new Error(`Inserted question not found for ${q.id}`);
  q.answers.forEach((a, index) => {
    answerRows.push({
      question_id: questionId,
      answer_type: a.answerType ?? (a.imageUrl ? "image_selection" : "multiple_choice"),
      answer_en: a.answerEn,
      answer_km: a.answerKm,
      is_correct: Boolean(a.isCorrect),
      image_url: a.imageUrl ?? null,
      sort_order: index,
    });
  });
}

await sql.query(
  `
    INSERT INTO answers (
      question_id, answer_type, answer_en, answer_km,
      is_correct, image_url, sort_order
    )
    SELECT
      question_id, answer_type, answer_en, answer_km,
      is_correct, image_url, sort_order
    FROM jsonb_to_recordset($1::jsonb) AS a(
      question_id int,
      answer_type text,
      answer_en text,
      answer_km text,
      is_correct boolean,
      image_url text,
      sort_order int
    )
  `,
  [JSON.stringify(answerRows)]
);

const after = await countRoadSignRows();
const modeCounts = items.reduce(
  (acc, q) => {
    acc[gameTypeFor(q)] += 1;
    return acc;
  },
  { mcq: 0, true_false: 0, image_pick: 0 }
);

const [dbModeCounts] = await sql.query(`
  WITH answer_stats AS (
    SELECT
      q.id,
      COUNT(a.id)::int AS answer_count,
      BOOL_OR(a.image_url IS NOT NULL) AS has_answer_image
    FROM questions q
    JOIN topics t ON t.id = q.topic_id
    JOIN categories c ON c.id = t.category_id
    JOIN answers a ON a.question_id = q.id
    WHERE c.slug = 'road-sign'
      AND q.status IN ('approved', 'published')
    GROUP BY q.id
  )
  SELECT
    COUNT(*)::int AS all_play,
    COUNT(*) FILTER (WHERE answer_count = 2)::int AS true_false,
    COUNT(*) FILTER (WHERE answer_count <> 2 AND has_answer_image)::int AS image_pick,
    COUNT(*) FILTER (WHERE answer_count <> 2 AND NOT has_answer_image)::int AS mcq
  FROM answer_stats
`);

console.log("After:", after);
console.log("Expected game type counts from JSON:", modeCounts);
console.log("DB game type counts:", dbModeCounts);

if (after.topics !== 247 || after.questions !== 2223 || after.answers !== 7904) {
  throw new Error(`Unexpected DB totals after import: ${JSON.stringify(after)}`);
}
if (dbModeCounts.mcq !== 1482 || dbModeCounts.true_false !== 494 || dbModeCounts.image_pick !== 247) {
  throw new Error(`Unexpected game type counts: ${JSON.stringify(dbModeCounts)}`);
}

console.log("Road-sign Q&A import complete.");
