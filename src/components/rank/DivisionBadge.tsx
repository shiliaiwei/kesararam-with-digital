import * as React from "react";
import { cn } from "@/lib/utils";
import type { Division, RankConfig } from "@/lib/ranks";

/**
 * DivisionBadge — shows the Roman-numeral division (IV / III / II / I) on a frame
 * corner. Dark body + rank-accent edge + black border keeps the numeral readable
 * on every tier (brand rule: division numerals must never be hard to read).
 * It sits on the frame corner, never over the user photo.
 */

const SIZES = {
    sm: { box: 22, font: 11 },
    md: { box: 26, font: 13 },
    lg: { box: 30, font: 15 },
    xl: { box: 34, font: 17 },
} as const;

export interface DivisionBadgeProps {
    division: Division;
    config: RankConfig;
    size?: keyof typeof SIZES;
    /** add the looping shine animation */
    animated?: boolean;
    className?: string;
}

export function DivisionBadge({
    division,
    config,
    size = "md",
    animated = false,
    className,
}: DivisionBadgeProps) {
    const { box, font } = SIZES[size];

    return (
        <span
            className={cn(
                "rank-division-badge",
                "relative inline-flex items-center justify-center",
                "border-2 border-black shadow-[2px_2px_0_0_#000]",
                "font-black leading-none tabular-nums tracking-tight text-white",
                animated && "rank-division-badge--shine",
                className,
            )}
            style={{
                width: box,
                height: box,
                fontSize: font,
                background: "#0a0a0a",
                // accent-coloured top bar reads as the "sign tab"
                boxShadow: `inset 0 3px 0 0 ${config.accentColor}, 2px 2px 0 0 #000`,
            }}
            aria-label={`Division ${division}`}
        >
            {division}
        </span>
    );
}

export default DivisionBadge;
