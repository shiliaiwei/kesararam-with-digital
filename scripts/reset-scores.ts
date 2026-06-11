/**
 * Reset ALL student leaderboard scores to zero.
 *
 * Wipes everything that feeds the public leaderboard so it starts clean:
 *   - users.lifetimePoints / highestScore / totalGamesPlayed  → 0 (students only)
 *   - points_ledger          (windowed weekly/monthly board)  → emptied
 *   - leaderboard_entries    (legacy quiz ranking table)       → emptied
 *
 * From now on only live teacher-hosted sessions add points (see
 * src/app/api/game/sessions/[code]/control/route.ts). Personal practice history
 * (daily_attempts, game_attempts, user_streaks) is intentionally left untouched.
 *
 * Usage:
 *   pnpm tsx scripts/reset-scores.ts            # dry run — shows what would change
 *   pnpm tsx scripts/reset-scores.ts --confirm  # actually performs the reset
 */

import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const dbUrl = (process.env.DATABASE_URL ?? "").replace(/^['"]+|['"]+$/g, "");
if (!dbUrl) throw new Error("DATABASE_URL is not set");
const sql = neon(dbUrl);
const confirmed = process.argv.includes("--confirm");

async function main() {
  console.log(confirmed ? "RESETTING all student scores…" : "DRY RUN (pass --confirm to apply)\n");

  // Counts before, so the operator sees the blast radius.
  const [{ count: studentCount }] = await sql`
    SELECT COUNT(*)::int AS count FROM users
    WHERE role = 'student' AND (lifetime_points <> 0 OR highest_score <> 0 OR total_games_played <> 0)
  `;
  const [{ count: ledgerCount }] = await sql`SELECT COUNT(*)::int AS count FROM points_ledger`;
  const [{ count: legacyCount }] = await sql`SELECT COUNT(*)::int AS count FROM leaderboard_entries`;

  console.log(`  students with non-zero scores : ${studentCount}`);
  console.log(`  points_ledger rows            : ${ledgerCount}`);
  console.log(`  leaderboard_entries rows      : ${legacyCount}`);

  if (!confirmed) {
    console.log("\nNothing changed. Re-run with --confirm to apply.");
    return;
  }

  await sql`
    UPDATE users
    SET lifetime_points = 0, highest_score = 0, total_games_played = 0, updated_at = NOW()
    WHERE role = 'student'
  `;
  await sql`DELETE FROM points_ledger`;
  await sql`DELETE FROM leaderboard_entries`;

  console.log("\nDone. All student scores reset to zero.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Reset failed:", err);
    process.exit(1);
  });
