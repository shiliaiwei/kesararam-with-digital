import * as React from "react";
import { cn } from "@/lib/utils";
import type { RankConfig } from "@/lib/ranks";

/**
 * RankBadge — the main rank banner that attaches to the bottom of the avatar
 * frame. Shows the UPPERCASE rank name. Rank tiers are the one place gradients
 * are allowed in the KWD system, so the banner uses a subtle tier gradient with a
 * solid black border + hard offset shadow.
 */

const SIZES = {
    sm: { font: 11.5, padX: 9, padY: 2.5 },
    md: { font: 13.5, padX: 11, padY: 3.5 },
    lg: { font: 15.5, padX: 13, padY: 4.5 },
    xl: { font: 18, padX: 15, padY: 5.5 },
} as const;

export interface RankBadgeProps {
    config: RankConfig;
    size?: keyof typeof SIZES;
    /** add the shine-sweep animation across the banner */
    animated?: boolean;
    className?: string;
}

export function RankBadge({ config, size = "md", animated, className }: RankBadgeProps) {
    const { font, padX, padY } = SIZES[size];

    return (
        <span
            className={cn(
                "rank-name-banner",
                "relative inline-flex items-center justify-center overflow-hidden",
                "border-2 border-black shadow-[2px_2px_0_0_#000]",
                "font-black uppercase leading-none tracking-wider",
                animated && "rank-name-banner--shine",
                className,
            )}
            style={{
                fontSize: font,
                padding: `${padY}px ${padX}px`,
                color: config.textColor,
                background: `linear-gradient(180deg, ${config.primaryColor}, color-mix(in srgb, ${config.primaryColor} 80%, #000))`,
            }}
        >
            {config.label}
        </span>
    );
}

export default RankBadge;
