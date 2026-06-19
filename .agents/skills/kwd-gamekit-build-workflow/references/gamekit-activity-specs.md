# KWD GameKit Activity Specs

This file consolidates reusable GameKit build notes. Treat the current code and
`docs/games/*.md` as the source of truth; these notes preserve locked product
decisions and file maps.

## sign-connect

- Game id: `sign-connect`
- Route: `/play/sign-connect`
- Title: `Connect the Signs / ភ្ជាប់សញ្ញា`
- Do not modify the older flip-card `sign-match`.
- UI: two-column line match. Left column = real sign images. Right column =
  shuffled meaning labels. Tap sign, tap meaning, draw an SVG connecting line.
- Round size: 4 pairs.
- Wrong match locks red and counts incorrect. Correct match locks green.
- Content: live sign topics through `getSignItems()`. If revived matching-question
  data is available and safely adapted, it can be mixed in; otherwise live sign
  topics are the fallback.
- Practice-only; no leaderboard. Access tier: `user`.
- Server validation: picked meaning topic id must equal sign topic id.
- Main files: format index, `kid-games.ts`, GET/complete API routes,
  `gamekit/server.ts`, registry, optional play page.

## word-bank

- Game id: `word-bank`
- Route: `/play/word-bank`
- Title: `Word Bank / ធនាគារពាក្យ`
- UI: word bank on top plus 8 sign pictures with empty drop slots.
- Interaction: `@dnd-kit` drag chips, with tap-to-place fallback for small screens.
- Round size: 8 signs.
- Wrong placement locks red and counts incorrect. Correct placement locks green
  and removes the chip from the bank.
- Content: live sign topics through `getSignItems()`; revived matching-question
  data can be added only with a safe adapter.
- Practice-only; no leaderboard. Access tier: `user`.
- Server validation: chip topic id must equal picture topic id.
- Main files: format index, `kid-games.ts`, GET/complete API routes,
  `gamekit/server.ts`, registry, optional play page.

## tick-sign

- Game id: `tick-sign`
- Route: `/play/tick-sign`
- Title: `Tick the Sign / ធីកសញ្ញា`
- UI: worksheet rows. Each row shows a sign name EN/Khmer and 4 real sign image
  choices with tick boxes.
- Size: 2 pages x 6 rows = 12 signs total. Each page is a GameKit round unless
  the current implementation has a better worksheet pagination pattern.
- Choices per row: 1 correct + 3 random road-sign decoys.
- Grading: instant client feedback. Correct locks green; wrong shows red and
  highlights the correct sign.
- Later rows stay dimmed until reached.
- Practice-only; no leaderboard. Access tier: `user`.
- Server validation: picked image topic id must equal row prompt topic id.
- Main files: format index, `kid-games.ts`, GET/complete API routes,
  `gamekit/server.ts`, registry, optional play page.

## traffic-commander

- Game id: `traffic-commander`
- Route: `/play/traffic-commander`
- Title: `Traffic Commander / មេបញ្ជាការចរាចរណ៍`
- This supersedes the older priority puzzle in the play hub.
- Prefer phased delivery:
  - Phase 1: schema support for `mode` and `answer_key` on `priorityScenes`,
    Mode A pointer-draw paths, server validation, post-submit animation, why-card,
    migrate existing approved scenes into Mode A, register format, de-list priority
    from the hub.
  - Phase 2: Mode B sign placer with `@dnd-kit`, real category-1 sign palette,
    same-subcategory decoys.
  - Phase 3: Mode C marking master and Mode D safe-driver route draw.
  - Phase 4: admin scene editor with the same drag/draw UI.
- Game shape: 5 rounds/game, top-down 2D SVG scene.
- Answer key is server-only JSON and must be stripped from GET responses.
- Client submits sampled path points and/or placements only.
- Server validates checkpoint sequence within radius and slot/sign matches.
- Award partial credit per element through the project scoring helper.
- Practice-only; no leaderboard unless a newer spec explicitly changes that.
- After submit, animate vehicles along correct paths, then show the bilingual
  why-card (`explanationEn`/`explanationKm`).
- Main files: follow `docs/games/traffic-commander.md` section 9 and inspect the
  current format, API routes, schema, registry, and server validator first.
