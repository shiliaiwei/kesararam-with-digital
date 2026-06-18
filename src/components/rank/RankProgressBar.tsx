import * as React from "react";
import { cn } from "@/lib/utils";
import {
    calculateRankAndDivision,
    formatPoints,
    getNextRank,
} from "@/lib/ranks";

/**
 * RankProgressBar — progress inside the current rank. Shows the rank + division,
 * "<into> / <range> PTS", and how many points remain to the next rank. The bar
 * fill uses the current rank's colours. Highmaster shows division-step progress.
 */

export interface RankProgressBarProps {
    score: number;
    /** show the "Rank Division" heading row (default true) */
    showHeading?: boolean;
    className?: string;
}

export function RankProgressBar({ score, showHeading = true, className }: RankProgressBarProps) {
    const result = calculateRankAndDivision(score);
    const { rank, division, progressToNextRank, pointsNeededForNextRank } = result;
    const next = getNextRank(rank.name);

    // Points shown as "<into> / <rangeOrStep>".
    const rangeTotal = next ? next.minPoints - rank.minPoints : pointsNeededForNextRank + result.pointsIntoRank;
    const into = next ? result.pointsIntoRank : result.pointsIntoRank;

    const toNextText =
        pointsNeededForNextRank > 0
            ? next
                ? `${formatPoints(pointsNeededForNextRank)} PTS to ${next.label}`
                : `${formatPoints(pointsNeededForNextRank)} PTS to next division`
            : "MAX RANK REACHED";

    return (
        <div
            className={cn("w-full", className)}
            style={
                {
                    "--rank-primary": rank.primaryColor,
                    "--rank-accent": rank.accentColor,
                } as React.CSSProperties
            }
        >
            {showHeading && (
                <div className="mb-1 flex items-baseline justify-between gap-2">
                    <span className="text-sm font-black uppercase tracking-wide text-black">
                        {rank.label} <span style={{ color: rank.accentColor }}>{division}</span>
                    </span>
                    <span className="font-mono text-xs font-bold tabular-nums text-zinc-700">
                        {formatPoints(into)} / {formatPoints(rangeTotal)} PTS
                    </span>
                </div>
            )}

            {/* Track — brutalist: black border, sharp corners, hard offset shadow */}
            <div className="h-3 w-full border-2 border-black bg-white shadow-[2px_2px_0_0_#000]">
                <div
                    className="h-full transition-[width] duration-500 ease-out"
                    style={{
                        width: `${progressToNextRank}%`,
                        background: `linear-gradient(90deg, ${rank.primaryColor}, ${rank.accentColor})`,
                    }}
                />
            </div>

            <div className="mt-1 text-right text-[11px] font-bold uppercase tracking-wide text-zinc-600">
                {toNextText}
            </div>
        </div>
    );
}

export default RankProgressBar;
