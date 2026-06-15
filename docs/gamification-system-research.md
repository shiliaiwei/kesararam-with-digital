# KWD Education Gamification System

Research, product rules, scoring standard, leaderboard design, badge model, and
technical roadmap for Kesararam With Digital.

- Status: Research + background. The **authoritative scoring/economy spec is
  [`docs/store-points-economy.md`](./store-points-economy.md)** — build to that.
- Research date: June 15, 2026
- Product timezone: Asia/Phnom_Penh
- Audience: students, teachers, administrators, product designers, and engineers

> ## Final decisions (recorded 2026-06-16)
>
> These supersede any conflicting proposal below. The spendable economy is a
> single currency, **Store Points**, defined fully in
> [`store-points-economy.md`](./store-points-economy.md).
>
> 1. **One spendable currency: Store Points.** Max 60 per play; based on accuracy,
>    completion, and learning units; **no speed, no streak**. The four-value model
>    in §1 below is background only and is NOT the system of record.
> 2. **Students only.** Only accounts with `role = 'student'` earn or store points.
>    Staff, teachers, and admins never earn or store; their plays record learning
>    data only. Enforced server-side. (Economy spec §1.1.)
> 3. **Legacy scores: delete all, start fresh** (decided 2026-06-16, superseding
>    the earlier convert-300:1 plan). Every learner starts at 0; the new
>    `store_point_events` ledger begins empty. The 300:1 ratio is kept only to
>    size reward prices. (Economy §10.)
> 4. **Match Score** (the big in-game number) stays as transient per-activity
>    feedback only — never spendable, never a mastery claim.

## 1. Executive decision

KWD should not use one "point" value for every purpose. A single number cannot
simultaneously represent knowledge, game performance, long-term progress,
leaderboard position, and purchasing power without becoming confusing and easy
to exploit.

Use four clearly named values:

| Value | Purpose | Can decrease? | Can be spent? | Uses speed? |
|---|---|---:|---:|---:|
| Mastery | Evidence that a learner knows a topic | Yes, as evidence changes | No | No |
| XP | Permanent account progression and levels | No | No | No |
| Season Score | Weekly or monthly competition | Resets each season | No | Optional, small |
| Reward Credits | Teacher-verified physical reward balance | Yes, when spent | Yes | No |

The game result screen can still show a temporary Match Score. Match Score is
for the current activity only and must not be presented as proof of mastery or as
spendable currency.

The recommended default experience is:

1. Answer a short set of questions.
2. Receive immediate correctness feedback and a short explanation.
3. See accuracy first, then Match Score, XP, badge progress, and next action.
4. Revisit weak content later through spaced retrieval.
5. Compare progress on a class or nearby-peer seasonal leaderboard.
6. Earn badges for demonstrated learning, consistency, exploration, and
   improvement.

The goal is sustained learning, not maximum screen time.

## 2. What the research supports

### 2.1 Gamification can help, but mechanics are not magic

Meta-analytic evidence finds generally positive but heterogeneous effects of
gamification on cognitive, motivational, and behavioral outcomes. The strongest
conclusion is not "add points and learning improves." The result depends on the
learning task, feedback, social structure, and how individual mechanics are
combined.

KWD implication:

- Start with a valid learning loop.
- Add game mechanics that make progress visible.
- Do not use game mechanics to hide weak questions, unclear feedback, or poor
  content sequencing.

### 2.2 Retrieval and spacing should be the learning engine

Retrieving an answer from memory and revisiting it after a delay are better
supported learning strategies than repeated passive reading. Points should
encourage these behaviors:

- first attempts;
- correcting a misconception;
- returning to a weak topic later;
- demonstrating the same skill on different questions;
- retaining knowledge across multiple days.

Points should not primarily reward opening pages, leaving a tab active, or
repeating the easiest question set.

### 2.3 Feedback must explain, not only celebrate

Immediate feedback is useful when it tells the learner:

- whether the answer was correct;
- why it was correct;
- why a common distractor was wrong;
- what rule or sign applies;
- what to do next.

Confetti, sound, rank movement, and score animation are secondary feedback.

### 2.4 Motivation requires autonomy, competence, and relatedness

Self-Determination Theory identifies three relevant needs:

- Autonomy: meaningful choices, optional modes, and control over privacy.
- Competence: clear goals, understandable rules, progress, and useful feedback.
- Relatedness: class teams, supportive comparison, and shared goals.

KWD should therefore provide choice of learning activity, show specific progress,
and combine competition with class collaboration.

### 2.5 Leaderboards need macro and micro views

Research on educational leaderboard design recommends combining:

- Macro boards: overall seasonal or class performance.
- Micro boards: category mastery, improvement, consistency, or team goals.

A single global lifetime board mainly motivates learners already near the top.
Students far behind have little reason to believe they can catch up.

### 2.6 Points, badges, and leaderboards are feedback instruments

Experiments indicate that common mechanics can increase task performance, but
they do not automatically increase intrinsic motivation. They work best when
they communicate competence and progress rather than control the learner.

### 2.7 The "learning pyramid" percentages should not be used

The supplied pyramid that claims fixed retention rates such as 5% for lectures,
10% for reading, and 90% for teaching others is not supported by identifiable,
credible original research. The broad idea that active retrieval and practice
can be valuable is reasonable, but the percentages must not be used to set KWD
scores, product claims, or learning analytics.

### 2.8 Child-centered design rules

KWD serves school-age learners. Avoid manipulative patterns such as:

- unpredictable chance rewards;
- artificial scarcity intended to create anxiety;
- public shame for a broken streak;
- making privacy loss the easiest choice;
- excessive pressure to keep playing;
- confusing virtual currencies;
- pay-to-win rank advantages.

Use positive reminders, stopping points, high privacy defaults, and transparent
reward rules.

## 3. Interpretation of the supplied reference images

### "How Gamification Works"

Useful:

- points;
- badges;
- levels;
- leaderboards;
- challenges;
- immediate feedback;
- clear goals;
- achievable tasks.

Missing:

- learning validity;
- accessibility;
- privacy;
- anti-cheat controls;
- score auditability;
- spaced retrieval;
- safeguards for lower-ranked learners.

### Badge illustration

Useful as a visual reminder that achievements need distinct identities. It does
not define badge criteria. A badge is credible only when its criteria and
evidence are explicit.

### PBGL mechanic grid

Useful as an idea inventory, not as a requirement list. KWD does not need every
mechanic. Add a mechanic only when it supports a specific learning or social
goal.

### Learning pyramid

Do not use the percentages. Replace it in product research with retrieval
practice, distributed practice, feedback, and mastery evidence.

## 4. Current KWD system audit

### 4.1 Existing strengths

The repository already has important foundations:

- a shared `calculateScore()` function for modern modes;
- server-timed scoring for live sessions;
- answer-level score breakdowns;
- unique daily attempts;
- a points ledger for time-windowed aggregation;
- live and solo source separation;
- user profile statistics;
- daily streak data;
- rank tiers and progress calculations;
- reward claim workflow;
- bilingual user interfaces;
- per-field profile privacy flags;
- tests for score boundaries and question selection.

These should be evolved rather than replaced without a migration plan.

### 4.2 Priority-zero integrity issues

#### P0.1 Solo scoring trusts client claims

`src/app/api/game/solo/complete/route.ts` accepts `isCorrect`, `difficulty`,
`timeTakenMs`, `timePerQuestion`, and `scoringMode` from the client and uses them
to create score and ledger rows.

Impact:

- a modified client can submit every answer as correct;
- a client can label every question hard;
- a client can submit unrealistically fast times;
- a client can choose the scoring mode;
- the solo leaderboard is not trustworthy.

Required fix:

- submit only `attemptId`, `questionId`, `answerId`, and an idempotency key;
- load question, difficulty, and correct answer on the server;
- calculate elapsed time from server timestamps;
- reject questions or answers not assigned to the attempt.

#### P0.2 Live answers are not constrained to the current question

The live answer route checks whether `answerId` is marked correct, but does not
also require `answers.questionId = questionId`.

Impact:

- a known correct answer ID from another question can be submitted;
- the answer can be scored as correct for the current question.

Required fix:

Query with both conditions:

```ts
and(eq(answers.id, answerId), eq(answers.questionId, questionId))
```

Also verify that the question belongs to the session's assigned question set.

#### P0.3 End-of-session score sync is not transactional

The live session is marked `scoresSynced = true` before all user totals and
ledger rows are written. Writes occur one participant at a time. Errors are
caught and not retried.

Impact:

- a mid-loop database failure can update some students but not others;
- the session remains marked synced;
- a retry skips the missing students;
- `users.lifetimePoints` and `pointsLedger` can disagree.

Required fix:

- use one database transaction;
- add a unique ledger idempotency key such as
  `(user_id, source_type, source_id, metric)`;
- insert ledger events first with `ON CONFLICT DO NOTHING`;
- derive or atomically update aggregates;
- mark the session synced only after all writes succeed.

### 4.3 Priority-one consistency issues

#### P1.1 All-time and windowed boards count different economies

The unfiltered all-time board reads `users.lifetimePoints`, which currently
represents live points. Windowed boards sum `pointsLedger`, which can include
live and solo points.

The same "All Sources" label therefore has different meanings depending on the
time tab.

#### P1.2 Solo-only students can be excluded

The common user filter requires `users.lifetimePoints > 0`. A student with solo
ledger points but no live lifetime points can be excluded from a solo board.

#### P1.3 Some filters cannot return data

Daily, priority puzzle, and several GameKit activities do not currently write to
`pointsLedger`. Adding them to a leaderboard filter produces an empty result,
not a meaningful board.

#### P1.4 Tie ranking is not dense

The route says ranking is dense, but assigns `offset + index + 1`. Equal scores
receive different ranks.

#### P1.5 The current leaderboard tests are stale

On June 15, 2026, the targeted run produced:

- score engine: 6 tests passed;
- leaderboard API: 9 tests failed.

The tests expect an older authenticated endpoint with `period`, `categoryId`,
and a different response shape. They no longer test the current route.

#### P1.6 Public identity bypasses existing flags

The leaderboard always returns real display names and usernames and forces
`isUsernamePublic: true`, even though profile privacy fields exist.

For school-age users, the safe default is a nickname or generated public alias.
Real names, school, grade, section, and province should be opt-in and scoped.

#### P1.7 Time windows are rolling, not calendar periods

"Weekly" currently means the last 7 days and "Monthly" means the last 30 days.
Either:

- label them "Last 7 Days" and "Last 30 Days"; or
- implement calendar weeks and months in Asia/Phnom_Penh.

#### P1.8 Returned `total` is not the total result count

The API returns the number of rows on the current page, not the total number of
eligible learners. Pagination UI cannot rely on it.

### 4.4 Priority-two product and design issues

#### P2.1 Speed and streak bonuses are too influential for learning

Current live scoring uses:

- base: 600, 800, or 1,000;
- speed range: 50% to 100% of base;
- streak bonus: up to 500.

For an easy question, the streak bonus can be 83% of the base value. This is
appropriate for an arcade-style Match Score, but too strong for XP, mastery, or
reward currency.

#### P2.2 Several scoring engines still exist

Modern games use `calculateScore()`, while legacy quiz and challenge paths use a
different content-point formula. A user can receive materially different value
for equivalent learning depending on the route.

#### P2.3 Rank and reward thresholds are arbitrary

Current production aggregate snapshot on June 15, 2026:

- 100 active student accounts;
- 6 students with nonzero live lifetime points;
- average nonzero lifetime points: 14,451;
- 18 ledger plays;
- average points per ledger play: 13,713;
- maximum ledger play: 30,498.

At that rate:

- the 10,000-point second tier is commonly reached in one live play;
- the 30,000-point tier is commonly reached in two to three plays;
- the first 75,000-point physical reward takes roughly five to six average plays.

Thresholds should be calibrated against a target number of successful sessions,
not chosen only because the numbers look large.

#### P2.4 No real badge data model exists

Rank tiers and reward rarities are not a badge system. KWD needs badge
definitions, criteria versions, progress, award records, evidence, and featured
badge selection.

#### P2.5 Internal design language uses pressure tactics

Comments currently describe psychological pressure, loss aversion, variable
ratio reinforcement, artificial desire, and funnel movement. Those goals should
be replaced with transparent learning goals, learner agency, and wellbeing
guardrails.

#### P2.6 Some rank visuals conflict with the KWD design system

`src/lib/rank-utils.ts` stores emoji icons. KWD user-facing icons should use
Lucide or Material Symbols. Rank-tier gradients may be retained only as the
documented rank-tier exception; structural cards still require flat fills, black
borders, and hard shadows.

## 5. Recommended score standard

> Update, June 15, 2026: the final small-number store economy is defined in
> [`docs/store-points-economy.md`](./store-points-economy.md). It caps one play
> at 60 Store Points and makes every server-validated solo and live game
> eligible. Its currency calculations supersede the larger Reward Credit
> examples below.

### 5.1 Metric A: Mastery

Mastery answers: "How strong is the learner's evidence for this topic?"

Show mastery as a level and percentage, not as a currency.

Suggested states:

| State | Evidence |
|---|---|
| Not Started | No valid attempts |
| Learning | Some evidence, below proficiency |
| Proficient | At least 80% across at least 10 valid items |
| Mastered | At least 90% across at least 20 valid items on at least 3 days |

Additional rules:

- use unique or meaningfully varied questions;
- weight recent evidence more than very old evidence;
- require spaced confirmation for Mastered;
- do not include speed;
- do not give mastery for repeated memorization of one answer;
- show weak subtopics and recommended next practice.

Mastery can fall if later evidence shows a misconception. XP must not fall.

### 5.2 Metric B: Match Score

Match Score answers: "How did the learner perform in this one activity?"

Use a predictable 0-1,000 scale per question:

```text
if wrong:
  score = 0

if correct:
  core       = 750
  difficulty = easy: 0, medium: 50, hard: 100
  speed      = speed mode only:
               round(100 * sqrt(clamp(remaining_ms / total_ms, 0, 1)))
  streak     = min(max(streak - 1, 0) * 10, 50)

  score = min(1000, core + difficulty + speed + streak)
```

Properties:

- correctness contributes at least 75% of the maximum;
- speed contributes at most 10%;
- streak contributes at most 5%;
- harder valid items can contribute more;
- wrong answers always earn zero Match Score;
- practice modes disable speed by default;
- accessibility accommodations can disable speed without affecting XP,
  mastery, badges, or credits.

The exact constants should be versioned as `score_version = 2`.

### 5.3 Metric C: XP

XP answers: "How much verified learning activity has the account completed?"

Recommended XP formula:

```text
xp =
  10 * unique_correct_answers
  + 2 * valid_incorrect_answers
  + 10 completion_bonus
  + improvement_bonus from 0 to 20
```

Rules:

- no speed bonus;
- no answer streak bonus;
- repeated identical questions on the same day earn reduced or zero XP;
- server-selected remediation questions can earn full XP;
- completion bonus requires a valid minimum activity length;
- improvement bonus compares equivalent content, not unrelated games;
- XP is permanent and cannot be spent.

Use XP for account levels and lifetime progression.

### 5.4 Metric D: Season Score

Season Score answers: "How much verified progress has the learner made during
this competition period?"

Recommended rule:

- Season Score equals eligible XP earned during the season.
- Apply per-question and per-activity anti-farming limits.
- Do not include purchased benefits.
- Reset at the published season boundary.
- Keep past season results as immutable snapshots.

Default season:

- starts Monday at 00:00 Asia/Phnom_Penh;
- ends Sunday at 23:59:59 Asia/Phnom_Penh;
- class board is the default;
- global board requires explicit participation.

### 5.5 Metric E: Reward Credits

Reward Credits answer: "How much teacher-verified reward value is available?"

Recommended live-session rule:

```text
credits =
  correct_answers
  + 2 if accuracy >= 80%
  + 1 if the valid activity is completed
```

Rules:

- no speed bonus;
- no streak bonus;
- only server-authoritative, teacher-hosted sessions are eligible initially;
- one credit grant per participant per session;
- credits are recorded in an immutable ledger;
- spending creates a negative ledger event or a linked claim hold;
- rejection releases the hold;
- fulfillment closes the claim;
- balances are derived, not manually overwritten.

Calibrate reward prices by target effort:

| Reward band | Target qualified live sessions |
|---|---:|
| First small reward | 5-8 |
| Common reward | 8-15 |
| Mid reward | 20-35 |
| Large reward | 50-80 |
| Showcase reward | 100+ |

Publish the earning rule and show estimated sessions to the next reward.

### 5.6 Worked examples: solo and live

The examples below use the proposed scoring standard. They illustrate the
intended product behavior; they do not describe every detail of the current
production implementation.

#### Example learner

The learner is Dara:

- current level: 4;
- current weekly Season Score: 280;
- Traffic Signs mastery: Learning, 64%;
- current daily learning streak: 2 days;
- Reward Credit balance: 18;
- first three eligible activities of the day have not yet been completed.

#### Solo example: Quick Quiz

Dara chooses a five-question Quick Quiz with equal scoring. Speed does not
affect the result.

| Question | Difficulty | Result | Correct-answer streak | Match Score |
|---|---|---|---:|---:|
| 1 | Easy | Correct | 1 | 750 |
| 2 | Medium | Correct | 2 | 810 |
| 3 | Hard | Incorrect | 0 | 0 |
| 4 | Hard | Correct | 1 | 850 |
| 5 | Medium | Correct | 2 | 810 |
| **Total** |  | **4 / 5 correct, 80%** |  | **3,220** |

Progress calculation:

```text
XP =
  4 correct * 10
  + 1 valid incorrect * 2
  + 10 completion
  = 52 XP

Season Score = 52
Reward Credits = 0
```

Profile result:

- XP increases by 52;
- weekly Season Score increases from 280 to 332;
- the five answers update Traffic Signs mastery evidence;
- the incorrect hard question is scheduled for later review;
- Reward Credits remain 18 because this was solo practice;
- Dara may receive badge progress, but not a badge unless its full criteria are
  satisfied.

#### Live example: Speed Round

Dara joins a teacher-hosted five-question Speed Round. Match Score includes a
small speed component, but XP and Reward Credits do not.

| Question | Difficulty | Response | Result | Streak | Match Score |
|---|---|---:|---|---:|---:|
| 1 | Easy | 6s of 15s | Correct | 1 | 827 |
| 2 | Medium | 9s of 15s | Correct | 2 | 873 |
| 3 | Hard | 7s of 15s | Incorrect | 0 | 0 |
| 4 | Hard | 4s of 15s | Correct | 1 | 936 |
| 5 | Medium | 12s of 15s | Correct | 2 | 855 |
| **Total** |  |  | **4 / 5 correct, 80%** |  | **3,491** |

Progress calculation:

```text
XP =
  4 correct * 10
  + 1 valid incorrect * 2
  + 10 completion
  = 52 XP

Season Score = 52

Reward Credits =
  4 correct answers
  + 2 for at least 80% accuracy
  + 1 completion credit
  = 7 Reward Credits
```

Profile result:

- XP increases by 52;
- weekly Season Score increases by 52;
- Reward Credits increase from 18 to 25;
- mastery receives the same answer evidence as an equivalent solo activity;
- Match Score determines Dara's position in this live session only;
- the class weekly leaderboard uses Season Score, not Match Score;
- the teacher can see the identified class result;
- a public leaderboard uses Dara's approved alias and privacy settings.

#### Live class result example

| Learner | Accuracy | Match Score | Live-session position | XP / Season Score | Reward Credits |
|---|---:|---:|---:|---:|---:|
| Lina | 90% | 7,680 | 1 | 102 | 12 |
| Dara | 80% | 7,020 | 2 | 94 | 11 |
| Vannak | 70% | 6,250 | 3 | 86 | 8 |

This separation is intentional:

- Match Score answers who performed best in this one timed session.
- XP records verified learning activity.
- Season Score creates a fair weekly competition.
- Reward Credits use correctness and completion, not reaction speed.
- Mastery uses answer evidence across multiple activities and days.

#### Solo activity examples by current KWD type

All solo activities can update mastery, XP, personal history, badge progress,
and eligible Season Score. Solo activities do not award Reward Credits.

| Solo activity | Example play | XP example | What else changes |
|---|---|---:|---|
| Quick Quiz (`quick-quiz`) | 8 correct of 10, equal score | 94 | Topic mastery and personal best |
| Speed Round (`speed-round`) | 8 correct of 10 under a 15s timer | 94 | Match Score includes a small speed bonus |
| Sign Challenge (`sign-challenge`) | 12 correct of 15 sign images | 136 | Traffic Signs mastery |
| Mixed Practice (`mixed-practice`) | 16 correct of 20 mixed items | 178 | Mastery evidence across several item types |
| Daily Challenge (`daily`) | 4 correct of 5 | 52 | Daily streak and daily badge progress |
| Who Goes First? (`priority-puzzle`) | 3 correct of 5 scenes | 44 | Right-of-way mastery |
| Traffic Commander (`traffic-commander`) | 3 correct objectives of 4 | 42 | Priority and path-planning evidence |
| Sign Match (`sign-match`) | 8 correct matches of 10 | 94 | Sign-recognition badge progress |
| Catch the Sign (`catch-sign`) | 12 correct catches of 15 | 136 | Sign-recognition mastery evidence |
| Traffic Light Hero (`light-hero`) | 9 correct actions of 12 | 106 | Signal-response mastery evidence |
| Safe Street Smart (`safe-street-smart`) | 4 correct choices of 5 | 52 | Safe-travel topic evidence |
| Safety Adventure (`safety-adventure`) | 6 correct decisions of 8 | 74 | Scenario mastery and exploration progress |
| Connect the Signs (`sign-connect`) | 9 correct pairs of 12 | 106 | Sign-to-meaning evidence |
| Word Bank (`word-bank`) | 10 correct placements of 12 | 114 | Vocabulary and image association evidence |
| Tick the Sign (`tick-sign`) | 10 correct rows of 12 | 114 | Worksheet history and sign mastery |

XP examples use:

```text
10 XP per correct item
+ 2 XP per valid incorrect item
+ 10 XP for completing the activity
```

Activity-specific scoring must normalize what counts as one learning item.
Traffic Commander, for example, must not produce excessive XP merely because a
scene contains more vehicles than another scene.

#### Live activity examples by current KWD type

Teacher-hosted modes use the same mastery and XP rules as solo activities. They
also award Reward Credits because the activity is server-authoritative and
teacher verified.

| Live mode | Example play | Match Score behavior | Progress result |
|---|---|---|---|
| Quick Quiz | 8 correct of 10 | Equal mode normally ignores speed | 94 XP, 94 Season Score, 11 credits |
| Speed Round | 8 correct of 10 | Small speed bonus affects session position | 94 XP, 94 Season Score, 11 credits |
| Sign Challenge | 12 correct of 15 | Image recognition with optional timer | 136 XP, 136 Season Score, 15 credits |
| Mixed Practice | 16 correct of 20 | Mixed item types in one session | 178 XP, 178 Season Score, 19 credits |

Credit examples use:

```text
1 credit per correct answer
+ 2 credits for at least 80% accuracy
+ 1 credit for valid completion
```

For the four examples above:

- 8 / 10 earns `8 + 2 + 1 = 11` credits;
- 12 / 15 earns `12 + 2 + 1 = 15` credits;
- 16 / 20 earns `16 + 2 + 1 = 19` credits.

#### What the learner sees

After either solo or live play, the result screen should read in this order:

```text
Accuracy: 8 / 10 correct (80%)
Traffic Signs mastery: 64% -> 69%
Match Score: 7,020
XP earned: +94
Weekly Season Score: +94
Reward Credits: +11        // live only
Badge progress: Sign Reader 18 / 20
Next step: Review 2 missed signs tomorrow
```

This presentation prevents a fast but inaccurate learner from appearing more
knowledgeable than a careful learner. It also makes the difference between solo
practice, live competition, account progression, and physical rewards explicit.

## 6. Badge standard

### 6.1 Badge categories

Use a balanced badge portfolio:

| Category | What it recognizes | Example criteria |
|---|---|---|
| Onboarding | First successful actions | Complete first valid activity |
| Mastery | Demonstrated knowledge | Master Traffic Signs across 3 days |
| Accuracy | High-quality performance | 95% on at least 20 items |
| Improvement | Growth from prior evidence | Raise a weak topic by 20 points |
| Consistency | Learning on multiple days | Active on 3, 7, 14, or 30 days |
| Exploration | Breadth | Complete valid work in all 8 categories |
| Collaboration | Positive group contribution | Complete a class team target |
| Teacher Recognition | Human-awarded contribution | Helpful participation, with reason |

Do not award badges only for time spent, page opens, or rapid repeated clicks.

### 6.2 Badge tiers

Use at most three tiers for one badge family:

- Bronze: started and demonstrated basic evidence.
- Silver: repeated proficiency.
- Gold: spaced, high-confidence mastery.

Each tier must have clearly different criteria. Do not create many cosmetic
tiers that communicate no additional evidence.

### 6.3 Badge record

Follow the information model used by Open Badges:

- badge definition ID;
- name and bilingual description;
- issuer;
- criteria;
- evidence or result reference;
- recipient;
- issue timestamp;
- criteria version;
- optional expiration;
- optional standards or competency alignment.

### 6.4 Badge user experience

Each badge card should show:

- locked, in progress, earned, or featured state;
- exact progress, such as `14 / 20 valid questions`;
- criteria;
- issue date after earning;
- evidence summary;
- next recommended action.

Avoid random badge drops. Surprise presentation is acceptable only when the
underlying criteria remain deterministic and explainable.

## 7. Level and rank progression

Levels should use XP, not Reward Credits or Season Score.

Design target:

- Level 2 after one good first session.
- Level 3 after two to three sessions.
- First named rank after approximately one week of normal use.
- Higher ranks require sustained learning across weeks, not one unusually large
  score.

Do not finalize thresholds until at least four weeks of clean event data exists.
Use the median and 75th percentile of daily eligible XP to model expected time.

Recommended calibration method:

```text
target_xp(rank) = median_eligible_xp_per_active_day * target_active_days(rank)
```

Example target active days:

| Rank | Target active days |
|---|---:|
| Starter | 0 |
| Explorer | 3 |
| Navigator | 7 |
| Guide | 21 |
| Champion | 45 |
| Master | 90 |

Names and Khmer translations require product and native-language review.

## 8. Leaderboard standard

### 8.1 Default board

The default board should be:

- class scoped;
- current calendar week;
- based on Season Score;
- opt-in for public identity;
- accompanied by the learner's own progress.

Do not make global all-time rank the primary student experience.

### 8.2 Recommended boards

1. Class This Week
2. Around Me
3. Most Improved
4. Category Mastery
5. Team Challenge
6. Province, opt-in
7. Global, opt-in
8. Lifetime XP, secondary historical view

"Around Me" should show the learner, two positions above, and two positions
below. This creates an achievable next goal.

### 8.3 Ranking and tie rule

Use SQL `DENSE_RANK()` for educational boards:

```text
scores: 100, 90, 90, 80
ranks:    1,  2,  2,  3
```

Rules:

- equal Season Score means equal rank;
- stable display order can use a noncompetitive field, but the displayed rank
  remains tied;
- if a physical prize requires one winner, publish a separate tie process before
  the season starts;
- do not silently use response time as a tie-breaker.

### 8.4 Quality before volume

A pure sum board favors learners with more free time. Add one of these controls:

- only the best N activities per day count;
- cap eligible XP per repeated content set;
- add a Most Improved board;
- add mastery boards that require accuracy and spacing;
- use team averages with a minimum participation count.

Recommended first version:

- first 3 valid activities per day earn full Season Score;
- later valid activities earn XP but not Season Score;
- teacher-hosted class activities always remain visible in history.

### 8.5 Privacy

Default public representation:

- generated nickname or approved display alias;
- avatar;
- score and rank;
- no real name, school, grade, section, or province.

Additional fields require opt-in. Teachers can see identified class boards under
their role permissions. Public profile links must not bypass privacy settings.

### 8.6 Leaderboard UI

Show:

- season name and exact end date;
- scoring rules;
- learner's score;
- points to the next nearby position;
- rank change since last completed activity;
- top three;
- around-me group;
- selected board and source;
- last update time;
- empty-state explanation when a mode is not eligible.

Do not show filters for activities that cannot create eligible ledger events.

## 9. Core play loop

### Before an activity

Show:

- learning goal;
- number of questions or rounds;
- time expectation;
- whether speed affects Match Score;
- possible XP and credits;
- accessibility option;
- privacy/board scope.

### After each answer

Show in this order:

1. correct or incorrect;
2. explanation;
3. relevant rule or sign;
4. Match Score breakdown;
5. next action.

Do not interrupt every answer with a large badge animation.

### After an activity

Show in this order:

1. accuracy and correct count;
2. topic mastery movement;
3. Match Score;
4. XP earned;
5. Reward Credits, if eligible;
6. badge progress or newly earned badge;
7. personal best or season movement;
8. recommended next activity.

### Return loop

Use a spaced recommendation such as:

- review the missed concept later today;
- revisit it tomorrow;
- confirm mastery after several days.

The daily streak should communicate consistency without punishment. If the
learner misses a day, preserve longest streak and use a neutral "start a new
streak" message.

## 10. Profile standard

A student profile should prioritize:

1. current learning goal;
2. XP level and next level;
3. mastery by category;
4. earned badges;
5. recent learning history;
6. current streak and longest streak;
7. personal bests;
8. season rank;
9. Reward Credit balance and claim state;
10. privacy controls.

Global rank should not dominate the profile.

Allow learners to feature up to three badges. Use Lucide or Material Symbols,
not emoji, for user-facing badge and rank icons.

## 11. Event and data model

### 11.1 Immutable score event ledger

Replace the generic points-only ledger over time with a metric-aware event
ledger:

```text
score_events
  id
  user_id
  attempt_id
  session_id
  activity_type
  activity_id
  question_id
  metric             match_score | xp | season_score | reward_credit
  delta
  reason_code
  score_version
  idempotency_key    UNIQUE
  metadata_json
  occurred_at
  reversed_by_event_id
```

Never edit an awarded event in place. Correct it with a reversal event.

This resembles the actor-verb-object-result-context approach used by xAPI:

```text
Actor: learner
Verb: answered / completed / mastered / earned
Object: question / activity / topic / badge
Result: correct, score, duration, response
Context: class, session, category, language, score version
Timestamp: server time
```

KWD does not need a full Learning Record Store immediately, but adopting this
shape will make analytics and future interoperability easier.

### 11.2 Attempts

```text
attempts
  id
  user_id
  activity_type
  activity_id
  assigned_question_ids
  mode
  score_version
  started_at_server
  completed_at_server
  status
  idempotency_key
```

### 11.3 Badge tables

```text
badge_definitions
  id
  slug
  criteria_version
  name_en
  name_km
  description_en
  description_km
  criteria_json
  category
  tier
  icon_name
  active

badge_awards
  id
  badge_definition_id
  user_id
  evidence_json
  issued_at
  revoked_at
  UNIQUE(user_id, badge_definition_id, criteria_version)
```

### 11.4 Seasons

```text
seasons
  id
  name
  scope
  starts_at
  ends_at
  timezone
  score_version
  status

season_totals
  season_id
  user_id
  score
  last_event_at
  PRIMARY KEY(season_id, user_id)
```

Keep `season_totals` as a projection of immutable events. It can be rebuilt.

## 12. Server-authoritative answer flow

### Start

1. Server authenticates the learner.
2. Server creates an attempt.
3. Server assigns questions.
4. Server stores the score version and start time.
5. Client receives question content without answer keys.

### Answer

1. Client submits `attemptId`, `questionId`, `answerId`, and idempotency key.
2. Server checks attempt ownership and state.
3. Server checks the question is assigned to the attempt.
4. Server checks the answer belongs to the question.
5. Server loads correctness and difficulty.
6. Server computes elapsed time from server timestamps.
7. Server calculates score.
8. Server writes answer and score events in one transaction.
9. Server returns correctness, explanation, and score breakdown.

### Complete

1. Server verifies required rounds.
2. Server finalizes the attempt once.
3. Server awards XP, Season Score, and eligible Reward Credits.
4. Server evaluates deterministic badges.
5. Server commits all changes.
6. Realtime updates are published only after commit.

All three operations must be safe to retry.

## 13. Anti-cheat and reliability controls

Required:

- server-side answer keys;
- server-side difficulty;
- server-side timing;
- answer-to-question membership validation;
- question-to-attempt membership validation;
- idempotency key on every write;
- unique constraints for one award per source;
- database transactions;
- rate limits;
- maximum payload sizes;
- valid state transitions;
- audit logs;
- replay protection;
- anomaly monitoring.

Useful anomaly signals:

- repeated responses under the human minimum;
- impossible answer IDs;
- completion faster than content can render;
- repeated identical payloads;
- large score changes after client version changes;
- one device rapidly switching many accounts.

An anomaly should flag a result for review, not automatically accuse a learner.

## 14. Accessibility and bilingual requirements

### Timers

- Practice should not require speed.
- Timed competition must clearly disclose the timer.
- Teachers should be able to use equal-score mode.
- Learners who receive extra time should not lose XP, mastery, badges, or
  credits.
- Pause, stop, or hide auto-updating and moving content where required.

### Motion and sound

- honor `prefers-reduced-motion`;
- provide a motion toggle;
- provide sound controls;
- do not communicate correctness by color or sound alone;
- avoid rapid flashing;
- keep the result understandable without animation.

### Language

- all new UI copy requires English and Khmer;
- use the learning font for learning content;
- use the system font for controls;
- test Khmer line height and wrapping;
- store badge names and criteria descriptions bilingually;
- have a native Khmer reviewer approve public terminology.

## 15. KWD visual design application

Use the existing KWD brand system:

- sharp or structured corners consistent with the surrounding surface;
- 2-3px black borders;
- hard, zero-blur structural shadows;
- yellow for primary action and active state;
- green for success;
- red for stop or destructive actions;
- blue for information;
- orange for caution;
- purple only for premium or special modes;
- Lucide or Material Symbols icons;
- no emoji icons;
- no decorative gradient fills on cards or buttons;
- rank-tier gradients only where the brand rules explicitly allow them.

Suggested visual mapping:

| Element | Road-sign treatment |
|---|---|
| Mastery badge | Circle or shield-like library icon in bordered badge |
| Warning about weak topic | Yellow diamond |
| Destructive reset | Red octagon |
| Learning direction | Green information rectangle |
| Season end notice | Orange caution strip |
| Primary next activity | Yellow bordered rectangle |

The leaderboard should use a flat table/card structure. Podium decoration must
not make ranks below third look like failure states.

## 16. Measurement plan

### Primary learning metrics

- delayed accuracy after 7 days;
- delayed accuracy after 30 days;
- first-attempt accuracy;
- misconception recovery rate;
- mastery confirmation rate;
- transfer to unfamiliar questions;
- category coverage.

### Engagement metrics

- valid activity completion rate;
- active learning days;
- return rate after 7 and 30 days;
- voluntary remediation completion;
- class participation;
- badge progress completion.

### Guardrail metrics

- answer spam rate;
- suspicious timing rate;
- abandoned timed activities;
- leaderboard opt-out rate;
- privacy-setting changes;
- support reports;
- reduced-motion usage;
- score write failures;
- ledger and aggregate reconciliation errors.

Do not optimize only for total plays, time on site, or raw point volume.

### Experiment rules

- define a learning hypothesis before shipping a mechanic;
- compare against a valid non-gamified or simpler condition;
- run long enough to reduce novelty effects;
- segment by age, language, prior performance, and device class;
- measure delayed learning, not only immediate clicks;
- stop an experiment if guardrail metrics worsen materially.

## 17. Implementation roadmap

### Phase 0: Integrity

1. Make solo answers server-authoritative.
2. Validate live answer membership.
3. Make final score sync transactional and idempotent.
4. Add unique ledger source keys.
5. Reconcile `lifetimePoints` against ledger history.
6. Replace stale leaderboard tests.
7. Validate all leaderboard query parameters.

### Phase 1: Clarify the economy

1. Rename current values in UI and APIs.
2. Introduce `score_version`.
3. Separate XP, Season Score, and Reward Credits.
4. Display accuracy before Match Score.
5. Remove filters for ineligible activities.
6. Correct weekly/monthly labels or boundaries.

### Phase 2: Fair leaderboards

1. Add calendar seasons.
2. Use `DENSE_RANK()`.
3. Add class and around-me boards.
4. Add opt-in public aliases.
5. Add result counts and stable pagination.
6. Snapshot completed seasons.

### Phase 3: Badge engine and profile

1. Add badge definitions and award tables.
2. Add deterministic criteria evaluation.
3. Add mastery and improvement badges.
4. Add badge progress.
5. Redesign profile hierarchy around learning progress.

### Phase 4: Learning personalization

1. Add spaced review scheduling.
2. Use weak-topic evidence to select questions.
3. Add mastery confirmation across days.
4. Add teacher-facing learning analytics.
5. Run controlled tuning experiments.

## 18. Acceptance criteria

The gamification system is ready when:

- no leaderboard-eligible score trusts client correctness;
- every answer is validated against its question and attempt;
- every award is idempotent;
- aggregate balances reconcile with immutable events;
- score rules are visible to learners and teachers;
- accuracy is not hidden behind points;
- mastery does not use speed;
- XP is not spendable;
- Reward Credits do not use speed or streak;
- seasons have exact published boundaries;
- ties have one documented rule;
- public identity is opt-in;
- badge criteria and evidence are visible;
- practice remains usable without timers;
- English and Khmer layouts pass review;
- reduced-motion behavior works;
- leaderboard tests cover all current filters, ties, privacy, pagination, and
  source combinations.

## 19. Research and standards

- Sailer, M. and Homner, L. "The Gamification of Learning: a Meta-analysis."
  Educational Psychology Review:
  https://link.springer.com/article/10.1007/s10648-019-09498-w
- Sailer, M. et al. "How gamification motivates: An experimental study of the
  effects of specific game design elements on psychological need satisfaction."
  Computers in Human Behavior:
  https://doi.org/10.1016/j.chb.2016.12.033
- Mekler, E. D. et al. "Towards understanding the effects of individual
  gamification elements on intrinsic motivation and performance."
  Computers in Human Behavior:
  https://doi.org/10.1016/j.chb.2015.08.048
- Ryan, R. M. and Deci, E. L. "Self-Determination Theory and the Facilitation
  of Intrinsic Motivation, Social Development, and Well-Being":
  https://selfdeterminationtheory.org/SDT/documents/2000_RyanDeci_SDT.pdf
- Karpicke, J. D. and Roediger, H. L. "The Critical Importance of Retrieval for
  Learning." Science:
  https://www.science.org/doi/abs/10.1126/science.1152408
- Dunlosky, J. et al. "Improving Students' Learning With Effective Learning
  Techniques." Psychological Science in the Public Interest:
  https://journals.sagepub.com/doi/10.1177/1529100612453266
- Park, S. and Kim, S. "Leaderboard Design Principles to Enhance Learning and
  Motivation in a Gamified Educational Environment":
  https://games.jmir.org/2021/2/e14746/
- Lalley, J. P. and Miller, R. H. "The Learning Pyramid: Does It Point Teachers
  in the Right Direction?":
  https://eric.ed.gov/?id=EJ790160
- 1EdTech Open Badges:
  https://www.1edtech.org/standards/open-badges
- W3C Web Content Accessibility Guidelines 2.2:
  https://www.w3.org/TR/WCAG22/
- Advanced Distributed Learning, Experience API and Learning Record Stores:
  https://www.adlnet.gov/
- OWASP API Security Project:
  https://owasp.org/www-project-api-security/
- OWASP Game Security Framework:
  https://owasp.org/www-project-gamesec-framework/OGSF
- UK Information Commissioner's Office, Age Appropriate Design Code:
  https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/
