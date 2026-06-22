import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "../src/lib/db";

function norm(s: string) {
  return (s ?? "").toLowerCase().replace(/[.\s,;:!?'"`’“”\-_/()]+/g, "").trim();
}

async function main() {
  const rows = await sql`
    SELECT a.question_id, a.id, a.answer_en, a.answer_km, a.is_correct, a.image_url,
           t.topic_code, t.category_id, c.slug AS cat_slug
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    JOIN topics t ON q.topic_id = t.id
    JOIN categories c ON t.category_id = c.id
    ORDER BY a.question_id, a.sort_order`;

  const byQ = new Map<number, any[]>();
  for (const r of rows) {
    if (!byQ.has(r.question_id)) byQ.set(r.question_id, []);
    byQ.get(r.question_id)!.push(r);
  }

  const broken: { qid: number; ans: any[]; catSlug: string; topic: string }[] = [];
  for (const [qid, ans] of byQ) {
    if (ans.length < 2) continue;
    const distinctEn = new Set(ans.map((a) => a.answer_en)).size;
    const distinctKm = new Set(ans.map((a) => (a.answer_km ?? "").trim()).filter(Boolean)).size;
    if (distinctEn > distinctKm) broken.push({ qid, ans, catSlug: ans[0].cat_slug, topic: ans[0].topic_code });
  }

  // Classify broken questions
  let singleCorrectShort = 0; // exactly 1 correct, all answers short label (<60 chars), no images
  let singleCorrectLong = 0;  // 1 correct, but long sentence answers (scenarios)
  let multiCorrect = 0;       // >1 correct (checkbox)
  let hasImages = 0;
  const byCat: Record<string, number> = {};

  for (const b of broken) {
    byCat[b.catSlug] = (byCat[b.catSlug] ?? 0) + 1;
    const correct = b.ans.filter((a) => a.is_correct).length;
    const anyImg = b.ans.some((a) => a.image_url);
    const maxLen = Math.max(...b.ans.map((a) => (a.answer_en ?? "").length));
    if (anyImg) hasImages++;
    if (correct > 1) multiCorrect++;
    else if (maxLen <= 60) singleCorrectShort++;
    else singleCorrectLong++;
  }

  console.log(`Broken questions total: ${broken.length}`);
  console.log(`  single-correct SHORT label (<=60 chars): ${singleCorrectShort}  <-- sibling-substitution works cleanly`);
  console.log(`  single-correct LONG sentence (scenarios): ${singleCorrectLong}`);
  console.log(`  multi-correct (checkbox): ${multiCorrect}`);
  console.log(`  questions with answer images: ${hasImages}`);
  console.log(`\nBy category:`);
  for (const [k, v] of Object.entries(byCat).sort((a, b) => b[1] - a[1])) console.log(`  ${k}: ${v}`);

  // How many distinct real sign-names exist per category (pool for distractors)
  console.log(`\nDistinct correct short labels available per category (distractor pool):`);
  const pool = await sql`
    SELECT c.slug, COUNT(DISTINCT a.answer_km) AS n
    FROM answers a JOIN questions q ON a.question_id=q.id
    JOIN topics t ON q.topic_id=t.id JOIN categories c ON t.category_id=c.id
    WHERE a.is_correct = true AND length(a.answer_en) <= 60
    GROUP BY c.slug ORDER BY n DESC`;
  console.log(pool);

  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
