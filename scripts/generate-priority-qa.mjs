/**
 * Priority Q&A generator — REAL-DATA style.
 * Each priority topic is an intersection diagram whose true answer (the vehicle
 * order) already lives in topics.description_*. We build ONE question per topic:
 *   - show the diagram image
 *   - ask the meaning (topics.name_*)
 *   - 3 options = the REAL answer (correct) + 2 other real answers (distractors)
 * No answers are invented. Output: cat-03-priority.json (+ .md). No DB writes.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { neon } from "@neondatabase/serverless";

const DB_URL = readEnvValue("DATABASE_URL");
if (!DB_URL) throw new Error("DATABASE_URL not found in .env.local");
const sql = neon(DB_URL);
const outJson = "docs/qa-rewrite/categories/cat-03-priority.json";
const outMd = "docs/qa-rewrite/categories/cat-03-priority.md";

function readEnvValue(key) {
  const env = readFileSync(".env.local", "utf8");
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(new RegExp(`^${key}=([\\s\\S]*)$`));
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, "");
  }
  return "";
}

// Boilerplate tails in the English answer that aren't part of the order itself.
const EN_BOILERPLATE = [
  "Follow the displayed order one by one to avoid conflict at the intersection.",
  "Pay extra attention to left-turn conflict points and follow the displayed priority order carefully.",
  "Non-conflicting vehicles may proceed together, then remaining vehicles follow the shown order.",
];
function cleanAnsEn(s) {
  let t = String(s || "").replace(/\s+/g, " ").trim();
  t = t.replace(/^the answer is\s*:?\s*/i, "");
  for (const b of EN_BOILERPLATE) t = t.split(b).join(" ");
  return t.replace(/\s+/g, " ").replace(/\s+\./g, ".").replace(/^[.\s]+/, "").trim();
}
function cleanAnsKm(s) {
  let t = String(s || "").replace(/\s+/g, " ").trim();
  t = t.replace(/^ចម្លើយ\s*គឺ\s*[:：]?\s*/, "");
  return t.replace(/\s+([។៕,])/g, "$1").trim();
}
const cleanQ = (s) => String(s || "").replace(/\s+/g, " ").trim();

function hash(input) {
  let n = 2166136261;
  for (const ch of input) { n ^= ch.charCodeAt(0); n = Math.imul(n, 16777619); }
  return n >>> 0;
}

function difficultyFor(sub) {
  const s = (sub || "").toLowerCase();
  if (s.includes("sequential")) return "easy";
  if (s.includes("simultaneous")) return "medium";
  return "hard"; // Left Turn and anything else
}

const rows = await sql.query(`
  SELECT t.id, t.topic_code, t.sub_group, t.name_en, t.name_km,
         t.description_en, t.description_km, t.primary_image_url, c.slug AS category_slug
  FROM topics t JOIN categories c ON c.id = t.category_id
  WHERE c.slug = 'priority'
  ORDER BY t.id
`);

const topics = rows.map((r) => ({
  id: r.id,
  code: r.topic_code,
  sub: cleanQ(r.sub_group),
  qEn: cleanQ(r.name_en) || "What does this sign stand for?",
  qKm: cleanQ(r.name_km) || "ផ្លាកសញ្ញានេះមានន័យដូចម្តេច?",
  ansEn: cleanAnsEn(r.description_en),
  ansKm: cleanAnsKm(r.description_km),
  img: r.primary_image_url,
  slug: r.category_slug,
}));

// 2 distractors = real answers from 2 OTHER topics, with different answer text.
function distractors(topic, idx) {
  const pool = topics
    .filter((t, i) => i !== idx && t.ansKm && t.ansKm !== topic.ansKm)
    .sort((a, b) => hash(`${topic.id}:${a.id}`) - hash(`${topic.id}:${b.id}`));
  const out = [];
  const seen = new Set([topic.ansKm]);
  for (const t of pool) {
    if (seen.has(t.ansKm)) continue;
    seen.add(t.ansKm);
    out.push(t);
    if (out.length === 2) break;
  }
  if (out.length !== 2) throw new Error(`Not enough distractors for ${topic.code}`);
  return out;
}

const items = topics.map((t, idx) => {
  const ds = distractors(t, idx);
  const answers = [
    { answerKm: t.ansKm, answerEn: t.ansEn, isCorrect: true, answerType: "multiple_choice" },
    ...ds.map((d) => ({ answerKm: d.ansKm, answerEn: d.ansEn, isCorrect: false, answerType: "multiple_choice" })),
  ];
  return {
    id: `PR-${t.id}-01`,
    topicId: t.id,
    topicCode: t.code,
    categorySlug: t.slug,
    subGroup: t.sub,
    difficulty: difficultyFor(t.sub),
    questionType: "scenario",
    questionImageUrl: t.img,
    questionKm: t.qKm,
    questionEn: t.qEn,
    answers,
    answerKm: t.ansKm,
    answerEn: t.ansEn,
    explanationKm: "មើលរូប ហើយជ្រើសរើសលំដាប់ត្រឹមត្រូវនៃការទៅមុន។",
    explanationEn: "Look at the diagram and choose the correct order of who goes first.",
  };
});

function validate() {
  const problems = [];
  const ids = new Set();
  for (const q of items) {
    if (q.categorySlug !== "priority") problems.push(`${q.id}: not priority`);
    if (!q.questionImageUrl) problems.push(`${q.id}: missing diagram image`);
    if (!q.answerKm || !q.answerEn) problems.push(`${q.id}: empty real answer`);
    if (q.answers.length !== 3) problems.push(`${q.id}: must have exactly 3 options`);
    if (q.answers.filter((a) => a.isCorrect).length !== 1) problems.push(`${q.id}: must have exactly one correct`);
    if (new Set(q.answers.map((a) => a.answerKm)).size !== 3) problems.push(`${q.id}: duplicate option text`);
    if (ids.has(q.topicId)) problems.push(`${q.id}: duplicate topic`);
    ids.add(q.topicId);
  }
  if (problems.length) throw new Error(`Validation failed:\n${problems.slice(0, 40).join("\n")}`);
}
validate();

const data = {
  meta: {
    category: "priority", categoryId: 3, version: "real-data-v1",
    status: "for-review - not inserted",
    topicsTotal: topics.length, questions: items.length,
    optionsPerQuestion: 3,
    note: "Real intersection-priority data. One question per topic: diagram image + meaning question + 3 options = the topic's true answer (from description) + 2 other real answers. No answers generated.",
  },
  items,
};

function toMarkdown() {
  const lines = [`# Priority Q&A — real-data (${items.length} questions)`, "", `Status: ${data.meta.status}`, ""];
  for (const q of items) {
    lines.push(`## ${q.topicCode} — topic_id ${q.topicId} — ${q.subGroup} — ${q.difficulty}`);
    lines.push(`Image: ${q.questionImageUrl}`);
    lines.push(`KM: ${q.questionKm}`);
    lines.push(`EN: ${q.questionEn}`);
    q.answers.forEach((a, i) => lines.push(`${i + 1}. ${a.isCorrect ? "[correct]" : "[ ]"} ${a.answerKm} / ${a.answerEn}`));
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

mkdirSync(dirname(outJson), { recursive: true });
writeFileSync(outJson, `${JSON.stringify(data, null, 2)}\n`);
writeFileSync(outMd, `${toMarkdown()}\n`);
console.log(`Wrote ${outJson}`);
console.log(`Wrote ${outMd}`);
console.log(`Topics: ${topics.length}  Questions: ${items.length}  Answers: ${items.length * 3}`);
