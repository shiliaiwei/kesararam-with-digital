# Requirements Document

## Introduction

The Traffic GameKit (`traffic-game-kit`) is a reusable client + server abstraction layer for KWD that lets new road-safety mini-games plug into the existing engine (scoring, points, streaks, leaderboard, rewards) without re-implementing session lifecycle, scoring, or persistence. Each new game is a small **GameFormat** component that declares its config, renders one round, and reports a normalized result; the kit handles everything else.

This v1 ships the GameKit plus the first two games built on it:

1. **Daily Challenge** — 5 fixed questions per day, identical for everyone, with a consecutive-day streak bonus. Reuses the existing `dailyChallengeSets` and `userStreaks` tables.
2. **Who Goes First? (Priority Puzzle)** — a junction scene shows 2–4 vehicles; the player taps them in the correct right-of-way order. Trains the Priority category.

These requirements are derived from the approved design document (`design.md`). They reuse the existing engine: scoring through `calculateScore` (`src/lib/game-engine.ts`), points through `users.lifetimePoints`, the solo phase machine, `AnswerGrid`/`CountdownTimer`, and DB-sourced questions. The stack is Next.js App Router APIs with Drizzle/Neon. Two new tables (`dailyAttempts`, `priorityScenes`) are added. UI is bilingual (EN/KH via `useLang()`), brand-compliant (Brutalist, sharp corners, 2px black borders, hard offset shadows, Lucide icons only, no emoji), and renders the junction with SVG/DOM only (no canvas/WebGL).

## Glossary

- **GameKit**: The reusable client + server abstraction layer that provides session lifecycle, scoring, and persistence to mini-games.
- **GameFormat**: A plug-in contract (`GameFormat<TRound, TResult>`) that a mini-game implements to declare metadata, config, round fetching, round rendering, and the completion endpoint.
- **GameKitShell**: The client component that owns the phase state machine (`setup → loading → playing → results`), drives timing, displays a cosmetic running score, and POSTs results for authoritative scoring.
- **GameKit_Server**: The single server-side module (`src/lib/gamekit/server.ts`) that performs scoring via `calculateScore` and all persistence; API routes are thin wrappers around it.
- **Daily_Challenge**: The v1 game that presents 5 fixed daily questions identical for all users, with a consecutive-day streak bonus.
- **Priority_Puzzle**: The v1 "Who Goes First?" game where the player taps 2–4 vehicles in correct right-of-way order.
- **calculateScore**: The existing engine function that computes points (base by difficulty, speed bonus, streak bonus) with anti-cheat for sub-500ms answers.
- **lifetimePoints**: The `users.lifetimePoints` column; the rank/leaderboard currency, updated via atomic SQL increment.
- **dailyChallengeSets**: Existing table holding one question set per date, identical for all users.
- **userStreaks**: Existing table holding per-user consecutive-day streak state.
- **dailyAttempts**: New table enforcing one scored attempt per user per day (anti-replay) and storing the breakdown.
- **priorityScenes**: New table holding junction scene data, including the server-only `correctOrder`.
- **correctOrder**: The server-only correct right-of-way ordering of vehicle ids for a Priority scene; never sent to the client before scoring.
- **Guest**: A user without an authenticated session who may play but whose results are not persisted.
- **challengeDate**: The `YYYY-MM-DD` date computed server-side in `Asia/Phnom_Penh`; never trusted from the client.
- **Cloudinary_Optimizer**: The `cloudinaryOptimize` helper producing `f_auto,q_auto,w_<n>,c_limit` image URLs.
- **EN**: English language content. **KH**: Khmer language content.

## Requirements

### Requirement 1: GameKit Format Abstraction

**User Story:** As a developer, I want a single GameFormat contract and a reusable shell, so that I can add new mini-games by writing only round UI without re-implementing session lifecycle, scoring, or persistence.

#### Acceptance Criteria

1. THE GameKit SHALL expose a `GameFormat<TRound, TResult>` contract that declares static metadata, runtime config, a `fetchRounds` function, a `completePath`, and a round-rendering component.
2. WHEN a GameFormat is registered in the format registry, THE GameKit SHALL make the corresponding game available at the format's declared route.
3. WHEN the GameKitShell mounts a registered GameFormat, THE GameKitShell SHALL drive the phase state machine through the states `setup`, `loading`, `playing`, and `results`.
4. THE GameFormat round renderer SHALL remain presentation-only and SHALL NOT perform database access, scoring computation, or points writes.
5. WHEN a round renderer reports a completed round, THE GameKitShell SHALL record the normalized result and advance to the next round until all rounds are complete.
6. WHEN all rounds are complete, THE GameKitShell SHALL POST the collected results to the format's `completePath` and display the server's returned total score.

### Requirement 2: Server-Authoritative Scoring

**User Story:** As a product owner, I want all scoring computed and persisted on the server, so that players cannot inflate their points by manipulating the client.

#### Acceptance Criteria

1. WHEN a completion request is received, THE GameKit_Server SHALL compute the score by calling `calculateScore` using correctness derived server-side from the database.
2. THE GameKit_Server SHALL increment `users.lifetimePoints` by exactly the server-computed total score using an atomic SQL increment.
3. WHEN a completion request includes a client-supplied score or correctness claim, THE GameKit_Server SHALL ignore the client-supplied value when computing the persisted score.
4. THE GameKitShell client cosmetic score SHALL be used for display only and SHALL NOT affect persisted points.
5. IF a response time below 500 milliseconds is reported for an answer, THEN THE GameKit_Server SHALL award zero speed bonus and zero streak bonus for that answer, as enforced by `calculateScore`.

### Requirement 3: Daily Challenge Set Generation

**User Story:** As a player, I want a daily set of 5 questions that is identical for everyone, so that the daily challenge is fair and comparable across players.

#### Acceptance Criteria

1. WHEN the daily endpoint is requested for a date that has no set, THE GameKit_Server SHALL create exactly one `dailyChallengeSets` row for that date containing 5 distinct approved question ids.
2. WHEN the daily endpoint is requested for a date that already has a set, THE GameKit_Server SHALL return the existing set for that date.
3. WHILE multiple daily-set creation requests for the same date occur concurrently, THE GameKit_Server SHALL ensure that at most one `dailyChallengeSets` row exists for that date.
4. IF fewer than 5 distinct approved questions are available, THEN THE GameKit_Server SHALL return an HTTP 503 response with a bilingual unavailable message.
5. THE GameKit_Server SHALL compute `challengeDate` server-side in the `Asia/Phnom_Penh` timezone and SHALL ignore any client-supplied date.

### Requirement 4: Daily Challenge Anti-Replay

**User Story:** As a product owner, I want each user limited to one scored daily attempt per day, so that players cannot farm points by replaying the daily challenge.

#### Acceptance Criteria

1. THE dailyAttempts table SHALL enforce a unique constraint on the combination of `userId` and `challengeDate`.
2. WHEN a user submits a daily completion and no attempt exists for that user and date, THE GameKit_Server SHALL insert exactly one `dailyAttempts` row and increment `lifetimePoints` by the computed score exactly once.
3. WHEN a user submits a daily completion and an attempt already exists for that user and date, THE GameKit_Server SHALL leave `lifetimePoints` unchanged and return the prior breakdown with `alreadyPlayed` set to true.
4. IF a concurrent duplicate daily submission violates the unique constraint, THEN THE GameKit_Server SHALL treat the submission as already played and return HTTP 200 with the prior attempt.

### Requirement 5: Consecutive-Day Streak

**User Story:** As a returning player, I want my consecutive-day streak tracked and rewarded, so that I am motivated to play every day.

#### Acceptance Criteria

1. WHEN a user completes a daily attempt and the user's `lastPlayDate` is exactly the previous day, THE GameKit_Server SHALL set the current streak to the previous streak plus one.
2. WHEN a user completes a daily attempt and the user has no prior streak or the `lastPlayDate` is neither yesterday nor today, THE GameKit_Server SHALL set the current streak to one.
3. WHEN a user completes a daily attempt and the user's `lastPlayDate` is today, THE GameKit_Server SHALL leave the current streak unchanged.
4. THE GameKit_Server SHALL set the longest streak to the maximum of the prior longest streak and the current streak.
5. WHERE a current streak reaches a consecutive-day milestone, THE GameKit_Server SHALL add a milestone bonus to the total score once for that qualifying attempt.

### Requirement 6: Who Goes First? (Priority Puzzle) Scenes

**User Story:** As a player, I want to view a junction scene with vehicles and tap them in right-of-way order, so that I can learn and practice priority rules.

#### Acceptance Criteria

1. WHEN the priority endpoint is requested for a count of scenes, THE GameKit_Server SHALL return that many random approved `priorityScenes` records.
2. THE Priority_Puzzle round payload SHALL contain a junction layout with between 2 and 4 vehicles, each vehicle having an id that is unique within the scene.
3. THE Priority_Puzzle round renderer SHALL render the junction using inline SVG for the road and absolutely-positioned DOM tiles for vehicles, and SHALL NOT use canvas or WebGL.
4. WHEN a player taps vehicles, THE Priority_Puzzle round renderer SHALL record the tapped order and stamp each tapped vehicle with its ordinal position.
5. WHEN a Priority round is reported, THE Priority_Puzzle round renderer SHALL submit the tapped order of vehicle ids and the time taken for that scene.

### Requirement 7: Priority Order Validation and Scoring

**User Story:** As a product owner, I want priority answers validated exactly against the correct order, so that scoring reflects genuine right-of-way understanding.

#### Acceptance Criteria

1. WHEN a priority completion is received, THE GameKit_Server SHALL mark a scene correct if and only if the submitted order is a permutation of the scene's vehicle ids AND equals the scene's `correctOrder` element-for-element.
2. THE GameKit_Server SHALL compute the priority total score as the sum of `calculateScore` results across all submitted scenes.
3. IF a submitted order contains unknown or duplicate vehicle ids, THEN THE GameKit_Server SHALL score that scene as incorrect with zero points and SHALL continue scoring remaining scenes.
4. WHEN priority scoring completes, THE GameKit_Server SHALL include each scene's `correctOrder` and bilingual explanation in the response.

### Requirement 8: Secret Protection (No Leakage)

**User Story:** As a product owner, I want answer keys hidden until after scoring, so that players cannot read the correct answers from network payloads.

#### Acceptance Criteria

1. THE GameKit_Server SHALL exclude `correctOrder` from every client-facing payload returned by the priority GET endpoint.
2. THE GameKit_Server SHALL derive daily-question correctness from the database and SHALL NOT use client-supplied correctness when computing the persisted score.
3. WHEN a Priority completion has been scored, THE GameKit_Server SHALL reveal `correctOrder` only in the completion response.

### Requirement 9: Points Economy Reuse

**User Story:** As a product owner, I want the games to feed the existing economy, so that points, ranks, leaderboard, and rewards stay unified with no parallel system.

#### Acceptance Criteria

1. THE GameKit_Server SHALL persist game points exclusively by incrementing `users.lifetimePoints` and SHALL NOT introduce a separate points currency in v1.
2. THE GameKit_Server SHALL compute base points, speed bonus, and streak bonus solely through `calculateScore` without modifying its rules.
3. WHEN `lifetimePoints` is incremented, THE GameKit_Server SHALL use an atomic SQL increment so that concurrent updates do not lose points.

### Requirement 10: Guest Play

**User Story:** As a visitor without an account, I want to play both games, so that I can try the experience before signing up, matching the existing solo flow.

#### Acceptance Criteria

1. WHERE no authenticated session exists, THE GameKit SHALL allow the guest to play both Daily_Challenge and Priority_Puzzle.
2. WHEN a guest completes a game, THE GameKit_Server SHALL set `persisted` to false and SHALL perform zero database writes for that completion.
3. WHILE a guest is playing, THE GameKitShell SHALL display the guest-mode banner consistent with the solo flow.
4. WHEN a guest completes a daily game, THE GameKit_Server SHALL NOT update `userStreaks`.

### Requirement 11: Bilingual Coverage (EN/KH)

**User Story:** As a Khmer or English speaker, I want every screen and message in my language, so that I can fully understand and play the games.

#### Acceptance Criteria

1. THE GameKit SHALL resolve every user-visible string in both EN and KH.
2. WHEN the active language is changed via `useLang()`, THE GameKit SHALL display all game text in the selected language.
3. THE GameKit_Server SHALL provide bilingual EN and KH text for error and status messages shown to the player.
4. THE Priority_Puzzle SHALL provide each scene title and explanation in both EN and KH.

### Requirement 12: Brand Compliance

**User Story:** As a brand owner, I want the games to follow the KWD Brutalist visual system, so that the experience is consistent with the rest of the product.

#### Acceptance Criteria

1. THE GameKit UI SHALL render with sharp corners, 2px black borders, and hard offset shadows consistent with the brand system.
2. THE GameKit UI SHALL use Lucide icons only and SHALL NOT use emoji.
3. WHEN displaying GameKit cards in the play hub, THE GameKit SHALL reuse the existing `GameCard` visual treatment with a KIT family badge.
4. THE GameFormat metadata SHALL use on-palette brand colors for each game.

### Requirement 13: Image Optimization

**User Story:** As a player on a mobile data connection, I want images delivered efficiently, so that rounds load quickly without wasting data.

#### Acceptance Criteria

1. WHERE a round includes an image, THE GameKit SHALL serve it through the Cloudinary_Optimizer with `f_auto`, `q_auto`, width, and `c_limit` parameters.
2. WHEN loading a game route, THE GameKit SHALL lazy-load each format's code chunk via dynamic import.

### Requirement 14: Mobile and PC Performance / Simulation

**User Story:** As a player on a mid-range phone or a desktop, I want smooth animation and responsive controls, so that the game feels fluid on any device.

#### Acceptance Criteria

1. THE GameKit SHALL target a 60 frames-per-second render budget (16 milliseconds or less per frame) on a mid-range Android device and on desktop browsers.
2. THE GameKit SHALL animate vehicle movement and selection using GPU-composited CSS transforms and SHALL NOT run a persistent `requestAnimationFrame` loop.
3. WHEN the user interacts via touch or mouse, THE GameKit SHALL handle taps and clicks identically and SHALL provide tap targets of at least 44 pixels.
4. WHERE the user has set `prefers-reduced-motion`, THE GameKit SHALL apply instant state changes instead of non-essential transitions.
5. WHEN advancing between rounds, THE GameKit SHALL reuse fixed-height layout slots to avoid layout shift.

### Requirement 15: Error Handling and Resilience

**User Story:** As a player, I want graceful handling when something goes wrong, so that a failure does not crash my game or cost me my progress.

#### Acceptance Criteria

1. IF the completion endpoint fails after the player has answered, THEN THE GameKitShell SHALL display the cosmetic score and SHALL set `persisted` to false.
2. WHEN a daily set is unavailable for the day, THE GameKit SHALL display an unavailable state on the hub card.
3. IF a Priority submission is malformed, THEN THE GameKit_Server SHALL score the affected scene as incorrect and SHALL render the results screen with the explanation.

### Requirement 16: Scope Boundaries (Non-Goals for v1)

**User Story:** As a product owner, I want v1 scope limited to the GameKit and the first two games, so that the kit stays focused and shippable.

#### Acceptance Criteria

1. THE traffic-game-kit v1 SHALL NOT implement achievements, badges, spendable coin currency, power-ups, or weekly tournaments.
2. THE traffic-game-kit v1 SHALL deliver the GameKit abstraction, the Daily_Challenge game, and the Priority_Puzzle game only.
3. THE traffic-game-kit v1 SHALL NOT modify the existing solo or live-challenge flows beyond adding play-hub entry points.
4. THE GameKit contract SHALL allow future games to be added as new GameFormats without changes to the engine or the two v1 games.


---

## Addendum: Kid Games Pack (v1.1)

This addendum **adds** four kid-focused games and a 3-tier access model. It does not remove or change the existing play-hub modes or the v1 GameKit games; the new games appear as **additional** cards.

### Glossary additions
- **AccessTier**: One of `guest`, `user`, `class-pro`, declared per game, controlling who may play and whether the score is recorded.
- **gameAttempts**: New table recording non-daily kid-game completions (score, correctCount, breakdown).
- **class-pro**: Access tier requiring an authenticated student enrolled in a class whose owning teacher holds an active `teacher_pro` or `school` subscription.
- **Sign_Match / Catch_Sign / Light_Hero / Safety_Adventure**: The four new kid games.

### Requirement 17: Kid Games Pack (Additive)

**User Story:** As a young learner, I want fun sign/traffic mini-games added to the play hub, so that I can learn road safety by playing without losing access to the existing modes.

#### Acceptance Criteria

1. THE GameKit SHALL add four games — Sign_Match, Catch_Sign, Light_Hero, Safety_Adventure — as new GameFormats without removing or altering any existing play-hub mode or v1 GameKit game.
2. THE GameKit SHALL register the four games so they appear as additional cards in the existing "Pick your game mode" list.
3. THE four games SHALL reuse `calculateScore` for points and SHALL persist points by incrementing `users.lifetimePoints` (no separate currency).
4. THE four games SHALL be bilingual (EN/KH), brand-compliant (Brutalist, Lucide-only, no emoji), use `cloudinaryOptimize` for images, and render with SVG/DOM only (no canvas/WebGL).
5. THE four games SHALL provide kid-friendly interaction with tap targets of at least 44 pixels and touch+click parity.

### Requirement 18: Free Guest Play Without Recording

**User Story:** As a visitor without an account, I want to play the kid games for free, so that I can try them, while my score is not recorded until I sign in.

#### Acceptance Criteria

1. WHERE a game's access tier is `guest` or `user`, THE GameKit SHALL allow a guest to play without authentication.
2. WHEN a guest completes a `user`-tier or `guest`-tier game, THE GameKit_Server SHALL set `persisted` to false and SHALL perform zero `gameAttempts` and zero `lifetimePoints` writes.
3. WHEN an authenticated user completes a `user`-tier game, THE GameKit_Server SHALL record the attempt to `gameAttempts` and increment `lifetimePoints` by the server-computed score.

### Requirement 19: Score Recording for Logged-in Users

**User Story:** As a logged-in student, I want my kid-game scores recorded, so that they count toward my points, rank, and leaderboard.

#### Acceptance Criteria

1. WHEN an authenticated user completes a kid game they are allowed to play, THE GameKit_Server SHALL insert one `gameAttempts` row with the server-computed score and per-round breakdown.
2. WHEN recording a kid-game completion, THE GameKit_Server SHALL increment `users.lifetimePoints` using an atomic SQL increment.
3. THE GameKit_Server SHALL compute the recorded score solely via `calculateScore` from server-derived correctness, ignoring any client-supplied score.

### Requirement 20: Teacher-Pro Gated Premium Game

**User Story:** As a product owner, I want the premium kid game (Road Safety Adventure) unlocked only for students in a class led by a subscribed teacher, so that Teacher Pro/School plans provide clear value.

#### Acceptance Criteria

1. WHERE a game's access tier is `class-pro`, THE GameKit_Server SHALL allow play only when the requester is an authenticated student.
2. THE GameKit_Server SHALL allow `class-pro` play only when the student has an active `classEnrollments` link to a class AND the class's owning teacher has an active `teacher_pro` or `school` subscription that is not expired.
3. IF any `class-pro` access condition fails, THEN THE GameKit_Server SHALL return HTTP 403 with a bilingual lock message and SHALL NOT start or record the game.
4. WHEN a `class-pro` game is locked for the current user, THE GameKit SHALL display the hub card in a locked state with a Lucide Lock icon and an "ask your teacher to unlock" bilingual message.
5. THE GameKit SHALL NOT allow guests or non-student accounts to play a `class-pro` game.

### Requirement 21: Server-Authoritative Access Enforcement

**User Story:** As a product owner, I want access rules enforced on the server, so that players cannot bypass gating or recording rules from the client.

#### Acceptance Criteria

1. THE GameKit_Server SHALL determine access and whether a completion records via a single `resolveAccess(tier, session)` function on both the fetch and complete endpoints.
2. WHEN `resolveAccess` returns `willRecord` false, THE GameKit_Server SHALL perform zero `gameAttempts` and zero `lifetimePoints` writes for that completion.
3. THE GameKit_Server SHALL NOT rely on client-supplied access, role, subscription, or recording flags when enforcing access.

### Mapping of new correctness properties (in design.md)
- **Property 8: Access-tier authority** → Validates Requirements 20.1, 20.2, 20.3, 21.1, 21.2, 21.3
- **Property 9: Guest no-record on user-tier** → Validates Requirements 18.2

### Scope note
These four games and the access model are **v1.1 additions** to the same `traffic-game-kit` spec. The original Requirement 16 non-goals (achievements, badges, spendable coin currency, power-ups, weekly tournaments) remain out of scope.


---

## Addendum: Leaderboard & Profile Stats (v1.2)

Extends the public Leaderboard and user profile. Additive; preserves existing behavior and privacy masking.

### Requirement 22: Time-Windowed & Province Leaderboard

**User Story:** As a student, I want to see top students by week, month, and all-time and filter by province, so that I can compare myself fairly across time and region.

#### Acceptance Criteria

1. THE Leaderboard SHALL support three ranking windows: `weekly`, `monthly`, and `all`.
2. WHEN `window=all`, THE Leaderboard SHALL rank by `users.lifetimePoints` (existing behavior).
3. WHEN `window=weekly` or `monthly`, THE Leaderboard SHALL rank by the sum of a student's recorded attempt scores whose `createdAt` is within the window, computed server-side in `Asia/Phnom_Penh`.
4. WHERE a `province` filter is provided, THE Leaderboard SHALL rank only students in that province.
5. THE Leaderboard SHALL include only active students with public stats.

### Requirement 23: Game-Type Scores

**User Story:** As a student, I want my scores recorded and shown per game type, so that I can see how I do in each game.

#### Acceptance Criteria

1. THE GameKit_Server SHALL record each completed (recordable) play with its game type (`gameId`/`gameMode`), score, and timestamp.
2. THE profile stats endpoint SHALL return a per-game-type breakdown (plays, total score, best score) for the user.
3. WHERE a `gameType` filter is provided to the Leaderboard, THE Leaderboard SHALL rank by that game type's recorded scores within the selected window.

### Requirement 24: Prize Catalog Redemption

**User Story:** As a student, I want to see prizes I can redeem with my points, so that earning points feels rewarding.

#### Acceptance Criteria

1. THE Leaderboard page SHALL display a public prize catalog with each prize's bilingual name, point cost, and image.
2. WHEN a logged-in student views the catalog, THE GameKit SHALL indicate which prizes are claimable based on the student's `lifetimePoints`.
3. THE prize redemption SHALL reuse the existing claim flow (`/api/user/claim`, `REWARD_ITEMS`) without introducing a separate currency.

### Requirement 25: Profile Stat Recording

**User Story:** As a student, I want my game results saved to my profile, so that my totals, streak, recent games, and per-game stats stay up to date.

#### Acceptance Criteria

1. WHEN a recordable completion occurs, THE GameKit_Server SHALL update the user's totals and SHALL make the play available to the profile's recent-games and per-game-type views.
2. THE profile stats endpoint SHALL return `weeklyPoints`, `monthlyPoints`, all-time `lifetimePoints`, current/longest streak, and a per-game-type breakdown.
3. THE Leaderboard and profile SHALL preserve all existing privacy masking and `isStatsPublic` exclusion across every window and filter.

### Mapping of new correctness properties (in design.md)
- **Property 10: Window scoping correctness** → Validates Requirements 22.2, 22.3, 23.3
- **Property 11: Privacy preservation** → Validates Requirements 22.5, 24.x, 25.3


---

## Addendum: Public Leaderboard, Prizes & Profile Stats (v1.2)

### Glossary additions
- **pointsLedger**: New append-only table holding one row per points-earning play (`userId`, `source`, `gameType`, `points`, `createdAt`) used for time-windowed ranking.
- **Window**: A ranking timeframe — `weekly`, `monthly`, or `all` (all-time).

### Requirement 22: Time-Windowed Public Leaderboard

**User Story:** As a student, I want to see the best students weekly, monthly, and all-time, so that I can track recent and overall standings.

#### Acceptance Criteria

1. THE Leaderboard API SHALL accept a `window` parameter of `weekly`, `monthly`, or `all`, defaulting to `all`.
2. WHEN `window` is `all`, THE Leaderboard API SHALL rank public students by `users.lifetimePoints` descending (existing behavior preserved).
3. WHEN `window` is `weekly` or `monthly`, THE Leaderboard API SHALL rank public students by the sum of `pointsLedger.points` whose `createdAt` falls within the window computed in `Asia/Phnom_Penh`.
4. THE GameKit_Server SHALL insert one `pointsLedger` row with `points` equal to the persisted score whenever it increments `users.lifetimePoints`.
5. THE Leaderboard API SHALL preserve existing privacy masking (`isStatsPublic`, `isNamePublic`, `isProvincePublic`, etc.).

### Requirement 23: Province Filtering

**User Story:** As a student, I want to filter the leaderboard by province, so that I can compare with peers in my area.

#### Acceptance Criteria

1. THE Leaderboard API SHALL accept a `province` parameter that filters results to students in that province, defaulting to `all`.
2. WHEN `province` is a specific province, THE Leaderboard API SHALL return only public students whose province matches.
3. WHEN `province` is `all`, THE Leaderboard API SHALL return students from all provinces.

### Requirement 24: Per-Game-Type Score Recording

**User Story:** As a product owner, I want each play's score tagged with its game type, so that leaderboards and profiles can break down points by game.

#### Acceptance Criteria

1. WHEN a play is recorded, THE GameKit_Server SHALL store the game type (`gameType`) and `source` on the `pointsLedger` row.
2. THE Leaderboard API SHALL accept an optional `gameType` parameter that restricts windowed ranking to that game type.
3. THE recorded game score SHALL be the server-computed score from `calculateScore`, not a client-supplied value.

### Requirement 25: Prize Catalog on Leaderboard

**User Story:** As a student, I want to see prizes I can redeem with points on the leaderboard page, so that I am motivated to earn points.

#### Acceptance Criteria

1. THE Leaderboard page SHALL display a catalog of redeemable prizes with bilingual name, Cloudinary-optimized image, and point cost.
2. THE prize catalog SHALL reuse the existing rewards items and the existing `/api/user/claim` redemption endpoint.
3. WHEN a signed-in student has fewer active points than a prize cost, THE Leaderboard page SHALL show that prize in a locked/insufficient-points state.

### Requirement 26: Profile Game Stats

**User Story:** As a student, I want my game scores and stats recorded in my profile, so that I can see my progress and per-game performance.

#### Acceptance Criteria

1. WHEN a play is recorded for an authenticated user, THE GameKit_Server SHALL ensure the user's profile stats (lifetime points, games played, best score) reflect the play.
2. THE profile SHALL display a per-game-type breakdown derived from `pointsLedger` and the attempt tables (points and best score per game).
3. THE profile SHALL display the user's current and longest streak from `userStreaks`.

### Mapping of new correctness properties (in design.md)
- **Property 10: Windowed ranking integrity** → Validates Requirements 22.3, 22.4, 24.1, 24.2
- **Property 11: Province filter correctness** → Validates Requirements 23.2, 23.3


### Requirement 27: What Counts Toward the Leaderboard

**User Story:** As a student, I want my GameKit game scores to count toward the public leaderboard, so that practicing the new games (not only live games) improves my ranking.

#### Acceptance Criteria

1. THE Leaderboard SHALL count points earned from GameKit games (Daily_Challenge, Priority_Puzzle, Sign_Match, Catch_Sign, Light_Hero, Safety_Adventure) toward a student's ranking, in addition to existing live-game scores.
2. WHEN an authenticated student earns recordable points from any GameKit game, THE GameKit_Server SHALL include those points in the `pointsLedger` so they appear in weekly, monthly, and all-time windows.
3. THE Leaderboard page caption SHALL be updated to accurately describe what counts (GameKit games and live games count; guest play and unrecorded plays do not), replacing the prior "only live game scores count / solo practice is not tracked" message.
4. WHERE a play is not recorded (guest, or a `class-pro` game the user cannot access), THE Leaderboard SHALL NOT count those points.
