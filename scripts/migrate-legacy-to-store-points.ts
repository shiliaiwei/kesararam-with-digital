/**
 * One-time conversion of legacy scores → the small "premium" Store Points scale.
 *
 * Decided 2026-06-18: replace the old big-number balances with a tiny, scarce,
 * premium ladder (top player = 25 pt, −2 per rank). These are LIVE carry-forward
 * points — the live-only economy means only live score is claimable. Each
 * student gets a single `legacy_migration` event whose delta becomes their
 * lifetime-earned + store balance (balances are DERIVED, see getStoreBalances).
 *
 * Fully re-runnable: deletes any prior `legacy_migration` rows, then re-inserts
 * the fixed table below. The event play_date is backdated so it never counts
 * toward the current week's earning cap.
 *
 *   npm run db:migrate-legacy-to-store-points            # dry run (no writes)
 *   npm run db:migrate-legacy-to-store-points -- --confirm
 *
 * BACK UP FIRST: npm run backup
 */
import { config } from "dotenv"; config({ path: ".env.local" });
import { sql } from "../src/lib/db";

const CONFIRM = process.argv.includes("--confirm");
const MIGRATION_PLAY_DATE = "2026-06-01"; // before the current week → ignored by weekly cap
const SCORE_VERSION = 2;

// Ordered premium award table (username → Store Points). −20 per rank.
const PREMIUM_AWARDS: { username: string; pt: number }[] = [
  { username: "kanika", pt: 250 },
  { username: "sunrunamaragg453", pt: 230 },
  { username: "danaiyin57527", pt: 210 },
  { username: "tbeitbc287", pt: 190 },
  { username: "linmany2025289", pt: 170 },
  { username: "digitalkesararam566", pt: 150 },
  { username: "rozaneun104", pt: 130 },
  { username: "yinminhchou", pt: 110 },
];

async function main() {
  // Resolve each username → student id (only role='student' may hold Store Points).
  const seed: { id: number; username: string; pt: number }[] = [];
  for (const a of PREMIUM_AWARDS) {
    const [u] = await sql`SELECT id, role FROM users WHERE username = ${a.username} LIMIT 1`;
    if (!u) { console.warn(`  ! ${a.username}: not found — skipped`); continue; }
    if (u.role !== "student") { console.warn(`  ! ${a.username}: role=${u.role}, not a student — skipped`); continue; }
    seed.push({ id: u.id, username: a.username, pt: a.pt });
  }

  const total = seed.reduce((s, r) => s + r.pt, 0);
  console.log(`\n${CONFIRM ? "APPLYING" : "DRY RUN —"} legacy → premium Store Points (live-only)`);
  for (const r of seed) console.log(`  #${r.id} ${r.username}: ${r.pt} pt`);
  console.log(`Total: ${total} pt across ${seed.length} students\n`);

  // Idempotency check: see if the migration has already run.
  const [alreadyMigrated] = await sql`
    SELECT COUNT(*)::int n 
    FROM store_point_events 
    WHERE reason = 'legacy_migration' AND delta = 250
  `;
  const isMigrated = alreadyMigrated && alreadyMigrated.n > 0;

  if (isMigrated) {
    console.log(">> Database has already been migrated to 10x scores. Skipping users, ledger, and event scaling.");
  }

  if (!CONFIRM) {
    console.log("Dry run only — no rows written. Re-run with -- --confirm to apply.");
    process.exit(0);
  }

  if (!isMigrated) {
    console.log("Scaling all student lifetime_points and highest_score in 'users' table by 10x...");
    const userUpdate = await sql`
      UPDATE users 
      SET lifetime_points = lifetime_points * 10,
          highest_score = highest_score * 10
      WHERE role = 'student'
      RETURNING id
    `;
    console.log(`Updated ${userUpdate.length} students' scores.`);

    console.log("Scaling all points in 'points_ledger' table by 10x...");
    const ledgerUpdate = await sql`
      UPDATE points_ledger 
      SET points = points * 10
      RETURNING id
    `;
    console.log(`Updated ${ledgerUpdate.length} points_ledger rows.`);

    console.log("Scaling all deltas and performance_points in 'store_point_events' table by 10x...");
    const eventUpdate = await sql`
      UPDATE store_point_events 
      SET delta = delta * 10,
          performance_points = performance_points * 10
      RETURNING id
    `;
    console.log(`Updated ${eventUpdate.length} store_point_events rows.`);
  }

  // Replace any prior legacy_migration seed (makes the script re-runnable).
  const del = await sql`DELETE FROM store_point_events WHERE reason = 'legacy_migration' RETURNING id`;
  console.log(`Cleared ${del.length} prior legacy_migration event(s).`);

  let inserted = 0;
  for (const r of seed) {
    const key = `legacy_migration:${r.id}`;
    const res = await sql`
      INSERT INTO store_point_events
        (user_id, game_type, attempt_id, play_date, valid_units, correct_units,
         accuracy, performance_points, completion_bonus, quality_bonus, delta,
         reason, score_version, idempotency_key)
      VALUES
        (${r.id}, 'live', NULL, ${MIGRATION_PLAY_DATE}, 0, 0,
         1, ${r.pt}, 0, 0, ${r.pt},
         'legacy_migration', ${SCORE_VERSION}, ${key})
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id`;
    if (res.length > 0) inserted++;
  }

  const [verify] = await sql`
    SELECT COUNT(*)::int n, COALESCE(SUM(delta),0)::int total
    FROM store_point_events WHERE reason = 'legacy_migration'`;
  console.log(`Inserted ${inserted} legacy_migration event(s).`);
  console.log(`store_point_events legacy_migration → rows: ${verify.n}, sum(delta): ${verify.total}`);
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
