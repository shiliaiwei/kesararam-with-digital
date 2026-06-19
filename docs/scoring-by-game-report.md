# Scoring Verification Report — all game types

> Generated 2026-06-19. Confirms the post-change scoring (speed bonus removed; each
> question/unit scores **0, 1, or 2**) is applied uniformly across every game type,
> with per-play score estimates and the Q&A / content bank behind each game.

## 1. Rule under test

Per question/unit (see `src/lib/quiz-scoring.ts` → `calculateQuestionScore`):

| Outcome | Points |
|---|---|
| Wrong | **0** (streak resets) |
| Correct, not on a streak yet | **1** (base) |
| Correct, already on a streak (≥1 prior correct) | **2** (base + streak) |

- **No speed bonus** — timing never changes the score on any game.
- Streak threads continuously through a play and resets to 0 on any wrong answer.
- Max for an all-correct play of N units = **2N − 1** (the first correct has no
  streak yet, then +2 each).

## 2. Verification — every game routes through one scorer

All modern games call `calculateScore` (`src/lib/game-engine.ts`), which delegates
to `calculateQuestionScore`. Verified call sites:

| Game (leaderboard id) | Scorer (server) | Content bank | Unit model | Claimable? |
|---|---|---|---|---|
| **Live Class Game** (`sessions`) | `api/game/sessions/[code]/answer` | `questions` (5,182) | per question | **Yes — live only** |
| **Solo Practice** (`solo`) | `api/game/solo/complete` | `questions` (5,182) | per question | No (rank only) |
| **Daily Challenge** (`daily`) | `recordDailyAttempt` | `questions` (5,182), **5/day** | per question **+ consecutive-day streak bonus** | No |
| **Who Goes First?** (`priority-puzzle`) | `validatePriority` | `priority_scenes` (**4**) | per scene | No |
| **Sign Match** (`sign-match`) | `recordGameAttempt` | sign topics (**247**) | 1 unit/round | No |
| **Catch the Sign** (`catch-sign`) | `recordGameAttempt` | sign topics (247) | 1 unit/round | No |
| **Traffic Light Hero** (`light-hero`) | `recordGameAttempt` | sign topics (247) | 1 unit/round | No |
| **Road Safety Adventure** (`safety-adventure`) | `recordGameAttempt` | built-in scenarios | 1 unit/round | No |
| **Connect the Signs** (`sign-connect`) | `recordSignConnectAttempt` | sign topics (247) | **4 pairs/round** | No |
| **Word Bank** (`word-bank`) | `recordWordBankAttempt` | sign topics (247) | **8 items/round** | No |
| **Tick the Sign** (`tick-sign`) | `recordTickSignAttempt` | sign topics (247) | rows/round | No |
| **Traffic Commander** (`traffic-commander`) | `validateTrafficCommander` | built-in scenes | per decision | No |

Notes:
- **Q&A bank** = `questions` table: **5,182 questions / 18,386 answers**. Daily, Live,
  Solo and Category Quiz all draw from it. Daily uses a fixed **5-question** set/day.
- **Sign bank** = published category-1 `topics` with an image: **247 signs**. All
  sign/arcade games draw from it (`getSignItems`).
- **Priority** currently has only **4** scenes in the bank (default play asks for 5).
- **Store-Points claimable economy** (`src/lib/store-points`) is built but **OFF**
  (`STORE_POINTS_ENABLED=false`); solo plays are never claimable. Today the
  leaderboard "Live" balance is the rank points earned in **live class games** only.
- **Legacy** `api/quiz/answer` + `api/challenge/answer` are dead (their `content`
  table no longer exists) — time bonus was removed there too for consistency.

## 3. Score per play, by accuracy (rank points)

Because every game uses the same 0/1/2 rule, one table covers them all. `C` = number
correct. Score depends on **how the correct answers are arranged** (streaks):

- **Best** (correct answers consecutive): `2C − 1`
- **Typical** (random order): `C + C(C−1)/N`
- **Worst** (every correct isolated by a wrong): `C`

| Accuracy | 1 Q | 20 Q | 40 Q |
|---|---|---|---|
| **100%** | **1** | **39** | **79** |
| **75%** | 0–1 | ~26 (15–29) | ~52 (30–59) |
| **50%** | 0–1 | ~15 (10–19) | ~30 (20–39) |
| **25%** | 0 | ~6 (5–9) | ~12 (10–19) |

(1-question plays are binary: correct = 1, wrong = 0.)

### Max (all-correct) per play length
| Length | Max rank points |
|---|---|
| 1 Q | 1 |
| 20 Q | 39 |
| 40 Q | 79 |

### Daily Challenge extra
Daily adds a **consecutive-day** streak milestone bonus on top of the per-question
score (not a speed bonus). The 5-question daily itself maxes at **9** rank points
(2×5 − 1) before the day-streak bonus.

## 4. Claimable points (live games) — when Store-Points is switched on

Reference only; currently disabled. Formula (`calculateStorePoints`): **10 per
correct**, capped at **300/play**, requires **≥40% accuracy** or it pays 0.

| Accuracy | 20 Q | 40 Q |
|---|---|---|
| 100% | 200 | 300 (cap) |
| 75% | 150 | 300 (cap) |
| 50% | 100 | 200 |
| 25% | 0 (below 40% floor) | 0 (below 40% floor) |

## 5. Conclusion

✅ Speed bonus is removed everywhere; every game type scores **0/1/2 per
question/unit** through the single `calculateScore` path. Estimates above hold for
all games (sign games count per pair/item/row as the unit). Unit tests:
`src/lib/quiz-scoring.test.ts` + `src/test/game-engine.test.ts` (28 passing).
