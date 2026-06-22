import { config } from "dotenv";
config({ path: ".env.local" });
import { sql } from "../src/lib/db";
import { writeFileSync } from "fs";

async function main() {
  const rows = await sql`SELECT * FROM answers ORDER BY id`;
  const stamp = process.env.STAMP ?? "manual";
  const jsonPath = `/tmp/answers-backup-${stamp}.json`;
  writeFileSync(jsonPath, JSON.stringify(rows, null, 0));

  // Also emit restorable SQL (UPDATE statements for answer_en/answer_km by id)
  const esc = (s: string | null) => (s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
  const lines = rows.map(
    (r: any) =>
      `UPDATE answers SET answer_en=${esc(r.answer_en)}, answer_km=${esc(r.answer_km)} WHERE id=${r.id};`
  );
  writeFileSync(`/tmp/answers-backup-${stamp}.sql`, lines.join("\n") + "\n");

  console.log(`Backed up ${rows.length} answer rows -> ${jsonPath} (+ .sql restore file)`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
