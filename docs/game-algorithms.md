# GameKit — Game Algorithm Reference

All six games share the same scoring formula from `src/lib/game-engine.ts`.
Server scoring is **always authoritative** — the client submits answers and the server
re-validates before awarding points.

---

## Universal Scoring Formula

```
totalPoints = baseScore + speedBonus + streakBonus
```

| Component | Rule |
|-----------|------|
| **baseScore** | easy → 1 pt · medium → 2 pt · hard → 3 pt |
| **speedBonus** | speed mode only: `round(remainingTimeMs / totalTimeMs × 3)` — max +3 |
| **streakBonus** | 2–4 correct in a row → +1 · 5+ in a row → +2 |
| **Suspicious guard** | response < 500 ms → speedBonus = 0, streakBonus = 0 |
| **Wrong answer** | 0 points, streak resets |

Guest plays are computed but **never persisted** — no DB write, no points.

---

## Game 1 — Daily Challenge (`/play/daily`)

**Format:** MCQ / true-false / image-pick, 5 questions, same set for every player each day.

### Round flow
1. Server calls `getOrCreateDailySet(today)` — selects 5 approved question IDs for
   today's date (Asia/Phnom_Penh). All players share the same set.
2. Player answers each question; client sends `RoundResult[]` to `POST /api/game/daily/complete`.
3. Server re-fetches questions + correct answers from DB (client-provided `isCorrectGuess`
   is ignored — server recalculates).
4. Anti-replay: a `UNIQUE(userId, challengeDate)` constraint in `daily_attempts` prevents
   a second attempt on the same calendar day.
5. Streak updated via `computeStreak(prev, today)`:
   - Yesterday → `currentStreak = prev + 1`
   - Gap > 1 day → `currentStreak = 1`
   - Same day → unchanged
6. Milestone bonus (+5 pts) awarded **once** at streaks 7, 14, 30.

### Scoring mode
`speed` — each question has 30 s total; faster answers earn more.

---

## Game 2 — Who Goes First? (`/play/priority-puzzle`)

**Format:** Junction scene, tap vehicles in right-of-way order.

### Round flow
1. Server selects N random approved `priority_scenes` from DB (no `correctOrder` sent to client).
2. The JunctionView renders an SVG crossroad with vehicle tiles showing:
   - **Vehicle heading** (facing the direction of travel)
   - **Turn intent arrow** (yellow badge: straight ↑ / left ↯ / right ↱)
3. Player taps vehicles in the order they believe each should go. An order strip shows the
   running sequence. Undo / Reset buttons allow correction before submitting.
4. `POST /api/game/priority/complete` receives `{ submittedOrder[], timeTakenMs }` per scene.
5. Server fetches `correctOrder` from DB, checks `arrayEquals(submitted, correct)`.
6. Rule hints displayed during play:
   - **Uncontrolled cross** → give way to the right
   - **Emergency vehicle** present → ambulance/fire engine always goes first
   - **Traffic light** → follow signal order

### Scoring mode
`speed` — 30 s per scene.

---

## Game 3 — Sign Match (`/play/sign-match`)

**Format:** Memory / flip-card matching.

### Round flow
1. Server returns 4–8 pairs of `{ id, nameEn, nameKm, imageUrl }` from `traffic_signs`.
2. Client builds a grid of `2 × N` face-down cards (one image card + one text card per pair).
   Cards are shuffled randomly.
3. Player flips two cards at a time:
   - **Match** (same pairId, one image + one text) → cards stay face-up (green).
   - **No match** → both flip back after 650 ms.
4. Round is complete when all N pairs are matched.
5. Score submitted as one `RoundResult` with `isCorrectGuess: true` because completion itself
   is success (no wrong answers possible — only extra flips slow you down).

### Scoring mode
`equal` — no time bonus; base score applied once for the completed round (difficulty = easy).

---

## Game 4 — Catch the Sign (`/play/catch-sign`)

**Format:** Rapid image tap — 4 signs shown, tap the one that matches the text prompt.

### Round flow
1. Server pulls `count × 4` random sign items (shuffled). Each round: 4 choices, one target.
2. Client shows the text prompt (EN or KH based on `lang`) and a 2×2 grid of sign images.
3. Player taps one image:
   - **Correct** → `isCorrectGuess: true`, move to next round.
   - **Wrong** → `isCorrectGuess: false`, move to next round (no retry).
4. `timeTakenMs` is measured from round start.
5. Server scores each tap via `calculateScore`.

### Scoring mode
`speed` — 15 s per round; tapping quickly earns the full speed bonus.

---

## Game 5 — Traffic Light Hero (`/play/light-hero`)

**Format:** Single-tap reaction — see the light colour, tap the correct action.

### Round flow
1. Server generates N rounds, each with a random light state: `green | red | yellow`.
2. Client displays the light and three action buttons:
   - 🟢 Green → **Go** (Footprints icon)
   - 🔴 Red → **Stop** (Hand icon)
   - 🟡 Yellow → **Slow** (Alert icon)
3. Player taps one action. `isCorrectGuess = (tapped.correctFor === light)`.
4. Animated light flash feedback, then next round.
5. Server scores via `calculateScore` (speed mode, 15 s per round).

### Scoring mode
`speed` — 15 s per round; quick and correct earns maximum points.

---

## Game 6 — Road Safety Adventure (`/play/safety-adventure`) 🔒 Class-Pro

**Format:** Stepped scenario — choose the safe action at each situation.

### Access gate
Requires the student to be enrolled in a class whose teacher has an active
`teacher_pro` or `school` subscription (`resolveAccess` in `src/lib/gamekit/access.ts`).
Shows a locked card on the hub if the condition is not met.

### Round flow
1. Server returns 3 scenario steps (static content — no DB query needed).
2. Each step has a 2-choice prompt (correct = safe choice, wrong = unsafe).
3. Player picks one option; no retry.
4. `isCorrectGuess = choice.correct`.
5. Server scores via `calculateScore` (speed mode, 15 s per step).

### Scoring mode
`speed` — 15 s per step.

---

## Points Ledger (windowed leaderboard)

Every scored play writes one row to `points_ledger`:

| Column | Value |
|--------|-------|
| `userId` | authenticated user id |
| `source` | game id string (e.g. `"daily"`, `"sign-match"`) |
| `gameType` | same as source |
| `points` | total points earned |
| `createdAt` | server timestamp (UTC) |

The leaderboard API sums `points` within the chosen window (`weekly` = last Mon 00:00 ICT,
`monthly` = 1st of current month 00:00 ICT, `all` = `lifetimePoints` column on users).

---

## Access Tiers

| Tier | Who | Score recorded? |
|------|-----|-----------------|
| `guest` | unauthenticated | ❌ never |
| `user` | any logged-in student | ✅ yes |
| `class-pro` | student in a class with pro teacher | ✅ yes |
