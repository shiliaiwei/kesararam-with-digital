---
description: Build the Word Bank (word-bank) drag-the-word kid game in GameKit
---

Build the **`word-bank`** ("Word Bank") game in the Kesararam GameKit. Follow the full
spec in [`docs/games/word-bank.md`](../../docs/games/word-bank.md) exactly. Re-read the
referenced source files to confirm current contracts before writing code, then implement
and report what you changed.

## Locked decisions (summary — full detail in the doc)
- Id `word-bank`, route `/play/word-bank`, title "Word Bank / ធនាគារពាក្យ".
- **Word bank on top + grid of 8 sign pictures** with empty drop slots below.
- **Placement = drag chips with `@dnd-kit`** (installed); **tap-to-place fallback** for small screens.
- **8 signs per round.**
- **Wrong placement = lock as wrong** (red, counted incorrect); correct = green, chip removed from bank.
- **Content = both/mix:** live sign topics via `getSignItems()` AND the 321 revived "ផ្គូផ្គង" matching questions (adapter + re-enable; fall back to live sign topics if the data shape needs more work so the game still ships).
- Practice-only, **no leaderboard**, `accessTier: "user"` (guests play unrecorded).
- Brand: follow `kwd-brand-design` — black 2–3px borders, hard `3px 3px 0 #000` shadows (no blur), `#eab308` yellow chips, green=correct / red=wrong, Lucide icons only (NO emoji/Unicode), bilingual EN/ខ្មែរ, sign images via `cloudinaryOptimize()`. Runs in `GameKitShell` with a filled/total counter.

## Files to create / touch
1. `src/lib/gamekit/formats/word-bank/index.tsx` — `RoundView` (word bank + picture grid, `@dnd-kit` drag + tap fallback, green/red/locked states) + `wordBankFormat`. Config `{ timed:false, secondsPerRound:0, scoringMode:"equal", showStreakHud:false }`.
2. `src/lib/gamekit/kid-games.ts` — add `buildWordBankRounds(count)` (8 items, mixed sources) and register `"word-bank"` in `KID_GAMES`.
3. `src/app/api/game/word-bank/route.ts` (GET, gated by `resolveAccess`) + `src/app/api/game/word-bank/complete/route.ts` (POST → re-validate placements + score + record). Reuse `recordGameAttempt` (or a placement-aware variant) in `src/lib/gamekit/server.ts`.
4. `src/lib/gamekit/registry.ts` — add `wordBankFormat` to `GAMEKIT_FORMATS`.
5. `src/app/(public)/play/word-bank/page.tsx` if a dedicated route is needed — render `<GameKitShell format={wordBankFormat} />`.

## Server validation (anti-cheat)
Correct placement = chip's topic id equals the picture's topic id. Re-check every placement server-side in the complete route before recording; client correctness is cosmetic. Points via `calculateScore()`. Record to `gameAttempts` only when `willRecord`. No leaderboard writes.

## Verify before done
- `npm run build` (typecheck + lint) passes.
- New card on `/play`; word bank + 8 sign pictures from real DB content; drag-to-place works (tap fallback too); correct=green, wrong=locked red; round ends → results with score + correct count; records for logged-in users only.

Do NOT push or commit unless I explicitly say so (memory: git-push-discipline). Only touch the files listed above.

If `$ARGUMENTS` is provided, treat it as overrides (e.g. different sign count).
