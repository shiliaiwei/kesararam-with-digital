---
name: kwd-gamification-leaderboard
description: >
  KWD (Kesararam With Digital) Gamification, Leaderboard & License Plate architecture.
  USE THIS whenever you work on leaderboard ranking algorithms, Solo Driver scoring,
  Road Points currency systems, ScorePlate components, reward claiming, or /leaderboard
  page modifications. Enforces the #1 priority ranking by Solo Driver (អ្នកបើកបរឯករាជ្យ),
  the distinction between competitive rank points and spendable Road Points currency,
  and authentic Brutalist Cambodian license plate visual presentation.
---

# KWD Gamification, Leaderboard & License Plate Architecture

## 1. Core Philosophy & Psychology

The KWD leaderboard operates on a **daily momentum psychological model** (inspired by Duolingo, Chess.com leagues, and competitive arcade games) to encourage students to play every day:

```
                  ┌──────────────────────────────────────────────┐
                  │           Daily Play & Mini-Games            │
                  └──────────────────────┬───────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
   [ SOLO DRIVER RANKING ]                         [ ROAD POINTS CURRENCY ]
    • Primary leaderboard metric                    • Spendable/Claimable points
    • Driven by active solo practice plays          • Used to unlock plates, avatar gear,
    • Active students rise to the top                 badges in the Rewards Store
```

---

## 2. Terminology & Khmer Translations

| English Term | Khmer Term | Domain Meaning |
| :--- | :--- | :--- |
| **Solo Driver** | **អ្នកបើកបរឯករាជ្យ** | Primary competitive ranking score earned from solo mini-games, practice quizzes, and daily challenges. |
| **Road Points** | **Road Points** *(untranslated)* | Spendable / claimable currency used in the Rewards Shop. |
| **Rank** | **ចំណាត់ថ្នាក់** | Current position on the leaderboard table or podium. |
| **Games** | **ហ្គេម** | Total recorded game sessions. |
| **Accuracy** | **ត្រឹមត្រូវ** | Percentage of correct answers across played games. |

---

## 3. Database & Ranking Query Rules

### Ranking Sorter Priority ([`src/app/api/leaderboard/route.ts`](../../../src/app/api/leaderboard/route.ts))

The leaderboard API computes dense ranks by sorting students with **Solo Driver Points (`soloExpr`)** as the #1 priority:

```sql
ORDER BY
  desc(soloExpr),         -- 1st: Solo Driver points (daily solo play momentum)
  desc(soloExpr),         -- 2nd: Tiebreak
  desc(balanceExpr),      -- 3rd: Store points balance
  desc(highestScore),     -- 4th: Personal high score
  asc(id)                 -- 5th: Deterministic user ID
```

---

## 4. Rankings Table Column Hierarchy

The leaderboard table rows (`src/app/(public)/leaderboard/page.tsx`) must follow this exact column order:

1. **Column 1 — Rank & Profile** (`#` + Avatar + Tier Ring + Display Name Plate)
2. **Column 2 — SOLO DRIVER / អ្នកបើកបរឯករាជ្យ**
   - Rendered using `<ScorePlate value={user.soloPoints} isSoloDriver={true} ... />`
3. **Column 3 — ROAD POINTS**
   - Rendered as bold monospace numbers showing claimable store currency.
4. **Column 4 — MODE / ប្រភេទហ្គេម**
   - Filter dropdown header + GameBadge + selected game score.
5. **Column 5 — Stats (PLAYS & ACCURACY)**
   - Total plays count (`PLAYS` / `ចំនួនលេង`) + accuracy percentage pill.

---

## 5. ScorePlate Component Architecture ([`src/components/shared/score-plate.tsx`](../../../src/components/shared/score-plate.tsx))

The `ScorePlate` renders authentic Cambodian vehicle license plates adhering to KWD Brutalist rules:

* **Borders & Shadows**: 2px/3px solid black border with hard `2px 2px 0 #000` or `4px 4px 0 #000` offset shadow (no blur).
* **Provincial Stamping**: Uses authentic Khmer province abbreviations (`សរ` for Siem Reap, `ភភ` for Phnom Penh, `បប` for Battambang, etc.).
* **`isSoloDriver={true}`**:
  * Applies the **Gold Accent Trim** (`#eab308` yellow bar on top edge).
  * Uses high-contrast black border and premium cream metallic sheen.
* **Top 3 Podium**: The 1st, 2nd, and 3rd pedestals showcase Road Points plates atop brutalist textured pedestals, with positioning determined by Solo Driver rank.
