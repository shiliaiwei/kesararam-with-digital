/**
 * GameBadge — the iconic, premium per-game emblem used EVERYWHERE a game is
 * referenced: the play hub card header, the leaderboard filter chips, and the
 * "Top game" data-table cell. One game → one instantly-recognizable badge.
 *
 * Design (kwd-brand-design / brutalist road-sign DNA):
 *   - A solid color-filled square (the game's signature hue) = a road-sign body.
 *   - 2–3px solid black border + hard offset shadow (zero blur) = brutalist edge.
 *   - A flat WHITE Lucide glyph centered on top = max contrast, "sticker" recall.
 *   - Sharp 90° corners. No gradient, no glow (icon stays monochrome per policy).
 *
 * The white-glyph-on-solid-color block reads as a memorable token at a glance —
 * the same psychology as a real traffic sign: bold shape, one color, one symbol.
 */

import type { CSSProperties } from "react";
import { getGameMeta, type GameCatalogEntry } from "@/lib/gamekit/game-catalog";

type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Pixel geometry per size: box, icon, border, hard-shadow offset. */
const SIZES: Record<BadgeSize, { box: number; icon: number; border: number; shadow: number }> = {
    xs: { box: 22, icon: 13, border: 2, shadow: 2 }, // data-table cells, dense chips
    sm: { box: 30, icon: 17, border: 2, shadow: 2 }, // filter chips
    md: { box: 44, icon: 24, border: 3, shadow: 3 }, // list rows, default
    lg: { box: 56, icon: 30, border: 3, shadow: 4 }, // play hub card header
    xl: { box: 72, icon: 38, border: 4, shadow: 5 }, // hero / featured
};

export interface GameBadgeProps {
    /** Game slug (preferred) — resolved through the catalog. */
    slug?: string | null;
    /** Or pass a resolved catalog entry directly (skips the lookup). */
    entry?: GameCatalogEntry | null;
    size?: BadgeSize;
    /** Render with a hard drop shadow (default true). Turn off inside tight chips. */
    shadow?: boolean;
    className?: string;
    style?: CSSProperties;
}

/**
 * Renders the game's premium badge. Returns null when the slug is unknown so
 * callers can fall back (e.g. an em-dash for "no top game yet").
 */
export function GameBadge({ slug, entry, size = "md", shadow = true, className, style }: GameBadgeProps) {
    const game = entry ?? getGameMeta(slug);
    if (!game) return null;

    const s = SIZES[size];
    const { Icon } = game;

    return (
        <span
            className={className}
            style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                width: s.box,
                height: s.box,
                background: game.color,
                border: `${s.border}px solid #000`,
                boxShadow: shadow ? `${s.shadow}px ${s.shadow}px 0 #000` : "none",
                borderRadius: 0,
                ...style,
            }}
            aria-hidden
        >
            <Icon size={s.icon} strokeWidth={2.75} color="#fff" />
        </span>
    );
}
