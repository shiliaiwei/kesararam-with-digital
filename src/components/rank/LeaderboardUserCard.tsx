import * as React from "react";
import { cn } from "@/lib/utils";
import { calculateRankAndDivision, formatPoints, type LeaderboardUser } from "@/lib/ranks";
import { AvatarBorder } from "./AvatarBorder";
import { RankProgressBar } from "./RankProgressBar";

/**
 * LeaderboardUserCard — one leaderboard row/card: avatar border, username, score,
 * rank, division and (in full mode) the progress bar. Compact mode is a tight row
 * for long leaderboards; full mode is a richer card.
 */

export interface LeaderboardUserCardProps {
    user: LeaderboardUser;
    /** 1-based leaderboard position (optional rank number chip) */
    position?: number;
    /** tight single-row layout for long lists */
    compact?: boolean;
    animated?: boolean;
    className?: string;
}

export function LeaderboardUserCard({
    user,
    position,
    compact = false,
    animated = true,
    className,
}: LeaderboardUserCardProps) {
    const { rank, division } = calculateRankAndDivision(user.score);

    return (
        <div
            className={cn(
                // brutalist card: black border, sharp corners, hard offset shadow
                "flex items-center gap-3 border-2 border-black bg-white shadow-[3px_3px_0_0_#000]",
                compact ? "p-2" : "p-3 sm:gap-4 sm:p-4",
                className,
            )}
        >
            {typeof position === "number" && (
                <div
                    className={cn(
                        "flex shrink-0 items-center justify-center border-2 border-black font-black tabular-nums",
                        compact ? "h-7 w-7 text-sm" : "h-9 w-9 text-base",
                    )}
                    style={{ background: rank.accentColor, color: rank.textColor }}
                    aria-label={`Position ${position}`}
                >
                    {position}
                </div>
            )}

            <div className="shrink-0">
                <AvatarBorder
                    src={user.imageUrl}
                    alt={`${user.name} avatar`}
                    username={user.username}
                    score={user.score}
                    size="sm"
                    animated={animated}
                    showPoints={!compact}
                    showDivision
                />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-black text-black sm:text-base">
                        {user.username}
                    </span>
                    <span className="shrink-0 font-mono text-sm font-black tabular-nums text-black">
                        {formatPoints(user.score)}
                        <span className="ml-0.5 text-[10px] text-zinc-500">PTS</span>
                    </span>
                </div>

                <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wide text-zinc-700">
                        {rank.label}
                    </span>
                    <span
                        className="text-[11px] font-black"
                        style={{ color: rank.accentColor }}
                    >
                        {division}
                    </span>
                </div>

                {!compact && (
                    <div className="mt-2">
                        <RankProgressBar score={user.score} showHeading={false} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeaderboardUserCard;
