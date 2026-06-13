import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");

const sql = neon(dbUrl);

/**
 * Adds game_sessions.scores_synced — a one-shot idempotency guard so a retried
 * or duplicate "end" action can't double-count live points into lifetimePoints
 * and the points ledger. See syncScoresToUserProfiles in
 * src/app/api/game/sessions/[code]/control/route.ts.
 *
 * Already-ended sessions are backfilled to true so their scores (already synced
 * before this column existed) are never re-applied.
 */
async function migrate() {
  try {
    console.log("Running migration: add game_sessions.scores_synced");

    await sql`
      ALTER TABLE game_sessions
      ADD COLUMN IF NOT EXISTS scores_synced BOOLEAN DEFAULT false NOT NULL
    `;

    // Backfill: any session that has already ended was synced under the old
    // (unguarded) code path, so mark it synced to avoid re-counting.
    const result = await sql`
      UPDATE game_sessions
      SET scores_synced = true
      WHERE status = 'ended' AND scores_synced = false
    `;
    console.log(`Backfilled ${result.length ?? 0} ended session(s) to scores_synced = true`);

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrate();
