/**
 * Full database backup — dumps every base table in the public schema to JSON.
 * Output: backups/<timestamp>/<table>.json  + _manifest.json
 *
 * Run: node node_modules/tsx/dist/cli.mjs scripts/backup-db.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "../src/lib/db";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { writeSql } from "./backup-to-sql";

function stamp() {
  // Build a filesystem-safe UTC timestamp without Date.now/new Date races
  const d = new Date();
  const p = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`;
}

async function run() {
  const ts = stamp();
  const outDir = join(process.cwd(), "backups", ts);
  mkdirSync(outDir, { recursive: true });

  const tablesRes = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name`;
  const tables: string[] = tablesRes.map((r: any) => r.table_name);

  const manifest: any = { createdAtUTC: ts, database: "neon-postgres", tables: [] as any[] };
  let grandTotal = 0;

  for (const t of tables) {
    // identifier comes from information_schema (trusted); .query() executes raw SQL and returns rows
    const rows = await (sql as any).query(`SELECT * FROM "${t}"`);
    const arr = Array.isArray(rows) ? rows : (rows.rows ?? []);
    writeFileSync(join(outDir, `${t}.json`), JSON.stringify(arr, null, 2), "utf-8");
    manifest.tables.push({ table: t, rows: arr.length });
    grandTotal += arr.length;
    console.log(`  ${t.padEnd(34)} ${arr.length}`);
  }

  manifest.totalRows = grandTotal;
  manifest.tableCount = tables.length;
  writeFileSync(join(outDir, "_manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");

  // also emit a single .sql file (INSERT statements) alongside the JSON
  writeSql(outDir);

  console.log("\nBackup complete:");
  console.log("  dir:        ", outDir);
  console.log("  tables:     ", tables.length);
  console.log("  total rows: ", grandTotal);
  console.log("  formats:    JSON (per table) + full_backup.sql");
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
