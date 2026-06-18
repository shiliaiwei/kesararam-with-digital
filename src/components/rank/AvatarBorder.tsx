"use client";

import * as React from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    calculateRankAndDivision,
    DIVISIONS,
    type AvatarSize,
    type Division,
    type RankConfig,
} from "@/lib/ranks";
import { RankBadge } from "./RankBadge";
import { DivisionBadge } from "./DivisionBadge";
import { PointsBadge } from "./PointsBadge";
import { SafetyIconBadge } from "./SafetyIconBadge";

/**
 * AvatarBorder — premium "division-ring" rank badge around a user profile photo.
 *
 * CENTER RULE (hard): the centre shows the user image ONLY. The rank ring, the 4
 * division pips, the corner shield/icon and the name banner all live OUTSIDE the
 * photo. The photo sits on its own opaque layer above the ring, so nothing ever
 * renders over the user's face.
 *
 * The ring is the rank colour; the 4 pips fill left→right as the player climbs
 * IV → III → II → I (redundant with the corner numeral, so it reads without
 * colour). Rank, division, ring colour and animation are all derived from `score`.
 */

/** Profile-image diameter in px for each size. */
const IMAGE_PX: Record<AvatarSize, number> = {
    sm: 64,
    md: 96,
    lg: 128,
    xl: 160,
};

/** Pip centres on the top of the r=50 ring (viewBox 120), lowest→highest division. */
const PIP_POINTS: ReadonlyArray<readonly [number, number]> = [
    [37.3, 15.5],
    [52.2, 10.6],
    [67.8, 10.6],
    [82.7, 15.5],
];

export interface AvatarBorderProps {
    src?: string | null;
    alt: string;
    score: number;
    username?: string;
    size?: AvatarSize;
    /** show division shield + safety icon + rank banner (default true) */
    showBadges?: boolean;
    /** show the points chip (default true) */
    showPoints?: boolean;
    /** show the division shield (default true) */
    showDivision?: boolean;
    /** run the looping ring / badge animations (default true) */
    animated?: boolean;
    className?: string;
}

function rankCssVars(config: RankConfig): React.CSSProperties {
    return {
        "--rank-primary": config.primaryColor,
        "--rank-secondary": config.secondaryColor,
        "--rank-accent": config.accentColor,
        "--rank-text": config.textColor,
        "--rank-shadow": "#000000",
    } as React.CSSProperties;
}

/** How many of the 4 ring pips are filled (IV=1 … I=4). */
function filledPips(division: Division): number {
    return DIVISIONS.indexOf(division) + 1;
}

export function AvatarBorder({
    src,
    alt,
    score,
    username,
    size = "md",
    showBadges = true,
    showPoints = true,
    showDivision = true,
    animated = true,
    className,
}: AvatarBorderProps) {
    const [imgFailed, setImgFailed] = React.useState(false);

    const { rank, division } = calculateRankAndDivision(score);

    const imagePx = IMAGE_PX[size];
    const ringPx = Math.round(imagePx * 1.45); // full ring/svg square
    const pipsLit = filledPips(division);

    const showImage = Boolean(src) && !imgFailed;
    const fallbackLetter = username?.trim()?.charAt(0)?.toUpperCase() ?? "";
    const iconSize = size === "sm" ? 24 : size === "xl" ? 34 : 28;

    return (
        <div
            className={cn(
                "rank-avatar rank-reduced-motion-safe inline-flex flex-col items-center",
                rank.animationClass && animated ? rank.animationClass : undefined,
                className,
            )}
            data-rank={rank.id}
            style={rankCssVars(rank)}
        >
            {/* Ring + corner badges. */}
            <div className="rank-avatar__ring relative" style={{ width: ringPx, height: ringPx }}>
                <svg
                    className="rank-avatar__svg"
                    width={ringPx}
                    height={ringPx}
                    viewBox="0 0 120 120"
                    aria-hidden="true"
                >
                    {/* brutalist double black edge + rank-colour ring */}
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#000" strokeWidth="2.5" />
                    <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="var(--rank-primary)"
                        strokeWidth="8"
                        className="rank-avatar__ringline"
                    />
                    <circle cx="60" cy="60" r="46" fill="none" stroke="#000" strokeWidth="2" />

                    {/* rotating shine arc (animated) — stays on the ring, under the photo */}
                    <circle
                        cx="60"
                        cy="60"
                        r="50"
                        fill="none"
                        stroke="rgba(255,255,255,0.65)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="26 288"
                        className="rank-avatar__scan"
                    />

                    {/* 4 division pips — fill left→right (IV→I) */}
                    {PIP_POINTS.map((p, i) => (
                        <circle
                            key={i}
                            cx={p[0]}
                            cy={p[1]}
                            r="4.6"
                            fill={i < pipsLit ? "var(--rank-accent)" : "#ffffff"}
                            stroke="#000"
                            strokeWidth="1.5"
                            className={cn("rank-avatar__pip", i < pipsLit && "rank-avatar__pip--on")}
                            style={{ animationDelay: `${i * 0.15}s` }}
                        />
                    ))}
                </svg>

                {/* ── User photo — OPAQUE, centred, on top. Nothing renders over it ── */}
                <div
                    className="rank-avatar__photo"
                    style={{ width: imagePx, height: imagePx }}
                >
                    {showImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={src as string}
                            alt={alt}
                            width={imagePx}
                            height={imagePx}
                            className="h-full w-full object-cover"
                            onError={() => setImgFailed(true)}
                        />
                    ) : (
                        <div
                            className="flex h-full w-full items-center justify-center bg-zinc-200 text-zinc-500"
                            role="img"
                            aria-label={alt}
                        >
                            {fallbackLetter ? (
                                <span
                                    className="font-black leading-none"
                                    style={{ fontSize: Math.round(imagePx * 0.42) }}
                                >
                                    {fallbackLetter}
                                </span>
                            ) : (
                                <User size={Math.round(imagePx * 0.5)} strokeWidth={2} />
                            )}
                        </div>
                    )}
                </div>

                {/* Corner badges — on the ring corners, never over the photo */}
                {showBadges && showDivision && (
                    <div className="rank-avatar__corner rank-avatar__corner--tl">
                        <DivisionBadge
                            division={division}
                            config={rank}
                            size={size}
                            animated={animated}
                        />
                    </div>
                )}

                {showBadges && (
                    <div className="rank-avatar__corner rank-avatar__corner--tr">
                        <SafetyIconBadge config={rank} size={iconSize} rounded />
                    </div>
                )}
            </div>

            {/* Rank name + points — license-plate bar under the photo */}
            {showBadges && (
                <div className="rank-avatar__banner relative z-20 mt-3 flex flex-col items-center">
                    <RankBadge config={rank} size={size} animated={animated} />
                    {showPoints && (
                        <PointsBadge
                            config={rank}
                            points={score > 0 ? score : undefined}
                            label={score > 0 ? undefined : rank.displayPoints}
                            animated={animated}
                            className="mt-1.5"
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default AvatarBorder;
