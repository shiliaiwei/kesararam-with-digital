---
description: Build the tick-sign worksheet kid game in GameKit (real DB sign images)
---

Build the **`tick-sign`** worksheet game in the Kesararam GameKit. Follow this locked spec exactly. Before writing code, re-read the referenced files to confirm current contracts, then implement and report what you changed.

## Concept
A worksheet like a kindergarten road-safety sheet: each **row** shows a sign **name** (EN + ខ្មែរ) on the left and **4 real sign images** with tick boxes on the right. The player taps the correct image per row. Rows grade **instantly** (auto-advance, no submit button): correct tap locks green with a check badge; wrong tap shows red ✗ and highlights the correct sign green. Rows fill top-down; later rows are dimmed until reached.

## Locked design choices
- **Size:** 2 pages × 6 rows = 12 signs total. Each page is one GameKit round (or render both pages as a paged worksheet — keep the GameKitShell HUD/progress).
- **Choices per row:** 4 (1 correct + 3 decoys).
- **Decoys:** any random road signs (no shape/color tagging needed).
- **Grading:** instant client feedback (catch-sign pattern); the complete route re-validates the recorded score server-side. Practice-only, **no leaderboard**.
- **Access tier:** `user` (guests play but are not recorded).
- **Brand:** follow the `kwd-brand-design` skill — black 2–3px borders, hard `3–4px 3–4px 0 #000` shadows (no blur), `#eab308` yellow, Lucide icons only (NO emoji/Unicode), bilingual EN/ខ្មែរ. Images via `cloudinaryOptimize()`.

## Data
- Use `getSignItems()` in `src/lib/gamekit/kid-rounds.ts` (published road-sign topics, category 1, with `primaryImageUrl` + `nameEn`/`nameKm`). Fetch ~24 signs per game: 12 row answers + 12 decoy fillers. Ensure each row's 4 choices are distinct and the correct sign's id is the row's prompt topic id.

## Files to create / touch
1. `src/lib/gamekit/formats/tick-sign/index.tsx` — the worksheet `RoundView` + the `tickSignFormat: GameFormat<...>` (meta + config). Copy the structure of `src/lib/gamekit/formats/catch-sign/index.tsx`. Meta: id `tick-sign`, route `/play/tick-sign`, bilingual title "Tick the Sign / ធីកសញ្ញា", brandColor on-palette, Lucide icon, `accessTier: "user"`, badge KIDS/កុមារ. Config: `timed: false`, `scoringMode: "speed"`, `showStreakHud: true`.
2. `src/lib/gamekit/kid-games.ts` — add `buildTickSignRounds(count)` and register `"tick-sign"` in `KID_GAMES` with `accessTier: "user"`.
3. `src/app/api/game/tick-sign/route.ts` (GET rounds, gated by `resolveAccess`) and `src/app/api/game/tick-sign/complete/route.ts` (POST → score via the GameKit server service, record to `gameAttempts` only when `willRecord`). Mirror how the existing catch-sign / generic kid-game routes are wired — reuse `recordGameAttempt` (or a tick-sign-aware variant) in `src/lib/gamekit/server.ts`.
4. `src/lib/gamekit/registry.ts` — import and add `tickSignFormat` to `GAMEKIT_FORMATS` so the `/play` hub renders its card.
5. If the page route is needed, add `src/app/(public)/play/tick-sign/page.tsx` rendering `<GameKitShell format={tickSignFormat} />` (match how other GameKit games mount their route).

## Server validation (anti-cheat)
Correct = picked image's topic id equals the row's prompt topic id. Re-check each row server-side in the complete route before recording; do not trust client correctness for the persisted score. Points via `calculateScore()`.

## Verify before done
- `npm run build` (or the project's typecheck/lint) passes.
- New card appears on `/play`; the worksheet renders 6 rows × 4 image choices from real DB signs; instant green/red feedback works; page advances 1→2→results; score records for logged-in users only.

Do NOT push or commit unless I explicitly say so (see memory: git-push-discipline). Only touch the files listed above.

If `$ARGUMENTS` is provided, treat it as overrides to the spec above (e.g. different page/row counts).
