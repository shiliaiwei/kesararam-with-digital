/**
 * Reset ALL scores to zero and permanently clear score data — full clean slate.
 *
 * Wipes every table that stores or feeds a score so the platform starts recording
 * from scratch. Accounts, classes, content, and learning progress are KEPT.
 *
 * Cleared:
 *   - users.lifetime_points / highest_score / total_games_played → 0 (students)
 *   - users.claimed_rewards → '[]'  (rewards were bought with now-deleted points)
 *   - points_ledger            (unified ledger: live + solo + daily)   → emptied
 *   - game_scores              (solo practice raw scores)              → emptied
 *   - game_attempts            (kid arcade games)                      → emptied
 *   - daily_attempts           (daily challenge)                       → emptied
 *   - user_streaks             (daily streak state)                    → emptied
 *   - game_participants        (live session per-player scores)        → zeroed
 *   - quiz_attempts            (legacy quiz mode)                       → emptied
 *   - session_participants     (legacy challenge mode)                 → emptied
 *   - leaderboard_entries      (legacy ranking board)                  → emptied
 *
 * Usage:
 *   npm run db:reset-scores              # DRY RUN — shows the blast radius
 *   npm run db:reset-scores -- --confirm # actually performs the reset
 *
 * ⚠️  IRREVERSIBLE. Run `npm run backup` first.
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");
const sql = neon(dbUrl);
const confirmed = process.argv.includes("--confirm");

async function count(table: string): Promise<number> {
  try {
    const rows = (await sql`SELECT COUNT(*)::int AS count FROM ${sql.unsafe(table)}`) as { count: number }[];
    return rows[0]?.count ?? 0;
  } catch {
    return -1; // table missing — reported as n/a
  }
}

async function main() {
  console.log(
    confirmed
      ? "RESETTING all scores (permanent clean slate)…\n"
      : "DRY RUN — nothing will change. Pass --confirm to apply.\n"
  );

  const [{ count: studentCount }] = (await sql`
    SELECT COUNT(*)::int AS count FROM users
    WHERE role = 'student'
      AND (lifetime_points <> 0 OR highest_score <> 0 OR total_games_played <> 0 OR claimed_rewards <> '[]')
  `) as { count: number }[];

  const tables = [
    "points_ledger",
    "game_scores",
    "game_attempts",
    "daily_attempts",
    "user_streaks",
    "game_participants",
    "quiz_attempts",
    "session_participants",
    "leaderboard_entries",
  ];

  console.log(`  students with score/reward data : ${studentCount}`);
  for (const t of tables) {
    const c = await count(t);
    console.log(`  ${t.padEnd(22)} : ${c < 0 ? "n/a (no table)" : c} rows`);
  }

  if (!confirmed) {
    console.log("\nNothing changed. Re-run with --confirm to apply (after `npm run backup`).");
    return;
  }

  // 1. Zero the denormalized totals + reset reward claims on student accounts.
  await sql`
    UPDATE users
    SET lifetime_points = 0, highest_score = 0, total_games_played = 0,
        claimed_rewards = '[]', updated_at = NOW()
    WHERE role = 'student'
  `;

  // 2. Empty every score-bearing table (guarded so a missing legacy table is skipped).
  const empties = [
    "DELETE FROM points_ledger",
    "DELETE FROM game_scores",
    "DELETE FROM game_attempts",
    "DELETE FROM daily_attempts",
    "DELETE FROM user_streaks",
    "DELETE FROM quiz_attempts",
    "DELETE FROM session_participants",
    "DELETE FROM leaderboard_entries",
  ];
  for (const stmt of empties) {
    try {
      await sql.unsafe(stmt);
    } catch (e) {
      console.warn(`  skipped: ${stmt} (${(e as Error).message})`);
    }
  }

  // 3. Zero live-session participant scores (rows are session history — kept).
  await sql`
    UPDATE game_participants
    SET total_score = 0, correct_answers = 0, current_streak = 0, rank = 0
  `;
  // scores_synced may not exist yet (migration optional) — reset if present.
  try {
    await sql`UPDATE game_participants SET scores_synced = false`;
  } catch {
    /* column not present — ignore */
  }

  console.log("\nDone. All scores reset to zero and score data cleared.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Reset failed:", err);
    process.exit(1);
  });
