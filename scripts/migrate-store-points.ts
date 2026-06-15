/**
 * Create the store_point_events table — the immutable Store Points ledger.
 *
 * Spec: docs/store-points-economy.md (§9). Additive and non-breaking — the table
 * is empty until the award path (Phase 3) starts writing to it.
 *
 * Idempotent: CREATE TABLE / INDEX IF NOT EXISTS, safe to re-run.
 *
 * Usage:
 *   npm run db:migrate-store-points
 */

import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { neon } from "@neondatabase/serverless";

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");
const sql = neon(dbUrl);

async function main() {
  console.log("Creating store_point_events table (if not exists)…");

  await sql`
    CREATE TABLE IF NOT EXISTS store_point_events (
      id                  SERIAL PRIMARY KEY,
      user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      game_type           TEXT NOT NULL,
      attempt_id          TEXT,
      play_date           DATE NOT NULL,
      valid_units         INTEGER NOT NULL DEFAULT 0,
      correct_units       INTEGER NOT NULL DEFAULT 0,
      accuracy            REAL NOT NULL DEFAULT 0,
      performance_points  INTEGER NOT NULL DEFAULT 0,
      completion_bonus    INTEGER NOT NULL DEFAULT 0,
      quality_bonus       INTEGER NOT NULL DEFAULT 0,
      delta               INTEGER NOT NULL DEFAULT 0,
      reason              TEXT NOT NULL DEFAULT 'play',
      score_version       INTEGER NOT NULL DEFAULT 1,
      idempotency_key     TEXT NOT NULL UNIQUE,
      created_at          TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS store_point_events_user_date_game_idx
      ON store_point_events (user_id, play_date, game_type)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS store_point_events_user_time_idx
      ON store_point_events (user_id, created_at)
  `;

  const [{ count }] = (await sql`SELECT COUNT(*)::int AS count FROM store_point_events`) as { count: number }[];
  console.log(`Done. store_point_events ready (${count} existing rows).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
