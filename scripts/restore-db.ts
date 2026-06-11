/**
 * Restore a JSON backup (produced by scripts/backup-db.ts) back into the database.
 *
 *   node node_modules/tsx/dist/cli.mjs scripts/restore-db.ts backups/<timestamp>
 *   node node_modules/tsx/dist/cli.mjs scripts/restore-db.ts backups/<timestamp> --truncate
 *
 * Without --truncate it only inserts; if rows already exist you'll get
 * primary-key conflicts (safe — nothing is overwritten).
 * With --truncate it WIPES each target table first, then reloads it.  DESTRUCTIVE.
 *
 * Tables are loaded parent-first so foreign keys resolve. Sequences are reset
 * afterwards so new inserts continue past the restored IDs.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "../src/lib/db";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const dir = process.argv[2];
const TRUNCATE = process.argv.includes("--truncate");
if (!dir) {
  console.error("Usage: restore-db.ts <backupDir> [--truncate]");
  process.exit(1);
}

// Parent-first load order. Any populated table not listed here is loaded last.
const ORDER = [
  "users", "categories", "game_modes", "media_resources",
  "invite_codes", "subscriptions", "classes", "class_enrollments",
  "content_items", "topics", "questions", "answers", "flashcards",
  "challenge_sessions", "challenge_participants",
  "game_sessions", "game_participants", "game_session_answers",
  "daily_challenge_sets", "user_streaks", "user_progress",
  "traffic_signs", "traffic_sign_approvals", "road_markings",
];

const q = (id: string) => `"${id}"`;

async function loadTable(table: string) {
  const fp = join(dir, `${table}.json`);
  if (!existsSync(fp)) return 0;
  const rows: any[] = JSON.parse(readFileSync(fp, "utf-8"));
  if (rows.length === 0) return 0;

  if (TRUNCATE) {
    await (sql as any).query(`TRUNCATE TABLE ${q(table)} RESTART IDENTITY CASCADE`);
  }

  const cols = Object.keys(rows[0]);
  const colList = cols.map(q).join(", ");
  let inserted = 0;

  // batch insert in chunks to keep each request small
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const params: any[] = [];
    const valueGroups = slice.map((row) => {
      const ph = cols.map((c) => {
        params.push(row[c] === undefined ? null : row[c]);
        return `$${params.length}`;
      });
      return `(${ph.join(", ")})`;
    });
    const text = `INSERT INTO ${q(table)} (${colList}) VALUES ${valueGroups.join(", ")} ON CONFLICT DO NOTHING`;
    await (sql as any).query(text, params);
    inserted += slice.length;
  }

  // reset sequence on `id` if the table has a serial id
  if (cols.includes("id")) {
    try {
      await (sql as any).query(
        `SELECT setval(pg_get_serial_sequence($1, 'id'), (SELECT COALESCE(MAX(id), 1) FROM ${q(table)}), true)`,
        [table]
      );
    } catch { /* no serial sequence — ignore */ }
  }
  return inserted;
}

async function run() {
  console.log(`Restoring from ${dir}${TRUNCATE ? "  (TRUNCATE mode — wiping each table first)" : ""}`);
  const manifest = JSON.parse(readFileSync(join(dir, "_manifest.json"), "utf-8"));
  const populated: string[] = manifest.tables.filter((t: any) => t.rows > 0).map((t: any) => t.table);

  // ordered first, then any leftover populated tables
  const seq = [...ORDER.filter((t) => populated.includes(t)),
               ...populated.filter((t) => !ORDER.includes(t))];

  let total = 0;
  for (const t of seq) {
    const n = await loadTable(t);
    total += n;
    console.log(`  ${t.padEnd(28)} ${n}`);
  }
  console.log(`\nDone. Rows loaded: ${total}`);
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
