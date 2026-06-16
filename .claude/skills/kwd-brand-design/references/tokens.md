# KWD — Token & hex reference

Authoritative tokens live in [`src/app/globals.css`](../../../../src/app/globals.css).
This is a cheat-sheet; if they disagree, globals.css wins (and update this file).

## Brand colors (traffic-sign semantic palette)

| Name   | Light/marketing hex | Token         | Meaning                              |
|--------|---------------------|---------------|--------------------------------------|
| Yellow | `#eab308`           | (swatch)      | CTA · warning · brand accent · active |
| Yellow (gold) | `#ffd700`    | `--kwd-yellow`| Dark dashboard / HUD primary          |
| Black  | `#000000`           | —             | Text · borders · structure            |
| White  | `#ffffff`           | —             | Background · negative space           |
| Blue   | `#3b82f6`           | `--kwd-blue`  | Info · links · positive signals       |
| Red    | `#ef4444`           | `--kwd-red`   | Prohibitory · danger · stop · delete  |
| Green  | `#22c55e`           | `--kwd-green` | Success · active · go                  |
| Orange | `#f97316`           | `--kwd-orange`| Caution · attention                    |
| Purple | `#a855f7`           | `--kwd-purple`| Premium · special game modes           |
| Cyan   | `#06b6d4`           | `--kwd-cyan`  | Grid lines · diamond rank · accents    |
| Rose   | `#fda4af`           | `--kwd-rose`  | Soft accent                            |

## Neo-brutalism structure tokens

```
--nb-border:    1px solid #000000   /* minimum; use 2–3px for hero/marketing */
--nb-shadow:    3px 3px 0px #000000
--nb-shadow-sm: 2px 2px 0px #000000
--nb-shadow-lg: 4px 4px 0px #000000
--nb-shadow-xl: 5px 5px 0px #000000
--nb-radius:    15px   (sm 12px · md 15px · lg 18px)   /* brand page itself uses 0 */
```

## Utility classes (in globals.css)

| Class                | Effect                                             |
|----------------------|----------------------------------------------------|
| `.nb-card`           | border + hard shadow + radius + hover lift         |
| `.nb-btn`            | button: border + shadow + hover lift + active press |
| `.nb-border`         | `--nb-border`                                       |
| `.nb-shadow[-sm/lg/xl]` | hard offset shadows                             |
| `.nb-interactive`    | bigger hover lift (`7px` shadow) + active settle    |
| `.nav-active`        | black fill + white text + small shadow             |
| `.caution-tape`      | 6px yellow/black `-45deg` stripe                    |
| `.grid-bg`           | white + cyan 32px grid lines                        |
| `.dot-bg`            | white + blue 24px dot grid                          |
| `.hero-dot-bg`       | dark `#18181b` + cyan dots                          |
| `.game-dot-bg`       | dark `#1a1a1f` + white dots + center vignette       |
| `.nb-skeleton`       | brutalist shimmer skeleton                          |
| `.font-english` / `.font-stack-notch` | StackSansNotch                    |
| `.font-google-sans`  | GoogleSans Bold                                     |
| `.font-kh-header` / `.font-kh-body` | Khmer header / body fonts           |
| `.kwd-dash`          | dark gold-on-dark dashboard token theme            |

## Animation helpers

`.animate-marquee`, `.animate-marquee-vertical`, `.animate-slide-in`,
`.animate-bounce-in`, `.animate-pulse-gold`, `.animate-pulse-red-alert`,
`.animate-sparkle-float`, `.shimmer-sweep-btn`, `.cyber-rotating-border`.

## Spacing scale

`4 · 8 · 12 · 16 · 20 · 24` px  →  Tailwind `1 · 2 · 3 · 4 · 5 · 6`.

## Fonts (loaded in `src/app/layout.tsx` + `globals.css`)

- English: Roboto (`--font-en` / `var(--font-en)`)
- Khmer: Google Sans (`KWD Google Sans Khmer` / `var(--font-kh-ui)`) and Battambang (`KWD Battambang Khmer` / `var(--font-kh-learning)`)
- Mono: Roboto (`--font-mono` / `var(--font-mono)`)

## Icon libraries (installed) — NO emoji / Unicode symbols

| Library            | Import / class                  | Use                          |
|--------------------|---------------------------------|------------------------------|
| **Lucide** (primary, 128+ files) | `import { Icon } from "lucide-react"` | All UI icons          |
| Material Symbols Rounded | `<span className="material-symbols-rounded">name</span>` | Google-standard fallback |
| react-icons        | `from "react-icons/..."`        | Brand/3rd-party logos only   |

Icons: flat, monochrome, `currentColor`, sized on the 4px scale (16/20/24).
Never gradient/neon/glow. Never emoji (⚠️✅🔥) or raw glyphs (✓✗→★●) — use the
library component (`Check`, `X`, `ArrowRight`, `Star`, `TriangleAlert`, `OctagonAlert`).

## Road-sign shapes

| Shape | How | Meaning |
|-------|-----|---------|
| Diamond | `rotate-45` square, counter-rotate content | Warning |
| Octagon | `clip-path: polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)` | Stop / destructive |
| Circle  | `rounded-full` | Icon button, status dot, prohibitory |
| Rectangle / rounded-rect | `rounded-md` + `border-[3px] border-black` | Info card / banner (default) |
| Triangle | `clip-path: polygon(50% 0,100% 100%,0 100%)` | Caution marker |

Yellow `#eab308` body = warning/CTA · Green `#22c55e` body = informational/guide.
All shapes keep black border + hard offset shadow (no blur).
