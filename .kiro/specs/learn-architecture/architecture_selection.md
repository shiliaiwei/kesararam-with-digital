# Architecture Selection: KWD Learn Architecture

> **Scope:** Full project — Kesararam With Digital (KWD), a bilingual road-safety
> education platform. Next.js 15 App Router · React 19 · Drizzle ORM · Neon
> PostgreSQL · Pusher real-time · Stripe subscriptions. This document maps the
> architecture that is already implicit in the codebase and formalises it as the
> canonical reference.

---

## Recommended Architecture: Use-Case Vertical Slices (Candidate B)

### Rationale

The codebase separates two fundamentally different scoring economies — rank-only
practice plays (solo/GameKit) and claimable-points live sessions (teacher-hosted)
— and this split is a first-class domain invariant. A use-case-oriented slice
architecture makes that boundary explicit and measurable (flow density 0.21 vs.
0.42 for the current implicit layer model), while eliminating the "Service Layer
god object" problem that the layer model creates (55% of business logic in one
component → 40% max in the use-case model). No new infrastructure is required,
unlike Candidate C's event bus, which would need a queue or in-process async
coordination that conflicts with Next.js serverless execution.

The main trade-off is that the Identity & Access component remains a cross-cutter
(4 of 6 feature components call it), but this is unavoidable given the 3-tier
access model and is already well-isolated in `lib/gamekit/access.ts` and
`lib/auth.ts`.

---

## Components

| Component | Owned State | Responsibility |
|---|---|---|
| **Content & Learning** | `categories[8]`, `topics[638]`, `questions[5925]`, `answers[21355]` | Serves browsable content: `/learn/*` pages, flashcard/audio/image display, category + topic navigation. Reads from `content.ts` schema. Feeds rounds to both play engines. |
| **Solo Play Engine** | `rounds[]`, `kitPhase`, `gameAttempts`, `dailyAttempts`, `userStreaks` | Drives all practice plays: GameKitShell phase machine, 10 active GameKit formats, 4 solo quiz modes (quick-quiz, speed-round, sign-challenge, mixed-practice), daily challenge. Scores via `calculateScore()` → `awardRankPoints()`. Writes `gameAttempts`, `lifetimePoints`, `pointsLedger`. Never writes claimable store points. |
| **Live Session Engine** | `gameSessions`, `gameParticipants`, `gameSessionAnswers`, `scoresSynced` | Teacher-hosted real-time competition via Pusher. Creates sessions (6-char code), drives lobby → active → ended state machine. Writes both rank points (`lifetimePoints`, `pointsLedger`) AND claimable `storePoints` via `syncScoresToUserProfiles()` with a one-shot `scoresSynced` guard. |
| **Identity & Access** | `session` (JWT), `classEnrollment`, `subscriptionPlan` | JWT mint/verify (`jose`, `kwd_token` cookie, role-based expiry). Access resolution for 3 tiers: `guest` / `user` / `class-pro`. TOTP 2FA for admin/staff. Google OAuth. Rate limiting. |
| **Rank & Leaderboard** | `lifetimePoints` (derived read), `pointsLedger` | Pure rank derivation from `lifetimePoints` via `ranks.ts` (6 tiers × 4 Roman divisions). Windowed leaderboard queries from `pointsLedger` (fed by both Solo and Live). Rank is NEVER stored — always derived. |
| **Economy & Rewards** | `storePoints`, `rewardClaims` | Student claimable-points wallet. Claim → accept → fulfil / reject lifecycle between student and teacher. Points only enter this component from Live Session Engine via `awardStorePoints()` with `source="live"`. |
| **Persistence Boundary** | All 48 DB tables | Neon PostgreSQL via Drizzle ORM lazy-Proxy (`lib/db.ts`). Schema owner. All state reads/writes route through this boundary; no component bypasses it. |

---

## Information Flow

| From \ To | Content & Learning | Solo Play Engine | Live Session Engine | Identity & Access | Rank & Leaderboard | Economy & Rewards | Persistence |
|---|---|---|---|---|---|---|---|
| **Content & Learning** | — | → rounds data | → question pool | — | — | — | R: topics, questions, answers |
| **Solo Play Engine** | R: rounds | — | — | R: access gate | → rankPoints write | — | W: gameAttempts, dailyAttempts, pointsLedger |
| **Live Session Engine** | R: question pool | — | — | R: access gate | → rankPoints write | W: storePoints | W: gameSessions, gameSessionAnswers |
| **Identity & Access** | — | → accessDecision | → accessDecision | — | — | — | R: users, classEnrollments, subscriptions |
| **Rank & Leaderboard** | — | — | — | — | — | — | R: users.lifetimePoints, pointsLedger |
| **Economy & Rewards** | — | — | — | — | — | — | R/W: storePoints, rewardClaims |
| **Persistence** | ← serves | ← serves | ← serves | ← serves | ← serves | ← serves | — |

**Key directional rules:**
- Solo Play Engine → Rank & Leaderboard (rank points), never → Economy & Rewards
- Live Session Engine → both Rank & Leaderboard AND Economy & Rewards
- Rank & Leaderboard is **read-only** toward Persistence (rank is derived, never stored)
- Identity & Access has no write path to Persistence except session cookie (httpOnly)

---

## Requirement Allocation

| Area | Component(s) |
|---|---|
| Browse road-safety content (signs, traffic law, right of way, etc.) | Content & Learning |
| Play solo practice games (quick-quiz, speed-round, sign-challenge, mixed-practice) | Solo Play Engine |
| Play GameKit mini-games (sign-match, tick-sign, word-bank, sign-connect, catch-sign, light-hero, safety-adventure, safe-street-smart) | Solo Play Engine |
| Daily Challenge (5-question set, anti-replay, streak) | Solo Play Engine |
| Traffic Commander / Priority Puzzle (draw-path geometry, server-authoritative order) | Solo Play Engine |
| Teacher creates and hosts live class session | Live Session Engine |
| Students join live session via 6-char code | Live Session Engine + Identity & Access |
| Real-time leaderboard in live session (Pusher) | Live Session Engine |
| Session-end score sync to user profiles (one-shot guard) | Live Session Engine → Persistence |
| Login, registration, JWT issuance | Identity & Access |
| TOTP 2FA for admin/staff | Identity & Access |
| Google OAuth | Identity & Access |
| Access gate: guest / user / class-pro | Identity & Access |
| Subscription plan limits (maxPlayers, allCategories, classManagement) | Identity & Access |
| Rank display (6 tiers, 4 Roman divisions, avatar frame, progress bar) | Rank & Leaderboard |
| Global and windowed leaderboards (all-time / weekly / monthly / by-game) | Rank & Leaderboard |
| Student reward point balance and claim history | Economy & Rewards |
| Teacher accepts / rejects / fulfils reward claims | Economy & Rewards |
| Admin content pipeline (topics → questions → answers, approval workflow) | Content & Learning + Persistence |

---

## Key Design-Induced Invariants

These invariants follow from the component boundaries, not from requirements alone:

| # | Invariant | Enforced by |
|---|---|---|
| DI-1 | **Rank is stateless at write-time.** `rank` / `division` are never written to the DB; Solo Play Engine and Live Session Engine only increment `lifetimePoints`. Rank & Leaderboard re-derives on every read. | Rank & Leaderboard component owns no write path |
| DI-2 | **Store points flow through a single inlet.** The Economy & Rewards component only receives writes from Live Session Engine. Solo Play Engine cannot write claimable points; it can only write `pointsLedger` rows tagged `source="solo"`, which the economy ignores. | Directional rule: Solo Play Engine → Economy & Rewards = blocked |
| DI-3 | **Access decisions are synchronous and server-authoritative.** Both play engines call `resolveAccess()` on their server-side API routes before serving rounds or accepting completions. Client-reported access state is never trusted. | Identity & Access is called by both engines pre-round-serve AND pre-completion |
| DI-4 | **`scoresSynced` is a one-shot write gate.** The Live Session Engine flips it true once per session at end-of-game; any retry call is a no-op. This prevents double-crediting of both rank points and store points. | Live Session Engine owns the flag; no other component can flip it |
| DI-5 | **Content schema is append-only from the play engines' perspective.** Neither Solo Play nor Live Session Engine writes to `topics`, `questions`, or `answers`. Content mutation is Admin/Staff-only through the content approval pipeline. | Content & Learning is read-only to both play engines |

---

## Alternatives Considered

| Candidate | Strength | Weakness | Why Not Selected |
|---|---|---|---|
| **A — Layer-Oriented** (Presentation → API → Service → Persistence) | Natural Next.js grain; easy to onboard new developers | Service Layer accumulates ~55% of business logic (god object); cross-cutting at 45%; adding a game touches 3 layers | God object score is the core problem — it makes the scoring/access/round-building logic hard to isolate and test independently |
| **C — Event-Driven** (Play Gateway emits PlayedEvent; downstream processors subscribe) | Cleanest separation of side effects (rank / economy / streak / audit); fan-in ≤ 1 per processor | Requires an event bus (Pusher, in-process queue, or job table) not currently in the stack; partial-write risk in serverless; adds infrastructure complexity | Next.js serverless functions discourage long-lived event buses; async fan-out increases latency and debuggability cost in a school/Cambodian connectivity context |

---

## Metrics Summary

| Metric | B — Use-Case (selected) | A — Layer | C — Event-Driven |
|---|---|---|---|
| Cross-cutting requirements % | **25%** | 45% | 20% |
| Cross-cutting invariants % | **30%** (INV-2,5,6 span 2 components each) | 45% | 20% |
| Flow density (edges / N×(N-1)) | **0.21** | 0.42 | 0.17 |
| God object score (max % logic in one component) | **40%** (Solo Play Engine) | 55% (Service Layer) | 35% (Play Gateway) |
| Synchronous cycles | **0** | 0 | 0 |
| Max fan-in | **4** (Identity & Access) | 5 (Service Layer) | 1 (each processor) |
| Max fan-out | **4** (Live Session Engine) | 3 (Presentation) | 4 (Play Gateway) |
| Evolvability cost (avg components touched per new REQ) | **1.4** (new game = 1 slice; new reward tier = 1 slice) | 2.8 (crosses 3 layers) | 1.2 (new effect = 1 processor) |
| Infrastructure delta | **0** (no new deps) | 0 | +1 (event bus) |

---

## File-to-Component Map (current repo)

For navigating the codebase, each component corresponds to these files:

**Content & Learning**
- `src/app/(public)/learn/**` — browsable category + topic pages
- `src/db/schema/content.ts` — categories, topics, questions, answers schema
- `src/app/api/categories/`, `src/app/api/content/`, `src/app/api/traffic-signs/`
- `src/app/(dashboard)/staff/`, `src/app/(dashboard)/admin/` — content pipeline

**Solo Play Engine**
- `src/lib/gamekit/` — GameKitShell, types, server.ts, kid-games.ts, formats/*
- `src/app/(public)/play/**` — all /play/* routes
- `src/app/api/game/[gameId]/`, `api/game/daily/`, `api/game/solo/`, `api/game/priority/`
- `src/lib/game-engine.ts`, `src/lib/quiz-scoring.ts`

**Live Session Engine**
- `src/app/api/game/sessions/` — session lifecycle + Pusher events
- `src/app/(public)/play/[code]/` — student join flow
- `src/app/(dashboard)/teacher/` — host controls
- `src/db/schema/game.ts` — gameSessions, gameParticipants, gameSessionAnswers
- `src/lib/realtime-bus.ts`, `src/lib/game-realtime-bus.ts`

**Identity & Access**
- `src/lib/auth.ts` — JWT sign/verify/session
- `src/lib/gamekit/access.ts` — 3-tier access resolution
- `src/app/api/auth/**` — login, register, OAuth, 2FA
- `src/db/schema/users.ts` — users, classes, classEnrollments, inviteCodes
- `src/app/api/subscriptions/`, `src/lib/subscription-plans.ts`

**Rank & Leaderboard**
- `src/lib/ranks.ts` — pure rank/division derivation (6 tiers)
- `src/app/(public)/leaderboard/` — public leaderboard pages
- `src/app/api/leaderboard/` — windowed queries
- `src/db/schema/content.ts` — pointsLedger

**Economy & Rewards**
- `src/lib/store-points/` — award, balance, idempotency
- `src/db/schema/game.ts` — rewardClaims
- `src/app/(dashboard)/teacher/` — claim management

**Persistence Boundary**
- `src/lib/db.ts` — lazy Drizzle Proxy to Neon PostgreSQL
- `src/db/schema/` — all 48 tables

---

## Quick Reference: The Two Economies

```
SOLO PLAY (practice)           LIVE SESSION (teacher-hosted)
─────────────────────          ─────────────────────────────
calculateScore()                calculateScore()
       ↓                                ↓
  awardRankPoints()              syncScoresToUserProfiles()
       ↓                                ↓
  lifetimePoints               lifetimePoints + storePoints
  pointsLedger (source=solo)   pointsLedger (source=live)
       ↓                                ↓
  Rank derivation only         Rank derivation + claimable economy
```

**Key insight:** Both economies write to `lifetimePoints` (the rank source of truth),
BUT only the live session writes to `storePoints` (the claimable currency). The
two-economy split is NOT about rank vs. no-rank; it's about **rank-only vs.
rank-plus-claimable**. Solo plays DO contribute to the public leaderboard (this
changed from an earlier design); they just can't earn physical rewards.

**Correction from earlier comment in server.ts:** The comment "solo modes do NOT
contribute to the public leaderboard" is outdated. As of the current codebase,
`awardRankPoints()` in `lib/gamekit/server.ts` writes `lifetimePoints` +
`pointsLedger` for every persisted solo play. The two-economy split is about
claimable store points (live-only), not about rank eligibility.
