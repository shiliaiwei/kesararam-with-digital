/**
 * Convert a JSON backup folder (from scripts/backup-db.ts) into a single .sql
 * file of INSERT statements — a portable, human-readable SQL data backup.
 *
 *   node node_modules/tsx/dist/cli.mjs scripts/backup-to-sql.ts backups/<timestamp>
 *
 * Output: <backupDir>/full_backup.sql
 * Re-import later with any Postgres client:  psql "$DATABASE_URL" -f full_backup.sql
 * (or paste into the Neon SQL Editor). Each table is TRUNCATEd then reloaded,
 * wrapped in a single transaction, with sequences reset at the end.
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// parent-first so foreign keys resolve on import
const ORDER = [
  "users", "categories", "game_modes", "media_resources",
  "invite_codes", "subscriptions", "classes", "class_enrollments",
  "content_items", "topics", "questions", "answers", "flashcards",
  "challenge_sessions", "challenge_participants",
  "game_sessions", "game_participants", "game_session_answers",
  "daily_challenge_sets", "user_streaks", "user_progress",
  "traffic_signs", "traffic_sign_approvals", "road_markings",
];

const qid = (id: string) => `"${id}"`;

function lit(v: any): string {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    // Postgres array literal, e.g. ARRAY['a','b'] or ARRAY[1,2]
    if (v.length === 0) return "'{}'";
    return "ARRAY[" + v.map(lit).join(", ") + "]";
  }
  if (typeof v === "object") {
    // JSON value stored in a text/json column
    return "'" + JSON.stringify(v).replace(/'/g, "''") + "'";
  }
  // string (also covers timestamps, which the Neon HTTP driver returns as strings)
  return "'" + String(v).replace(/'/g, "''") + "'";
}

export function writeSql(dir: string): string {
const manifest = JSON.parse(readFileSync(join(dir, "_manifest.json"), "utf-8"));
const populated: string[] = manifest.tables.filter((t: any) => t.rows > 0).map((t: any) => t.table);
const seq = [...ORDER.filter((t) => populated.includes(t)),
             ...populated.filter((t) => !ORDER.includes(t))];

const out: string[] = [];
out.push("-- KWD database SQL backup");
out.push(`-- source: ${dir}`);
out.push(`-- created (UTC): ${manifest.createdAtUTC}`);
out.push(`-- tables: ${manifest.tableCount}  rows: ${manifest.totalRows}`);
out.push("BEGIN;");
out.push("SET session_replication_role = replica;  -- defer FK checks during load (ignored if not permitted)");
out.push("");

let rowsWritten = 0;
for (const table of seq) {
  const fp = join(dir, `${table}.json`);
  if (!existsSync(fp)) continue;
  const rows: any[] = JSON.parse(readFileSync(fp, "utf-8"));
  if (rows.length === 0) continue;

  out.push(`-- ${table} (${rows.length} rows)`);
  out.push(`TRUNCATE TABLE ${qid(table)} RESTART IDENTITY CASCADE;`);
  const cols = Object.keys(rows[0]);
  const colList = cols.map(qid).join(", ");

  const CHUNK = 500;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const values = slice
      .map((row) => "  (" + cols.map((c) => lit(row[c])).join(", ") + ")")
      .join(",\n");
    out.push(`INSERT INTO ${qid(table)} (${colList}) VALUES\n${values};`);
  }
  out.push("");
  rowsWritten += rows.length;
}

// reset sequences so future inserts continue past restored IDs
out.push("-- reset id sequences");
for (const table of seq) {
  const fp = join(dir, `${table}.json`);
  if (!existsSync(fp)) continue;
  const rows: any[] = JSON.parse(readFileSync(fp, "utf-8"));
  if (rows.length === 0 || !Object.keys(rows[0]).includes("id")) continue;
  out.push(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), (SELECT COALESCE(MAX(id),1) FROM ${qid(table)}), true);`);
}

out.push("");
out.push("SET session_replication_role = DEFAULT;");
out.push("COMMIT;");

const outPath = join(dir, "full_backup.sql");
writeFileSync(outPath, out.join("\n"), "utf-8");
console.log(`  SQL: ${outPath}  (tables: ${seq.length}, rows: ${rowsWritten})`);
return outPath;
}

// Run as a CLI:  node ... scripts/backup-to-sql.ts <backupDir>
const cliDir = process.argv[2];
if (cliDir) writeSql(cliDir);
