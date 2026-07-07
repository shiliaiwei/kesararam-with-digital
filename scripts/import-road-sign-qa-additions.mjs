import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const sourcePath = "docs/qa-rewrite/categories/cat-01-road-sign.json";
const apply = process.argv.includes("--apply");
const databaseUrl = readEnvValue("DATABASE_URL");
if (!databaseUrl) throw new Error("DATABASE_URL not found in .env.local");

const sql = neon(databaseUrl);
const data = JSON.parse(readFileSync(sourcePath, "utf8"));
const additions = (data.items ?? []).filter((question) => slotFromId(question.id) >= 10);

function readEnvValue(key) {
  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const match = line.match(new RegExp(`^${key}=([\\s\\S]*)$`));
    if (match) return match[1].trim().replace(/^['"]|['"]$/g, "");
  }
  return "";
}

function slotFromId(id) {
  const slot = Number(String(id).split("-").at(-1));
  if (!Number.isInteger(slot)) throw new Error(`Bad question id: ${id}`);
  return slot;
}

function normalize(value) {
  return String(value ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function assertBatchReady() {
  if (additions.length !== 741) throw new Error(`Expected 741 additions, got ${additions.length}`);
  const byTopic = new Map();
  const english = new Set();
  const khmer = new Set();

  for (const question of additions) {
    if (question.categorySlug !== "road-sign") throw new Error(`${question.id}: not road-sign`);
    const slot = slotFromId(question.id);
    if (![10, 11, 12].includes(slot)) throw new Error(`${question.id}: unexpected addition slot`);
    if (question.answers?.length !== 4) throw new Error(`${question.id}: additions must have exactly 4 answers`);
    if (question.answers.filter((answer) => answer.isCorrect).length !== 1) throw new Error(`${question.id}: must have exactly one correct answer`);
    if (question.questionType === "image_selection") {
      if (question.questionImageUrl) throw new Error(`${question.id}: image selection cannot have a stem image`);
      if (question.answers.some((answer) => !answer.imageUrl)) throw new Error(`${question.id}: image option is missing an image`);
      if (new Set(question.answers.map((answer) => answer.imageUrl)).size !== 4) throw new Error(`${question.id}: duplicate image option`);
    } else if (!question.questionImageUrl) {
      throw new Error(`${question.id}: missing owner image`);
    }
    if (new Set(question.answers.map((answer) => normalize(answer.answerEn))).size !== 4) throw new Error(`${question.id}: duplicate English answer`);
    if (new Set(question.answers.map((answer) => normalize(answer.answerKm))).size !== 4) throw new Error(`${question.id}: duplicate Khmer answer`);

    const en = normalize(question.questionEn);
    const km = normalize(question.questionKm);
    if (english.has(en)) throw new Error(`${question.id}: duplicate English question in additions`);
    if (khmer.has(km)) throw new Error(`${question.id}: duplicate Khmer question in additions`);
    english.add(en);
    khmer.add(km);

    const topicItems = byTopic.get(question.topicId) ?? [];
    topicItems.push(slot);
    byTopic.set(question.topicId, topicItems);
  }

  if (byTopic.size !== 247) throw new Error(`Expected additions for 247 topics, got ${byTopic.size}`);
  for (const [topicId, slots] of byTopic) {
    if (slots.sort((a, b) => a - b).join(",") !== "10,11,12") throw new Error(`Topic ${topicId}: expected slots 10,11,12`);
  }
}

async function getLiveSummary() {
  const [row] = await sql.query(`
    WITH scoped_questions AS (
      SELECT q.* FROM questions q
      JOIN topics t ON t.id=q.topic_id
      JOIN categories c ON c.id=t.category_id
      WHERE c.slug='road-sign'
    ), answer_stats AS (
      SELECT q.id, COUNT(a.id)::int answer_count,
             COUNT(*) FILTER (WHERE a.is_correct)::int correct_count,
             BOOL_OR(a.image_url IS NOT NULL) has_answer_image
      FROM scoped_questions q LEFT JOIN answers a ON a.question_id=q.id
      GROUP BY q.id
    )
    SELECT
      (SELECT COUNT(*)::int FROM topics t JOIN categories c ON c.id=t.category_id WHERE c.slug='road-sign') topics,
      (SELECT COUNT(*)::int FROM scoped_questions) questions,
      (SELECT COUNT(*)::int FROM answers a JOIN scoped_questions q ON q.id=a.question_id) answers,
      (SELECT COUNT(*)::int FROM scoped_questions WHERE sort_order BETWEEN 10 AND 12) addition_slots,
      (SELECT COUNT(*)::int FROM answer_stats WHERE correct_count<>1) bad_correct_count,
      (SELECT COUNT(*)::int FROM answer_stats WHERE answer_count>4 OR answer_count=0) bad_answer_count,
      (SELECT COUNT(*)::int FROM answer_stats WHERE answer_count=2) true_false,
      (SELECT COUNT(*)::int FROM answer_stats WHERE answer_count<>2 AND has_answer_image) image_pick,
      (SELECT COUNT(*)::int FROM answer_stats WHERE answer_count<>2 AND NOT has_answer_image) mcq
  `);
  return row;
}

assertBatchReady();
const before = await getLiveSummary();
console.log("Before:", before);
console.log(`Validated additions: ${additions.length} questions / ${additions.reduce((sum, q) => sum + q.answers.length, 0)} answers`);

if (!apply) {
  console.log("Dry run complete. Re-run with --apply to insert the validated batch.");
  process.exit(0);
}

if (before.questions !== 2223 || before.answers !== 7904 || before.addition_slots !== 0) {
  throw new Error(`Live road-sign baseline changed; refusing additive insert: ${JSON.stringify(before)}`);
}

const payload = additions.map((question) => ({
  client_key: question.id,
  topic_id: question.topicId,
  sort_order: slotFromId(question.id),
  question_type: question.questionType,
  question_en: question.questionEn,
  question_km: question.questionKm,
  hint_en: question.explanationEn ?? null,
  hint_km: question.explanationKm ?? null,
  image_url: question.questionImageUrl ?? null,
  difficulty: question.difficulty,
  answers: question.answers.map((answer, index) => ({
    answer_type: answer.answerType ?? (answer.imageUrl ? "image_selection" : "multiple_choice"),
    answer_en: answer.answerEn,
    answer_km: answer.answerKm,
    is_correct: Boolean(answer.isCorrect),
    image_url: answer.imageUrl ?? null,
    sort_order: index,
  })),
}));

const [insertResult] = await sql.query(`
  WITH question_input AS (
    SELECT *
    FROM jsonb_to_recordset($1::jsonb) AS q(
      client_key text, topic_id int, sort_order int, question_type text,
      question_en text, question_km text, hint_en text, hint_km text,
      image_url text, difficulty text, answers jsonb
    )
  ), live_counts AS (
    SELECT
      (SELECT COUNT(*)::int FROM topics t JOIN categories c ON c.id=t.category_id WHERE c.slug='road-sign') topics,
      (SELECT COUNT(*)::int FROM questions q JOIN topics t ON t.id=q.topic_id JOIN categories c ON c.id=t.category_id WHERE c.slug='road-sign') questions,
      (SELECT COUNT(*)::int FROM answers a JOIN questions q ON q.id=a.question_id JOIN topics t ON t.id=q.topic_id JOIN categories c ON c.id=t.category_id WHERE c.slug='road-sign') answers,
      (SELECT COUNT(*)::int FROM question_input) incoming
  ), guard AS (
    SELECT 1 ok FROM live_counts lc
    WHERE lc.topics=247 AND lc.questions=2223 AND lc.answers=7904 AND lc.incoming=741
      AND NOT EXISTS (
        SELECT 1 FROM questions q
        JOIN topics t ON t.id=q.topic_id JOIN categories c ON c.id=t.category_id
        WHERE c.slug='road-sign' AND q.sort_order BETWEEN 10 AND 12
      )
      AND NOT EXISTS (
        SELECT 1 FROM question_input i
        JOIN questions q ON regexp_replace(lower(trim(q.question_en)), '\\s+', ' ', 'g') = regexp_replace(lower(trim(i.question_en)), '\\s+', ' ', 'g')
          OR regexp_replace(lower(trim(q.question_km)), '\\s+', ' ', 'g') = regexp_replace(lower(trim(i.question_km)), '\\s+', ' ', 'g')
        JOIN topics t ON t.id=q.topic_id JOIN categories c ON c.id=t.category_id
        WHERE c.slug='road-sign'
      )
  ), inserted_questions AS (
    INSERT INTO questions (
      topic_id, question_type, question_en, question_km,
      hint_en, hint_km, image_url, difficulty, status, sort_order
    )
    SELECT i.topic_id, i.question_type, i.question_en, i.question_km,
           i.hint_en, i.hint_km, i.image_url, i.difficulty, 'approved', i.sort_order
    FROM question_input i CROSS JOIN guard
    RETURNING id, topic_id, sort_order
  ), answer_input AS (
    SELECT i.topic_id, i.sort_order question_sort_order, a.*
    FROM question_input i
    CROSS JOIN LATERAL jsonb_to_recordset(i.answers) AS a(
      answer_type text, answer_en text, answer_km text,
      is_correct boolean, image_url text, sort_order int
    )
  ), inserted_answers AS (
    INSERT INTO answers (
      question_id, answer_type, answer_en, answer_km,
      is_correct, image_url, sort_order
    )
    SELECT q.id, a.answer_type, a.answer_en, a.answer_km,
           a.is_correct, a.image_url, a.sort_order
    FROM answer_input a
    JOIN inserted_questions q ON q.topic_id=a.topic_id AND q.sort_order=a.question_sort_order
    RETURNING id
  )
  SELECT
    (SELECT COUNT(*)::int FROM inserted_questions) inserted_questions,
    (SELECT COUNT(*)::int FROM inserted_answers) inserted_answers
`, [JSON.stringify(payload)]);

if (insertResult.inserted_questions !== 741 || insertResult.inserted_answers !== 2964) {
  throw new Error(`Insert guard rejected the batch: ${JSON.stringify(insertResult)}`);
}

const after = await getLiveSummary();
console.log("Inserted:", insertResult);
console.log("After:", after);

if (
  after.topics !== 247 || after.questions !== 2964 || after.answers !== 10868 ||
  after.addition_slots !== 741 || after.bad_correct_count !== 0 || after.bad_answer_count !== 0 ||
  after.true_false !== 494 || after.image_pick !== 494 || after.mcq !== 1976
) {
  throw new Error(`Unexpected live totals after insert: ${JSON.stringify(after)}`);
}

console.log("Road-sign additions inserted and verified.");
