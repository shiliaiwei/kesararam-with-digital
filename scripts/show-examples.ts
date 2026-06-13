import { config } from "dotenv"; config({ path: ".env.local" });
import { sql } from "../src/lib/db";
import { readFileSync, readdirSync } from "fs";
async function main(){
  const bf = readdirSync(".backups").find(f=>f.startsWith("answers-backup")&&f.endsWith(".json"))!;
  const before = JSON.parse(readFileSync(".backups/"+bf,"utf8"));
  const byId = new Map<number,any>(); for(const r of before) byId.set(r.id, r);
  const labels: Record<number,string> = {593:"road-sign: 'this sign indicates ___'",2931:"road-traffic: numeric",2916:"road-traffic: yes/no",694:"road-sign: duplicate row"};
  for(const qid of [593,2931,2916,694]){
    const after = await sql`SELECT id,answer_en,answer_km,is_correct,sort_order FROM answers WHERE question_id=${qid} ORDER BY sort_order`;
    const q = await sql`SELECT question_en FROM questions WHERE id=${qid}`;
    console.log(`\n================ Q${qid}  (${labels[qid]})`);
    console.log(`Q: ${q[0].question_en}`);
    console.log(`-- BEFORE --`);
    for(const a of after){ const b=byId.get(a.id); console.log(`  ${a.is_correct?"✔":"✗"} ${(b?.answer_en??"?")}  ::  ${(b?.answer_km??"?")}`);}
    console.log(`-- AFTER --`);
    for(const a of after){ console.log(`  ${a.is_correct?"✔":"✗"} ${a.answer_en}  ::  ${a.answer_km}`);}
  }
  process.exit(0);
}
main().catch(e=>{console.error(e);process.exit(1);});
