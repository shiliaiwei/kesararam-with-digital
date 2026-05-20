# 🎮 Play System — Full Reference

> Cambodia Driving Licence Quiz Platform  
> All question types, game modes, routes, scoring, and architecture in one place.

---

## Table of Contents

1. [Question Types](#1-question-types)
2. [Runtime Game Types](#2-runtime-game-types)
3. [Game Modes](#3-game-modes)
4. [Route Map](#4-route-map)
5. [Scoring System](#5-scoring-system)
6. [Game Session Lifecycle](#6-game-session-lifecycle)
7. [Key Files](#7-key-files)

---

## 1. Question Types

Defined in `src/components/admin/questions/question-form-modal.tsx` (`Q_TYPES` array).  
These are the **admin-facing** types used when creating questions in the dashboard.

| Type | Label | Description | Min Answers | Max Answers | Multi-correct |
|---|---|---|:---:|:---:|:---:|
| `MCQ_SINGLE` | Multiple Choice | One correct answer from a list | 2 | 5 | ❌ |
| `MCQ_MULTIPLE` | Multi-Select | Multiple correct answers | 3 | 5 | ✅ |
| `TRUE_FALSE` | True / False | Binary choice (True or False) | 2 | 2 | ❌ |
| `IMAGE_BASED` | Image Based | Visual scenario — answers may include images | 2 | 4 | ❌ |
| `MATCHING` | Matching | Match items from two sets (pairs) | 2 | 6 | ❌ |
| `FILL_BLANK` | Fill in the Blank | Complete the missing word(s) | 1 | 5 | ❌ |

### Notes
- `IMAGE_BASED` is only available for categories with `IMAGE_MATCH_SLUGS`: **road-sign** and **priority**.
- `MCQ_MULTIPLE` requires at least 2 correct answers to be marked.
- `MATCHING` pairs are stored as answer rows with metadata JSON.
- `FILL_BLANK` accepts 1–5 acceptable answer variants.

---

## 2. Runtime Game Types

At runtime, the 6 admin types collapse into **3 engine-level game types** via `mapContentToGameType()` in `src/lib/game-engine.ts`.  
These drive the `AnswerGrid` component rendering.

| Runtime Type | Maps From | Rendering |
|---|---|---|
| `true_false` | Any question with exactly **2 answers** | Large binary buttons (True / False) |
| `image_pick` | Questions with an **image** + 2–4 answers | Image thumbnail answer grid |
| `mcq` | Everything else | Standard A / B / C / D answer grid |

```ts
// Mapping logic (game-engine.ts)
export function mapContentToGameType(params: {
  answerCount: number;
  hasImage: boolean;
  hasAudio: boolean;
}): "mcq" | "true_false" | "image_pick" {
  if (params.answerCount === 2) return "true_false";
  if (params.hasImage && params.answerCount >= 2 && params.answerCount <= 4) return "image_pick";
  return "mcq";
}
```

---

## 3. Game Modes

Defined in `src/lib/game-engine.ts` — `GAME_MODE_CONFIG` and `GAME_MODE_TYPES`.

### 3.1 Quick Quiz
| Property | Value |
|---|---|
| **Route** | `/play/solo?mode=quick-quiz` |
| **Label (KH)** | សំណួរលឿន |
| **Tag** | 🔥 HOT |
| **Color** | Yellow `#eab308` |
| **Default Questions** | 10 |
| **Allowed Counts** | 5, 10, 15, 20 |
| **Time per Question** | 30 seconds |
| **Allowed Types** | `mcq`, `true_false` |
| **Description** | Pick any number of questions at your own pace. Relaxed practice mode. |

---

### 3.2 Speed Round
| Property | Value |
|---|---|
| **Route** | `/play/solo?mode=speed-round` |
| **Label (KH)** | វគ្គល្បឿន |
| **Tag** | ⚡ INTENSE |
| **Color** | Red `#ef4444` |
| **Default Questions** | 20 |
| **Allowed Counts** | 10, 15, 20, 30 |
| **Time per Question** | 15 seconds |
| **Allowed Types** | `mcq` only |
| **Description** | Fast MCQ only — tap fast, score big. Speed bonus is maximized here. |

---

### 3.3 Sign Challenge
| Property | Value |
|---|---|
| **Route** | `/play/solo?mode=sign-challenge` |
| **Label (KH)** | ប្រឡងសញ្ញា |
| **Tag** | — |
| **Color** | Blue `#3b82f6` |
| **Default Questions** | 15 |
| **Allowed Counts** | 5, 10, 15, 20, 30 |
| **Time per Question** | 20 seconds |
| **Allowed Types** | `image_pick` only |
| **Description** | Identify traffic signs from images only. Tests visual recognition. |

---

### 3.4 Mixed Battle
| Property | Value |
|---|---|
| **Route** | `/play/solo?mode=mixed-battle` |
| **Label (KH)** | ប្រកួតចម្រុះ |
| **Tag** | 🆕 NEW |
| **Color** | Purple `#a855f7` |
| **Default Questions** | 20 |
| **Allowed Counts** | 10, 20, 30, 40 |
| **Time per Question** | 30 seconds |
| **Allowed Types** | `mcq`, `true_false`, `image_pick` |
| **Description** | All categories, all question types mixed together. The most comprehensive mode. |

---

### 3.5 Daily Challenge
| Property | Value |
|---|---|
| **Route** | `/play/solo?mode=daily-challenge` |
| **Label (KH)** | បញ្ហាប្រចាំថ្ងៃ |
| **Tag** | 📅 DAILY |
| **Color** | Green `#22c55e` |
| **Default Questions** | 15 |
| **Allowed Counts** | 10, 15, 20 |
| **Time per Question** | 30 seconds |
| **Allowed Types** | `mcq`, `true_false`, `image_pick` |
| **Description** | A fresh set of questions every day. Build your daily streak. |

---

### 3.6 Exam Simulation
| Property | Value |
|---|---|
| **Route** | `/play/solo?mode=exam-simulation` |
| **Label (KH)** | ត្រាប់តាមប្រឡង |
| **Tag** | 🏆 PRO |
| **Color** | Orange `#f97316` |
| **Default Questions** | 40 |
| **Allowed Counts** | 20, 30, 40 |
| **Time per Question** | 45 seconds |
| **Allowed Types** | `mcq`, `true_false` |
| **Description** | Simulates the real Cambodia driving licence exam. 40 questions, longer time. |

---

### 3.7 Category Quiz *(bonus mode)*
| Property | Value |
|---|---|
| **Route** | `/play/category-quiz` |
| **Questions** | 20 fixed |
| **Time per Question** | 60 seconds |
| **Allowed Types** | All types |
| **Description** | Pick a specific category (e.g. Road Signs, Emergency) and drill it. |

---

### 3.8 Live Multiplayer *(teacher-hosted)*
| Property | Value |
|---|---|
| **Route** | `/play/[code]` |
| **Join** | Enter 6-character room code on `/play` hub |
| **Questions** | Defined by host |
| **Time per Question** | Defined by host |
| **Allowed Types** | All types |
| **Max Players** | 50 per session |
| **Description** | Real-time multiplayer. Teacher hosts, students join with a code. Live leaderboard. |

---

### Mode Summary Table

| Mode | Route | Q Count | Time/Q | Types |
|---|---|:---:|:---:|---|
| Quick Quiz | `/play/solo?mode=quick-quiz` | 5–20 | 30s | mcq, true_false |
| Speed Round | `/play/solo?mode=speed-round` | 10–30 | 15s | mcq |
| Sign Challenge | `/play/solo?mode=sign-challenge` | 5–30 | 20s | image_pick |
| Mixed Battle | `/play/solo?mode=mixed-battle` | 10–40 | 30s | mcq, true_false, image_pick |
| Daily Challenge | `/play/solo?mode=daily-challenge` | 10–20 | 30s | mcq, true_false, image_pick |
| Exam Simulation | `/play/solo?mode=exam-simulation` | 20–40 | 45s | mcq, true_false |
| Category Quiz | `/play/category-quiz` | 20 | 60s | all |
| Live Multiplayer | `/play/[code]` | host | host | all |

---

## 4. Route Map

```
/play
├── (hub)                        → Mode picker + "Join Live Game" input
│
├── solo?mode=quick-quiz         → Quick Quiz solo session
├── solo?mode=speed-round        → Speed Round solo session
├── solo?mode=sign-challenge     → Sign Challenge solo session
├── solo?mode=mixed-battle       → Mixed Battle solo session
├── solo?mode=daily-challenge    → Daily Challenge solo session
├── solo?mode=exam-simulation    → Exam Simulation solo session
│
├── category-quiz                → Category-specific drill (pick category → play)
│
└── [code]                       → Live multiplayer student view
    ├── lobby                    → Waiting room (shows participants)
    ├── active                   → Live question + countdown + leaderboard
    ├── paused                   → Host paused the session
    └── ended                    → Final podium + scores
```

---

## 5. Scoring System

Defined in `src/lib/game-engine.ts` — `calculateScore()`.

### 5.1 Base Score by Difficulty

| Difficulty | Base Points |
|---|:---:|
| Easy | 500 |
| Medium | 1,000 |
| Hard | 1,500 |

### 5.2 Speed Bonus

Only applies in **speed scoring mode**.

```
speedBonus = floor(baseScore × (remainingTimeMs / totalTimeMs))
```

- Maximum speed bonus = full base score (answered instantly)
- Zero speed bonus = answered at the last millisecond
- **Disabled** if answer was submitted in under 500ms (anti-cheat)

### 5.3 Streak Bonus

| Consecutive Correct Answers | Bonus Points |
|---|:---:|
| 2–3 in a row | +100 |
| 4–5 in a row | +200 |
| 6+ in a row | +300 |

- **Disabled** if answer was submitted in under 500ms (anti-cheat)

### 5.4 Total Score Formula

```
totalPoints = baseScore + speedBonus + streakBonus
```

### 5.5 Scoring Modes

| Mode | Description |
|---|---|
| `speed` | Base + speed bonus + streak bonus |
| `equal` | Base + streak bonus only (no time pressure) |

### 5.6 Anti-Cheat

Answers submitted in **< 500ms** are flagged as suspicious.  
Suspicious answers receive **0 speed bonus** and **0 streak bonus** (base score only).

---

## 6. Game Session Lifecycle

### Solo Session

```
setup → loading → playing (Q1 → Q2 → ... → Qn) → results
```

1. **setup** — user picks mode and question count
2. **loading** — API call to `/api/game/solo` creates session + fetches questions
3. **playing** — countdown timer per question, answer recorded via API
4. **results** — score breakdown, accuracy %, personal best check

### Live Multiplayer Session

```
lobby → active ⇄ paused → ended
```

| Status | Description |
|---|---|
| `lobby` | Players joining, waiting for host to start |
| `active` | Game running, questions advancing |
| `paused` | Host paused mid-game |
| `ended` | Game over, final leaderboard shown |

Valid transitions:
- `lobby` → `active` or `ended`
- `active` → `paused` or `ended`
- `paused` → `active` or `ended`
- `ended` → *(terminal, no further transitions)*

Session codes are **6-character alphanumeric** (e.g. `AB3X7K`), generated server-side.

---

## 7. Key Files

### Game Logic
| File | Purpose |
|---|---|
| `src/lib/game-engine.ts` | Scoring, mode configs, type mapping, session code generation |
| `src/lib/game-sounds.ts` | Sound effects for correct/wrong/streak events |

### Pages
| File | Route |
|---|---|
| `src/app/(public)/play/page.tsx` | `/play` hub |
| `src/app/(public)/play/solo/page.tsx` | `/play/solo` all solo modes |
| `src/app/(public)/play/category-quiz/page.tsx` | `/play/category-quiz` |
| `src/app/(public)/play/[code]/page.tsx` | `/play/[code]` live multiplayer |

### API Routes
| File | Purpose |
|---|---|
| `src/app/api/game/solo/route.ts` | Create solo session + fetch questions |
| `src/app/api/game/sessions/[code]/route.ts` | Get session state |
| `src/app/api/game/sessions/[code]/answer/route.ts` | Submit answer |
| `src/app/api/game/sessions/[code]/advance/route.ts` | Advance to next question (host) |

### Components
| File | Purpose |
|---|---|
| `src/components/game/AnswerGrid.tsx` | Renders mcq / true_false / image_pick answers |
| `src/components/game/CountdownTimer.tsx` | Animated countdown per question |
| `src/components/game/LeaderboardPanel.tsx` | Live leaderboard sidebar |
| `src/components/game/Podium.tsx` | End-of-game top 3 podium |

### Database Schema
| File | Tables |
|---|---|
| `src/db/schema/game.ts` | `game_sessions`, `game_participants`, `game_session_answers` |
| `src/db/schema/content.ts` | `questions`, `answers`, `topics`, `categories`, `game_mode_content` |

### Admin
| File | Purpose |
|---|---|
| `src/components/admin/questions/question-form-modal.tsx` | Create/edit questions (defines `Q_TYPES`) |

### Hooks
| File | Purpose |
|---|---|
| `src/hooks/use-game-sse.ts` | Server-Sent Events hook for live multiplayer real-time updates |

---

*Last updated: May 2026*
