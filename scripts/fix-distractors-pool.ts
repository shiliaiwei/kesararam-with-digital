import { config } from "dotenv";
config({ path: ".env.local" });
import { sql } from "../src/lib/db";

// Deterministic PRNG so re-runs are stable
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const normKm = (s: string | null) => (s ?? "").replace(/^[:\s]+/, "").replace(/\s+/g, " ").trim();
const normEn = (s: string | null) => (s ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "").trim();

// Strip lead-in phrases so every option reads in the same bare style as the correct answer
const cleanEn = (s: string) =>
  s.replace(/^\s*(it indicates:\s*|the correct order is:\s*|the answer is:?\s*)/i, "").trim();
const cleanKm = (s: string) =>
  s.replace(/^\s*(វាបង្ហាញពី\s*:\s*|លំដាប់ត្រឹមត្រូវគឺ\s*:\s*|:\s*)/, "").trim();

const APPLY = process.env.APPLY === "1";
// Which categories this pass handles (real same-domain distractors):
const POOL_CATS = new Set(["road-sign", "priority"]);

async function main() {
  const rows = await sql`
    SELECT a.question_id, a.id AS answer_id, a.answer_en, a.answer_km, a.is_correct, a.sort_order,
           t.topic_code, c.slug AS cat
    FROM answers a
    JOIN questions q ON a.question_id = q.id
    JOIN topics t ON q.topic_id = t.id
    JOIN categories c ON t.category_id = c.id
    ORDER BY a.question_id, a.sort_order`;

  const byQ = new Map<number, any[]>();
  for (const r of rows) { if (!byQ.has(r.question_id)) byQ.set(r.question_id, []); byQ.get(r.question_id)!.push(r); }

  const groupKey = (cat: string, topic: string) =>
    cat === "road-sign" ? (topic || "").trim().split("-").slice(0, 2).join("-") : cat;

  // Build distractor pools: groupKey -> deduped list of {en, km} from ALL correct answers in group
  const pools = new Map<string, { en: string; km: string; nk: string }[]>();
  const poolSeen = new Map<string, Set<string>>();
  // category-level fallback pool
  const catPools = new Map<string, { en: string; km: string; nk: string }[]>();
  const catSeen = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!r.is_correct) continue;
    if (!POOL_CATS.has(r.cat)) continue;
    const nk = normKm(r.answer_km);
    if (!nk) continue;
    const gk = groupKey(r.cat, r.topic_code);
    if (!pools.has(gk)) { pools.set(gk, []); poolSeen.set(gk, new Set()); }
    if (!poolSeen.get(gk)!.has(nk)) { poolSeen.get(gk)!.add(nk); pools.get(gk)!.push({ en: r.answer_en, km: r.answer_km, nk }); }
    if (!catPools.has(r.cat)) { catPools.set(r.cat, []); catSeen.set(r.cat, new Set()); }
    if (!catSeen.get(r.cat)!.has(nk)) { catSeen.get(r.cat)!.add(nk); catPools.get(r.cat)!.push({ en: r.answer_en, km: r.answer_km, nk }); }
  }

  const examples: any[] = [];
  let fixed = 0, skippedShort = 0, notBroken = 0, outOfScope = 0;
  const updates: { id: number; en: string; km: string }[] = [];

  for (const [qid, ans] of byQ) {
    if (ans.length < 2) continue;
    const cat = ans[0].cat;
    // Skip incomplete priority placeholder questions (need a separate decision)
    if (ans.some((a) => /^(correct|other) scenario$/i.test((a.answer_en ?? "").trim()))) { notBroken++; continue; }
    // Broken = any duplicate KM among options (user sees clone options)
    const distinctKm = new Set(ans.map((a) => normKm(a.answer_km)).filter(Boolean)).size;
    if (distinctKm >= ans.length) { notBroken++; continue; } // all options distinct
    if (!POOL_CATS.has(cat)) { outOfScope++; continue; }     // handled in factual pass

    const gk = groupKey(cat, ans[0].topic_code);
    // Exclude the correct answer by BOTH normalized Khmer AND normalized English
    // (identical-looking Khmer can differ by invisible chars, so KM-only is not enough)
    // Compare on CLEANED text (prefixes stripped) so a pooled "It indicates: ROAD HUMP"
    // is recognised as equal to the bare correct answer "ROAD HUMP".
    const correctNk = new Set(ans.filter((a) => a.is_correct).map((a) => normKm(cleanKm(a.answer_km))));
    const correctEn = new Set(ans.filter((a) => a.is_correct).map((a) => normEn(cleanEn(a.answer_en))));
    const distractorRows = ans.filter((a) => !a.is_correct);
    const need = distractorRows.length;

    const rnd = mulberry32(qid * 2654435761);
    const pickFrom = (pool: { en: string; km: string; nk: string }[]) =>
      [...pool].map((p) => ({ p, r: rnd() })).sort((a, b) => a.r - b.r).map((x) => x.p);

    const chosen: { en: string; km: string }[] = [];
    const usedNk = new Set<string>(correctNk);
    const usedEn = new Set<string>(correctEn);
    for (const src of [pools.get(gk) ?? [], catPools.get(cat) ?? []]) {
      for (const cand of pickFrom(src)) {
        if (chosen.length >= need) break;
        const ce = cleanEn(cand.en), ck = cleanKm(cand.km);
        const ne = normEn(ce), nk = normKm(ck);
        if (usedNk.has(nk) || usedEn.has(ne) || !ne) continue;
        usedNk.add(nk); usedEn.add(ne);
        chosen.push({ en: ce, km: ck });
      }
      if (chosen.length >= need) break;
    }

    if (chosen.length < need) { skippedShort++; console.log(`SHORT pool q${qid} [${gk}] need ${need} got ${chosen.length}`); continue; }

    distractorRows.forEach((row, i) => updates.push({ id: row.answer_id, en: chosen[i].en, km: chosen[i].km }));
    fixed++;
    if (process.env.PREVIEW === "1" && examples.length < 6) {
      const corr = ans.find((a) => a.is_correct);
      examples.push({ qid, gk, corr, chosen });
    }
  }

  if (process.env.PREVIEW === "1") {
    for (const e of examples) {
      console.log(`\nQ${e.qid} [${e.gk}]`);
      console.log(`  ✔ ${e.corr.answer_en}  ::  ${e.corr.answer_km}`);
      for (const c of e.chosen) console.log(`  ✗ ${c.en}  ::  ${c.km}`);
    }
  }

  console.log(`\nScope=${[...POOL_CATS].join(",")}`);
  console.log(`Fixed (planned): ${fixed} | short-pool skipped: ${skippedShort} | out-of-scope(other cats): ${outOfScope} | not-broken: ${notBroken}`);
  console.log(`Answer rows to update: ${updates.length} | APPLY=${APPLY}`);

  if (APPLY) {
    let n = 0;
    for (const u of updates) {
      await sql`UPDATE answers SET answer_en = ${u.en}, answer_km = ${u.km} WHERE id = ${u.id}`;
      if (++n % 200 === 0) console.log(`  ...${n}/${updates.length}`);
    }
    console.log(`Applied ${n} updates.`);
  } else {
    console.log("DRY RUN — set APPLY=1 to write.");
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
