---
description: Build Traffic Commander — top-down traffic-sim GameKit game superseding the priority puzzle
---

Build **`traffic-commander`** ("Traffic Commander / មេបញ្ជាការចរាចរណ៍") in the Kesararam
GameKit. Follow the full spec in
[`docs/games/traffic-commander.md`](../../docs/games/traffic-commander.md) exactly.
Re-read the referenced source files first (priority format, `validatePriority` in
`src/lib/gamekit/server.ts`, `priorityScenes` schema in `src/db/schema/content.ts`).

This is a LARGE, multi-phase game. **Default to phased delivery** unless told otherwise —
build and verify one phase, report, then continue:
- **Phase 1:** schema migration (`mode`, `answer_key` on `priorityScenes`) + Mode A
  (pointer-draw paths, draw-order = priority) + `validateTrafficCommander` (Mode A) +
  post-submit animation + why-card + migrate the 4 existing approved scenes into Mode A
  (derive `pathOrder` from `correctOrder`, derive `checkpoints` geometrically from
  approach+intent) + register format, de-list `priorityFormat`.
- **Phase 2:** Mode B (Sign Placer) with `@dnd-kit`, real category-1 sign palette,
  same-subcategory decoys.
- **Phase 3:** Mode C (Marking Master) + Mode D (Safe Driver route draw).
- **Phase 4:** admin scene editor (same drag/draw UI, saves layout + answer key).

If `$ARGUMENTS` names a phase (e.g. "phase 2"), build only that phase.

## Non-negotiables
- 5 rounds/game; top-down 2D SVG scene; pointer events for drawing (A/D), `@dnd-kit` for drag (B/C).
- **Answer key stays server-only** (`answer_key` JSON), stripped from GET like `correctOrder`. Client submits sampled path points + `{slotId, signId}` placements only.
- Server validates checkpoint-sequence within radius + slot matches; **partial credit per element** via `calculateScore()` → `gameAttempts`. Practice-only, **no leaderboard**.
- After submit: animate vehicles along correct paths, THEN bilingual why-card (`explanationEn`/`explanationKm`).
- Sign palette = real topics from category 1 with same-subcategory decoys.
- Register in `KID_GAMES`, `accessTier: "user"`. UI per `kwd-brand-design` (black borders, hard shadows, `#eab308`, Lucide icons only, bilingual EN/ខ្មែរ).
- Ensure the pointer-draw layer and `@dnd-kit` sensors don't fight for pointer events.

## Files
See doc §9. Touch only those. Run `npm run build` (typecheck + lint) before declaring a phase done, and report what you changed + what's left.

Do NOT push or commit unless I explicitly say so (memory: git-push-discipline).
