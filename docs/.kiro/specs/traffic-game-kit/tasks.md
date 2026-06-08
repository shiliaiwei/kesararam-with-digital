# Implementation Plan: Traffic GameKit (`traffic-game-kit`)

## Overview

This plan implements the GameKit abstraction plus the first two games (Daily Challenge, Who Goes First?) in TypeScript on the existing Next.js App Router + Drizzle/Neon stack. Work proceeds bottom-up: database schema and migration first, then the GameKit core types/contract, then the server service that reuses `calculateScore` and atomic `lifetimePoints` increments, then thin API route wrappers, then the client shell and two formats, then play-hub wiring and seed data, and finally tests. All scoring stays server-authoritative; UI is bilingual (EN/KH) and brand-compliant (Brutalist, Lucide-only, no emoji, Cloudinary-optimized images, SVG/DOM rendering only).

Property-based tests use `fast-check` and unit/integration tests use `vitest` (both already in `package.json`). Each test sub-task is mapped to the relevant correctness property and requirement clause.

## Tasks

- [x] 1. Add Drizzle schema for new tables and generate migration
  - [x] 1.1 Add `dailyAttempts` and `priorityScenes` tables to `src/db/schema/content.ts`
    - Append `dailyAttempts` pgTable with `userId`, `challengeDate` (text), `setId`, `score`, `correctCount`, `totalQuestions`, `streakAfter`, `breakdown` (JSON text), `createdAt`, plus the `unique("daily_attempts_user_date_unique")` constraint on `(userId, challengeDate)`
    - Append `priorityScenes` pgTable with `topicId`, `titleEn`/`titleKm`, `layout` (JSON text), `correctOrder` (JSON text, server-only), `explanationEn`/`explanationKm`, `difficulty`, `status`, `createdBy`, `createdAt`, `updatedAt`
    - Export `DailyAttempt`/`NewDailyAttempt` and `PriorityScene`/`NewPriorityScene` inferred types
    - Confirm both tables are re-exported via `src/db/schema/index.ts`
    - _Requirements: 4.1, 6.2, 8.1_
  - [ ] 1.2 Generate and wire the Drizzle migration for the two new tables
    - Run `drizzle-kit generate` to produce the SQL migration adding `daily_attempts` and `priority_scenes` (including the unique index)
    - Verify the migration is picked up by `scripts/migrate.ts` (`npm run db:migrate`)
    - _Requirements: 4.1_

- [ ] 2. Define GameKit core types and contract
  - [ ] 2.1 Create `src/lib/gamekit/types.ts`
    - Define `Lang`, `I18nText`, `GameFormatMeta`, `GameFormatConfig`, `RoundResult`, `RoundViewProps<TRound>`, `GameFormat<TRound, TResult>`, `KitCompletionResult`, and `KitPhase<TRound, TResult>`
    - Keep `RoundView`/`ResultView` typed as presentation-only components (no DB/scoring imports)
    - _Requirements: 1.1, 1.3, 1.4_
  - [ ] 2.2 Create Daily and Priority format type modules
    - Add `src/lib/gamekit/formats/daily/types.ts` with `DailyRound`, `DailyCompletionResult`
    - Add `src/lib/gamekit/formats/priority/types.ts` with `LaneDir`, `JunctionKind`, `VehiclePlacement`, `JunctionLayout`, `PriorityRound` (no `correctOrder`), `PriorityRoundPayload`, `PriorityCompletionResult`
    - _Requirements: 1.1, 6.2, 8.1_

- [ ] 3. Implement GameKit server service (`src/lib/gamekit/server.ts`)
  - [ ] 3.1 Implement pure `computeStreak(prev, today)` helper
    - Yesterday → `current = prev.currentStreak + 1`; gap or no prior → `current = 1`; same-day → unchanged; `longest = max(prev.longest, current)`
    - No I/O; date math anchored to `Asia/Phnom_Penh`
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  - [ ]* 3.2 Write property test for `computeStreak`
    - **Property 3: Streak monotonic correctness**
    - **Validates: Requirements 5.1, 5.2, 5.4**
  - [ ] 3.3 Implement order-comparison helpers (`sameMultiset`, `arrayEquals`) and `challengeDate` computation
    - `sameMultiset` checks permutation membership; `arrayEquals` checks element-for-element order
    - `todayInPhnomPenh()` computes `YYYY-MM-DD` server-side, never trusting client input
    - _Requirements: 7.1, 3.5_
  - [ ]* 3.4 Write unit tests for comparison + date helpers
    - Cover unknown/duplicate ids, empty arrays, order mismatch, and timezone boundary dates
    - _Requirements: 7.1, 7.3, 3.5_
  - [ ] 3.5 Implement `getOrCreateDailySet(today)`
    - Read the unique `dailyChallengeSets` row for `today`; if absent, select 5 distinct approved question ids and insert; on unique-constraint conflict re-read the existing row (concurrency-safe single set)
    - Throw a typed "insufficient questions" error when fewer than 5 approved questions exist (surfaced as 503 by the route)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [ ] 3.6 Implement `recordDailyAttempt(userId, today, setId, answers)`
    - Fast-path anti-replay read; re-fetch authoritative question set + correct answers from DB; score each question via `calculateScore` using server-derived correctness; ignore client `isCorrectGuess`
    - Update streak via `computeStreak`, add milestone bonus once, insert one `dailyAttempts` row, and atomically increment `users.lifetimePoints` with `sql` template; catch unique violation → return `alreadyPlayed`
    - For `userId === null` (guest) compute the result but perform zero writes and return `persisted: false` with no streak update
    - _Requirements: 2.1, 2.2, 2.3, 4.2, 4.3, 4.4, 5.5, 9.1, 9.2, 9.3, 10.2, 10.4_
  - [ ]* 3.7 Write property test for server-authoritative daily scoring
    - **Property 1: Server-authoritative scoring**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 9.2**
  - [ ]* 3.8 Write property test for daily anti-replay
    - **Property 2: Daily anti-replay**
    - **Validates: Requirements 4.2, 4.3, 4.4**
  - [ ] 3.9 Implement `getPriorityScenes(count)` and `validatePriority(userId, rounds)`
    - `getPriorityScenes` selects `count` random approved scenes and strips `correctOrder` from the client-facing payload
    - `validatePriority` re-loads `correctOrder` server-side, marks a scene correct iff submitted order is a permutation of the scene's vehicle ids AND equals `correctOrder`, scores malformed rounds as 0 and continues, sums `calculateScore`, atomically increments `lifetimePoints` for users (guests `persisted: false`), and reveals `correctOrder` + explanations only in the response
    - _Requirements: 6.1, 7.1, 7.2, 7.3, 7.4, 8.1, 8.3, 9.2, 9.3, 10.2_
  - [ ]* 3.10 Write property test for priority order exactness
    - **Property 4: Priority order exactness**
    - **Validates: Requirements 7.1, 6.2**
  - [ ]* 3.11 Write property test for no secret leakage
    - **Property 5: No secret leakage** (serialized priority GET payload never contains `correctOrder`; daily scoring ignores client-supplied correctness)
    - **Validates: Requirements 8.1, 8.2, 8.3**
  - [ ]* 3.12 Write property test for guest safety
    - **Property 6: Guest safety** (guest completions yield `persisted: false` and zero DB writes / no streak update)
    - **Validates: Requirements 10.2, 10.4**

- [ ] 4. Checkpoint - server core
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement API routes as thin wrappers
  - [ ] 5.1 Implement `GET /api/game/daily` route
    - Call `getSession()` (guest allowed), compute `challengeDate` server-side, delegate to `getOrCreateDailySet` + attempt lookup, return rounds + `alreadyPlayed`; map insufficient-questions error to HTTP 503 with bilingual message
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 10.1, 11.3_
  - [ ] 5.2 Implement `POST /api/game/daily/complete` route
    - Parse answers, resolve `userId` (or null for guest), delegate to `recordDailyAttempt`, return `KitCompletionResult`/`DailyCompletionResult`; return HTTP 200 with prior attempt on duplicate
    - _Requirements: 2.1, 4.2, 4.3, 4.4, 10.2_
  - [ ] 5.3 Implement `GET /api/game/priority` route
    - Parse `count`, delegate to `getPriorityScenes`, return scenes without `correctOrder`
    - _Requirements: 6.1, 8.1_
  - [ ] 5.4 Implement `POST /api/game/priority/complete` route
    - Parse rounds, resolve `userId` (or null), delegate to `validatePriority`, return result revealing `correctOrder` + explanations
    - _Requirements: 7.1, 7.4, 8.3, 10.2_
  - [ ]* 5.5 Write integration tests for the daily routes
    - GET creates exactly one set per date under concurrent requests; full authenticated run updates `dailyAttempts`/`userStreaks`/`lifetimePoints`; second run is a no-op (anti-replay); guest run performs no writes
    - _Requirements: 3.3, 4.2, 4.3, 10.2, 10.4_
  - [ ]* 5.6 Write integration tests for the priority routes
    - GET payload never includes `correctOrder`; complete persists points for users but not guests; malformed submission scores that scene 0 and still returns results
    - _Requirements: 7.3, 8.1, 8.3, 10.2_

- [ ] 6. Implement GameKitShell client phase machine and registry
  - [ ] 6.1 Create `src/lib/gamekit/GameKitShell.tsx`
    - Own the `setup → loading → playing → results` phase machine (mirroring solo), call `format.fetchRounds`, collect `RoundResult[]`, maintain cosmetic-only score, POST to `format.completePath`, and always trust the server `totalScore`
    - Render shared chrome (score chip, streak flame, progress bar, mute toggle, `CountdownTimer`), guest-mode banner, `alreadyPlayed` panel, and a completion-failure fallback that shows cosmetic score with `persisted: false`
    - Gate non-essential transitions behind `prefers-reduced-motion`; reuse fixed-height layout slots; resolve all strings via `useLang()`
    - _Requirements: 1.3, 1.5, 1.6, 2.4, 10.3, 11.1, 11.2, 14.4, 14.5, 15.1_
  - [ ] 6.2 Create `src/lib/gamekit/registry.ts`
    - Export `GAMEKIT_FORMATS` array; provide lookup by `meta.id` for route mounting and hub-card mapping
    - _Requirements: 1.2_
  - [ ]* 6.3 Write unit tests for the shell phase machine
    - Cover round advancement, completion POST, `alreadyPlayed` short-circuit, and completion-failure fallback (`persisted: false`)
    - _Requirements: 1.5, 1.6, 15.1_

- [ ] 7. Implement Daily Challenge format
  - [ ] 7.1 Create `DailyRoundView` and the daily format definition
    - Build `src/lib/gamekit/formats/daily/DailyRoundView.tsx` reusing `AnswerGrid` + `CountdownTimer`, serving images via `cloudinaryOptimize`, and calling `onRoundComplete` once per question
    - Build `src/lib/gamekit/formats/daily/index.ts` exporting `dailyFormat` (meta EN/KH, on-palette brand color, Lucide icon, badge, `fetchRounds`, `completePath`)
    - _Requirements: 1.1, 1.4, 11.1, 11.2, 12.1, 12.2, 12.4, 13.1_
  - [ ]* 7.2 Write unit tests for DailyRoundView reporting
    - Assert one normalized `RoundResult` per answered question and presentation-only behavior (no scoring/DB calls)
    - _Requirements: 1.4, 1.5_

- [ ] 8. Implement Priority Puzzle format
  - [ ] 8.1 Create the junction renderer and tap-order interaction
    - Build `src/lib/gamekit/formats/priority/JunctionView.tsx` rendering the road with inline SVG and vehicles as absolutely-positioned brutalist DOM tiles (Lucide vehicle icons), positioned via `transform: translate()`; no canvas/WebGL
    - Record tapped order, stamp ordinal badges (1–4), use `onPointerDown`/`onClick` for touch+click parity with ≥44px tap targets, GPU-composited transforms, and `prefers-reduced-motion` instant mode
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 14.2, 14.3, 14.4_
  - [ ] 8.2 Create `PriorityRoundView`, results explanation view, and the format definition
    - Build `PriorityRoundView` wrapping `JunctionView`, submitting `submittedOrder` + `timeTakenMs` via `onRoundComplete`
    - Build a `ResultView` that reveals `correctOrder` and bilingual explanation per scene
    - Build `src/lib/gamekit/formats/priority/index.ts` exporting `priorityFormat` (meta EN/KH, brand color, Lucide icon, `fetchRounds` with `count`, `completePath`)
    - _Requirements: 1.1, 6.5, 7.4, 11.1, 11.4, 12.1, 12.2, 12.4_
  - [ ]* 8.3 Write unit tests for tap-order recording and parity
    - Assert tapped order/ordinal badges, identical pointer+click handling, and that `submittedOrder` + `timeTakenMs` are reported correctly
    - _Requirements: 6.4, 6.5, 14.3_

- [ ] 9. Wire games into the play hub and add routes
  - [ ] 9.1 Add GameKit cards to the play hub
    - Map `GAMEKIT_FORMATS` into the existing `GameCard` treatment with a `KIT` family badge, bilingual title/description, Lucide icon, and on-palette brand color; show an unavailable state when the daily set is unavailable
    - _Requirements: 12.3, 12.4, 13.2, 15.2_
  - [ ] 9.2 Add `/play/daily` and `/play/priority-puzzle` route pages
    - Each page lazy-loads its format chunk via dynamic import and mounts `<GameKitShell format={...} />`
    - _Requirements: 1.2, 10.1, 13.2_

- [ ] 10. Seed approved priority scenes
  - [ ] 10.1 Add a seed script for a few approved `priorityScenes`
    - Insert several `status: "approved"` scenes (2–4 vehicles each, unique vehicle ids, `correctOrder` as a permutation of vehicle ids) with bilingual titles/explanations covering cross, T-junction, and roundabout layouts
    - _Requirements: 6.1, 6.2, 11.4_

- [ ] 11. Cross-cutting tests
  - [ ]* 11.1 Write bilingual completeness test
    - **Property 7: Bilingual completeness** (every user-visible string resolves in both `en` and `kh` across shell, formats, and server status messages)
    - **Validates: Requirements 11.1, 11.3, 11.4**

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional test sub-tasks and can be skipped for a faster MVP, but they validate the correctness properties and key requirements.
- All scoring/persistence lives in `src/lib/gamekit/server.ts`; API routes and formats never compute or write points.
- Property-based tests use `fast-check`; unit and integration tests use `vitest` (run via `npm test` / `vitest --run`).
- Each task references specific requirement clauses; property test tasks additionally reference the correctness property they validate.
- No canvas/WebGL, no persistent `requestAnimationFrame` loop; rendering is SVG + DOM with GPU-composited transforms and `prefers-reduced-motion` support.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1"] },
    { "id": 1, "tasks": ["1.2", "2.2", "3.1", "3.3"] },
    { "id": 2, "tasks": ["3.2", "3.4", "3.5", "3.9"] },
    { "id": 3, "tasks": ["3.6", "3.10", "3.11", "3.12"] },
    { "id": 4, "tasks": ["3.7", "3.8", "5.1", "5.3"] },
    { "id": 5, "tasks": ["5.2", "5.4", "6.1", "6.2"] },
    { "id": 6, "tasks": ["5.5", "5.6", "6.3", "7.1", "8.1"] },
    { "id": 7, "tasks": ["7.2", "8.2", "9.1", "10.1"] },
    { "id": 8, "tasks": ["8.3", "9.2"] },
    { "id": 9, "tasks": ["11.1"] }
  ]
}
```


---

## Addendum Tasks: Kid Games Pack (v1.1)

These tasks are **additive** — they extend the GameKit with four kid games and the 3-tier access model. They depend on the core GameKit (tasks 1–6) being in place. No existing play-hub mode or v1 game is modified.

- [ ] 13. Access model foundation
  - [ ] 13.1 Add `gameAttempts` table to `src/db/schema/content.ts` + migration
    - Columns: `userId` (nullable), `gameId` (text), `score`, `correctCount`, `totalRounds`, `breakdown` (JSON text), `createdAt`; index on `(userId, gameId)`; export inferred types; re-export via `schema/index.ts`; run `drizzle-kit generate`
    - _Requirements: 19.1_
  - [ ] 13.2 Extend GameKit types with access tier
    - Add `AccessTier` and `AccessDecision` to `src/lib/gamekit/types.ts`; add `accessTier` to `GameFormatMeta`
    - _Requirements: 17.1, 21.1_
  - [ ] 13.3 Implement `resolveAccess(tier, session)` in `src/lib/gamekit/access.ts`
    - Implement guest/user/class-pro logic; reuse class link (`classEnrollments` ⨝ `classes`) and the subscription check used by `/api/subscriptions/check` (`teacher_pro`/`school`, not expired); return bilingual lock messages
    - _Requirements: 18.1, 18.2, 19.x, 20.1, 20.2, 20.3, 21.1, 21.2, 21.3_
  - [ ]* 13.4 Write property test for access-tier authority
    - **Property 8: Access-tier authority**
    - **Validates: Requirements 20.1, 20.2, 20.3, 21.1, 21.2, 21.3**
  - [ ]* 13.5 Write property test for guest no-record on user-tier
    - **Property 9: Guest no-record on user-tier**
    - **Validates: Requirements 18.2**

- [ ] 14. Generic kid-game server scoring + record
  - [ ] 14.1 Implement `recordGameAttempt(gameId, userId|null, rounds)` in the gamekit server service
    - Score via `calculateScore` from server-derived correctness; when `resolveAccess(...).willRecord`, insert `gameAttempts` + atomic `lifetimePoints` increment; otherwise compute result with `persisted: false` and zero writes
    - _Requirements: 18.2, 18.3, 19.1, 19.2, 19.3, 21.2_
  - [ ] 14.2 Implement dynamic API routes `GET/POST /api/game/[gameId](/complete)`
    - Each calls `resolveAccess(format.accessTier, session)`; GET returns `403` + bilingual message for locked `class-pro`; POST records only when `willRecord`
    - _Requirements: 20.3, 21.1, 21.2_

- [ ] 15. Sign Match game (`user` tier)
  - [ ] 15.1 Build `signMatchFormat` + `SignMatchView` (flip-card memory; CSS `rotateY` flip; Lucide; cloudinaryOptimize)
    - _Requirements: 17.1, 17.3, 17.4, 17.5, 18.1, 19.1_

- [ ] 16. Catch the Sign game (`user` tier)
  - [ ] 16.1 Build `catchSignFormat` + `CatchSignView` (prompt + tappable signs; bounded timeouts, no RAF loop)
    - _Requirements: 17.1, 17.3, 17.4, 17.5, 18.1, 19.1_

- [ ] 17. Traffic Light Hero game (`user` tier)
  - [ ] 17.1 Build `lightHeroFormat` + `LightHeroView` (light state → correct action tap; SVG light, GPU transforms)
    - _Requirements: 17.1, 17.3, 17.4, 17.5, 18.1, 19.1_

- [ ] 18. Road Safety Adventure game (`class-pro` tier, premium)
  - [ ] 18.1 Build `safetyAdventureFormat` + `SafetyAdventureView` (stepped journey; each step a round; bilingual scenes)
    - _Requirements: 17.1, 17.3, 17.4, 17.5, 20.1, 20.5_
  - [ ] 18.2 Build the locked-state card + "ask your teacher / Teacher Pro" panel
    - Hub card shows Lucide Lock when `resolveAccess` denies; click shows bilingual unlock message (reuse UpgradeModal/Teacher-Pro messaging)
    - _Requirements: 20.4, 20.5_

- [ ] 19. Hub + routes for the four kid games
  - [ ] 19.1 Append the four formats to `GAMEKIT_FORMATS` and add their cards to the hub (existing cards untouched)
    - _Requirements: 17.1, 17.2_
  - [ ] 19.2 Add routes `/play/sign-match`, `/play/catch-sign`, `/play/light-hero`, `/play/safety-adventure` (lazy-loaded, mount `GameKitShell`)
    - _Requirements: 17.2, 13.2 (image lazy-load)_

- [ ] 20. Addendum integration tests
  - [ ]* 20.1 Integration: user-tier guest plays but records nothing; logged-in user records
    - _Requirements: 18.2, 18.3, 19.1_
  - [ ]* 20.2 Integration: class-pro locked for guest/non-student/unlinked/non-subscribed; allowed + records for linked student under active Pro
    - _Requirements: 20.1, 20.2, 20.3_

## Addendum Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["13.1", "13.2"] },
    { "id": 1, "tasks": ["13.3"] },
    { "id": 2, "tasks": ["13.4", "13.5", "14.1"] },
    { "id": 3, "tasks": ["14.2", "15.1", "16.1", "17.1", "18.1"] },
    { "id": 4, "tasks": ["18.2", "19.1"] },
    { "id": 5, "tasks": ["19.2", "20.1", "20.2"] }
  ]
}
```


---

## Addendum Tasks: Leaderboard & Profile Stats (v1.2)

Additive; depends on the kid-games recording (task 14) so windowed sums have rows to read.

- [ ] 21. Windowed + province + game-type leaderboard API
  - [ ] 21.1 Extend `GET /api/leaderboard` with `window`, `province`, `gameType`, `limit`, `offset`
    - `window=all` keeps `lifetimePoints` ranking; `weekly`/`monthly` aggregate recorded scores (UNION of `gameAttempts`, `dailyAttempts`, `gameScores`) since `windowStart` (Asia/Phnom_Penh); apply province + gameType filters; preserve privacy masking + `isStatsPublic`
    - Add indexes on `(user_id, created_at)` for the three source tables
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5, 23.3, 25.3_
  - [ ]* 21.2 Property test: window scoping correctness
    - **Property 10: Window scoping correctness** — **Validates: Requirements 22.2, 22.3, 23.3**
  - [ ]* 21.3 Property test: privacy preservation across windows/filters
    - **Property 11: Privacy preservation** — **Validates: Requirements 22.5, 25.3**

- [ ] 22. Prize catalog
  - [ ] 22.1 Implement `GET /api/prizes` (REWARD_ITEMS: id, name EN/KH, cost, image + claimable state if logged in)
    - _Requirements: 24.1, 24.2, 24.3_
  - [ ] 22.2 Render the prize catalog section on the Leaderboard page (brand cards, cost, claim/lock state; reuse `/api/user/claim`)
    - _Requirements: 24.1, 24.2, 24.3_

- [ ] 23. Profile stats extension
  - [ ] 23.1 Extend `GET /api/user/stats` with `weeklyPoints`, `monthlyPoints`, `byGameType[]`, and unioned `recentGames`
    - _Requirements: 23.1, 23.2, 25.1, 25.2_
  - [ ] 23.2 Add a per-game-type breakdown card to the student profile UI (bilingual, brand-compliant)
    - _Requirements: 23.2, 25.2_

- [ ] 24. Leaderboard UI: window tabs + province sort + game-type filter
  - [ ] 24.1 Add Weekly/Monthly/All-time tabs, province selector, and optional game-type filter to the Leaderboard page (reuse existing bilingual province list + privacy display)
    - _Requirements: 22.1, 22.4, 23.3, 25.3_

## v1.2 Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["21.1", "22.1", "23.1"] },
    { "id": 1, "tasks": ["21.2", "21.3", "22.2", "23.2", "24.1"] }
  ]
}
```


---

## Addendum Tasks: Public Leaderboard, Prizes & Profile Stats (v1.2)

These tasks extend the leaderboard and profile. They depend on the access/recording foundation (tasks 13–14).

- [ ] 21. Points ledger foundation
  - [ ] 21.1 Add `pointsLedger` table to `src/db/schema/content.ts` + migration
    - Columns `userId`, `source`, `gameType`, `points`, `createdAt`; indexes on `(userId, createdAt)` and `(createdAt)`; export types; re-export via `schema/index.ts`; `drizzle-kit generate`
    - _Requirements: 22.4, 24.1_
  - [ ] 21.2 Insert a `pointsLedger` row on every points increment
    - In the gamekit server service (daily, kid games, and existing solo/live where feasible), write one ledger row `{ userId, source, gameType, points }` in the same path that increments `lifetimePoints`
    - _Requirements: 22.4, 24.1, 24.3_
  - [ ]* 21.3 Property test: windowed ranking integrity
    - **Property 10: Windowed ranking integrity** — **Validates: Requirements 22.3, 22.4, 24.1, 24.2**

- [ ] 22. Extend the leaderboard API
  - [ ] 22.1 Add `window` (weekly/monthly/all), `province`, and `gameType` params to `/api/leaderboard`
    - `all` keeps current `lifetimePoints` ordering; `weekly|monthly` rank by `SUM(pointsLedger.points)` over the window in `Asia/Phnom_Penh`; apply province + gameType filters; preserve existing privacy masking
    - _Requirements: 22.1, 22.2, 22.3, 22.5, 23.1, 23.2, 23.3, 24.2_
  - [ ]* 22.2 Integration tests for windows + province filter
    - Weekly/monthly sums match ledger; province filter returns only matching public students
    - **Property 11: Province filter correctness** — **Validates: Requirements 23.2, 23.3**

- [ ] 23. Leaderboard page UI
  - [ ] 23.1 Add Weekly/Monthly/All-time tabs + province selector to the leaderboard page
    - Reuse existing `CAMBODIA_PROVINCES`; brand-compliant tabs; bilingual; preserve current ranking card design
    - _Requirements: 22.1, 23.1_
  - [ ] 23.2 Add the prize catalog section to the leaderboard page
    - Render `REWARD_ITEMS` with `cloudinaryOptimize` images, bilingual names, point cost, and locked/insufficient state; claim via existing `/api/user/claim`
    - _Requirements: 25.1, 25.2, 25.3_

- [ ] 24. Profile game stats
  - [ ] 24.1 Add per-game-type breakdown + streak to the student profile
    - Query `pointsLedger` (group by `gameType`) + attempt tables (best score, plays) + `userStreaks` (current/longest); render brand-compliant, bilingual
    - _Requirements: 26.1, 26.2, 26.3_

## v1.2 Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["21.1"] },
    { "id": 1, "tasks": ["21.2"] },
    { "id": 2, "tasks": ["21.3", "22.1"] },
    { "id": 3, "tasks": ["22.2", "23.1", "23.2", "24.1"] }
  ]
}
```


- [ ] 25. Update leaderboard "what counts" messaging + empty state
  - [ ] 25.1 Update the leaderboard footer caption and empty state
    - Replace "ONLY LIVE GAME SCORES COUNT · SOLO PRACTICE IS NOT TRACKED" with bilingual copy stating GameKit games + live games count (guest/unrecorded plays do not); update the empty-state hint to point to the new games
    - _Requirements: 27.1, 27.3, 27.4_
