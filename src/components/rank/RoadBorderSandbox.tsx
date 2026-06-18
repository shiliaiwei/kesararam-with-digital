"use client";

import * as React from "react";
import { RoadAvatarBorder } from "./RoadAvatarBorder";
import { GoldAvatarBorder } from "./GoldAvatarBorder";
import {
    getRankNameByScore,
    getDivisionForScore,
    getDivisionProgress,
    getNextDivision,
} from "@/lib/road-rank";
import { formatPoints, type AvatarSize } from "@/lib/ranks";

/**
 * Interactive sandbox — slide the score 0→3499 and watch Rookie, Rising, and Gold
 * frames update division, rank-up, fallback initials, sizes, and animations.
 */
export function RoadBorderSandbox() {
    const [score, setScore] = React.useState(120);
    const [animated, setAnimated] = React.useState(true);
    const [useImage, setUseImage] = React.useState(true);

    const rank = getRankNameByScore(score);
    const division = getDivisionForScore(score);
    const progress = Math.round(getDivisionProgress(score));
    const next = getNextDivision(score);
    const demoSrc = useImage ? "https://i.pravatar.cc/240?img=12" : null;

    const sizes: AvatarSize[] = ["sm", "md", "lg", "xl"];

    return (
        <div className="space-y-8">
            {/* Controls */}
            <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000]">
                <div className="flex flex-wrap items-center gap-4">
                    <label className="flex-1 min-w-[260px]">
                        <div className="mb-1 flex items-baseline justify-between">
                            <span className="text-sm font-black uppercase tracking-wide">Score</span>
                            <span className="font-mono text-sm font-black tabular-nums">{formatPoints(score)} PTS</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={3499}
                            step={1}
                            value={score}
                            onChange={(e) => setScore(Number(e.target.value))}
                            className="w-full"
                        />
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold">
                        <input type="checkbox" checked={animated} onChange={(e) => setAnimated(e.target.checked)} />
                        Animated lights &amp; shine
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold">
                        <input type="checkbox" checked={useImage} onChange={(e) => setUseImage(e.target.checked)} />
                        Show photo
                    </label>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
                    {[0, 250, 500, 750, 999, 1000, 1100, 2500, 3000, 3250].map((v) => (
                        <button
                            key={v}
                            onClick={() => setScore(v)}
                            className="border-2 border-black bg-zinc-100 px-2 py-1 shadow-[2px_2px_0_0_#000] hover:bg-[#eab308]"
                        >
                            {v}
                        </button>
                    ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Stat label="Rank" value={rank} />
                    <Stat label="Division" value={division} />
                    <Stat label="Segment progress" value={`${progress}%`} />
                    <Stat
                        label="Next"
                        value={
                            next.pointsNeeded > 0
                                        ? `${next.rank} ${next.division} · ${formatPoints(next.pointsNeeded)} pts`
                                : "Maxed"
                        }
                    />
                </div>
            </div>

            {/* Live frame at all sizes */}
            <div className="flex flex-wrap items-end justify-center gap-10 border-2 border-black bg-zinc-50 p-8 shadow-[4px_4px_0_0_#000]">
                {sizes.map((size) => (
                    <div key={size} className="flex flex-col items-center gap-2">
                        {rank === "Gold" ? (
                            <GoldAvatarBorder
                                src={demoSrc}
                                alt="Sandbox player"
                                username="Sophea"
                                size={size}
                                animated={animated}
                            />
                        ) : (
                            <RoadAvatarBorder
                                src={demoSrc}
                                alt="Sandbox player"
                                username="Sophea"
                                score={score}
                                size={size}
                                animated={animated}
                            />
                        )}
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-500">{size}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-2 border-black bg-zinc-50 p-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</div>
            <div className="text-sm font-black">{value}</div>
        </div>
    );
}

export default RoadBorderSandbox;
