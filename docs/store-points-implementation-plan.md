# Store Points — Step-by-Step Implementation Plan

Engineering roadmap to build the economy defined in
[`store-points-economy.md`](./store-points-economy.md). Each phase is small,
shippable, and reversible. Do them in order; do not skip the guard or the tests.

- Spec of record: `docs/store-points-economy.md`
- Decisions: single currency, **students only**, fresh-start ledger; the legacy
  300:1 ratio sizes reward prices only
- Golden rules: server-authoritative, max **60 per play**, 30-unit scale,
  **no speed / no streak**

Legend: ☐ task · ✅ acceptance check · ↩ rollback

---

## Phase 0 — Safety & branch (no code)

- ☐ `npm run backup` (DB snapshot — the migration touches balances)
- ☐ Create a working branch off the current branch
- ☐ Re-read the spec §1.1 (student-only) and §3 (formula) before coding
- ✅ Backup file exists; branch created
- ↩ n/a

---

## Phase 1 — Data model (additive, non-breaking)

Add the new ledger without changing any behavior. The table stays empty until
Phase 3, so the app is unaffected.

Files:
- new `src/db/schema/store-points.ts` — `store_point_events` table from spec §9
  (`id, user_id, game_type, attempt_id, play_date, valid_units, correct_units,
  accuracy, performance_points, completion_bonus, quality_bonus, delta, reason,
  score_version, idempotency_key UNIQUE, created_at`)
- `src/db/schema/index.ts` — export the new table
- new `scripts/migrate-store-points.ts` — create table + indexes (mirror the
  existing `scripts/migrate-*.ts` dotenv+neon pattern); add a
  `"db:migrate-store-points"` entry in `package.json`
- ☐ Index on `(user_id, play_date, game_type)` and the unique `idempotency_key`
- ✅ `npm run db:migrate-store-points` succeeds on a copy; table exists; app build
  unchanged; nothing reads it yet
- ↩ `DROP TABLE store_point_events` (it is empty)

Balances are **derived**, not stored as a mutable column (spec §8):
- `store_balance  = SUM(delta) - holds/spends`
- `lifetime_earned = SUM(delta where delta > 0)`
- `weekly_earned   = SUM(delta where delta > 0 AND play_date in current week)`
Expose them via a small `src/lib/store-points/balance.ts` helper (pure read).

---

## Phase 2 — The scoring formula (pure function + tests)

Build the new formula next to the old one. Do not delete `calculateScore` yet.

Files:
- new `src/lib/store-points/score.ts`:
  ```ts
  // spec §3.2 — no speed, no streak
  export function calculateStorePoints(p: {
    valid: boolean; totalUnits: number; correctUnits: number;
  }): { points: number; accuracy: number; performance: number;
        completionBonus: number; qualityBonus: number } {
    if (!p.valid || p.totalUnits <= 0) return zero();
    const accuracy = p.correctUnits / p.totalUnits;
    if (accuracy < 0.40) return { ...zero(), accuracy };
    const units = Math.min(p.totalUnits, 30);
    const performance = Math.round(60 * accuracy * units / 30);
    const completionBonus = 0;
    const qualityBonus = 0;
    const points = Math.min(60, performance + completionBonus + qualityBonus);
    return { points, accuracy, performance, completionBonus, qualityBonus };
  }
  ```
- new `src/lib/store-points/units.ts` — per-game-type unit normalization from
  spec §5 (Quick Quiz=questions, Sign Match=pairs, Traffic Commander=normalized
  scenes, etc.). A scene with many objects = **one** unit unless the server
  defines more.
- new test `src/lib/store-points/score.test.ts` — assert the exact §3.3 table
  (5u/100%=10, 10u/100%=20, 30u/100%=60) and the §4 worked examples
- ✅ Tests reproduce the spec result table and worked examples exactly
- ↩ delete the new files (nothing imports them yet)

---

## Phase 3 — Award path: guard + anti-farming (server only)

One central writer that every game routes through. This is where the **student-
only** rule and the caps live.

Files:
- new `src/lib/store-points/award.ts` — `awardStorePoints(ctx)`:
  1. load the account by id server-side; **reject if `role !== 'student'`** →
     write **no** event (spec §1.1)
  2. compute units (Phase 2) and points (Phase 2)
  3. **daily best-diff** (spec §6): look up today's best for this `game_type`;
     award only `max(0, todayPoints - todayBest)` as `delta`
  4. **weekly cap 300** (spec §6): clamp `delta` so weekly earned ≤ 300; plays
     past the cap still write history but `delta = 0`
  5. write one `store_point_events` row with a unique `idempotency_key`
     (`userId:gameType:attemptId`); duplicate key = no-op
- Wire `awardStorePoints` into the existing scoring service
  `src/lib/gamekit/server.ts` and each `src/app/api/game/*/complete/route.ts`
  (daily, priority, solo, traffic-commander, sign-connect, word-bank, tick-sign,
  safe-street-smart, `[gameId]`) and the live-session answer/finish path.
- Keep the **old** `calculateScore` writes running in parallel behind a flag
  `STORE_POINTS_ENABLED` so we can compare before cutover.
- ✅ student play → one capped event (≤60); non-student → **zero** events;
  replay same day → only positive diff; >300/week → `delta=0`; duplicate submit →
  no second row
- ↩ flip `STORE_POINTS_ENABLED=false`; events table can be truncated

---

## Phase 4 — Wipe all scores + reprice store

Decision (2026-06-16): **delete everything, start fresh** — no conversion.

Files / steps:
- `npm run backup` first.
- Run the existing `scripts/reset-scores.ts` (`npm run db:reset-scores` dry-run,
  then `-- --confirm`) to wipe all legacy score data and zero
  `users.lifetime_points / highest_score / total_games_played / claimed_rewards`.
- Confirm `store_point_events` is **empty** — the new ledger starts at 0.
- `src/lib/rewards.ts` (`REWARD_ITEMS`) — reprice to spec §7.2
  (Eraser 250 … Planner 6,500); make `leaderboard/page.tsx` and
  `StudentProfileClient.tsx` import the single price source in `src/lib/rewards.ts`
  instead of their local copies.
- ✅ all legacy scores are 0/empty; `store_point_events` empty; prices updated
- ↩ restore from the Phase 0 backup (reset is irreversible without it)

---

## Phase 5 — Read surfaces (leaderboard, profile, result, store)

Switch what users see to Store Points. Students only.

Files:
- `src/app/api/leaderboard/route.ts` — rank by `lifetime_earned` from
  `store_point_events` (students only); keep window = `weekly_earned`. Remove the
  legacy `pointsLedger`/`lifetimePoints` ranking once parity confirmed.
- `src/app/(public)/leaderboard/page.tsx` — labels show Store Points, small
  numbers; tier thresholds re-tuned to the new scale (a tier ladder on a 60/play
  economy is hundreds–thousands, not 200,000 — revisit `src/lib/rank-utils.ts`)
- `src/app/(public)/u/[username]/{page.tsx,StudentProfileClient.tsx}` — show
  **Store balance / Lifetime earned / Weekly earned** (spec §8) instead of the
  raw thousands
- live result `src/components/game/Podium.tsx` and solo/daily result views —
  small result block (spec §11): `Accuracy 8/10 (80%) · +50 · balance · next reward`
- store/rewards UI — purchase against `store_balance`; create hold/spend/refund
  events (spec §9), never overwrite balance
- ✅ no screen shows thousands; leaderboard + profile read store events; buying
  decrements balance via a spend event, lifetime_earned unchanged
- ↩ keep the flag; UIs can read legacy fields if reverted

---

## Phase 6 — Cutover & cleanup

- ☐ Flip `STORE_POINTS_ENABLED=true` as the authoritative path
- ☐ Retire the old speed/streak scoring writes (`calculateScore`,
  `DIFFICULTY_BASE`, `STREAK_BONUS_*`, `streakMilestoneBonus`) — keep a transient
  **Match Score** for in-game feedback only (spec: never spendable, never mastery)
- ☐ Stop mixing legacy raw scores into any leaderboard (spec §10.9)
- ☐ Show the bilingual fresh-start notice to learners (spec §10)
- ✅ All §12 acceptance criteria pass
- ↩ flag back to false restores legacy scoring

---

## Phase 7 — Tests & pilot

- ☐ Tests per spec §12: every game type, 40% threshold, 30-unit scale, 60 cap,
  daily best-diff, weekly 300 cap, replay, refunds, **and the role guard**
- ☐ Bilingual (EN + Khmer) on all earning/price/result copy
- ☐ 4-week pilot; review the 300 weekly cap against real completion/redemption
- ✅ CI green; pilot metrics collected
- ↩ n/a

---

## Quick file map

| Concern | File(s) |
|---|---|
| New ledger table | `src/db/schema/store-points.ts`, `scripts/migrate-store-points.ts` |
| Balances (derived) | `src/lib/store-points/balance.ts` |
| Formula | `src/lib/store-points/score.ts`, `units.ts`, `score.test.ts` |
| Award + guard + caps | `src/lib/store-points/award.ts`, `src/lib/gamekit/server.ts`, `src/app/api/game/*/complete/route.ts` |
| Legacy migration | `scripts/migrate-store-points-balances.ts` |
| Prices | `src/lib/rewards.ts` |
| Read UIs | `src/app/api/leaderboard/route.ts`, `leaderboard/page.tsx`, `u/[username]/*`, `components/game/Podium.tsx`, `lib/rank-utils.ts` |

## Order summary

0 backup → 1 table → 2 formula+tests → 3 award/guard/caps (flagged) →
4 migrate+reprice → 5 read UIs → 6 cutover → 7 tests+pilot.

Ship 1–3 behind the flag with zero user impact; 4–6 is the visible switch;
7 hardens it.
