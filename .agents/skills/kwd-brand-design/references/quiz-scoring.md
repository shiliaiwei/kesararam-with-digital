# KWD Quiz Scoring Logic — locked spec

> Source of truth for the **new** scoring engine at `src/lib/quiz-scoring.ts`
> (tests: `src/lib/quiz-scoring.test.ts`). Feeds the 6-tier rank system —
> see `references/rank-tiers.md` / `src/lib/ranks.ts`. Set by the user 2026-06-19.
> Keep scoring logic separate from UI. Coexists with the legacy store-points
> engine; this is the NEW system, not yet live.

## Question structure (every game mode)

- **Exactly ONE correct answer per question.** No multi-select.
- **At most 4 options.** MCQ shows **3–4**; true/false shows **2**. Enforced when
  questions are served (`src/app/api/game/solo/route.ts`): keep the one correct
  answer + up to 3 random distractors, then shuffle. The server re-validates the
  submitted answer independently, so trimming never changes scoring.

## Core rule: keep points SMALL — each question gives 0, 1, or 2 points

> **Speed bonus REMOVED (2026-06-19).** Timing no longer affects the score on ANY
> game type (live, solo, daily, priority puzzle, kid arcade, legacy quiz/challenge).
> Each question is **base + streak**, max **2**. `speedBonus` is kept in the result
> shape but is always `0` for stored-column compatibility.

| Component | Value | When |
|-----------|-------|------|
| `baseScore` | +1 | answer is correct (else 0) |
| `streakBonus` | +1 | correct AND on a run of **≥3 correct in a row** (`currentCorrectStreak ≥ 2` prior correct) — **max +1, never more** |

```
baseScore       = isCorrect ? 1 : 0
streakBonus     = isCorrect && currentCorrectStreak >= 2 ? 1 : 0        // 3rd correct onward
questionScore   = isCorrect ? baseScore + streakBonus : 0                // 0..2
newCorrectStreak= isCorrect ? currentCorrectStreak + 1 : 0              // wrong → reset to 0
speedBonus      = 0   // removed; timing no longer scores
```

> `currentCorrectStreak` is the run of correct answers **before** this question.
> The streak bonus begins on the **THIRD** consecutive correct answer.

**A clean run scores `1, 1, 2, 2, 2, …`:**

| Correct in a row | 1 | 2 | 3 | 4 | 5 |
|------------------|---|---|---|---|---|
| Points this question | 1 | 1 | 2 | 2 | 2 |

Per-question outcomes:
- Wrong → **0** — the streak is **cut to 0**; the next correct restarts the run at 1
  (so it scores `1, 1, 2, …` again).
- Correct, fewer than 2 prior correct → **1** (regardless of how fast).
- Correct, on a run of ≥3 → **2** (regardless of how fast).

Edge cases: `answeredInFirstHalf` is still reported (informational) but never adds
points. Timing is irrelevant to the score. Negative streak coerced to 0.

## Functions (`src/lib/quiz-scoring.ts`)

- `calculateQuestionScore({ isCorrect, answerTimeSeconds, questionTimeLimitSeconds, currentCorrectStreak })`
  → `{ baseScore, speedBonus, streakBonus, questionScore, newCorrectStreak, answeredInFirstHalf, wasStreakBonusApplied }`
- `calculateQuizScore(answers[])` → `{ totalScore, correctAnswers, wrongAnswers, finalStreak, highestStreak, questionResults[] }`
  (threads the streak through every question).
- `applyQuizScoreToUser(currentScore, quizTotalScore)` → `{ previousScore, addedScore, newScore, rank }`.
  After a quiz: `user.score = user.score + totalScore`, then rank/division are
  re-derived from `newScore` via `ranks.ts`. **Never restart from zero.**

## Intended balance — do NOT inflate

40-question live quiz:
- All correct = `1 + 1 + 38×2` = **78** (max — first **two** correct have no streak
  bonus yet, then +2 each from the 3rd). General form for N≥2 all-correct: `2N − 2`.
- Timing has no effect on the total (speed bonus removed).

This cap is deliberate (scarce points → each one feels earned). Don't raise it.

## Rank connection

Total score accumulates into the user's permanent `score`; rank uses the 6 tiers
in `references/rank-tiers.md`: ROOKIE 0 · RISING 1,000 · GOLD 2,500 · PLATINUM 3,500 ·
DIAMOND 7,000 · MYTHIC 12,000. English names only, never translated.

## Applies to ALL game types (one scorer)

Every game routes through `calculateScore` (`src/lib/game-engine.ts`) → this method,
so the 0/1/2 rule is universal: Live Class Games, Solo Practice, Daily Challenge
(5 Q/day, plus a separate consecutive-**day** streak bonus), Who Goes First?,
Sign Match, Catch the Sign, Traffic Light Hero, Road Safety Adventure, Connect the
Signs, Word Bank, Tick the Sign, Traffic Commander. Multi-item games score per
pair/item/row as the unit, with the streak threaded across the whole play. The
Store-Points claimable economy (`src/lib/store-points`) is separate and OFF.
Full per-game estimates: `docs/scoring-by-game-report.md`.

## Changelog (score-point rule)

- **2026-06-20** — Streak bonus now begins on the **3rd** consecutive correct (was the
  2nd): a run scores `1, 1, 2, 2, 2, …` (`streakBonus` needs `currentCorrectStreak ≥ 2`).
  40-question all-correct max drops `79 → 78`. Also locked the question structure:
  exactly **one correct answer**, **≤4 options** (MCQ 3–4, true/false 2), enforced at
  serve time. Full policy: `docs/game-scoring-policy.md`.
- **2026-06-19** — Speed bonus **removed** from every game type; each question/unit
  is base + streak, **max 2**. `speedBonus`/`timeBonus` kept at 0 for column shape.
  Legacy `quiz/answer` + `challenge/answer` time bonus also removed.
- **2026-06-19** — Teacher host **scoring-mode toggle removed** (Speed vs Equal):
  it was a no-op after the speed bonus removal and showed twice. `scoringMode` is now
  a fixed internal constant (`"speed"`) only for create-session payload/DB shape.
