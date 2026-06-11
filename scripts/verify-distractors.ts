import { config } from "dotenv";
config({ path: ".env.local" });
import { sql } from "../src/lib/db";

const normKm = (s: string) => (s ?? "").replace(/^[:\s]+/, "").replace(/\s+/g, " ").trim();

async function main() {
  const rows = await sql`
    SELECT a.question_id, a.answer_en, a.answer_km, a.is_correct, c.slug AS cat
    FROM answers a JOIN questions q ON a.question_id=q.id
    JOIN topics t ON q.topic_id=t.id JOIN categories c ON t.category_id=c.id
    WHERE q.status IN ('approved','draft','published')
      AND NOT EXISTS (SELECT 1 FROM answers x WHERE x.question_id=a.question_id AND (x.answer_en ILIKE 'correct scenario' OR x.answer_en ILIKE 'other scenario'))
    ORDER BY a.question_id`;
  const byQ = new Map<number, any[]>();
  for (const r of rows) { if (!byQ.has(r.question_id)) byQ.set(r.question_id, []); byQ.get(r.question_id)!.push(r); }

  let total = 0, collapsedEnKm = 0, dupKmOptions = 0, dupEnOptions = 0, noCorrect = 0;
  const offendersByCat: Record<string, number> = {};
  const examples: any[] = [];

  for (const [qid, ans] of byQ) {
    if (ans.length < 2) continue;
    total++;
    const kmList = ans.map((a) => normKm(a.answer_km)).filter(Boolean);
    const distinctEn = new Set(ans.map((a) => (a.answer_en ?? "").trim().toLowerCase())).size;
    const distinctKm = new Set(kmList).size;
    if (distinctEn > distinctKm) collapsedEnKm++;
    if (distinctKm < ans.length) { dupKmOptions++; offendersByCat[ans[0].cat] = (offendersByCat[ans[0].cat] ?? 0) + 1; if (examples.length < 8) examples.push({ qid, cat: ans[0].cat, opts: ans.map((a) => a.answer_km) }); }
    if (new Set(ans.map((a) => (a.answer_en ?? "").trim().toLowerCase())).size < ans.length) dupEnOptions++;
    if (!ans.some((a) => a.is_correct)) noCorrect++;
  }

  console.log(`Multi-option questions: ${total}`);
  console.log(`Collapsed (distinct EN > distinct KM): ${collapsedEnKm}`);
  console.log(`Questions with DUPLICATE KM options (user sees clones): ${dupKmOptions}`);
  console.log(`Questions with DUPLICATE EN options: ${dupEnOptions}`);
  console.log(`Questions with NO correct answer: ${noCorrect}`);
  if (Object.keys(offendersByCat).length) console.log(`Dup-KM offenders by category:`, offendersByCat);
  for (const e of examples) { console.log(`\nQ${e.qid} [${e.cat}]`); for (const o of e.opts) console.log(`   - ${o}`); }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
