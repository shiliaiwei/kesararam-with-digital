# KWD Store Points Economy

Authoritative score-and-economy specification for Kesararam With Digital. This is
the system the product records scores against — the single source of truth.

- **Status: FINAL spec** (supersedes the four-value Mastery/XP/Season/Reward model
  in `docs/gamification-system-research.md` for the spendable economy)
- Maximum earned from one play: 60 Store Points
- Typical successful play: 30-50 Store Points
- Eligible modes: every current solo and live game
- **Eligible users: account `role = 'student'` ONLY** — staff, teachers, and
  admins never earn or store Store Points (see §1.1)
- **Existing scores: DELETE all and start fresh** (decided 2026-06-16, superseding
  the earlier convert-300:1 plan; see §10). The `store_point_events` ledger begins
  empty and every learner starts at 0. Reward prices still use the 300:1
  calibration in §7.2 (that ratio sizes prices, not balances).
- Research and calibration date: June 15, 2026
- Spec finalized: June 16, 2026
- Product timezone: Asia/Phnom_Penh

This report supersedes the large Store Credit examples in
`docs/gamification-system-research.md`. Accuracy, mastery, badges, and learning
history remain separate from the spendable Store Points balance.

## 1. Decision

Use one simple spendable currency named **Store Points**.

Every authenticated **student** can earn Store Points from every current game type,
including solo and teacher-hosted live activities, when the result is validated
by the server.

### 1.1 Eligibility — students only (hard rule)

Store Points are a **student-only** currency. The server must enforce this on
every award path; the client must never be trusted to assert eligibility.

```text
A Store Point award is allowed ONLY when:
  the authenticated account exists, AND
  account.role = 'student'

For every other role (admin, staff, teacher, or any future role):
  no Store Point event is created,
  no balance is incremented,
  the play still records mastery / history / streak as normal (learning data),
  the result screen shows "Practice — no Store Points (staff/teacher account)".
```

Rules:

1. Eligibility is decided **server-side** from the stored account role, not from
   any client field, query parameter, or token claim the client can set.
2. A non-student playing a game produces **zero** Store Point events. It must not
   write a `0` event either — it writes **no** event at all, so non-student rows
   never appear in the economy ledger.
3. Any pre-existing balance or ledger row owned by a non-student account is
   **invalid**. On migration, delete or zero every Store Point balance and event
   for accounts where `role <> 'student'` (see §10).
4. If an account's role later changes away from `student`, freeze its balance
   (no new earning) and exclude it from economy leaderboards.
5. Leaderboards, levels, and the store are computed only from student events.

One play must award:

```text
Minimum: 0 Store Points
Maximum: 60 Store Points
Typical result at about 80% accuracy: 30-50 Store Points
```

Do not award thousands of points. Do not multiply a question by 600, 800, or
1,000 for the store economy.

Store Points must not depend on:

- reaction speed;
- answer streaks;
- subscription level;
- payment;
- public profile settings;
- leaderboard rank.

Store Points should depend on:

- valid completion;
- accuracy;
- the number of meaningful learning units;
- server verification.

## 2. Research conclusion

There is no education or gamification standard that says a correct answer must
be worth 10, 100, or 1,000 points. The numeric scale is a product-economy
decision.

Research supports using points as clear performance feedback, but the effect of
gamification depends on context, autonomy, competence, feedback, and social
design. The point number itself is not the learning mechanism.

The defensible KWD principles are:

1. Learners can understand the calculation.
2. Equivalent effort receives comparable rewards.
3. Accuracy matters more than speed.
4. A short activity cannot pay as much as a substantially longer activity.
5. Repeating one easy activity cannot generate unlimited currency.
6. Store prices are shown directly with simple round numbers.
7. Badges require criteria and evidence rather than only a point threshold.
8. The currency must not hide real-money costs or use manipulative urgency.

The proposed 60-point cap is therefore a KWD design standard, not a claim that
scientific research discovered 60 as a universal number.

## 3. Store Points formula

### 3.1 Learning unit

A learning unit is one independently validated decision:

- one quiz question;
- one sign identification;
- one sign-to-meaning pair;
- one scenario decision;
- one worksheet row;
- one normalized Traffic Commander scene.

Complex activities must define learning units on the server. A scene with many
objects cannot automatically generate more Store Points.

### 3.2 Calculation

```text
if the play is incomplete, invalid, or accuracy is below 40%:
  Store Points = 0

otherwise:
  units = min(valid learning units, 10)
  accuracy = correct learning units / total valid learning units

  performance = round(50 * accuracy * units / 10)
  completion_bonus = 5
  quality_bonus = 5 if accuracy >= 80%, otherwise 0

  Store Points = min(60, performance + completion_bonus + quality_bonus)
```

### 3.3 Result table

| Eligible units | 40% accuracy | 60% accuracy | 80% accuracy | 100% accuracy |
|---:|---:|---:|---:|---:|
| 5 | 15 | 20 | 30 | 35 |
| 6 | 17 | 23 | 34 | 40 |
| 8 | 21 | 29 | 42 | 50 |
| 9 | 23 | 32 | 46 | 55 |
| 10 or more | 25 | 35 | 50 | 60 |

This table keeps one play below or equal to 60 points while recognizing that a
five-question activity requires less effort than a standard ten-question
activity.

## 4. Worked examples

### Five-question Daily Challenge

Dara answers 4 of 5 correctly:

```text
units = 5
accuracy = 4 / 5 = 80%
performance = round(50 * 0.80 * 5 / 10) = 20
completion bonus = 5
quality bonus = 5

Store Points = 30
```

### Ten-question Quick Quiz

Dara answers 8 of 10 correctly:

```text
units = 10
accuracy = 8 / 10 = 80%
performance = round(50 * 0.80 * 10 / 10) = 40
completion bonus = 5
quality bonus = 5

Store Points = 50
```

### Twenty-question Mixed Practice

Dara answers 16 of 20 correctly:

```text
reward units = min(20, 10) = 10
accuracy = 16 / 20 = 80%
performance = round(50 * 0.80 * 10 / 10) = 40
completion bonus = 5
quality bonus = 5

Store Points = 50
```

The longer activity gives stronger mastery evidence, but one play still cannot
inflate the store economy beyond 60 points.

### Unsuccessful play

Dara answers 3 of 10 correctly:

```text
accuracy = 30%
accuracy is below the 40% Store Points threshold

Store Points = 0
```

The attempt still appears in learning history and produces corrective feedback.
It simply does not create spendable currency.

## 5. Estimates for every current game

The estimates use each mode's current default activity size and approximately
80% accuracy.

| Game type | Mode | Default validated units | Estimated Store Points | Perfect-play maximum |
|---|---|---:|---:|---:|
| Quick Quiz | Solo or live | 10 questions | 50 | 60 |
| Speed Round | Solo or live | 20 questions | 50 | 60 |
| Sign Challenge | Solo or live | 15 questions | 50 | 60 |
| Mixed Practice | Solo or live | 20 questions | 50 | 60 |
| Daily Challenge | Solo | 5 questions | 30 | 35 |
| Who Goes First? | Solo | 5 scenes | 30 | 35 |
| Traffic Commander | Solo | 5 normalized scenes | 30 | 35 |
| Sign Match | Solo | 6 sign pairs | 34 | 40 |
| Catch the Sign | Solo | 8 signs | 42 | 50 |
| Traffic Light Hero | Solo | 9 decisions | 46 | 55 |
| Safe Street Smart | Solo | 10 questions | 50 | 60 |
| Road Safety Adventure | Solo | 8 decisions | 42 | 50 |
| Connect the Signs | Solo | 20 pairs | 50 | 60 |
| Matching Sign Word Bank | Solo | 16 placements | 50 | 60 |
| Click the Sign | Solo | 12 worksheet rows | 50 | 60 |

Every listed game is eligible for Store Points. Live and solo use the same
formula. A live game does not pay more merely because a teacher hosted it.

## 6. Replay and anti-farming rules

All games can earn Store Points, but the same result cannot be submitted
repeatedly for unlimited currency.

Recommended rules:

1. The learner must be authenticated.
2. Correctness, activity content, and completion are validated on the server.
3. Only the best result for one game type on one day is reward eligible.
4. A replay can award only the positive difference.
5. Example: first result is 30 points, replay result is 45 points, award only
   `+15`.
6. Replaying after a 60-point result awards no additional Store Points that day.
7. Recommended initial weekly Store Points cap: 300.
8. Plays after the cap still update mastery, history, streaks, and badges.
9. A reversed or fraudulent attempt creates a negative ledger event.
10. All award writes require a unique idempotency key.

A 300-point weekly cap represents approximately:

- five perfect standard plays; or
- six successful standard plays at about 80%; or
- ten successful five-question activities.

This cap should be reviewed after a four-week pilot using actual completion and
redemption data.

## 7. Store prices

### 7.1 Production data calibration

Production snapshot on June 15, 2026:

```text
Average recorded legacy play: 13,713 points
Maximum recorded legacy play: 30,498 points
Target average small-number play: about 45 points
```

Logical migration ratio:

```text
13,713 / 45 is approximately 305
Use a simple conversion ratio of 300 legacy points = 1 Store Point
```

This ratio preserves approximately the existing effort required for rewards
while removing three unnecessary digits.

### 7.2 Recommended converted prices

| Store item | Current legacy price | Recommended Store Points | Estimated successful plays at 45 points |
|---|---:|---:|---:|
| Eraser | 75,000 | 250 | 6 |
| Pencil | 120,000 | 400 | 9 |
| Pen | 190,000 | 650 | 15 |
| Ruler | 280,000 | 950 | 22 |
| Highlighter | 420,000 | 1,400 | 32 |
| Notes | 600,000 | 2,000 | 45 |
| Notebook | 880,000 | 3,000 | 67 |
| Kit | 1,350,000 | 4,500 | 100 |
| Planner | 2,000,000 | 6,500 | 145 |

Prices are rounded for readability. Do not use manipulative prices such as 399
or 999 merely to make an item appear cheaper.

Because the new proposal allows solo games to earn Store Points, the weekly cap
is important. Without a cap, reward supply would increase significantly compared
with the current live-only claim system.

## 8. Balance and level behavior

Store spending must not erase the learner's progress history.

Maintain three derived totals:

```text
Store balance = all Store Points earned - points spent or held
Lifetime earned = all valid Store Points ever earned
Weekly earned = valid Store Points earned in the current week
```

Use:

- Store balance for purchasing;
- Lifetime earned for levels;
- Weekly earned for a class leaderboard, if desired.

These are three views of the same Store Point award events, not three different
currencies.

Example:

```text
Dara has:
  Store balance: 420
  Lifetime earned: 1,850
  Weekly earned: 160

Dara spends 400 on a Pencil:
  Store balance becomes 20
  Lifetime earned remains 1,850
  Weekly earned remains 160
```

## 9. Required data record

Each Store Point award should contain:

```text
store_point_events
  id
  user_id
  game_type
  attempt_id
  play_date
  valid_units
  correct_units
  accuracy
  performance_points
  completion_bonus
  quality_bonus
  delta
  reason
  score_version
  idempotency_key UNIQUE
  created_at
```

Before inserting any `store_point_events` row, the server must re-check that the
owning account's `role = 'student'` (see §1.1). A failed check inserts no row.

Recommended score version:

```text
store_score_version = 1
```

Store claims should create hold, spend, release, or refund events instead of
directly overwriting the balance.

## 10. Migration

Chosen path (decided 2026-06-16): **delete all existing scores and start fresh.**
No balance is carried forward; every learner begins at 0 Store Points. This
supersedes the earlier convert-300:1 plan.

1. Back up the database first (`npm run backup`).
2. Freeze the old score economy at a published date and time.
3. **Wipe all legacy score data** with `scripts/reset-scores.ts`
   (`npm run db:reset-scores` dry-run, then `-- --confirm`). This empties
   `points_ledger`, `game_scores`, `game_attempts`, `daily_attempts`,
   `user_streaks`, legacy quiz/challenge/leaderboard tables, and zeros
   `users.lifetime_points / highest_score / total_games_played` and
   `claimed_rewards`.
4. Ensure `store_point_events` is **empty** (the new ledger starts at zero).
5. Reward prices: apply the table in §7.2 (the 300:1 ratio sizes prices only).
6. Start all new plays on `store_score_version = 1`; only `role = 'student'`
   accounts ever earn (see §1.1).
7. Do not show any legacy raw score anywhere after the freeze.
8. Show learners a short fresh-start notice (English and Khmer).

Example:

```text
Legacy balance: 14,451
Converted balance: ceil(14,451 / 300) = 49 Store Points
```

## 11. User-facing result

Use a small, direct result:

```text
Accuracy: 8 / 10 (80%)
Store Points earned: +50
Store balance: 420
Next reward: Pencil - 400 points
Mastery: Traffic Signs 64% to 69%
```

Do not show:

```text
Match Score: 13,713
Reward Credits: 11
XP: 94
Season Score: 94
```

unless those additional metrics solve a clearly tested product need. The simpler
result is easier for students to understand.

## 12. Acceptance criteria

The Store Points system is ready when:

- only `role = 'student'` accounts earn or store Store Points, enforced
  server-side; non-student plays create zero economy events;
- every current game type can create a server-verified award;
- one play never awards more than 60;
- speed and streak do not change Store Points;
- activities are normalized into valid learning units;
- accuracy below 40% awards zero spendable points;
- a replay awards only a positive daily difference;
- weekly earning caps are server enforced;
- balances are derived from immutable events;
- spending does not reduce lifetime progress;
- legacy balances convert without losing learner value;
- store prices and earning rules are visible in English and Khmer;
- tests cover every game type, thresholds, caps, replay, conversion, and refunds.

## 13. Sources

- Sailer, M. and Homner, L. "The Gamification of Learning: a Meta-analysis":
  https://link.springer.com/article/10.1007/s10648-019-09498-w
- Li, L., Hew, K. F., and Du, J. "Gamification enhances student intrinsic
  motivation, perceptions of autonomy and relatedness, but minimal impact on
  competency":
  https://link.springer.com/article/10.1007/s11423-023-10337-7
- 1EdTech, Open Badges and evidence-based achievement records:
  https://www.1edtech.org/standards/open-badges
- UK Information Commissioner's Office, Age Appropriate Design Code:
  https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/
