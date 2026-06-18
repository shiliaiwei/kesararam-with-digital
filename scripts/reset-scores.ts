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
 *   - store_point_events       (Store Points economy ledger)            → emptied
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
      ? "ADJUSTING all student scores to their current rank tier thresholds…\n"
      : "DRY RUN — nothing will change. Pass --confirm to apply.\n"
  );

  const students = (await sql`
    SELECT id, username, lifetime_points
    FROM users
    WHERE role = 'student'
  `) as Array<{ id: number; username: string; lifetime_points: number }>;

  console.log(`  students found: ${students.length}`);

  const deleters: Array<[string, () => Promise<unknown>]> = [
    ["points_ledger", () => sql`DELETE FROM points_ledger`],
    ["store_point_events", () => sql`DELETE FROM store_point_events`],
    ["game_scores", () => sql`DELETE FROM game_scores`],
    ["game_attempts", () => sql`DELETE FROM game_attempts`],
    ["daily_attempts", () => sql`DELETE FROM daily_attempts`],
    ["user_streaks", () => sql`DELETE FROM user_streaks`],
    ["quiz_attempts", () => sql`DELETE FROM quiz_attempts`],
    ["session_participants", () => sql`DELETE FROM session_participants`],
    ["leaderboard_entries", () => sql`DELETE FROM leaderboard_entries`],
  ];

  if (confirmed) {
    for (const [table, run] of deleters) {
      try {
        await run();
        console.log(`  cleared table: ${table}`);
      } catch (e) {
        console.warn(`  skipped: DELETE FROM ${table} (${(e as Error).message})`);
      }
    }
  } else {
    console.log("\nBlast radius / tables to clear (dry run):");
    for (const [table] of deleters) {
      const c = await count(table);
      console.log(`  ${table.padEnd(22)} : ${c < 0 ? "n/a (no table)" : c} rows`);
    }
    console.log("");
  }

  // Process score adjustment
  for (const s of students) {
    const pts = s.lifetime_points;
    let newPts = 0;
    let rankName = "Rookie";

    if (pts >= 12000) {
      newPts = 12000;
      rankName = "Mythic";
    } else if (pts >= 7000) {
      newPts = 7000;
      rankName = "Diamond";
    } else if (pts >= 3500) {
      newPts = 3500;
      rankName = "Platinum";
    } else if (pts >= 2500) {
      newPts = 2500;
      rankName = "Gold";
    } else if (pts >= 1000) {
      newPts = 1000;
      rankName = "Rising";
    } else {
      newPts = 0;
      rankName = "Rookie";
    }

    if (confirmed) {
      // 1. Set user points to rank tier floor
      await sql`
        UPDATE users
        SET lifetime_points = ${newPts}, highest_score = ${newPts}, total_games_played = 0,
            claimed_rewards = '[]', updated_at = NOW()
        WHERE id = ${s.id}
      `;

      // 2. Synchronize points_ledger so score query totals sum correctly
      if (newPts > 0) {
        await sql`
          INSERT INTO points_ledger (user_id, source, game_type, points, created_at)
          VALUES (${s.id}, 'system-adjustment', 'migration', ${newPts}, NOW())
        `;
      }
    }

    console.log(`  student ${s.username.padEnd(20)} : current pts ${pts.toString().padEnd(6)} -> adjusted to ${newPts.toString().padEnd(6)} (${rankName})`);
  }

  if (confirmed) {
    // 3. Zero live-session participant scores
    await sql`
      UPDATE game_participants
      SET total_score = 0, correct_answers = 0, current_streak = 0, rank = 0
    `;
    try {
      await sql`UPDATE game_participants SET scores_synced = false`;
    } catch {
      /* ignore if not present */
    }

    console.log("\nDone. All scores reset to tier floors and ledger synchronized.");
  } else {
    console.log("\nDry run completed. No data was modified. Pass --confirm to apply.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Reset failed:", err);
    process.exit(1);
  });
