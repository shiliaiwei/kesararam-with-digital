# Tick the Sign — Game Design & Build Spec

> **Game id:** `tick-sign` · **Display name:** Tick the Sign · **ខ្មែរ:** ធីកសញ្ញា
> **Type:** Worksheet-style kid game (GameKit) · **Access:** `user` (practice-only, no leaderboard)
> **Status:** Design approved — ready to build
> **Owner:** KWD (Kesararam With Digital) · Technovation Girls 2026 · Team #50777

This document is both the **design spec** and a **full build prompt**. An engineer (or
Claude Code) can build the game end-to-end from this file alone. It mirrors the printed
kindergarten road-safety worksheet "Tick the correct safety sign", using **real road-sign
images from our database**.

---

## 1 · Concept

A worksheet page like a kindergarten road-safety sheet. Each **row** shows:

- a sign **name** on the left, bilingual (English + ខ្មែរ), e.g. "No Parking · ហាមចត"
- **4 real sign images** on the right, each with a tick box

The player taps the correct image for each row. The named sign is the answer; the other
three images are decoys. Real artwork comes from the `topics` table — not drawings.

---

## 2 · Locked design decisions

| Decision | Value |
|----------|-------|
| Worksheet size | **2 pages × 6 rows = 12 signs** total |
| Choices per row | **4** (1 correct + 3 decoys) |
| Decoy selection | **Any random road signs** (no shape/color tagging required) |
| Grading | **Auto-advance, instant feedback** — no submit button |
| Feedback | Correct tap → green lock + check badge; wrong tap → red ✗ and the correct sign highlights green |
| Row order | Rows fill **top-down**; later rows dimmed until reached |
| Scoring | `calculateScore()` → `gameAttempts`; **practice-only, NO public leaderboard** |
| Access tier | `user` — guests can play but the score is **not** recorded |
| Trust model | Client shows instant feedback; the complete route **re-validates** the recorded score server-side |

---

## 3 · UI

### 3.1 Reference (source worksheet)
The printed worksheet that inspired this: rows of "name + 3 signs + tick boxes" titled
*"Tick the correct safety sign"* (Rail Road, No Horn, Speed Limit 80, No Overtaking,
No Parking, Stop). We adapt it to **4 choices** and add instant grading.

### 3.2 In-app design (KWD brand)
Follow the `kwd-brand-design` skill: black 2–3px borders, hard offset shadows
`3–4px 3–4px 0 #000` (no blur), `#eab308` yellow accent, Lucide icons only (no emoji /
no Unicode symbols), bilingual EN/ខ្មែរ. Images optimized via `cloudinaryOptimize()`.
The game runs inside `GameKitShell` so it inherits the HUD (exit, score chip, streak
flame, mute) and the yellow progress bar. A **PAGE 1/2** chip marks the current sheet.

States to render per row:
- **unanswered** — all 4 choices live (white card, black border, hard shadow)
- **correct** — chosen choice: green border + light-green fill + check badge top-right
- **wrong** — chosen choice: red border + light-red fill + ✗ badge; the correct choice turns green
- **locked/upcoming** — rows below the current one are dimmed until reached

### 3.3 Mockup (self-contained HTML preview)
Open this snippet in any browser to preview the playing screen (placeholder SVG signs
stand in for the real DB images):

```html
<div style="background:#1c1c1f;border-radius:14px;font-family:'Inter',system-ui,sans-serif;max-width:420px;margin:0 auto;overflow:hidden;">
  <div style="display:flex;align-items:center;justify-content:space-between;background:#0a0a0b;border-bottom:1px solid #3f3f46;padding:8px 12px;">
    <div style="display:flex;align-items:center;gap:10px;">
      <div style="width:26px;height:26px;border:1px solid #52525b;background:#18181b;color:#d4d4d8;display:flex;align-items:center;justify-content:center;">&times;</div>
      <span style="color:#a1a1aa;font-weight:600;font-size:11px;letter-spacing:1.5px;">TICK THE SIGN</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="display:flex;align-items:center;gap:5px;background:#eab308;border:1px solid #0a0a0b;padding:3px 9px;"><span style="font-weight:700;color:#000;font-size:13px;">&#9889; 3</span></div>
    </div>
  </div>
  <div style="height:6px;background:#27272a;"><div style="height:100%;width:33%;background:#eab308;"></div></div>
  <div style="background:#fafafa;padding:12px;">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
      <div style="font-weight:600;font-size:14px;color:#18181b;">Tick the correct sign &middot; &#6042;&#6072;&#6016;&#6047;&#6025;&#6022;&#6070;&#6038;&#6042;&#6098;&#6042;&#6071;&#6040;&#6098;&#6042;&#6071;&#6038;</div>
      <div style="background:#000;color:#eab308;font-size:10px;font-weight:700;letter-spacing:1px;padding:3px 8px;">PAGE 1/2</div>
    </div>
    <div style="display:grid;grid-template-columns:84px 1fr;gap:8px;align-items:center;background:#fff;border:2px solid #000;box-shadow:3px 3px 0 #000;padding:8px;">
      <div style="font-weight:600;font-size:12px;color:#18181b;">No Parking</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
        <div style="aspect-ratio:1;border:3px solid #22c55e;background:#dcfce7;display:flex;align-items:center;justify-content:center;font-weight:700;">P&oslash;</div>
        <div style="aspect-ratio:1;border:3px solid #000;background:#fff;"></div>
        <div style="aspect-ratio:1;border:3px solid #000;background:#fff;"></div>
        <div style="aspect-ratio:1;border:3px solid #000;background:#fff;"></div>
      </div>
    </div>
  </div>
</div>
```

> The repository also has a richer interactive mockup rendered during design review
> (6 rows × 4 choices, with correct/wrong/locked states). Reproduce that look in code.

---

## 4 · Data

Use `getSignItems()` in [`src/lib/gamekit/kid-rounds.ts`](../../src/lib/gamekit/kid-rounds.ts):
pulls **published road-sign topics (category 1)** with `primaryImageUrl` and bilingual
`nameEn` / `nameKm`. We have ~247 road signs available.

- Fetch ~**24 signs** per game: **12 row answers** + **12 decoy fillers**.
- Each row's 4 choices must be **distinct**; the correct choice's `id` equals the row's
  prompt topic id.
- Shuffle choice order per row so the answer isn't always in the same slot.

---

## 5 · Architecture (GameKit contract)

Every GameKit game implements one `GameFormat` and the shared shell + server do the rest.
See [`src/lib/gamekit/types.ts`](../../src/lib/gamekit/types.ts) for the contract and
[`src/lib/gamekit/formats/catch-sign/index.tsx`](../../src/lib/gamekit/formats/catch-sign/index.tsx)
as the closest template.

```
/play card → GameKitShell(tickSignFormat)
  start() → fetchRounds() ──GET──▶ /api/game/tick-sign      (rounds; correct id per row)
  RoundView renders worksheet → onRoundComplete(RoundResult) per page
  last page → POST answers ──▶ /api/game/tick-sign/complete (resolveAccess gate)
                                  └─ re-validate each row server-side
                                  └─ calculateScore() → insert gameAttempts (if willRecord)
  ◀── KitCompletionResult → results screen
```

---

## 6 · Files to create / touch

1. **`src/lib/gamekit/formats/tick-sign/index.tsx`** — the worksheet `RoundView` +
   `tickSignFormat: GameFormat<...>`. Copy the structure of `catch-sign`.
   - `meta`: id `tick-sign`, route `/play/tick-sign`, title `{en:"Tick the Sign", kh:"ធីកសញ្ញា"}`,
     on-palette `brandColor`, a Lucide `Icon`, `accessTier:"user"`, badge `{en:"KIDS", kh:"កុមារ"}`.
   - `config`: `{ timed:false, secondsPerRound:0, scoringMode:"speed", showStreakHud:true }`.
2. **`src/lib/gamekit/kid-games.ts`** — add `buildTickSignRounds(count)`; register
   `"tick-sign": { accessTier:"user", buildRounds: buildTickSignRounds }` in `KID_GAMES`.
3. **`src/app/api/game/tick-sign/route.ts`** (GET rounds, gated by `resolveAccess`) and
   **`src/app/api/game/tick-sign/complete/route.ts`** (POST → score + record). Mirror the
   existing catch-sign / generic kid-game wiring; reuse `recordGameAttempt` (or a
   tick-sign-aware variant) in [`src/lib/gamekit/server.ts`](../../src/lib/gamekit/server.ts).
4. **`src/lib/gamekit/registry.ts`** — import and add `tickSignFormat` to `GAMEKIT_FORMATS`
   so the `/play` hub renders the card.
5. **`src/app/(public)/play/tick-sign/page.tsx`** (if a dedicated route is needed) —
   render `<GameKitShell format={tickSignFormat} />`.

---

## 7 · Server validation (anti-cheat)

Correct = the picked image's topic id equals the row's prompt topic id. The complete
route re-checks **every row** server-side before recording — it does not trust the client
correctness flag for the persisted score. Points via `calculateScore()`. Records to
`gameAttempts` only when `willRecord` (logged-in). **No `lifetimePoints` / `pointsLedger`
writes** — this is solo/practice, never the public leaderboard.

---

## 8 · Acceptance criteria

- [ ] New "Tick the Sign / ធីកសញ្ញា" card appears on `/play`.
- [ ] Worksheet renders **6 rows × 4 image choices** from **real DB signs**.
- [ ] Tapping a choice grades **instantly** (green correct / red wrong + reveal).
- [ ] Page advances **1 → 2 → results**; results screen shows score + correct count.
- [ ] Score **records for logged-in users only**; guests play unrecorded.
- [ ] `npm run build` (typecheck + lint) passes.
- [ ] Brand check: black borders, hard shadows, `#eab308`, Lucide icons, bilingual copy.

---

## 9 · Build command

A project slash command encapsulates this spec:

```
/build-tick-sign
```

Optionally pass overrides, e.g. `/build-tick-sign 3 pages of 5 rows`.

---

## 10 · Related games (roadmap)

This is game **1 of 3** worksheet-style kid games:

1. **Tick the Sign** (`tick-sign`) — this doc.
2. **Sign Match** (`sign-match` upgrade) — match signs ↔ meanings; also revives the 321
   inactive "ផ្គូផ្គង" matching questions.
3. **Word Bank** (`word-bank`) — drag word chips onto sign pictures (`@dnd-kit`).

Build order: tick-sign → sign-match → word-bank.
