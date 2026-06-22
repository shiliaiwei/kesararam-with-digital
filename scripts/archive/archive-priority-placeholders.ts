import { config } from "dotenv";
config({ path: ".env.local" });
import { sql } from "../src/lib/db";
import { writeFileSync } from "fs";

const APPLY = process.env.APPLY === "1";

async function main() {
  // Incomplete priority questions whose answers are the "Correct/Other scenario" placeholders
  const ph = await sql`
    SELECT DISTINCT q.id, q.status
    FROM questions q
    WHERE q.id IN (
      SELECT a.question_id FROM answers a
      WHERE a.answer_en ILIKE 'other scenario' OR a.answer_en ILIKE 'correct scenario'
    )
    ORDER BY q.id`;
  console.log(`Placeholder priority questions: ${ph.length}`);
  writeFileSync(".backups/priority-placeholder-status-backup.json", JSON.stringify(ph, null, 0));
  console.log("Status backup written to .backups/priority-placeholder-status-backup.json");

  const ids = ph.map((r: any) => r.id);
  if (APPLY) {
    await sql`UPDATE questions SET status = 'archived' WHERE id = ANY(${ids})`;
    const after = await sql`SELECT status, COUNT(*)::int n FROM questions WHERE id = ANY(${ids}) GROUP BY status`;
    console.log("After archive:", after);
  } else {
    console.log("DRY RUN — set APPLY=1 to write. ids sample:", ids.slice(0, 5));
  }
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
