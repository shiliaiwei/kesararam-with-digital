import { config } from "dotenv";
config({ path: ".env.local" });
import { readFileSync } from "fs";
import { neon } from "@neondatabase/serverless";

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
const sql = neon(dbUrl);

async function main() {
  const students: { username: string }[] = JSON.parse(readFileSync("scripts/parsed_students.json", "utf8"));
  const usernames = students.map((s) => s.username);

  const ids = (
    await sql`SELECT id FROM users WHERE username = ANY(${usernames})`
  ).map((r: any) => Number(r.id));
  console.log(`Target student ids: ${ids.length}`);

  // All FKs that reference the users table, with their ON DELETE rule.
  const fks = await sql`
    SELECT tc.table_name AS child_table, kcu.column_name AS child_col, rc.delete_rule
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name = 'users'
    ORDER BY rc.delete_rule, tc.table_name`;

  console.log("\nFK constraints referencing users:");
  for (const f of fks as any[]) {
    let cnt = "-";
    if (ids.length) {
      try {
        const q = `SELECT COUNT(*)::int AS n FROM "${f.child_table}" WHERE "${f.child_col}" = ANY($1)`;
        const r = await sql.query(q, [ids]);
        cnt = String(r[0].n);
      } catch (e: any) {
        cnt = `err(${e.message.slice(0, 30)})`;
      }
    }
    console.log(`  ${f.delete_rule.padEnd(10)} ${f.child_table}.${f.child_col}  rowsForStudents=${cnt}`);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
