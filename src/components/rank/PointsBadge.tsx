import * as React from "react";
import { cn } from "@/lib/utils";
import { formatPoints, type RankConfig } from "@/lib/ranks";

/**
 * PointsBadge — a small points chip shown under the rank badge (outside the
 * photo). Either renders a formatted score ("250 PTS") or an explicit label
 * ("START NOW", "5000 PTS"). Brutalist chip: black border, hard offset shadow.
 */

export interface PointsBadgeProps {
    config: RankConfig;
    /** numeric points to format as "<n> PTS" */
    points?: number;
    /** explicit label that overrides `points` (e.g. "START NOW") */
    label?: string;
    /** add the points-chip glow animation */
    animated?: boolean;
    className?: string;
}

export function PointsBadge({ config, points, label, animated, className }: PointsBadgeProps) {
    const text =
        label ?? (typeof points === "number" ? `${formatPoints(points)} PTS` : config.displayPoints);

    return (
        <span
            className={cn(
                "rank-points-chip",
                "inline-flex items-center justify-center px-2 py-0.5",
                "border-2 border-black shadow-[2px_2px_0_0_#000]",
                "text-[11px] font-black uppercase tracking-wider tabular-nums whitespace-nowrap",
                animated && "rank-points-chip--glow",
                className,
            )}
            style={{
                background: config.primaryColor,
                color: config.textColor,
            }}
        >
            {text}
        </span>
    );
}

export default PointsBadge;
