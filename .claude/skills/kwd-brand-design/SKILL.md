---
name: kwd-brand-design
description: >
  KWD (Kesararam With Digital) brand & UI design system. USE THIS whenever you
  create, edit, redesign, or review ANY user-facing UI in this project — pages,
  components, cards, buttons, forms, modals, badges, backgrounds, marketing
  sections, OG images, emails. Enforces the Brutalist + Road-Traffic-Sign +
  Caution-Tape identity: sharp/structured corners, solid black borders, hard
  offset shadows (NO blur), the yellow #eab308 + black accent, and the traffic
  semantic palette (red=stop/danger, green=go/success, blue=info, orange=caution,
  purple=premium). Defines road-sign SHAPES (diamond/octagon/circle/rect) for
  buttons & containers, caution-tape pattern variants, and a strict ICON policy:
  library icons only (Lucide / Material Symbols) — NO emoji, NO Unicode symbols,
  NO neon colors, NO gradient/glow fills on UI elements or icons. Triggers on:
  "design", "redesign", "style", "UI", "component", "button", "shape", "icon",
  "make it look", "brand", "colors", "Tailwind class", and any .tsx/.css work
  that renders visuals.
---

# KWD Brand Design System

> **KWD = Kesararam With Digital** — free, bilingual (English + ខ្មែរ) road-safety
> education built by young Cambodian women. Technovation Girls 2026 · Team #50777 ·
> Siem Reap, Cambodia. The visual identity is **road safety made into a UI**:
> brutalist structure, traffic-sign color logic, and caution-tape accents.
>
> Source of truth in the repo: the live brand page
> [`src/app/(public)/brand/brand-client.tsx`](../../../src/app/(public)/brand/brand-client.tsx)
> and the tokens in [`src/app/globals.css`](../../../src/app/globals.css).
> **If those files change, this skill must be updated to match.**

## When you build or change UI, follow these in order

1. **Reuse the existing system first.** Before inventing styles, use the
   pre-built tokens & utility classes (`.nb-card`, `.nb-btn`, `.caution-tape`,
   `--kwd-*`, `--nb-*`). See `references/patterns.md` for copy-paste blocks.
2. **Apply the Design DNA** (below) — it is non-negotiable for new UI.
3. **Use color semantically** like a traffic sign, not decoratively.
4. **Check the Don'ts** before finishing.

---

## 1 · Design DNA — Brutalist

This is the spine of every surface. Match it exactly.

| Property        | Rule                                                              |
|-----------------|------------------------------------------------------------------|
| Corners         | Structured, never pill/blobby. Brand page = `0` (sharp 90°); app chrome uses the brutalist radius token `--nb-radius: 15px`. **Pick one mode per surface and stay consistent with neighbors.** |
| Border          | **2–3px solid `#000`** on cards, buttons, inputs (`--nb-border` = `1px` is the app-chrome minimum; go heavier for hero/marketing). |
| Shadow          | **Hard offset, zero blur:** `3–4px 3–4px 0 #000` (`--nb-shadow*`). **Never** soft/blurred drop shadows for structure. Glow blurs are allowed ONLY as decorative auras (game/HUD), never as a card's structural shadow. |
| Accent stripe   | Yellow `#eab308` / black **caution tape** (`.caution-tape`) with solid black rules on top and bottom. |
| Active state    | Yellow fill `#eab308` + black text `#000` (or `.nav-active` = black fill + white text). |
| Hover           | Lift via translate + bigger hard shadow (`.nb-card:hover`, `.nb-interactive`). Press = settle to `translate(0)` + smaller/no shadow. |
| Spacing scale   | `4 · 8 · 12 · 16 · 20 · 24` px. Stick to these steps.            |
| Type weight     | Labels are **UPPERCASE · tracked · Bold/Black**. Display is `font-black`. |

---

## 2 · Color — use it like a road sign

The palette is **semantic**, mirroring real traffic signage. Choose color by
**meaning**, not by what looks nice. (Roles taken verbatim from the brand page.)

| Color  | Hex       | Token         | MEANS → use only for                                  |
|--------|-----------|---------------|-------------------------------------------------------|
| Yellow | `#eab308` | `--kwd-yellow`*| CTA buttons · warnings · brand accent · active state |
| Black  | `#000000` | —             | Text · borders · structure                            |
| White  | `#ffffff` | —             | Background · negative space                           |
| Blue   | `#3b82f6` | `--kwd-blue`  | Info · links · positive/neutral signals               |
| Red    | `#ef4444` | `--kwd-red`   | Prohibitory signs · danger · STOP · destructive       |
| Green  | `#22c55e` | `--kwd-green` | Success · active/correct · GO signals                 |
| Orange | `#f97316` | `--kwd-orange`| Caution · attention (softer than red)                 |
| Purple | `#a855f7` | `--kwd-purple`| Premium features · special game modes                 |

\* Brand-page swatch yellow is `#eab308`; the CSS token `--kwd-yellow` is the
brighter gold `#ffd700` used in the dark dashboard/HUD theme. Use **`#eab308`**
for marketing/light surfaces and **`#ffd700`** (`--kwd-yellow`) inside `.kwd-dash`
/ game / HUD dark contexts. Don't mix them on one surface.

Also available: `--kwd-cyan #06b6d4` (grid lines, diamond rank), `--kwd-rose #fda4af`.

**Color rules**
- Don't introduce hex values outside this palette (and its standard
  Tailwind tints, e.g. `amber-400`, `zinc-900`). New brand-level hues need a
  human decision — flag it, don't invent one.
- Semantic colors must keep their meaning. Never use red for a primary CTA, never
  green for a destructive action, never purple for a free feature.
- Dark dashboard surfaces: wrap in `.kwd-dash` and let the token theme drive
  colors (gold primary `#ffd700`, neon-red destructive `#ff0050`).

---

## 3 · Shapes, buttons & caution-tape motifs

The brand's surfaces are shaped like **road signs and caution tape**. Reach for
these instead of generic flourishes. Full copy-paste code → `references/patterns.md`.

> **Use the ready-made kit first:**
> `import { CautionTape, SignShape, TAPES, SHAPES } from "@/components/brand/brand-kit"`
> — pure vector SVG, 4K/slide-crisp, flat brutalist. Live gallery on the
> [`/brand`](../../../src/app/(public)/brand/brand-client.tsx) page (Design Kit section).
> `<SignShape shape="diamond|octagon|circle|sign|triangle|banner">` ·
> `<CautionTape variant="caution|chevron|checker|dashed|line">`.

### Road-sign shapes (containers, badges, buttons)
Map the shape to the meaning, the way real signage does:

| Shape            | Real-world meaning      | Use for                                  |
|------------------|-------------------------|------------------------------------------|
| **Diamond** (45° rotated square) | Warning             | Hero "danger/attention" badges, key alerts |
| **Octagon**      | STOP                    | Destructive / stop / hard-block actions  |
| **Circle**       | Prohibitory / mandatory | Icon buttons, status dots, rule chips    |
| **Triangle**     | Caution                 | Inline caution markers                   |
| **Rectangle / rounded-rect** | Information sign | Default cards, banners, content panels  |
| **Banner / overhead** (wide rect on posts) | Directional/guide | Section headers, route/nav callouts |

- Yellow sign body = warning/CTA context; **green** sign body = informational/guide
  context (e.g. directions, "go"/progress). Both keep the black (or matching dark)
  border and hard offset shadow — never a blurred shadow.
- Buttons are sign-shaped too: a primary CTA is a yellow information-rectangle; a
  destructive button may take the octagon/STOP treatment; an icon button is a circle.

### Caution-tape pattern variants (dividers, emphasis bands)
All built from `repeating-linear-gradient` in flat `#eab308`/`#fbbf24` + `#000`:

| Variant        | Pattern                                              |
|----------------|------------------------------------------------------|
| Diagonal stripe | `.caution-tape` (45°/-45° yellow-black) with top and bottom solid black borders — the default |
| Checkerboard   | alternating yellow/black squares                     |
| Chevron        | repeating `›` arrows (directional)                   |
| Dashed         | yellow with black dashes                             |
| Double-line    | yellow band with two thin black rules                |
| Labeled tape   | tape + UPPERCASE label ("CAUTION", "WARNING", "DO NOT CROSS") |

Use tape for dividers, section edges, and "under construction / heads-up" framing.

### Backgrounds (already built)
`.grid-bg` (cyan lines) · `.dot-bg` (blue dots) · `.hero-dot-bg` / `.game-dot-bg` (dark).

> The lightning bolt is the logo's "Flash Learning" motif — fine as a small accent,
> but never redraw or alter the logo itself.

---

## 4 · Icons — library-only, NO emoji / symbols

Icons must come from an **icon library**, never from emoji or Unicode glyphs.

- **Primary: [Lucide React](https://lucide.dev)** (`lucide-react`, used in 128+
  files — this is the house standard). `import { TriangleAlert } from "lucide-react"`.
- **Secondary: Material Symbols Rounded** — already wired via the
  `.material-symbols-rounded` class in `globals.css` (Google standard).
- **Brand/3rd-party logos only: `react-icons`** (e.g. social/brand marks).

**Hard rules:**
- ❌ **No emoji** anywhere in UI (no ⚠️ 🚦 ✅ 🔥 etc.) — they render
  inconsistently and break the flat brutalist look.
- ❌ **No raw Unicode symbols/signs** as icons (✓ ✗ → ★ ● …). Use the library
  equivalent (`Check`, `X`, `ArrowRight`, `Star`, `Circle`).
- Icons are **monochrome and flat**: single `currentColor`, inherit the
  semantic color of their context. **No gradient fills, no neon, no glow** on icons.
- Default Lucide stroke; size on the 4px scale (`size={16/20/24}`), align to text.
- Pick the icon whose real meaning matches (e.g. `Octagon`/`OctagonAlert` for stop,
  `TriangleAlert` for caution, `Info` for info, `ShieldCheck` for safety).

---

## 5 · Typography

| Use       | Font stack                                              |
|-----------|--------------------------------------------------------|
| English   | `Inter` (`--font-sans`); brand fonts `StackSansNotch` (`.font-english`/`.font-stack-notch`), `GoogleSans` (`.font-google-sans`) |
| Khmer     | `Siemreap` / `Kantumruy_Pro` — `.font-kh-header`, `.font-kh-body`; also "Google Sans Khmer", "Battambang" |
| Labels    | UPPERCASE · `tracking-wide`/`tracking-wider` · `font-bold`/`font-black` |
| Mono      | `--font-mono` (Geist Mono) for filenames, versions, technical chips |

### Font by context (hard rule)
Pick the face by **where the text lives**, not by language alone:

| Context                                   | Font                                   | Class            |
|-------------------------------------------|----------------------------------------|------------------|
| **Learning / lesson / quiz content**      | **Siemreap** (the `--font-kh-body` face) | `.font-learning` |
| **System chrome / function buttons / UI** | **Inter** (EN primary) + **Google Sans Khmer** (KH) | `.font-system` |
| Khmer headings                            | Kantumruy Pro                          | `.font-kh-header`|

- Learning content (readable, lesson body) → `.font-learning` (Siemreap).
- Buttons, nav, toolbars, dialogs, settings — anything "system" → `.font-system`
  (Inter for English, Google Sans Khmer for Khmer).

**Always design bilingually.** This app is EN + ខ្មែរ everywhere. New copy needs
both languages (use the `useLang()` / `t(en, kh)` pattern seen across pages), and
layouts must not break when Khmer text (taller line-height) is used.

---

## 6 · Logo rules (hard constraints)

Never: stretch, rotate, distort, recolor, outline, add shadow/gradient/filter, or
place on low-contrast bg. Black logo (`kwd-black_nobackground.png`) on light only;
inverted/white on dark. Min height 24px. Clear space = height of the "K".

---

## Don'ts — reject these in review or your own output

- ❌ Soft/blurred **structural** shadows (e.g. `shadow-lg`, `shadow-xl` on a card).
  Use hard offset `--nb-shadow*` instead.
- ❌ Fully rounded/pill cards or blobby radii on structural surfaces.
- ❌ Rainbow/decorative gradients as fills on content cards. Gradients are for
  rank tiers, backgrounds (grid/dot/vignette), and HUD auras only.
- ❌ Off-palette hex colors or semantically wrong color use (red CTA, green delete).
- ❌ **Neon colors** or any **gradient fill** on buttons, icons, shapes, or content
  cards. (Gradients allowed only for rank tiers, grid/dot/vignette backgrounds, and
  HUD auras — never as a UI element's fill.)
- ❌ **Emoji** (⚠️🚦✅🔥…) or **raw Unicode symbols** (✓✗→★●) used as icons. Use
  Lucide / Material Symbols instead.
- ❌ Gradient/glow/multicolor icons. Icons are flat, monochrome, `currentColor`.
- ❌ Blob/pill shapes where a road-sign shape (rect, diamond, octagon, circle) fits.
- ❌ English-only UI copy.
- ❌ Recoloring/distorting the logo.
- ❌ Reinventing a button/card when `.nb-btn` / `.nb-card` exist.
- ❌ Using **banned words** in any user-facing text (see Banned Words section below).

## Quick self-check before you finish any UI change

1. Sharp/structured corners + road-sign shape where it fits?
2. Solid black border?  3. Hard (no-blur) offset shadow?
4. Color used semantically + on-palette only (no neon)?
5. NO gradients on the element's fill?  6. Icons from Lucide/Material — NO emoji or Unicode symbols?
7. EN + Khmer copy?  8. Reused existing tokens/classes?  9. Logo untouched?

For copy-paste component blocks → `references/patterns.md`.
For the full token/hex table → `references/tokens.md`.
For the learning/psychology/design **theories the product is built on** (design
*toward* them) → `references/concepts.md`.

---

## Working rules (scope & git)

- **Only touch what was asked.** Edit the files needed for the request; don't
  reformat, "clean up", or change unrelated files in passing.
- **Commit only the files you edited.** Stage them by path
  (`git add <path> …`) — never `git add -A`/`.`. Leave unrelated working-tree
  changes (e.g. `.DS_Store`, others' edits) untouched.
- **Push only when the user explicitly asks** ("push"). Never push (or commit
  unprompted) on your own, even after finishing a change.

See also memory: [[git-push-discipline]].

---

## Banned Words — Language Restrictions

Never use these words in any user-facing text, UI copy, translations, descriptions, or generated content:

### English
| Banned | Use instead |
|--------|-------------|
| **exam** | "test", "quiz", "challenge", or "assessment" |
| **driving** | "road safety", "traffic", or "travel" |

### Khmer
| Banned | Use instead |
|--------|-------------|
| **វេទិកា** | គេហទំព័រ |
| **ហ្វឹកហ្វឺន** | សំរាប់រៀន or សំណួរ |
| **ប្រឡង** | ប្រកួត or តេស្ត |
| **បើកបរ** | សុវត្ថិភាពចរាចរណ៍ or ចរាចរណ៍ |
| **ល្បែង** | សកម្មភាព |
| **វីរបុរស** | បញ្ញាបរ |
| **ផ្សងព្រែង** | ដំណើរ |

**Why:** This project is a road safety education platform, NOT a "driving school" or "exam prep" tool. Always frame around learning, knowledge, and confidence.

**Exceptions:** Internal DB slugs (e.g. `slug: "driving"`), the word "test" (quiz/test is fine), and technical documentation are exempt.
