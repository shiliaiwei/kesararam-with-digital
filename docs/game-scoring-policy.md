# KWD Game Scoring Policy — all game modes

> **Status:** locked policy, set by the product owner 2026-06-20.
> **Applies to:** EVERY game mode — Quick Quiz, Speed Round, Sign Challenge, Mixed
> Practice, Daily Challenge, Live Class Games, and the arcade games (Sign Match,
> Catch the Sign, Traffic Light Hero, Road Safety, Connect the Signs, Matching
> Sign / Word Bank, Click the Sign / Tick Sign, Traffic Commander).
>
> **Code:** `src/lib/quiz-scoring.ts` (the math) → reached by every mode through
> `src/lib/game-engine.ts` `calculateScore()`. Tests: `src/lib/quiz-scoring.test.ts`,
> `src/test/game-engine.test.ts`. Brand-skill mirror:
> `.agents/skills/kwd-brand-design/references/quiz-scoring.md`.

This is the single, plain-language policy for how a play is structured and scored.
It is intentionally simple: small, scarce points that are easy to audit and hard to
inflate.

---

## 1. Question structure

1. **One question has exactly ONE correct answer.** Never multi-select.
2. **Options are limited to at most 4.**
   - Multiple-choice questions show **3 or 4** options (one correct + 2–3 distractors).
   - True/false questions show **2** options.
3. Enforced at serve time in `src/app/api/game/solo/route.ts`: the server keeps the
   one correct answer plus up to three random distractors, then shuffles. Because the
   server re-checks the submitted answer independently, trimming options can never
   change whether an answer is scored correct.

---

## 2. Scoring — each question is worth 0, 1, or 2 points

Two ingredients, nothing else (no speed, no difficulty, no luck bonus):

| Ingredient | Points | Earned when |
|-----------|:------:|-------------|
| **Base** | **+1** | the answer is correct |
| **Streak** | **+1** | the answer is correct **and** it is the **3rd (or later) correct answer in a row** |

- **Maximum per question = 2** (base + streak). Never more.
- A **wrong answer = 0 points** and **cuts the streak back to zero**.

### The streak rule in one line

> The streak bonus starts on the **third** correct answer in a row.

So a clean run of correct answers scores:

```
correct #1  → 1   (base)
correct #2  → 1   (base)            ← still building the streak
correct #3  → 2   (base + streak)   ← streak bonus begins here
correct #4  → 2   (base + streak)
correct #5  → 2   (base + streak)
...every later correct → 2
```

If the player gets one wrong, the streak resets. The **next** correct answer starts
over at 1, and they must reach 3-in-a-row again before the +1 returns:

```
... 2, 2, [WRONG → 0], 1, 1, 2, 2, ...
```

---

## 3. Algorithm (exact)

`currentCorrectStreak` = the number of correct answers in a row **before** this
question (0 at the start of a play, and reset to 0 after any wrong answer).

```
baseScore        = isCorrect ? 1 : 0
streakBonus      = (isCorrect && currentCorrectStreak >= 2) ? 1 : 0   // 3rd correct onward
questionScore    = isCorrect ? (baseScore + streakBonus) : 0          // always 0, 1, or 2
newCorrectStreak = isCorrect ? (currentCorrectStreak + 1) : 0         // wrong → 0
```

A whole play simply threads `currentCorrectStreak` through every question in order
and sums each `questionScore`. Multi-item games (e.g. matching pairs, ticking rows)
treat each item as one "question" unit and thread the streak across the whole play.

### Worked totals

| Play | Result |
|------|--------|
| 5 correct in a row | `1 + 1 + 2 + 2 + 2` = **8** |
| 40 correct in a row | `1 + 1 + 38×2` = **78** (general form for N≥2 all-correct: `2N − 2`) |
| `✓ ✓ ✗ ✓` | `1 + 1 + 0 + 1` = **3** |

---

## 4. Two currencies — keep them straight

- **Rank score** (this policy): the base + streak points above accumulate into the
  player's permanent score, which drives the 6-tier rank ladder
  (`src/lib/ranks.ts`: ROOKIE → RISING → GOLD → PLATINUM → DIAMOND → MYTHIC).
- **Store Points** (claimable reward economy, `src/lib/store-points/`): a **separate**
  currency that is deliberately **streak-free and speed-free** — one correct answer is
  worth a flat amount, gated by an accuracy floor. This anti-inflation rule is
  intentional; **do not** add the streak bonus to Store Points.

---

## 5. What never affects the score

- ❌ **Speed / timing** (removed 2026-06-19) — fast and slow correct answers score the same.
- ❌ **Difficulty** — every correct answer is worth the same base of 1.
- ❌ **Random / "dopamine" bonuses** — kept at 0 for data-shape compatibility only.

Keep scoring logic in `quiz-scoring.ts`; never add a second scoring formula. Route
every new game mode through `game-engine.ts` `calculateScore()`.
