# KWD Quiz Scoring Logic — locked spec

> Source of truth for the **new** scoring engine at `src/lib/quiz-scoring.ts`
> (tests: `src/lib/quiz-scoring.test.ts`). Feeds the 6-tier rank system —
> see [[rank-tiers]] / `src/lib/ranks.ts`. Set by the user 2026-06-19.
> Keep scoring logic separate from UI. Coexists with the legacy store-points
> engine; this is the NEW system, not yet live.

## Core rule: keep points SMALL — each question gives 0, 1, or 2 points

> **Speed bonus REMOVED (2026-06-19).** Timing no longer affects the score on ANY
> game type (live, solo, daily, priority puzzle, kid arcade, legacy quiz/challenge).
> Each question is **base + streak**, max **2**. `speedBonus` is kept in the result
> shape but is always `0` for stored-column compatibility.

| Component | Value | When |
|-----------|-------|------|
| `baseScore` | +1 | answer is correct (else 0) |
| `streakBonus` | +1 | correct AND already on a streak (`currentCorrectStreak ≥ 1`) — **max +1, never more** |

```
baseScore       = isCorrect ? 1 : 0
streakBonus     = isCorrect && currentCorrectStreak >= 1 ? 1 : 0
questionScore   = isCorrect ? baseScore + streakBonus : 0                // 0..2
newCorrectStreak= isCorrect ? currentCorrectStreak + 1 : 0              // wrong → reset to 0
speedBonus      = 0   // removed; timing no longer scores
```

Per-question outcomes:
- Wrong → **0** (streak resets to 0; next correct starts a fresh streak).
- Correct, no streak → **1** (regardless of how fast)
- Correct, with streak → **2** (regardless of how fast)

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
- All correct = `1 + 39×2` = **79** (max — first correct has no streak yet, then +2 each).
- Timing has no effect on the total (speed bonus removed).

This cap is deliberate (scarce points → each one feels earned). Don't raise it.

## Rank connection

Total score accumulates into the user's permanent `score`; rank uses the 6 tiers
in [[rank-tiers]]: ROOKIE 0 · RISING 1,000 · GOLD 2,500 · PLATINUM 3,500 ·
DIAMOND 7,000 · MYTHIC 12,000. English names only, never translated.
