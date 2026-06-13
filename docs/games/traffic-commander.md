# Traffic Commander — Game Design & Build Spec

> **Game id:** `traffic-commander` · **Display name:** Traffic Commander · **ខ្មែរ:** មេបញ្ជាការចរាចរណ៍
> **Type:** Top-down 2D SVG traffic simulation (GameKit) · **Access:** `user` (practice-only, no leaderboard)
> **Status:** STUDY / design review — not yet approved to build
> **Supersedes:** the `priority-puzzle` ("Who Goes First?") game
> **Owner:** KWD (Kesararam With Digital) · Technovation Girls 2026 · Team #50777

This document is the **study + design spec** and a **build prompt**. It is bigger than the
worksheet games (tick-sign / sign-connect / word-bank) — read it fully before approving.
It generalizes the existing **priority puzzle** engine: a top-down intersection with a
**server-only answer key** validated like
[`validatePriority`](../../src/lib/gamekit/server.ts).

---

## 1 · Concept

A top-down 2D SVG intersection. **5 rounds per game**, each round is one of **4 modes**.
The player interacts directly with the scene (draw paths, drag signs/markings, draw a
route). On submit, the server validates against a hidden answer key, awards **partial
credit per element**, then the scene **animates the vehicles along the correct paths**
before showing a bilingual **why-card** (`explanationEn` / `explanationKm`).

### The 4 round modes
| Mode | Name | Interaction | Validates |
|------|------|-------------|-----------|
| **A** | **Priority Director** | Finger-**DRAW** each vehicle's path through the junction; **draw order = priority order** | Each path hits its checkpoints in sequence (within radius) **and** draw order matches `pathOrder` |
| **B** | **Sign Placer** | **DRAG** the correct sign from a 4-choice palette onto a scene slot | Each `{slotId, signId}` matches `slotAnswers` |
| **C** | **Marking Master** | **DRAG** road markings (zebra, stop line, lane arrow…) onto the road | Each `{slotId, markingId}` matches `slotAnswers` |
| **D** | **Safe Driver** | **DRAW** one route that obeys all signs/lights | Route passes required checkpoints in order **and** commits no violation (e.g. crossing a red, wrong-way) |

Modes A and D use **pointer events** for line drawing; B and C use **`@dnd-kit`**
(installed) for drag.

---

## 2 · Why supersede the priority game

The priority puzzle already has the right bones: a top-down `JunctionLayout`, a
**server-only `correctOrder`** never sent before scoring, and partial-aware
`validatePriority`. Traffic Commander keeps that trust model and **extends** it with
slots, palette, lights, and drawn paths — Mode A *is* the priority game, upgraded from
"tap who goes first" to "draw the paths in order". The 4 existing approved scenes migrate
straight into Mode A.

---

## 3 · Data model

### 3.1 Client-facing layout JSON (NO answers) — `priorityScenes.layout`
```jsonc
{
  "junction": "cross | t_junction | roundabout",
  "mode": "A | B | C | D",
  "hasTrafficLight": true,
  "lights": [{ "id": "L1", "approach": "north", "state": "red|green|yellow" }],
  "vehicles": [{ "id": "v1", "approach": "south", "intent": "right", "kind": "car", "pos": 0.9 }],
  "slots":   [{ "id": "s1", "x": 230, "y": 58, "kind": "sign | marking" }],   // B / C
  "palette": [{ "id": "p1", "signId": 412, "imageUrl": "...", "label": "No Entry" }] // B / C (incl. decoys)
}
```

### 3.2 Server-only answer key — extend `priorityScenes`
Add a JSON column `answer_key` (server-only, never sent before scoring). Keep `correctOrder`
for backward compatibility with migrated Mode-A scenes.
```jsonc
{
  "pathOrder":  ["v1", "v2", "v3"],                          // A: priority/draw order
  "checkpoints": { "v1": [{ "x": 150, "y": 175, "r": 22 }, { "x": 300, "y": 150, "r": 22 }] }, // A / D
  "slotAnswers": [{ "slotId": "s1", "signId": 412 }],        // B / C
  "routeCheckpoints": [{ "x": 60, "y": 150, "r": 24 }],      // D
  "violations": [{ "type": "red_light", "approach": "north" }] // D (optional disqualifiers)
}
```

### 3.3 Schema migration (`priorityScenes`)
Add two columns (Drizzle migration):
- `mode text not null default 'A'`
- `answer_key text` (JSON, server-only)

`layout` already JSON-flexible; extend the parsed type. `correctOrder` stays. Bump the
admin/types accordingly. (Table name `priority_scenes` is kept; the game reads it as
"traffic scenes".)

---

## 4 · Client submission shapes (per round)

The client submits only **sampled input**, never correctness:
```jsonc
// Mode A
{ "mode": "A", "paths": { "v1": [{x,y}, ...], "v2": [...] }, "drawOrder": ["v1","v2","v3"] }
// Mode B / C
{ "mode": "B", "placements": [{ "slotId": "s1", "signId": 412 }] }
// Mode D
{ "mode": "D", "routePoints": [{x,y}, ...] }
```
Paths/routes are **down-sampled** (e.g. ~1 point per 8–12px) before sending to keep the
payload small.

---

## 5 · Server validation (`validateTrafficCommander` in server.ts)

Mirror `validatePriority`: load scenes (with `answer_key`), validate per mode, never trust
the client. **Partial credit per element**, each scored via `calculateScore()`, summed.

- **A — checkpoint-sequence within radius:** for each vehicle, walk its submitted points
  and confirm they pass through the vehicle's `checkpoints` **in order** — each checkpoint
  is "hit" when some point falls within `r`. Vehicle is correct only if all its checkpoints
  are hit in sequence. Then require `drawOrder == pathOrder`. Score = correct-vehicle
  fraction + an order bonus.
- **B / C — slot matches:** each placement is correct iff `signId/markingId == slotAnswers[slotId]`.
  Score = correct-slot fraction.
- **D — route + no violation:** route must hit `routeCheckpoints` in order (radius rule)
  **and** trigger none of `violations`. Score = checkpoints-hit fraction, zeroed if a
  violation occurs.

Records to `gameAttempts` only when `willRecord` (logged-in). **No leaderboard writes** —
solo/practice, exactly like priority/daily.

---

## 6 · Post-submit animation + why-card

After scoring, before the explanation:
1. Reveal the correct answer key (paths, slots) on the SVG.
2. **Animate vehicles** along their correct paths (CSS/SVG `<animateMotion>` or CSS
   offset-path) so kids *see* the right outcome — emergency first, give-way to the right, etc.
3. Then show the bilingual **why-card** (`explanationEn` / `explanationKm`), reusing the
   priority result-view pattern.

---

## 7 · Sign / marking palette (real content)

- Signs pull **real topics from category 1** (~246 signs across Warning / Prohibitory /
  Informative / etc.) via the topic queries (see `getSignItems()` / topic subcategory).
- **Decoys are same-subcategory** as the answer (e.g. a prohibitory answer → prohibitory
  decoys) so the choice tests meaning, not shape/color.
- Markings (Mode C): a small fixed set (zebra crossing, stop line, lane arrow, give-way
  triangles, center line) rendered as SVG.

---

## 8 · Admin scene editor (content scaling)

A new admin page (extend `src/app/(dashboard)/admin/content/priority/`) using the **same
drag/draw UI** as the game:
- Pick junction + mode; place vehicles (approach/intent/kind), lights.
- **Mode A/D:** draw the correct path(s) → the editor samples them into `checkpoints`
  (+ `pathOrder` from draw order).
- **Mode B/C:** drop slots on the scene, pick palette items + mark the correct one →
  `slotAnswers`.
- Write bilingual title + explanation, set difficulty/status.
- **Saves the answer key server-side**; preview replays the animation.

This lets non-engineers author scenes, scaling content beyond the 4 seeded ones.

---

## 9 · Files to create / touch

1. **`src/lib/gamekit/formats/traffic-commander/`** — `index.tsx` (format), `SceneView.tsx`
   (the SVG canvas + pointer-draw + `@dnd-kit` drag), per-mode controllers, `ResultView`
   (animation + why-card), `types.ts`.
   - `meta`: id `traffic-commander`, route `/play/traffic-commander`, title
     `{en:"Traffic Commander", kh:"មេបញ្ជាការចរាចរណ៍"}`, on-palette `brandColor`, Lucide
     `Icon`, `accessTier:"user"`, badge.
   - `config`: `{ timed:false, secondsPerRound:0, scoringMode:"speed", showStreakHud:true }`.
2. **`src/lib/gamekit/server.ts`** — add `validateTrafficCommander(...)` (per-mode,
   partial credit). Keep `validatePriority` for any legacy use.
3. **`src/lib/gamekit/kid-games.ts`** — add `buildTrafficCommanderRounds(count=5)` (mix
   modes A–D from scenes); register `"traffic-commander": { accessTier:"user", ... }`.
4. **`src/app/api/game/traffic-commander/route.ts`** (GET, strips answer key, gated by
   `resolveAccess`) + **`.../complete/route.ts`** (POST → `validateTrafficCommander`).
5. **`src/db/schema/content.ts`** + Drizzle migration — add `mode`, `answer_key` to
   `priorityScenes`; extend types.
6. **`src/lib/gamekit/registry.ts`** — add `trafficCommanderFormat`; **remove/de-list**
   `priorityFormat` (superseded).
7. **`src/app/(public)/play/traffic-commander/page.tsx`** (if needed).
8. **Admin editor** under `src/app/(dashboard)/admin/content/priority/` (or a new
   `traffic/` route) — scene authoring UI saving layout + answer key.
9. **Migration script** — set the 4 existing approved scenes to `mode='A'`, derive
   `answer_key.pathOrder` from `correctOrder`, and **geometrically derive `checkpoints`**
   from each vehicle's approach + intent (entry → center → intent-based exit).

---

## 10 · Acceptance criteria

- [ ] "Traffic Commander / មេបញ្ជាការចរាចរណ៍" card on `/play`; priority puzzle de-listed.
- [ ] 5 rounds/game spanning modes A–D; each renders the top-down SVG scene.
- [ ] Mode A: drawing paths + draw-order works; Mode B/C: drag from palette / markings onto slots; Mode D: route draw.
- [ ] Server validates checkpoints-in-radius + slot matches; **partial credit** reflected in score.
- [ ] After submit: vehicles **animate** along correct paths, then bilingual why-card shows.
- [ ] Sign palette uses real category-1 signs with **same-subcategory decoys**.
- [ ] Admin scene editor creates a playable scene end-to-end (saves answer key).
- [ ] 4 legacy priority scenes migrated into Mode A and playable.
- [ ] Score records for logged-in users only; **no leaderboard**.
- [ ] `npm run build` passes; brand per `kwd-brand-design`; bilingual EN/ខ្មែរ throughout.

---

## 11 · Open decisions / risks (resolve before build)

1. **Round-mode mix per game** — fixed (1×A, 1×B, 1×C, 1×D, +1 random) or weighted random?
2. **Path-draw tolerance** — checkpoint radius `r` and sampling density need play-testing
   (too tight = frustrating for kids; too loose = trivial).
3. **Content dependency** — modes B/C/D need authored scenes with answer keys; only 4
   Mode-A scenes exist today. The **admin editor is on the critical path** to having
   enough content. Consider seeding a handful of B/C/D scenes by hand first.
4. **Scope** — this is multi-phase, far larger than the worksheet games. Suggested phasing:
   - **Phase 1:** schema migration + Mode A (draw paths) + migrate 4 scenes + validation/animation.
   - **Phase 2:** Mode B (sign placer) + palette sourcing + decoys.
   - **Phase 3:** Mode C (markings) + Mode D (safe route).
   - **Phase 4:** admin scene editor.
5. **`@dnd-kit` + pointer-draw on one SVG** — ensure the drawing layer and drag sensors
   don't fight for pointer events (separate layers / disable draw during drag).

---

## 12 · Build command

```
/build-traffic-commander
```
Optionally pass a phase, e.g. `/build-traffic-commander phase 1`.

---

## 13 · Related games

Part of the KWD GameKit. Companion worksheet games: `tick-sign`, `sign-connect`,
`word-bank` (see their docs in this folder). Traffic Commander is the flagship
interactive simulation, superseding `priority-puzzle`.
