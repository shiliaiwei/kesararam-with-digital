import { config } from "dotenv";
config({ path: ".env.local" });
import { sql } from "../src/lib/db";
import { writeFileSync } from "fs";

async function main() {
  const rows = await sql`
    SELECT a.question_id, a.id AS answer_id, a.answer_en, a.answer_km, a.is_correct,
           a.sort_order, a.answer_type, a.image_url AS ans_image,
           q.question_en, q.question_km, q.image_url AS q_image,
           t.topic_code, c.slug AS cat_slug
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

  const broken: any[] = [];
  for (const [qid, ans] of byQ) {
    if (ans.length < 2) continue;
    const distinctEn = new Set(ans.map((a) => a.answer_en)).size;
    const distinctKm = new Set(ans.map((a) => (a.answer_km ?? "").trim()).filter(Boolean)).size;
    if (distinctEn > distinctKm) {
      const correct = ans.filter((a) => a.is_correct);
      broken.push({
        qid,
        topic: ans[0].topic_code,
        cat: ans[0].cat_slug,
        q_en: ans[0].question_en,
        q_km: ans[0].question_km,
        q_image: ans[0].q_image,
        answer_type: ans[0].answer_type,
        n_options: ans.length,
        n_correct: correct.length,
        correct_en: correct.map((a) => a.answer_en),
        correct_km: correct.map((a) => a.answer_km),
        // the fake distractor answer rows we'll overwrite (non-correct)
        distractor_ids: ans.filter((a) => !a.is_correct).map((a) => a.id),
      });
    }
  }

  writeFileSync("/tmp/broken-questions.json", JSON.stringify(broken, null, 2));
  console.log(`Exported ${broken.length} broken questions to /tmp/broken-questions.json`);

  // Topic-code prefix distribution (to understand sign families)
  const prefixCount: Record<string, number> = {};
  for (const b of broken) {
    const pfx = (b.topic ?? "").split("-").slice(0, 2).join("-");
    prefixCount[pfx] = (prefixCount[pfx] ?? 0) + 1;
  }
  console.log("\nTopic-prefix distribution:");
  for (const [k, v] of Object.entries(prefixCount).sort((a, b) => b[1] - a[1]).slice(0, 30)) console.log(`  ${k}: ${v}`);

  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
