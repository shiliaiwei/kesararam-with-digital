---
description: Build the Connect the Signs (sign-connect) two-column line-match kid game in GameKit
---

Build the **`sign-connect`** ("Connect the Signs") game in the Kesararam GameKit. Follow
the full spec in [`docs/games/connect-the-signs.md`](../../docs/games/connect-the-signs.md)
exactly. Re-read the referenced source files to confirm current contracts before writing
code, then implement and report what you changed.

## Locked decisions (summary — full detail in the doc)
- **New game**, id `sign-connect`, route `/play/sign-connect`, title "Connect the Signs / ភ្ជាប់សញ្ញា". Do NOT modify the existing flip-card `sign-match`.
- **Two-column line match:** left = real sign images, right = shuffled meaning labels. Tap a sign → tap a meaning → animated connecting line.
- **4 pairs per round.**
- **Wrong match = lock as wrong** (red, counted incorrect); correct = green lock. Round can end with mistakes shown.
- **Content = both/mix:** live sign topics via `getSignItems()` AND the 321 revived "ផ្គូផ្គង" matching questions (adapter + re-enable; fall back to live sign topics if the data shape needs more work so the game still ships).
- Practice-only, **no leaderboard**, `accessTier: "user"` (guests play unrecorded).
- Brand: follow `kwd-brand-design` — black 2–3px borders, hard `3px 3px 0 #000` shadows (no blur), `#eab308` yellow, green=correct / red=wrong, Lucide icons only (NO emoji/Unicode), bilingual EN/ខ្មែរ, images via `cloudinaryOptimize()`. Runs in `GameKitShell` with a matched/total pairs counter.

## Files to create / touch
1. `src/lib/gamekit/formats/sign-connect/index.tsx` — two-column `RoundView` (tap-tap + absolutely-positioned SVG line layer for selected/correct/wrong states) + `signConnectFormat`. Config `{ timed:false, secondsPerRound:0, scoringMode:"equal", showStreakHud:false }`.
2. `src/lib/gamekit/kid-games.ts` — add `buildSignConnectRounds(count)` (4 pairs, mixed sources) and register `"sign-connect"` in `KID_GAMES`.
3. `src/app/api/game/sign-connect/route.ts` (GET, gated by `resolveAccess`) + `src/app/api/game/sign-connect/complete/route.ts` (POST → re-validate pairs + score + record). Reuse `recordGameAttempt` (or a pair-aware variant) in `src/lib/gamekit/server.ts`.
4. `src/lib/gamekit/registry.ts` — add `signConnectFormat` to `GAMEKIT_FORMATS`.
5. `src/app/(public)/play/sign-connect/page.tsx` if a dedicated route is needed — render `<GameKitShell format={signConnectFormat} />`.

## Server validation (anti-cheat)
Correct pair = picked meaning's topic id equals the sign's topic id. Re-check every pair server-side in the complete route before recording; client correctness is cosmetic. Points via `calculateScore()`. Record to `gameAttempts` only when `willRecord`. No leaderboard writes.

## Verify before done
- `npm run build` (typecheck + lint) passes.
- New card on `/play` (distinct from Sign Match); 4 sign tiles ↔ 4 shuffled meanings from real DB content; tap-tap line draws; correct=green, wrong=locked red; round ends → results with score + correct count; records for logged-in users only.

Do NOT push or commit unless I explicitly say so (memory: git-push-discipline). Only touch the files listed above.

If `$ARGUMENTS` is provided, treat it as overrides (e.g. different pair count).
