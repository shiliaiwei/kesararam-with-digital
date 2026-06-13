# Word Bank — Game Design & Build Spec

> **Game id:** `word-bank` · **Display name:** Word Bank · **ខ្មែរ:** ធនាគារពាក្យ
> **Type:** Drag-the-word kid game (GameKit) · **Access:** `user` (practice-only, no leaderboard)
> **Status:** Design approved — ready to build
> **Owner:** KWD (Kesararam With Digital) · Technovation Girls 2026 · Team #50777

This document is both the **design spec** and a **full build prompt**. It mirrors the
printed "Match the word with the pictures" worksheet (a word bank at the top, a grid of
sign pictures with empty slots below), using **real road-sign images from our database**.

---

## 1 · Concept

A **word bank** at the top holds meaning chips (Slippery road, Railroad crossing ahead,
No parking, Roundabout ahead, Traffic lights, Intersection, Go straight…). Below is a
**grid of real sign pictures**, each with an empty drop slot. The player **drags a word
chip onto the matching picture**. A chip snaps into the slot and leaves the bank; the
round ends when every picture is filled.

---

## 2 · Locked design decisions

| Decision | Value |
|----------|-------|
| Signs per round | **8** (8 pictures + 8 word chips) |
| Placement | **Drag chips** with `@dnd-kit` (installed); **tap-to-place fallback** for small screens |
| Wrong placement | **Lock as wrong** — placement locks red, counted incorrect (consistent with `sign-connect`) |
| Correct placement | Slot + chip lock **green**; chip removed from the bank |
| Content source | **Both / mix** — live sign topics (`getSignItems()`) **and** the 321 revived "ផ្គូផ្គង" matching questions |
| Scoring | `calculateScore()` → `gameAttempts`; **practice-only, NO leaderboard** |
| Access tier | `user` — guests play unrecorded |
| Trust model | Placements **re-validated server-side**; client visuals cosmetic |

---

## 3 · UI

### 3.1 Reference (source worksheet)
"Direction: Match the word with the pictures." A boxed word bank (a–j list) at the top,
then a 2-column grid of 10 sign pictures each with an empty text box to fill.

### 3.2 In-app design (KWD brand)
Follow the `kwd-brand-design` skill: black 2–3px borders, hard offset shadows
`3px 3px 0 #000` (no blur), `#eab308` yellow chips, green=correct / red=wrong, Lucide
icons only (no emoji / no Unicode symbols), bilingual EN/ខ្មែរ. Sign images via
`cloudinaryOptimize()`. Runs inside `GameKitShell` (HUD: exit, score chip, mute; yellow
progress bar; a `filled/total` counter).

**Drag layer (`@dnd-kit`):**
- **word bank** = a wrapping row of draggable chips at the top.
- each **picture card** = a droppable with an empty dashed slot.
- **dragging** → chip lifts (slight tilt/scale); the hovered target highlights (blue dashed).
- **drop correct** → slot + chip turn green and lock; chip removed from bank.
- **drop wrong** → slot + chip lock red, counted incorrect.
- **tap fallback** → tap a chip to select, tap a picture to place (same result).

### 3.3 Layout
- Word bank card on top; 2-column grid of 8 picture cards (sign image + slot) below.
- Scrollable within the GameKitShell round area on small phones.

---

## 4 · Data

Mix two sources behind one round shape
`{ items: [{ id, nameEn, nameKm, imageUrl }] }` (8 items):

1. **Live sign topics** — `getSignItems()` in
   [`src/lib/gamekit/kid-rounds.ts`](../../src/lib/gamekit/kid-rounds.ts).
2. **Revived 321 "ផ្គូផ្គង" matching questions** — disabled via
   `scripts/disable-matching-questions.ts`; pull into the same item shape (sign ↔ word).
   Treat as a follow-up if the data shape needs work; fall back to live sign topics so the
   game ships either way.

Word chips = the bilingual names of the 8 items, shuffled. The correct chip for a picture
has the same topic id as that picture.

---

## 5 · Architecture (GameKit contract)

```
/play card → GameKitShell(wordBankFormat)
  start() → fetchRounds() ──GET──▶ /api/game/word-bank          (items; shuffled chips)
  RoundView: @dnd-kit drag chip → picture; onRoundComplete(RoundResult) with all placements
  → POST answers ──▶ /api/game/word-bank/complete               (resolveAccess gate)
                       └─ re-validate each placement server-side
                       └─ calculateScore() → insert gameAttempts (if willRecord)
  ◀── KitCompletionResult → results screen
```

Closest templates: `sign-match` / `sign-connect` (data shape) and `catch-sign` (round/result flow).

---

## 6 · Files to create / touch

1. **`src/lib/gamekit/formats/word-bank/index.tsx`** — the `RoundView` (word bank +
   picture grid, `@dnd-kit` drag + tap fallback) + `wordBankFormat: GameFormat<...>`.
   - `meta`: id `word-bank`, route `/play/word-bank`, title
     `{en:"Word Bank", kh:"ធនាគារពាក្យ"}`, on-palette `brandColor`, Lucide `Icon`,
     `accessTier:"user"`, badge `{en:"KIDS", kh:"កុមារ"}`.
   - `config`: `{ timed:false, secondsPerRound:0, scoringMode:"equal", showStreakHud:false }`.
2. **`src/lib/gamekit/kid-games.ts`** — add `buildWordBankRounds(count)` (8 items, mix
   sources); register `"word-bank": { accessTier:"user", buildRounds: buildWordBankRounds }`.
3. **`src/app/api/game/word-bank/route.ts`** (GET, gated by `resolveAccess`) and
   **`src/app/api/game/word-bank/complete/route.ts`** (POST → re-validate + score +
   record). Reuse `recordGameAttempt` (or a placement-aware variant) in
   [`src/lib/gamekit/server.ts`](../../src/lib/gamekit/server.ts).
4. **`src/lib/gamekit/registry.ts`** — import and add `wordBankFormat` to `GAMEKIT_FORMATS`.
5. **`src/app/(public)/play/word-bank/page.tsx`** (if needed) — render
   `<GameKitShell format={wordBankFormat} />`.

---

## 7 · Server validation (anti-cheat)

Correct placement = the chip's topic id equals the picture's topic id. The complete route
re-checks **every placement** server-side before recording; client correctness is
cosmetic. Points via `calculateScore()`. Records to `gameAttempts` only when `willRecord`.
**No `lifetimePoints` / `pointsLedger` writes** — solo/practice, never the public
leaderboard.

---

## 8 · Acceptance criteria

- [ ] New "Word Bank / ធនាគារពាក្យ" card appears on `/play`.
- [ ] Round renders a **word bank + 8 sign pictures** with empty slots, from **real DB content**.
- [ ] Dragging a chip onto a picture places it; **correct = green, wrong = locked red (counted incorrect)**. Tap fallback works.
- [ ] Round ends when all 8 slots are filled; results show score + correct count.
- [ ] Score **records for logged-in users only**; guests play unrecorded.
- [ ] `npm run build` (typecheck + lint) passes.
- [ ] Brand check: black borders, hard shadows, `#eab308`, Lucide icons, bilingual copy.

---

## 9 · Build command

```
/build-word-bank
```

Optionally pass overrides, e.g. `/build-word-bank 10 signs`.

---

## 10 · Related games (roadmap — complete set)

Worksheet-style kid games:

1. **Tick the Sign** (`tick-sign`) — `docs/games/tick-the-sign.md`.
2. **Connect the Signs** (`sign-connect`) — `docs/games/connect-the-signs.md`.
3. **Word Bank** (`word-bank`) — this doc.

All three: real DB sign content, practice-only (no leaderboard), `accessTier: "user"`,
KWD brutalist brand, bilingual EN/ខ្មែរ.
