# KWD Game System Redesign Q&A

This note translates the gamification ideas into the current KWD game structure.
It is intentionally product-specific: live classroom games, solo practice,
GameKit formats, Store Points, leaderboard, rank, streak, and reward shop.

## Core Rule

Question: What is the new Store Points formula?
Answer: Store Points are based on valid completion, accuracy, and the real
question/unit count. Speed, streak, rank, subscription, and payment do not affect
spendable Store Points.

```text
if invalid, incomplete, or accuracy < 40%:
  Store Points = 0

accuracy = correctUnits / totalUnits
rewardUnits = min(totalUnits, 30)
Store Points = min(60, round(60 * accuracy * rewardUnits / 30))
```

Question: When can a student earn the maximum 60 Store Points?
Answer: Only when the play has at least 30 validated learning units and the
student reaches 100% accuracy.

Question: What happens if a live or solo play has fewer than 30 questions?
Answer: The maximum becomes lower, based on the question count. For example,
10 questions can reach at most 20 Store Points, 15 questions can reach 30, and
20 questions can reach 40.

Question: Why remove completion and quality bonuses?
Answer: The user-facing goal is accuracy-first scoring. Bonus terms made short
plays too valuable and made the result harder to explain.

## Current KWD Layers

Question: What is Match Score?
Answer: Match Score is the visible in-game score used for live ranking and
feedback. It can include speed and streak because it is not spendable currency.

Question: What is Store Points?
Answer: Store Points are the reward-shop economy. They are server-validated,
student-only, capped at 60 per play, and recorded in `store_point_events`.

Question: Why keep Match Score and Store Points separate?
Answer: Match Score makes games exciting. Store Points must stay fair, auditable,
and hard to farm.

Question: Which code owns Match Score?
Answer: `src/lib/game-engine.ts` through `calculateScore()`.

Question: Which code owns Store Points?
Answer: `src/lib/store-points/score.ts` through `calculateStorePoints()`, and
`src/lib/store-points/award.ts` through `awardStorePoints()`.

Question: Which users can earn Store Points?
Answer: Only accounts with `role = 'student'`. Teachers, staff, and admins can
play for testing or practice, but they do not create Store Point events.

## Algorithm Decisions

Question: Point calculation algorithm?
Answer: Use the Store Points formula above for spendable points. Use Match Score
only for live game excitement and ranking.

Question: XP calculation algorithm?
Answer: Do not create a second currency yet. Derive future XP from lifetime
earned Store Points or mastery events so students do not see confusing numbers.

Question: Score formula algorithm?
Answer: Keep two formulas: Match Score for gameplay, Store Points for rewards.
Never mix speed/streak into Store Points.

Question: Reward distribution algorithm?
Answer: Award through `awardStorePoints()`: student role check, formula, daily
best-difference, weekly cap, idempotency key.

Question: Bonus calculation algorithm?
Answer: Keep bonuses out of Store Points. Bonuses may appear as Match Score,
badges, or non-spendable achievement feedback.

Question: Penalty calculation algorithm?
Answer: Do not apply harsh negative currency. Incorrect answers lower accuracy,
which naturally lowers Store Points.

Question: Rank calculation algorithm?
Answer: Rank students by lifetime earned Store Points for economy rank, or by
Match Score inside one live session.

Question: Leaderboard sorting algorithm?
Answer: Public Store Points leaderboard sorts by earned Store Points, then
accuracy, then recent activity. Live session leaderboard sorts by Match Score.

Question: Streak tracking algorithm?
Answer: Track daily learning streak and correct-answer streak separately.
Correct-answer streak can affect Match Score, not Store Points.

Question: Accuracy calculation algorithm?
Answer: `accuracy = correctUnits / totalUnits`. The denominator must be the full
server-validated unit count, not only answered-correct rows.

Question: Speed scoring algorithm?
Answer: Speed belongs to Match Score. Clamp impossible response times and use the
server clock for live sessions.

Question: Difficulty scaling algorithm?
Answer: Difficulty may change Match Score or adaptive recommendations. Store
Points should not multiply by difficulty until there is strong anti-cheat and
content calibration.

Question: Progress tracking algorithm?
Answer: Track topic completion, first-attempt accuracy, retry accuracy, and weak
topics per student. These should drive learning recommendations.

Question: User level algorithm?
Answer: Level can be derived from lifetime earned Store Points or mastery count.
Do not make level a separate earnable balance.

Question: Badge unlock algorithm?
Answer: Unlock badges from clear evidence: perfect 10-question play, 7-day
streak, 80%+ accuracy in a category, or finishing mistake review.

Question: Achievement unlock algorithm?
Answer: Achievements should be milestones with evidence, not random rewards.
Example: "Road Sign Master" after 90% accuracy across sign topics.

Question: Mission generation algorithm?
Answer: Generate small daily missions from weak topics and incomplete categories.
Example: "Answer 10 warning-sign questions with 80% accuracy."

Question: Daily challenge algorithm?
Answer: Keep one shared daily set per day so students compete fairly on the same
questions.

Question: Weekly challenge algorithm?
Answer: Use topic rotation: signs, priority, traffic light, safety scenarios,
then mixed review.

Question: Reward shop algorithm?
Answer: Use `store_point_events` balance, never legacy raw scores. Purchases
should be hold/spend/refund events.

Question: Point economy algorithm?
Answer: Keep the weekly cap and daily best-difference. This prevents farming one
easy mode repeatedly.

Question: Anti-cheat score validation algorithm?
Answer: Validate answers server-side, use stable attempt ids, reject impossible
time windows, and make duplicate submissions idempotent.

Question: Suspicious activity detection algorithm?
Answer: Flag patterns like impossible speed, repeated perfect runs, many
identical attempts, and score jumps outside the formula.

Question: Skill rating algorithm?
Answer: Start with mastery per category: recent accuracy, first-attempt accuracy,
mistake recovery, and spaced retention.

Question: Matchmaking algorithm?
Answer: For future team/class games, match students by recent mastery band, not
only total points.

Question: Adaptive learning algorithm?
Answer: Prefer weak topics, recently missed questions, and spaced review before
serving random new questions.

## Modes To Build First

Question: Which modes should KWD build first?
Answer: Build in this order:

1. Classic Quiz Mode
2. Speed Mode
3. Accuracy Mode
4. Streak Mode
5. Daily Challenge Mode
6. Leaderboard Mode
7. Rank Mode
8. Reward Shop Mode
9. Mistake Review Mode
10. Adaptive Practice Mode
11. Anti-Cheat Mode

Question: Why this order?
Answer: It matches the current app. KWD already has live sessions, solo quiz,
daily challenge, GameKit modes, leaderboard, and reward-shop data. The next
improvements should standardize scoring first, then add smarter learning.

Question: Which generic modes should wait?
Answer: Tournament, team battle, mystery box, lucky draw, and Elo matchmaking
should wait until the scoring economy and anti-cheat rules are stable.

## Formula Study Sheet

Question: Final Store Points formula?
Answer:

```text
Store Points = min(60, round(60 * accuracy * min(totalUnits, 30) / 30))
```

Question: Accuracy rate formula?
Answer:

```text
Accuracy Rate = Correct Units / Total Units * 100
```

Question: Perfect-play maximum formula?
Answer:

```text
Perfect Max = min(60, round(60 * min(totalUnits, 30) / 30))
```

Question: Example for 10 questions and 100% accuracy?
Answer:

```text
min(60, round(60 * 1.0 * 10 / 30)) = 20 Store Points
```

Question: Example for 20 questions and 80% accuracy?
Answer:

```text
min(60, round(60 * 0.8 * 20 / 30)) = 32 Store Points
```

Question: Example for 30 questions and 100% accuracy?
Answer:

```text
min(60, round(60 * 1.0 * 30 / 30)) = 60 Store Points
```

Question: What is the most important implementation rule?
Answer: Every route must send the real server-validated `totalUnits` and
`correctUnits` into `awardStorePoints()`. The client should never decide earned
Store Points.
