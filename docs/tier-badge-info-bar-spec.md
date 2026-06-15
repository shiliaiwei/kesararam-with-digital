# Tier Badge — "Info bar" style implementation spec

> Design decision (final): tier badge uses the **Info-bar style** for BOTH the
> avatar profile border and the tier name label, across all 6 tiers, in each
> tier's **real game color**, with a splash animation. Tier names are **English
> only** (never translated). Tier 2 "Debut" is renamed to **"Rising"** (display
> label only; internal id stays `"debut"`).

---

## Task

Implement a new **Info-bar style** tier badge for the KWD road-safety education app
(Next.js + Tailwind + TypeScript). It replaces the current plain pill `RankBadge`.
The badge appears in TWO forms that must visually match:
1. **Name label** — an info-sign nameplate shown beside a username.
2. **Avatar profile border** — a matching square frame around the user's avatar.

Both use each tier's **real game color** (NOT the brand's semantic palette).

## Important naming rules
- **Tier names are ENGLISH ONLY — never translate them.** Render `label` as-is
  regardless of the active language (English in Khmer mode too). Tier names are not
  bilingual; only render the English `label`.
- **Rename tier "Debut" → "Rising".** Change only the display `label`. Keep the
  internal `id: "debut"` unchanged so existing references (e.g. `TIER_COOLDOWNS`
  keyed by `"debut"`, any DB/analytics) keep working.

## Research first (don't duplicate existing logic)
Read and reuse these before writing code:
- `src/lib/rank-utils.ts` — `RANK_TIERS`, `getRank()`, `getNextRank()`. Tier data
  (label, accent, minPoints, textColor, animated) already exists here.
- `src/components/shared/rank-label.tsx` — current `RankBadge`, `RankedAvatarRing`,
  `RankProgressBar`, `RankShowcase`, the `TIER_ICONS` map, and the `RANK_KEYFRAMES`
  injected `<style>`. Update these in place; keep the exported component names.
- `src/app/(public)/leaderboard/page.tsx` — how `RankBadge`/`TierBadge` and the
  `Avatar` component are used in podium cards and list rows. Wire the new badge in
  here (rows: name label; podium/profile: border + label).
- Follow the brand system in `.claude/skills/kwd-brand-design`: solid **3px black
  borders**, **hard offset shadow `2px 2px 0 #000` (zero blur)**, **sharp corners
  (border-radius 0)**, **Lucide icons only** (no emoji/Unicode), uppercase tracked
  bold labels. Tier colors are the allowed exception to the semantic-color rule —
  use the real tier colors below.

## Tier data (all 6 — English names, real colors, add `textDark`)
`RANK_TIERS` already has `accent`, `label`, `minPoints`, `textColor`, and
`TIER_ICONS` has the Lucide icon. Rename the Debut label to "Rising" and add a
`textDark` value per tier for the nameplate body text on white (darkest shade of
the same hue):

| id        | label (EN, never translated) | accent (block bg) | textColor (on block) | textDark (name on white) | Lucide icon  | minPoints |
|-----------|------------------------------|-------------------|----------------------|--------------------------|--------------|-----------|
| rookie    | Rookie                       | `#71717a` gray    | `#ffffff`            | `#3f3f46`                | `Sprout`     | 0         |
| debut     | Rising                       | `#7c3aed` purple  | `#ffffff`            | `#5b21b6`                | `PartyPopper`| 10000     |
| gold      | Gold                         | `#eab308` yellow  | `#000000`            | `#a16207`                | `Star`       | 30000     |
| platinum  | Platinum                     | `#38bdf8` blue    | `#000000`            | `#0369a1`                | `Trophy`     | 60000     |
| diamond   | Diamond                      | `#06b6d4` cyan    | `#000000`            | `#0e7490`                | `Gem`        | 100000    |
| mythic    | Mythic                       | `#ec4899` pink    | `#ffffff`            | `#9d174d`                | `Crown`      | 200000    |

(If `labelKh` exists on the tier type, you may leave the field but DO NOT use it for
the badge — the badge always shows the English `label`.)

## 1) Name label — info-sign nameplate
Horizontal info-sign: a tier-colored square block (icon) + black divider + white
body (tier name, optional points). Reference markup to translate to JSX:

```html
<div style="display:flex; align-items:stretch; border:3px solid #000;
            box-shadow:2px 2px 0 #000; background:#fff; border-radius:0;">
  <!-- color block with icon -->
  <div style="background:#eab308; display:flex; align-items:center;
              padding:0 8px; border-right:3px solid #000;">
    <!-- Lucide <Star size={15} color={textColor} /> -->
  </div>
  <!-- body -->
  <div style="display:flex; flex-direction:column; justify-content:center;
              padding:4px 10px; line-height:1.15;">
    <span style="font-weight:800; text-transform:uppercase; letter-spacing:.05em;
                 font-size:11px; color:#a16207;">Gold</span>
    <!-- optional threshold, mono, #71717a, 8px, e.g. "30K" — make it a `showPoints` prop -->
  </div>
</div>
```
- Block bg = `accent`, icon color = `textColor`, name color = `textDark`.
- Support `size` prop (`xs`/`sm`/`md`) scaling font/padding like the current RankBadge.
- Add an optional `showPoints` prop (default false) that renders the tier threshold
  in mono under the name.

## 2) Avatar profile border — matching info-sign frame
Square frame around the avatar: black outline → tier-color ring → avatar face.
Keep `RankedAvatarRing`'s signature (`lifetimePoints`, `size`, `children`) but
change it to this square info-sign frame (replace the round gradient ring):

```html
<div style="filter:drop-shadow(2px 2px 0 #000); background:#000; border-radius:0;
            padding:3px; display:inline-flex;">       <!-- black outline -->
  <div style="background:#eab308; padding:3px;">       <!-- tier-color ring -->
    <div style="overflow:hidden; background:#fff;">     <!-- avatar face slot -->
      <!-- children (the Avatar / image / initials) -->
    </div>
  </div>
</div>
```
- Ring bg = tier `accent`. Sharp corners (radius 0) to match the nameplate.
- The face slot wraps the passed `children` avatar at the given `size`.

## 3) Splash animation
Add these keyframes to the existing injected `<style>` (next to `RANK_KEYFRAMES`),
and apply on mount:
```css
@keyframes rankPop  { 0%{transform:scale(.6);opacity:0} 65%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
@keyframes rankShine{ 0%{left:-50%} 55%{left:130%} 100%{left:130%} }
```
- **Pop-in:** apply `animation: rankPop .45s cubic-bezier(.34,1.56,.64,1) both` to
  the badge/frame on mount. In lists, stagger via `animation-delay: ${index*0.06}s`
  (pass an optional `index` prop; default 0).
- **Shine sweep:** inside the nameplate (set `position:relative; overflow:hidden`),
  add an absolutely-positioned skewed highlight that loops, ONLY for tiers where
  `tier.animated === true` (gold, platinum, diamond, mythic):
  ```html
  <span style="position:absolute; top:0; height:100%; width:45%;
    background:linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent);
    transform:skewX(-18deg); animation:rankShine 2.4s ease-in-out infinite;"></span>
  ```
- Respect `prefers-reduced-motion: reduce` — disable both animations under it.

## Wiring
- Leaderboard **list rows**: render the info-bar **name label** beside the username
  (replace the old pill). Plain avatar is fine in rows, OR use the small frame.
- **Podium top-3 + profile header**: use BOTH — the info-sign **avatar frame**
  (`RankedAvatarRing`) AND the **name label**.
- Update every existing call site of `RankBadge` / `RankedAvatarRing` so nothing
  breaks; keep their prop signatures backward-compatible where possible.

## Constraints / acceptance
- Tier names render in **English in every language** (verify Khmer mode still shows
  "Rookie", "Rising", "Gold", "Platinum", "Diamond", "Mythic").
- The former "Debut" now displays as "Rising"; internal id stays `"debut"` and all
  references (incl. `TIER_COOLDOWNS`) still resolve.
- All 6 tiers show their correct real color, icon, and name.
- TypeScript strict, no new deps.
- Brutalist: 3px black borders, hard `2px 2px 0 #000` shadow, **no blur**, radius 0,
  Lucide icons only — no emoji.
- `npm run build` / typecheck passes. Don't touch scoring, DB, or unrelated files.
- Commit only the files you edit.
