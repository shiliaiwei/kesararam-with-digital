# KWD — Copy-paste UI patterns

All of these already exist in [`src/app/globals.css`](../../../../src/app/globals.css).
Prefer composing these over writing new CSS. Tailwind tints (`amber-400`,
`zinc-900`, etc.) are fine alongside them.

## Card (brutalist)

```tsx
// Pre-built utility — sharp-ish corners, black border, hard shadow, hover lift
<div className="nb-card bg-white p-4">…</div>

// Inline equivalent (when you need explicit control / heavier border)
<div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0_#000]
                transition-transform hover:-translate-x-px hover:-translate-y-px
                hover:shadow-[6px_6px_0_#000]">
  …
</div>
```

## Buttons

```tsx
// Primary CTA — yellow fill, the brand action color
<button className="nb-btn bg-[#eab308] text-black font-bold uppercase tracking-wide px-5 py-2.5">
  Start
</button>

// Neutral / secondary
<button className="nb-btn bg-white text-black font-bold uppercase tracking-wide px-5 py-2.5">
  Cancel
</button>

// Destructive — red ONLY for danger/stop/delete
<button className="nb-btn bg-[#ef4444] text-white font-bold uppercase tracking-wide px-5 py-2.5">
  Delete
</button>
```

`.nb-btn` already gives border + hard shadow + hover lift + active press.

## Active / selected state

```tsx
// Yellow fill + black text  (brand "active")
<div className="bg-[#eab308] text-black border-2 border-black">Selected</div>

// OR nav-active helper: black fill + white text
<a className="nav-active px-3 py-1.5">Home</a>
```

## Caution tape & hazard stripes

```tsx
// Thin divider strip (12px) — the signature brand accent (includes top and bottom solid black borders)
<div className="caution-tape" />

// Diagonal hazard band for emphasis
<div style={{ background: "repeating-linear-gradient(45deg,#000 0 8px,#fbbf24 8px 16px)" }}
     className="h-6 border-y-2 border-black" />

// Vertical caution edge
<div style={{ background: "repeating-linear-gradient(90deg,#eab308 0 18px,#000 18px 36px)" }}
     className="w-3" />
```

## Backgrounds (already built)

```tsx
<section className="grid-bg">…</section>      {/* light + cyan grid lines  */}
<section className="dot-bg">…</section>        {/* light + blue dot grid     */}
<section className="hero-dot-bg">…</section>   {/* dark #18181b + cyan dots   */}
<div     className="game-dot-bg">…</div>       {/* dark game bg + vignette    */}
```

## Status / semantic chips

```tsx
// Success (GO / correct)
<span className="border-2 border-black bg-[#22c55e] text-black px-2 py-0.5 text-xs font-bold uppercase">Pass</span>
// Info / link
<span className="border-2 border-black bg-[#3b82f6] text-white px-2 py-0.5 text-xs font-bold uppercase">Info</span>
// Caution
<span className="border-2 border-black bg-[#f97316] text-black px-2 py-0.5 text-xs font-bold uppercase">Wait</span>
// Danger / stop
<span className="border-2 border-black bg-[#ef4444] text-white px-2 py-0.5 text-xs font-bold uppercase">Stop</span>
// Premium
<span className="border-2 border-black bg-[#a855f7] text-white px-2 py-0.5 text-xs font-bold uppercase">Pro</span>
```

## Dark dashboard / HUD surfaces

```tsx
// Opt the subtree into the gold-on-dark token theme
<div className="kwd-dash">
  {/* primary becomes gold #ffd700, destructive neon-red #ff0050, etc. */}
</div>

// Decorative auras (the ONLY place blur shadows are allowed)
<div className="cyber-rotating-border">…</div>          {/* spinning gold conic glow */}
<button className="shimmer-sweep-btn nb-btn …">Play</button>
<span className="animate-pulse-gold" />
```

## Road-sign shapes (containers / badges / buttons)

```tsx
// WARNING diamond badge (45° rotated square, counter-rotate the content)
<div className="grid place-items-center">
  <div className="size-20 rotate-45 border-[3px] border-black bg-[#eab308] shadow-[4px_4px_0_#000]">
    <div className="-rotate-45 grid size-full place-items-center">
      <TriangleAlert className="size-7 text-black" />
    </div>
  </div>
</div>

// STOP octagon button (destructive) — clip-path octagon, flat red, no blur
<button
  className="bg-[#ef4444] text-white font-black uppercase tracking-wide px-6 py-4
             border-[3px] border-black shadow-[4px_4px_0_#000]
             hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_#000]
             active:translate-x-0 active:translate-y-0 active:shadow-none"
  style={{ clipPath: "polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%)" }}
>
  Stop
</button>

// Circle icon button (prohibitory/mandatory)
<button className="size-11 rounded-full grid place-items-center
                   border-[3px] border-black bg-white shadow-[3px_3px_0_#000]
                   hover:-translate-x-px hover:-translate-y-px">
  <X className="size-5 text-black" />
</button>

// INFORMATION rectangle — the default card/banner (rounded-rect road sign)
<div className="rounded-md border-[3px] border-black bg-[#22c55e] text-black p-4 shadow-[4px_4px_0_#000]">
  …  {/* green = informational/guide sign; use yellow body for warning/CTA */}
</div>

// Overhead/banner header (wide rect on "posts")
<header className="rounded-md border-[3px] border-black bg-[#22c55e] text-white px-6 py-4
                   shadow-[4px_4px_0_#000] font-black uppercase tracking-wide">
  Directions
</header>
```

## Caution-tape pattern variants

```tsx
// Diagonal (default)
<div className="caution-tape" />
// Checkerboard
<div className="h-6 border-y-2 border-black"
     style={{ background:
       "repeating-conic-gradient(#eab308 0% 25%, #000 0% 50%) 0 / 24px 24px" }} />
// Chevron (directional)
<div className="h-6 border-y-2 border-black"
     style={{ background:
       "repeating-linear-gradient(-60deg,#000 0 10px,#eab308 10px 20px)" }} />
// Dashed
<div className="h-6 bg-[#eab308] border-y-2 border-black"
     style={{ backgroundImage:
       "repeating-linear-gradient(90deg,#000 0 14px,transparent 14px 28px)",
       backgroundSize: "100% 4px", backgroundPosition: "center", backgroundRepeat: "no-repeat" }} />
// Double-line
<div className="h-6 bg-[#eab308] border-y-[3px] border-black [border-image:none]
                shadow-[inset_0_3px_0_#000,inset_0_-3px_0_#000]" />
// Labeled tape
<div className="flex items-center gap-3 bg-[#eab308] border-y-2 border-black px-3 py-1
                font-black uppercase tracking-widest text-black text-sm">
  CAUTION · CAUTION · CAUTION
</div>
```

## Icons — Lucide / Material Symbols only (NO emoji, NO symbols)

```tsx
import { TriangleAlert, OctagonAlert, Info, ShieldCheck, Check, X, ArrowRight } from "lucide-react";

// Flat, monochrome, inherits the semantic context color — never gradient/neon/glow
<TriangleAlert className="size-5 text-[#f97316]" />   {/* caution  */}
<OctagonAlert  className="size-5 text-[#ef4444]" />   {/* danger   */}
<Info          className="size-5 text-[#3b82f6]" />   {/* info     */}
<ShieldCheck   className="size-5 text-[#22c55e]" />   {/* success  */}

// Material Symbols (already wired in globals.css) — Google standard fallback
<span className="material-symbols-rounded text-black">warning</span>

// ❌ NEVER:  ⚠️  ✅  →  ★   (emoji / unicode)   →  ✅ USE the components above
```

## Bilingual copy (required)

```tsx
const { lang } = useLang();
const t = (en: string, kh: string) => (lang === "kh" ? kh : en);
// …
<h2 className="font-black uppercase tracking-tight">{t("Road Safety", "សុវត្ថិភាពចរាចរណ៍")}</h2>
```
