# KWD Quiz Scoring Logic — locked spec

> Source of truth for the **new** scoring engine at `src/lib/quiz-scoring.ts`
> (tests: `src/lib/quiz-scoring.test.ts`). Feeds the 6-tier rank system —
> see [[rank-tiers]] / `src/lib/ranks.ts`. Set by the user 2026-06-19.
> Keep scoring logic separate from UI. Coexists with the legacy store-points
> engine; this is the NEW system, not yet live.

## Core rule: keep points SMALL — each question gives 0, 1, 2, or 3 points

| Component | Value | When |
|-----------|-------|------|
| `baseScore` | +1 | answer is correct (else 0) |
| `speedBonus` | +1 | correct AND answered in the **first half** of the time limit |
| `streakBonus` | +1 | correct AND already on a streak (`currentCorrectStreak ≥ 1`) — **max +1, never more** |

```
baseScore       = isCorrect ? 1 : 0
answeredInFirstHalf = answerTimeSeconds <= questionTimeLimitSeconds / 2   (and limit > 0)
speedBonus      = isCorrect && answeredInFirstHalf ? 1 : 0
streakBonus     = isCorrect && currentCorrectStreak >= 1 ? 1 : 0
questionScore   = isCorrect ? baseScore + speedBonus + streakBonus : 0   // 0..3
newCorrectStreak= isCorrect ? currentCorrectStreak + 1 : 0               // wrong → reset to 0
```

Per-question outcomes:
- Wrong → **0** (streak resets to 0; next correct starts a fresh streak).
- Correct, slow, no streak → **1**
- Correct, fast, no streak → **2**
- Correct, slow, with streak → **2**
- Correct, fast, with streak → **3**

Edge cases: answering exactly at the half mark counts as first-half (≤). Timeout /
no answer = `answerTimeSeconds ≥ limit` → no speed bonus. Negative streak coerced to 0.

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
- All correct + all fast = `2 + 39×3` = **119** (max).
- All correct + all slow = `1 + 39×2` = **79**.

These caps are deliberate (scarce points → each one feels earned). Don't raise them.

## Rank connection

Total score accumulates into the user's permanent `score`; rank uses the 6 tiers
in [[rank-tiers]]: ROOKIE 0 · RISING 1,000 · GOLD 2,500 · PLATINUM 3,500 ·
DIAMOND 7,000 · MYTHIC 12,000. English names only, never translated.
