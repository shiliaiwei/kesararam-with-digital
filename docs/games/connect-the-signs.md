# Connect the Signs — Game Design & Build Spec

> **Game id:** `sign-connect` · **Display name:** Connect the Signs · **ខ្មែរ:** ភ្ជាប់សញ្ញា
> **Type:** Two-column line-match kid game (GameKit) · **Access:** `user` (practice-only, no leaderboard)
> **Status:** Design approved — ready to build
> **Owner:** KWD (Kesararam With Digital) · Technovation Girls 2026 · Team #50777

This document is both the **design spec** and a **full build prompt**. It mirrors the
printed "Match the road safety signs" worksheet (draw a line from each sign to its
meaning), using **real road-sign images from our database**.

> **Note — this is a NEW game, not the existing one.** The current `sign-match`
> (`src/lib/gamekit/formats/sign-match/index.tsx`) is a **flip-card memory game** and
> stays as-is. `sign-connect` is a separate two-column connect game with its own id,
> route, and `/play` card.

---

## 1 · Concept

A two-column matching worksheet. **Left column** = real sign images. **Right column** =
meaning labels, **shuffled** so positions never line up. The player **taps a sign, then
taps a meaning**; a line draws between them. Tap-then-tap is used instead of a freehand
drag because it is far more reliable for young kids on small touchscreens, while giving
the same connected-line visual.

---

## 2 · Locked design decisions

| Decision | Value |
|----------|-------|
| Relationship to existing game | **New game** (`sign-connect`); flip-card `sign-match` untouched |
| Content source | **Both / mix** — live sign topics (`getSignItems()`) **and** the 321 revived "ផ្គូផ្គង" matching questions |
| Pairs per round | **4 pairs** (4 signs ↔ 4 meanings) |
| Interaction | **Tap a sign → tap a meaning**; animated connecting line |
| Wrong match | **Lock as wrong** — the pair locks red and is counted incorrect; the round can end with mistakes shown (stricter, test-like) |
| Correct match | Line + both items lock **green** |
| Scoring | `calculateScore()` → `gameAttempts`; **practice-only, NO leaderboard** |
| Access tier | `user` — guests play unrecorded |
| Trust model | Pairs **re-validated server-side**; client visuals are cosmetic |

---

## 3 · UI

### 3.1 Reference (source worksheet)
"Match the road safety signs" — left column of signs (No Parking, No Right, Mens at Work,
No Left, Bicycle Crossing, 80 km/h, Stop…), right column of shuffled labels, connected by
hand-drawn lines.

### 3.2 In-app design (KWD brand)
Follow the `kwd-brand-design` skill: black 2–3px borders, hard offset shadows
`3px 3px 0 #000` (no blur), `#eab308` yellow accent, traffic-semantic colors
(green=correct, red=wrong), Lucide icons only (no emoji / no Unicode symbols), bilingual
EN/ខ្មែរ. Images via `cloudinaryOptimize()`. Runs inside `GameKitShell` (HUD: exit, score
chip, mute; yellow progress bar; a `matched/total` pairs counter).

**Connecting line layer:** an absolutely-positioned SVG over the two columns draws each
line from a sign's right edge to a meaning's left edge.
- **selected** (sign tapped, awaiting meaning) → yellow dashed line following the pointer / pending
- **correct** → solid green line; both endpoints lock green
- **wrong** → solid red line; both endpoints lock red, counted incorrect

States per item: neutral (white, black border) · selected (yellow border) · matched-correct
(green) · matched-wrong (red).

### 3.3 Layout
- 4 rows. Left column ~72px sign tiles; right column ~150px label tiles; ~54px row height.
- Right-column labels shuffled independently of the left order each round.

---

## 4 · Data

Mix two sources behind one round shape `{ pairs: [{ id, nameEn, nameKm, imageUrl }] }`:

1. **Live sign topics** — `getSignItems()` in
   [`src/lib/gamekit/kid-rounds.ts`](../../src/lib/gamekit/kid-rounds.ts) (published
   road-sign topics, category 1, with `primaryImageUrl` + bilingual names).
2. **Revived 321 "ផ្គូផ្គង" matching questions** — previously disabled via
   `scripts/disable-matching-questions.ts` because the quiz renderer broke on them. Pull
   them into the same `pairs` shape (sign/image ↔ meaning). May need a small adapter +
   re-enable step; treat as a follow-up if the data shape needs work, falling back to
   live sign topics so the game ships either way.

Each round = **4 distinct pairs**. The correct meaning's `id` equals the sign's topic id.

---

## 5 · Architecture (GameKit contract)

```
/play card → GameKitShell(signConnectFormat)
  start() → fetchRounds() ──GET──▶ /api/game/sign-connect       (pairs; shuffled labels)
  RoundView: tap sign → tap meaning → line; onRoundComplete(RoundResult) with all picks
  → POST answers ──▶ /api/game/sign-connect/complete            (resolveAccess gate)
                       └─ re-validate each pair server-side
                       └─ calculateScore() → insert gameAttempts (if willRecord)
  ◀── KitCompletionResult → results screen
```

Closest templates: `sign-match` (data + format shape) and `catch-sign` (round/result flow).

---

## 6 · Files to create / touch

1. **`src/lib/gamekit/formats/sign-connect/index.tsx`** — the two-column `RoundView`
   (tap-tap + SVG line layer) + `signConnectFormat: GameFormat<...>`.
   - `meta`: id `sign-connect`, route `/play/sign-connect`, title
     `{en:"Connect the Signs", kh:"ភ្ជាប់សញ្ញា"}`, on-palette `brandColor`, Lucide `Icon`,
     `accessTier:"user"`, badge `{en:"KIDS", kh:"កុមារ"}`.
   - `config`: `{ timed:false, secondsPerRound:0, scoringMode:"equal", showStreakHud:false }`.
2. **`src/lib/gamekit/kid-games.ts`** — add `buildSignConnectRounds(count)` (4 pairs, mix
   sources); register `"sign-connect": { accessTier:"user", buildRounds: buildSignConnectRounds }`.
3. **`src/app/api/game/sign-connect/route.ts`** (GET pairs, gated by `resolveAccess`) and
   **`src/app/api/game/sign-connect/complete/route.ts`** (POST → re-validate + score +
   record). Reuse `recordGameAttempt` (or a pair-aware variant) in
   [`src/lib/gamekit/server.ts`](../../src/lib/gamekit/server.ts).
4. **`src/lib/gamekit/registry.ts`** — import and add `signConnectFormat` to
   `GAMEKIT_FORMATS`.
5. **`src/app/(public)/play/sign-connect/page.tsx`** (if needed) — render
   `<GameKitShell format={signConnectFormat} />`.

---

## 7 · Server validation (anti-cheat)

Correct pair = picked meaning's topic id equals the sign's topic id. The complete route
re-checks **every pair** server-side before recording; client correctness is cosmetic.
Points via `calculateScore()`. Records to `gameAttempts` only when `willRecord`. **No
`lifetimePoints` / `pointsLedger` writes** — solo/practice, never the public leaderboard.

---

## 8 · Acceptance criteria

- [ ] New "Connect the Signs / ភ្ជាប់សញ្ញា" card appears on `/play` (separate from Sign Match).
- [ ] Round renders **4 sign tiles ↔ 4 shuffled meanings** from **real DB content**.
- [ ] Tap-sign-then-meaning draws a line; **correct = green, wrong = locked red (counted incorrect)**.
- [ ] Round ends when all 4 pairs are resolved; results show score + correct count.
- [ ] Score **records for logged-in users only**; guests play unrecorded.
- [ ] `npm run build` (typecheck + lint) passes.
- [ ] Brand check: black borders, hard shadows, `#eab308`, Lucide icons, bilingual copy.

---

## 9 · Build command

```
/build-sign-connect
```

Optionally pass overrides, e.g. `/build-sign-connect 6 pairs`.

---

## 10 · Related games (roadmap)

Worksheet-style kid games:

1. **Tick the Sign** (`tick-sign`) — `docs/games/tick-the-sign.md`.
2. **Connect the Signs** (`sign-connect`) — this doc. Also home for the 321 revived
   matching questions.
3. **Word Bank** (`word-bank`) — drag word chips onto sign pictures (`@dnd-kit`).
