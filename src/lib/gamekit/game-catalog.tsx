/**
 * GAME CATALOG — the single source of truth for every game's IDENTITY:
 * its iconic Lucide glyph, on-palette brand color, and bilingual label.
 *
 * Why this file exists separately from the format registry:
 *   - The format files (`formats/<id>/index.tsx`) pull in heavy game logic
 *     (dnd-kit, canvas geometry, round renderers). The leaderboard, profile,
 *     and data tables only need each game's icon + color + label, so they
 *     import THIS module instead — keeping those bundles light.
 *   - The format `meta.Icon` / `meta.brandColor` are sourced FROM here, so the
 *     play hub, leaderboard filter chips, and the "Top game" data-table cell all
 *     render the exact same iconic badge for a given game. One game, one icon.
 *
 * ICON POLICY (kwd-brand-design): flat monochrome Lucide only — no emoji, no
 * gradient/glow. Each glyph is chosen for action-recall: the picture maps to the
 * verb the player performs, so the icon is memorable after one play.
 */

import type { LucideIcon } from "lucide-react";
import {
    MousePointerClick, // tick-sign — "click the sign": a pointer tapping
    Navigation,        // traffic-commander — directing/commanding: heading arrow
    Crosshair,         // catch-sign — aim & catch the falling sign
    Grid2x2,           // sign-match — flip & match a grid of cards
    TrafficCone,       // light-hero — react to the road / traffic light
    Waypoints,         // sign-connect — connect signs to meanings (linked nodes)
    SpellCheck,        // word-bank — match the word to the sign
    Map as MapIcon,    // safety-adventure — the journey to school
    ShieldCheck,       // safe-street-smart — road-safety rules / protection
    CalendarDays,      // daily — the daily challenge
    Swords,            // mixed-practice — all question types together (also legacy priority-puzzle)
    Zap,               // quick-quiz — fast warm-up
    Flame,             // speed-round — race the clock
    TriangleAlert,     // sign-challenge — identify signs from images
} from "lucide-react";

export interface GameCatalogEntry {
    /** Stable game slug — matches the format id AND the DB `gameType`. */
    id: string;
    /** Bilingual display name. Game names stay English on both sides (matches the play hub). */
    en: string;
    kh: string;
    /** On-palette brand color (the game's signature hue). */
    color: string;
    /** The game's iconic Lucide glyph. */
    Icon: LucideIcon;
    /** True for retired games kept only for historical leaderboard rows. */
    legacy?: boolean;
}

/**
 * Canonical catalog, keyed by slug. Order here is the display order used for
 * leaderboard filter chips (after the leading "All games" chip).
 */
export const GAME_CATALOG: Record<string, GameCatalogEntry> = {
    // Headline solo quiz modes (play-hub cards 01–04). Slugs match the DB game_type
    // recorded by /api/game/solo/complete. Colors/icons mirror the play hub.
    "quick-quiz":        { id: "quick-quiz",        en: "Quick Quiz",         kh: "Quick Quiz",         color: "#eab308", Icon: Zap },
    "speed-round":       { id: "speed-round",       en: "Speed Round",        kh: "Speed Round",        color: "#ef4444", Icon: Flame },
    "sign-challenge":    { id: "sign-challenge",    en: "Sign Challenge",     kh: "Sign Challenge",     color: "#06b6d4", Icon: TriangleAlert },
    "mixed-practice":    { id: "mixed-practice",    en: "Mixed Practice",     kh: "Mixed Practice",     color: "#a855f7", Icon: Swords },
    "daily":             { id: "daily",             en: "Daily Challenge",    kh: "Daily Challenge",    color: "#3b82f6", Icon: CalendarDays },
    "traffic-commander": { id: "traffic-commander", en: "Traffic Commander",  kh: "Traffic Commander",  color: "#06b6d4", Icon: Navigation },
    "catch-sign":        { id: "catch-sign",        en: "Catch the Sign",     kh: "Catch the Sign",     color: "#f97316", Icon: Crosshair },
    "sign-match":        { id: "sign-match",        en: "Sign Match",         kh: "Sign Match",         color: "#22c55e", Icon: Grid2x2 },
    "light-hero":        { id: "light-hero",        en: "Traffic Light Hero", kh: "Traffic Light Hero", color: "#ef4444", Icon: TrafficCone },
    "sign-connect":      { id: "sign-connect",      en: "Connect the Signs",  kh: "Connect the Signs",  color: "#2563eb", Icon: Waypoints },
    "word-bank":         { id: "word-bank",         en: "Matching Sign",      kh: "Matching Sign",      color: "#ec4899", Icon: SpellCheck },
    "tick-sign":         { id: "tick-sign",         en: "Click the Sign",     kh: "Click the Sign",     color: "#14b8a6", Icon: MousePointerClick },
    "safety-adventure":  { id: "safety-adventure",  en: "Road Safety",        kh: "Road Safety",        color: "#a855f7", Icon: MapIcon },
    "safe-street-smart": { id: "safe-street-smart", en: "Safe Street Smart",  kh: "Safe Street Smart",  color: "#e91e8c", Icon: ShieldCheck },
    // Retired — Traffic Commander superseded it, but old leaderboard rows still reference the slug.
    "priority-puzzle":   { id: "priority-puzzle",   en: "Who Goes First?",    kh: "Who Goes First?",    color: "#f59e0b", Icon: Swords, legacy: true },
};

/** Look up a game's identity by slug. Returns null for unknown slugs. */
export function getGameMeta(slug: string | null | undefined): GameCatalogEntry | null {
    if (!slug) return null;
    return GAME_CATALOG[slug] ?? null;
}

/**
 * Ordered list of games for the leaderboard filter (active games only, legacy
 * hidden). The caller prepends the "All games" option.
 */
export const GAME_FILTER_ORDER: GameCatalogEntry[] = Object.values(GAME_CATALOG).filter(
    (g) => !g.legacy,
);
