---
name: kwd-gamekit-build-workflow
description: KWD GameKit implementation workflow for building, updating, reviewing, or fixing kid game modes such as sign-connect, tick-sign, word-bank, traffic-commander, catch-sign, light-hero, safety-adventure, and other /play activities. Use when Codex works on GameKit formats, kid-games round builders, game API routes, server validation, scoring/attempt recording, play hub cards, or docs/games specs in this Kesararam repo.
---

# KWD GameKit Build Workflow

Use this as the single track for GameKit work. Keep reusable GameKit instructions
inside `.agents/skills`, not in tool-specific command folders.

## First Pass

1. Inspect the current implementation before editing:
   - `src/lib/gamekit/registry.ts`
   - `src/lib/gamekit/kid-games.ts`
   - `src/lib/gamekit/server.ts`
   - `src/lib/gamekit/types.ts`
   - the target format under `src/lib/gamekit/formats/<game-id>/`
   - target routes under `src/app/api/game/<game-id>/`
   - target page under `src/app/(public)/play/<game-id>/page.tsx`
2. Read the relevant game spec in `docs/games/` when it exists.
3. Read `references/gamekit-activity-specs.md` for consolidated game-specific
   decisions.
4. If UI changes are needed, also use `$kwd-brand-design`.
5. If scoring/rewards are touched, also use `$kwd-game-system-algorithms`.

## Non-Negotiables

- Build from real DB-backed road-safety content where the spec says so; sign games
  should use `getSignItems()` unless a newer adapter is already in the repo.
- Keep client feedback cosmetic. Re-check correctness server-side in the complete
  route before recording attempts or scores.
- Practice kid games are not public leaderboard writers unless the current spec
  explicitly says otherwise.
- Keep access tiers in the format meta, `KID_GAMES`, and API routes aligned.
- Keep the play hub registry in `GAMEKIT_FORMATS`; do not leave a finished game
  missing from `/play`.
- Keep the UI bilingual EN/Khmer and branded: solid black borders, hard no-blur
  shadows, `#eab308` yellow, semantic red/green/blue/orange/purple, Lucide icons,
  no emoji or raw Unicode icons.
- Do not push or commit unless the user explicitly says `push` or asks for a commit.

## Implementation Pattern

For a new or missing GameKit activity:

1. Create or update `src/lib/gamekit/formats/<game-id>/index.tsx`.
2. Add or update the round builder in `src/lib/gamekit/kid-games.ts`.
3. Add or update `src/app/api/game/<game-id>/route.ts`.
4. Add or update `src/app/api/game/<game-id>/complete/route.ts`.
5. Add or update validation/recording helpers in `src/lib/gamekit/server.ts`.
6. Register the format in `src/lib/gamekit/registry.ts`.
7. Add a dedicated page route only when the existing GameKit routing pattern
   requires it.
8. Verify `/play` shows the card and the game runs through result state.

For an existing activity, patch only the missing or incorrect layer; do not replay
the whole build prompt blindly.

## Verification

Prefer focused checks because broad repo gates may be noisy:

```bash
PATH="/Users/Apple16/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" ./node_modules/.bin/tsc --noEmit --pretty false
PATH="/Users/Apple16/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" ./node_modules/.bin/vitest --run <focused-test-files>
git diff --check -- <touched-files>
```

If broad `tsc` or ESLint fails from unrelated existing repo errors, report that
clearly and add a targeted check/filter for touched files. Browser-check the local
route when UI behavior changes.
