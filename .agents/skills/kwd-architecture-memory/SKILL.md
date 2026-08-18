# KWD Architecture Memory

## Purpose

This skill provides canonical architectural knowledge for the Kesararam With Digital (KWD) project. Read this before making changes that span multiple feature areas or touch core boundaries.

---

## Architecture Style: Use-Case Vertical Slices

**Key Decision:** The codebase separates two fundamentally different scoring economies:
- **Solo/Practice Play** (rank-only): GameKit mini-games, quick-quiz, speed-round, daily challenge
- **Live Sessions** (rank + claimable points): Teacher-hosted real-time competition

This two-economy split is a first-class domain invariant and drives the component boundaries.

---

## Component Inventory

### 1. Content & Learning
**Owned State:** `categories[8]`, `topics[638]`, `questions[5925]`, `answers[21355]`

**Responsibility:** Serves browsable content via `/learn/*` pages. Feeds question pools to both play engines.

**Key Files:**
- `src/app/(public)/learn/**`
- `src/db/schema/content.ts`
- `src/app/api/categories/`, `src/app/api/content/`, `src/app/api/traffic-signs/`
- `src/app/(dashboard)/staff/`, `src/app/(dashboard)/admin/`

**Access:** Read-only from both play engines.

---

### 2. Solo Play Engine
**Owned State:** `rounds[]`, `kitPhase`, `gameAttempts`, `dailyAttempts`, `userStreaks`

**Responsibility:** Drives all practice plays (10 GameKit formats, 4 solo quiz modes, daily challenge). Scores via `calculateScore()` → `awardRankPoints()`. Writes rank points ONLY.

**Key Files:**
- `src/lib/gamekit/` — GameKitShell, server.ts, kid-games.ts, formats/*
- `src/app/(public)/play/**`
- `src/app/api/game/[gameId]/`, `api/game/daily/`, `api/game/solo/`, `api/game/priority/`
- `src/lib/game-engine.ts`, `src/lib/quiz-scoring.ts`

**Writes:**
- `gameAttempts`, `lifetimePoints`, `pointsLedger` (source="solo")

**NEVER writes:** `storePoints` (claimable currency)

---

### 3. Live Session Engine
**Owned State:** `gameSessions`, `gameParticipants`, `gameSessionAnswers`, `scoresSynced`

**Responsibility:** Teacher-hosted real-time competition via Pusher. Creates sessions (6-char code), drives lobby → active → ended state machine. Writes BOTH rank points AND claimable store points via `syncScoresToUserProfiles()` with one-shot `scoresSynced` guard.

**Key Files:**
- `src/app/api/game/sessions/`
- `src/app/(public)/play/[code]/`
- `src/app/(dashboard)/teacher/`
- `src/db/schema/game.ts` — gameSessions, gameParticipants, gameSessionAnswers
- `src/lib/realtime-bus.ts`, `src/lib/game-realtime-bus.ts`

**Writes:**
- `gameSessions`, `gameSessionAnswers`
- `lifetimePoints`, `pointsLedger` (source="live")
- `storePoints` (claimable currency) — **only inlet to economy**

---

### 4. Identity & Access
**Owned State:** `session` (JWT), `classEnrollment`, `subscriptionPlan`

**Responsibility:** JWT mint/verify (`jose`, `kwd_token` cookie). Access resolution for 3 tiers: `guest` / `user` / `class-pro`. TOTP 2FA for admin/staff. Google OAuth. Rate limiting.

**Key Files:**
- `src/lib/auth.ts` — JWT sign/verify/session
- `src/lib/gamekit/access.ts` — 3-tier access resolution
- `src/app/api/auth/**`
- `src/db/schema/users.ts`
- `src/app/api/subscriptions/`, `src/lib/subscription-plans.ts`

**Fan-in:** 4 (both play engines call it, plus leaderboard queries, plus economy checks)

**Cross-cutter:** This is unavoidable given the 3-tier access model.

---

### 5. Rank & Leaderboard
**Owned State:** `lifetimePoints` (derived read), `pointsLedger`

**Responsibility:** Pure rank derivation from `lifetimePoints` via `ranks.ts` (6 tiers × 4 Roman divisions). Windowed leaderboard queries from `pointsLedger`. Rank is NEVER stored — always derived.

**Key Files:**
- `src/lib/ranks.ts` — pure rank/division derivation
- `src/app/(public)/leaderboard/`
- `src/app/api/leaderboard/`
- `src/db/schema/content.ts` — pointsLedger

**Read-only:** No write path to Persistence.

---

### 6. Economy & Rewards
**Owned State:** `storePoints`, `rewardClaims`

**Responsibility:** Student claimable-points wallet. Claim → accept → fulfil / reject lifecycle. Points only enter from Live Session Engine via `awardStorePoints()` with `source="live"`.

**Key Files:**
- `src/lib/store-points/`
- `src/db/schema/game.ts` — rewardClaims
- `src/app/(dashboard)/teacher/` — claim management

**Single inlet:** Only Live Session Engine writes `storePoints`.

---

### 7. Persistence Boundary
**Owned State:** All 48 DB tables

**Responsibility:** Neon PostgreSQL via Drizzle ORM lazy-Proxy (`lib/db.ts`). Schema owner. All components route reads/writes through this boundary.

**Key Files:**
- `src/lib/db.ts`
- `src/db/schema/`

---

## Information Flow Rules

### Directional Constraints
1. **Solo Play Engine → Rank & Leaderboard** (rank points only)
2. **Solo Play Engine → Economy & Rewards** = **BLOCKED**
3. **Live Session Engine → Rank & Leaderboard AND Economy & Rewards** (both currencies)
4. **Rank & Leaderboard → Persistence** = **read-only** (rank is derived, never stored)
5. **Identity & Access → Solo/Live Play Engines** = sync, server-authoritative gate

### Fan-in/Fan-out
- **Max fan-in:** 4 (Identity & Access)
- **Max fan-out:** 4 (Live Session Engine)
- **Flow density:** 0.21 (low coupling)

---

## Key Design-Induced Invariants

These invariants follow from the component boundaries, not from requirements alone:

| # | Invariant | Enforced by |
|---|---|---|
| **DI-1** | Rank is stateless at write-time. `rank` / `division` are never written to DB; only `lifetimePoints` is incremented. Rank & Leaderboard re-derives on every read. | Rank & Leaderboard component owns no write path |
| **DI-2** | Store points flow through a single inlet. Economy & Rewards only receives writes from Live Session Engine. Solo Play Engine cannot write claimable points. | Directional rule: Solo Play Engine → Economy & Rewards = blocked |
| **DI-3** | Access decisions are synchronous and server-authoritative. Both play engines call `resolveAccess()` on server-side API routes before serving rounds or accepting completions. | Identity & Access is called by both engines pre-round-serve AND pre-completion |
| **DI-4** | `scoresSynced` is a one-shot write gate. Live Session Engine flips it true once per session at end-of-game; any retry call is a no-op. Prevents double-crediting. | Live Session Engine owns the flag; no other component can flip it |
| **DI-5** | Content schema is append-only from play engines' perspective. Neither Solo Play nor Live Session Engine writes to `topics`, `questions`, or `answers`. Content mutation is Admin/Staff-only. | Content & Learning is read-only to both play engines |

---

## The Two Economies (Quick Reference)

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

**Key insight:** Both economies write to `lifetimePoints` (the rank source of truth), BUT only live sessions write to `storePoints` (the claimable currency). Solo plays DO contribute to public leaderboards.

The two-economy split is NOT about rank vs. no-rank; it's about **rank-only vs. rank-plus-claimable**.

---

## Metrics (vs. Alternatives)

| Metric | Current (Use-Case Slices) | Alt: Layer-Oriented | Alt: Event-Driven |
|---|---|---|---|
| Cross-cutting requirements % | **25%** | 45% | 20% |
| Flow density | **0.21** | 0.42 | 0.17 |
| God object score | **40%** (Solo Play Engine) | 55% (Service Layer) | 35% (Play Gateway) |
| Sync cycles | **0** | 0 | 0 |
| Max fan-in | **4** (Identity & Access) | 5 | 1 |
| Evolvability cost (avg components touched per new REQ) | **1.4** | 2.8 | 1.2 |
| Infrastructure delta | **0** (no new deps) | 0 | +1 (event bus) |

**Why use-case slices won:** Eliminates god object, low coupling, no new infrastructure. Event-driven would be cleaner but requires event bus not suitable for Next.js serverless.

---

## Common Pitfalls to Avoid

### ❌ DON'T: Write `storePoints` from Solo Play Engine
The solo play economy is rank-only. Only Live Session Engine writes claimable currency.

### ❌ DON'T: Store `rank` or `division` in the DB
Rank is derived on-the-fly from `lifetimePoints` via `ranks.ts`. Storing it creates sync issues.

### ❌ DON'T: Trust client-reported access state
Always call `resolveAccess()` server-side before serving rounds or accepting completions.

### ❌ DON'T: Allow `scoresSynced` to flip twice
The one-shot guard prevents double-crediting. Respect it.

### ❌ DON'T: Let play engines write to content tables
Content mutation is Admin/Staff-only through the approval pipeline.

---

## When to Update This Skill

Update this skill when:
- Component boundaries change (new component, merge, split)
- A new cross-cutting concern emerges (e.g., analytics, audit trail)
- Information flow rules change (e.g., new write path to Economy)
- Key invariants are violated or evolve

Reference the architecture selection at `.kiro/specs/learn-architecture/architecture_selection.md` for full analysis.

---

## Iteration Points (as of last analysis)

### 1. Identity & Access as a Cross-Cutter
Currently 4 fan-in (both play engines + leaderboard + economy). Could split into:
- **Authentication** (JWT, OAuth, 2FA) — pure identity
- **Access Control** (`resolveAccess`, subscription checks) — authorization policy

**Trade-off:** Adds interface overhead; auth must expose `session`, access reads it.

### 2. Two-Economy Split
Currently implicit via directional rules. Could formalize as:
- **Rank Economy Service** (solo + live write `lifetimePoints`)
- **Claimable Economy Service** (live-only writes `storePoints`)

**Trade-off:** Adds a layer; both services would still need to coordinate in Live Session Engine's `syncScoresToUserProfiles()`.

### 3. Rank & Leaderboard Read-Only Boundary
Currently enforced by convention (no write path exists). Could formalize with:
- Separate read-only DB connection for Rank & Leaderboard
- Enforced at Persistence Boundary level

**Trade-off:** Adds infrastructure; requires dual connection management.
