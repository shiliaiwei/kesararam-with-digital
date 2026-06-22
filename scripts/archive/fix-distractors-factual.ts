import { config } from "dotenv";
config({ path: ".env.local" });
import { sql } from "../src/lib/db";

const APPLY = process.env.APPLY === "1";
const PREVIEW = process.env.PREVIEW === "1";
const FACTUAL = new Set(["road-traffic", "driving", "technical", "emergency", "loading-people-goods", "general-knowledge"]);

function mulberry32(seed: number) {
  return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const cleanEn = (s: string) =>
  (s ?? "").replace(/^\s*(the correct answer is|the answer is|the correct order is|it indicates)\s*:?\s*/i, "").trim();
const cleanKm = (s: string) => {
  let r = (s ?? "").trim();
  // strip leading Khmer lead-in phrases + colons/spaces, repeatedly
  for (let i = 0; i < 3; i++) {
    r = r.replace(/^\s*(ចម្លើយត្រឹមត្រូវគឺ|លំដាប់ត្រឹមត្រូវគឺ|វាបង្ហាញពី)\s*[:：]?\s*/, "").replace(/^\s*[:：]\s*/, "").trim();
  }
  return r;
};
const keyEn = (s: string) => cleanEn(s).toLowerCase().replace(/[^a-z0-9]+/g, "");
const normKm = (s: string) => cleanKm(s).replace(/\s+/g, " ").trim();

const KD = "០១២៣៤៥៦៧៨៩";
const toKm = (numStr: string) => [...numStr].map((c) => (c >= "0" && c <= "9" ? KD[+c] : c === "." ? "," : c)).join("");
const isYesNo = (en: string) => /^(can|cannot|cant|yes|no\b|no,|can not|don.t|do not|need|shall|must|not allow|no )/i.test(en) && en.length < 40;

// Curated accurate opposites for yes/no answers (keyed by cleaned-EN, lowercased no-punct)
const OPP: Record<string, { en: string; km: string }> = {
  noovertaking: { en: "Can overtake", km: "អាចជែងបាន" },
  dontovertake: { en: "Can overtake", km: "អាចជែងបាន" },
  nodrivingupalongside: { en: "Can drive alongside", km: "អាចបើកបរទន្ទឹមគ្នាបាន" },
  can: { en: "Cannot", km: "មិនអាចបានទេ" },
  nostopping: { en: "Can stop", km: "អាចឈប់បាន" },
  donotdistruptthepedestrians: { en: "Can keep driving through", km: "អាចបន្តបើកបរកាត់ដោយមិនបាច់ឈប់" },
  dontparkorstoponthezebra: { en: "Can park or stop on the zebra", km: "អាចឈប់ ឬចតពីលើគំនូសសញ្ញាបាន" },
  shallwearhelmet: { en: "No need to wear a helmet", km: "មិនចាំបាច់ពាក់មួកសុវត្ថិភាព" },
  cannot: { en: "Can", km: "បាន" },
  noitisnt: { en: "Yes, it is counted as overtaking", km: "ចាត់ទុកជាការជែង" },
  needtowearall: { en: "Only the driver needs to wear it", km: "ត្រឹមតែអ្នកបើកបរប៉ុណ្ណោះត្រូវពាក់" },
  nousingtowingcable: { en: "Can use a towing cable", km: "អាចប្រើខ្សែសណ្ដោងបាន" },
  notrailing: { en: "Can tow", km: "អាចសណ្ដោងបាន" },
  notowing: { en: "Can tow", km: "អាចសណ្ដោងបាន" },
  noparkingorstopping: { en: "Can park or stop", km: "អាចឈប់ ឬចតបាន" },
  noinstalling: { en: "Can install it", km: "អាចបំពាក់បន្ថែមបាន" },
  cannotpark: { en: "Can park", km: "អាចចតបាន" },
  notheycannot: { en: "Yes, they can", km: "អាចឈប់បាន" },
  nousing: { en: "Can use it", km: "អាចប្រើប្រាស់បាន" },
  noturningback: { en: "Can turn back", km: "អាចបត់ត្រឡប់ក្រោយបាន" },
  nostoppingorparkingonthezebra: { en: "Can stop or park on it", km: "អាចឈប់ ឬចតពីលើបាន" },
  dontdriveonoracrossthemarkings: { en: "Can drive on or across the markings", km: "អាចបើកបរជាន់ ឬឆ្លងកាត់បាន" },
  nodrivingoveritoracrossit: { en: "Can drive over or across it", km: "អាចបើកបរជាន់ ឬឆ្លងកាត់បាន" },
  noparkingintwolines: { en: "Can park in two lines", km: "អាចចតពីរជួរបាន" },
  shallbegoodtight: { en: "It can be a little loose", km: "អាចមានសភាពធូរបន្តិចបាន" },
  notallowatall: { en: "It is allowed", km: "អនុញ្ញាត" },
  notthereisnt: { en: "Yes, there is", km: "មាន" },
  nothereisnt: { en: "Yes, there is", km: "មាន" },
  yes: { en: "No", km: "ទេ" },
  yesbyhelpingthroughfirstaids: { en: "No, you cannot help", km: "ទេ មិនអាចជួយបានទេ" },
};

async function main() {
  const rows = await sql`
    SELECT a.question_id, a.id AS answer_id, a.answer_en, a.answer_km, a.is_correct, a.sort_order,
           c.slug AS cat
    FROM answers a JOIN questions q ON a.question_id=q.id
    JOIN topics t ON q.topic_id=t.id JOIN categories c ON t.category_id=c.id
    ORDER BY a.question_id, a.sort_order`;

  const byQ = new Map<number, any[]>();
  for (const r of rows) { if (!byQ.has(r.question_id)) byQ.set(r.question_id, []); byQ.get(r.question_id)!.push(r); }

  // "other" distractor pools per category (real correct answers, non-numeric, non-yesno)
  const otherPool = new Map<string, { en: string; km: string; nk: string }[]>();
  const seen = new Map<string, Set<string>>();
  for (const r of rows) {
    if (!r.is_correct || !FACTUAL.has(r.cat)) continue;
    const en = cleanEn(r.answer_en); const km = cleanKm(r.answer_km);
    const nk = normKm(km); if (!nk) continue;
    if (/\d/.test(en) && en.length < 45) continue; // numeric
    if (isYesNo(en)) continue;
    if (!otherPool.has(r.cat)) { otherPool.set(r.cat, []); seen.set(r.cat, new Set()); }
    if (!seen.get(r.cat)!.has(nk)) { seen.get(r.cat)!.add(nk); otherPool.get(r.cat)!.push({ en, km, nk }); }
  }

  function numericVariant(en: string, km: string, avoidEn: Set<string>): { en: string; km: string } | null {
    const m = en.match(/\d+(?:\.\d+)?/);
    if (!m) return null;
    const val = parseFloat(m[0]);
    const cands = [val * 2, Math.round(val / 2), val + (val >= 10 ? 10 : 1), Math.max(0.5, val - (val >= 10 ? 10 : 1)), val * 3];
    const existingNums = new Set((en.match(/\d+(?:\.\d+)?/g) ?? []).map(Number));
    for (const c of cands) {
      if (c <= 0 || c === val || existingNums.has(c)) continue;
      const fmt = Number.isInteger(c) ? String(c) : c.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
      const newEn = en.replace(/\d+(?:\.\d+)?/, fmt);
      if (avoidEn.has(newEn.toLowerCase())) continue;
      // replace first numeric run in km — handle Khmer OR Latin digits
      const kmRun = km.match(/[0-9០-៩][0-9០-៩.,]*/);
      if (!kmRun) continue; // no number to swap in KM → try next candidate / fall back to pool
      const isKhmerDigits = /[០-៩]/.test(kmRun[0]);
      const newKm = km.replace(/[0-9០-៩][0-9០-៩.,]*/, isKhmerDigits ? toKm(fmt) : fmt);
      if (newKm === km) continue; // KM didn't actually change → avoid re-collapse
      return { en: newEn, km: newKm };
    }
    return null;
  }

  let fixed = 0, skipped = 0;
  const updates: { id: number; en: string; km: string }[] = [];
  const examples: any[] = [];

  for (const [qid, ans] of byQ) {
    if (ans.length < 2) continue;
    const cat = ans[0].cat;
    if (!FACTUAL.has(cat)) continue;
    // Broken = any duplicate KM among options (covers case-variants AND duplicate rows)
    const distinctKm = new Set(ans.map((a) => normKm(a.answer_km)).filter(Boolean)).size;
    if (distinctKm >= ans.length) continue; // all options distinct

    const corr = ans.find((a) => a.is_correct);
    if (!corr) { skipped++; continue; }
    const cEn = cleanEn(corr.answer_en); const cKm = cleanKm(corr.answer_km);
    const distractorRows = ans.filter((a) => !a.is_correct);
    const need = distractorRows.length;
    const avoidEn = new Set<string>([cEn.toLowerCase()]);
    const avoidNk = new Set<string>([normKm(cKm)]);
    const chosen: { en: string; km: string }[] = [];

    const isNum = /\d/.test(cEn) && cEn.length < 45;
    const yn = isYesNo(cEn);

    if (isNum) {
      for (let i = 0; i < need; i++) { const v = numericVariant(cEn, cKm, avoidEn); if (v) { avoidEn.add(v.en.toLowerCase()); chosen.push(v); } }
    } else if (yn && OPP[keyEn(cEn)]) {
      chosen.push(OPP[keyEn(cEn)]);
    }

    // Fill the rest (or all, for "other") from category pool
    if (chosen.length < need) {
      const pool = otherPool.get(cat) ?? [];
      const rnd = mulberry32(qid * 1103515245 + 12345);
      const ranked = [...pool]
        .filter((p) => !avoidNk.has(p.nk) && p.en.toLowerCase() !== cEn.toLowerCase())
        .map((p) => ({ p, lenDiff: Math.abs(p.km.length - cKm.length), r: rnd() }))
        .sort((a, b) => a.lenDiff - b.lenDiff || a.r - b.r);
      for (const x of ranked) {
        if (chosen.length >= need) break;
        if (avoidNk.has(x.p.nk)) continue;
        avoidNk.add(x.p.nk); chosen.push({ en: x.p.en, km: x.p.km });
      }
    }

    if (chosen.length < need) { skipped++; console.log(`SKIP q${qid} [${cat}] need ${need} got ${chosen.length} | ${cEn}`); continue; }

    // Update distractor rows with chosen
    distractorRows.forEach((row, i) => updates.push({ id: row.answer_id, en: chosen[i].en, km: chosen[i].km }));
    // Clean the correct row(s) so formatting matches (strip "The answer is"/leading ":")
    for (const a of ans.filter((x) => x.is_correct)) {
      const ne = cleanEn(a.answer_en), nk = cleanKm(a.answer_km);
      if (ne !== a.answer_en || nk !== a.answer_km) updates.push({ id: a.answer_id, en: ne, km: nk });
    }
    fixed++;
    if (PREVIEW && examples.length < 400) examples.push({ qid, cat, kind: isNum ? "num" : yn ? "yesno" : "other", cEn, cKm, chosen });
  }

  if (PREVIEW) for (const e of examples) {
    console.log(`\nQ${e.qid} [${e.cat}/${e.kind}]`);
    console.log(`  ✔ ${e.cEn}  ::  ${e.cKm}`);
    for (const c of e.chosen) console.log(`  ✗ ${c.en}  ::  ${c.km}`);
  }

  console.log(`\nFactual fixed: ${fixed} | skipped: ${skipped} | answer rows to update: ${updates.length} | APPLY=${APPLY}`);
  if (APPLY) {
    let n = 0;
    for (const u of updates) { await sql`UPDATE answers SET answer_en=${u.en}, answer_km=${u.km} WHERE id=${u.id}`; if (++n % 200 === 0) console.log(`  ...${n}/${updates.length}`); }
    console.log(`Applied ${n} updates.`);
  } else console.log("DRY RUN — set APPLY=1 to write.");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
