"use client";

/**
 * ── RankLabel & RankedAvatar ──────────────────────────────────────────────────
 *
 * Reusable components that apply the tier-based visual identity to any user.
 *
 * Psychology:
 *  • Status Signalling — visible rank badge makes achievement public
 *  • Endowed Progress Effect — progress bar toward next tier
 *  • Variable Ratio Reinforcement — animated shimmer on Gold+ tiers
 *  • Loss Aversion — "X pts to next tier" micro-copy
 *  • Social Comparison — rank visible to peers on leaderboard
 */

import { getRank, getNextRank, tierProgress, pointsToNextRank, RANK_TIERS } from "@/lib/rank-utils";
import { PremiumRankedAvatar } from "./premium-ranked-avatar";
import { RoadAvatarBorder } from "@/components/rank/RoadAvatarBorder";
import { GoldAvatarBorder } from "@/components/rank/GoldAvatarBorder";
import { PlatinumAvatarBorder } from "@/components/rank/PlatinumAvatarBorder";
import { DiamondAvatarBorder } from "@/components/rank/DiamondAvatarBorder";
import { MythicAvatarBorder } from "@/components/rank/MythicAvatarBorder";
import {
    Sprout,
    PartyPopper,
    Star,
    Trophy,
    Gem,
    Shield,
    Flame,
    Crown,
    Award,
    Zap,
    type LucideIcon,
} from "lucide-react";

export const TIER_ICONS: Record<string, LucideIcon> = {
    rookie: Sprout,
    rising: Zap,
    debut: PartyPopper,
    gold: Star,
    platinum: Trophy,
    diamond: Gem,
    master: Shield,
    elite: Flame,
    legend: Crown,
    highmaster: Award,
    mythic: Award,
};

// ── Keyframe styles injected once ────────────────────────────────────────────
export const RANK_KEYFRAMES = `
  @keyframes rankShimmer {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes rankPop {
    0%   { transform: scale(.6); opacity: 0; }
    65%  { transform: scale(1.08); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes rankPlateIn {
    0%   { transform: translateX(-14px) scaleX(.86); opacity: 0; }
    70%  { transform: translateX(2px) scaleX(1.02); opacity: 1; }
    100% { transform: translateX(0) scaleX(1); opacity: 1; }
  }
  @keyframes rankShine {
    0%   { left: -50%; }
    55%  { left: 130%; }
    100% { left: 130%; }
  }
  @keyframes rankStarBurst {
    0%, 2%   { transform: translate(-50%,-50%) translate(0,0) scale(.2) rotate(-20deg); opacity: 0; }
    5%       { transform: translate(-50%,-50%) translate(var(--star-x),var(--star-y)) scale(1.2) rotate(8deg); opacity: 1; }
    9%       { transform: translate(-50%,-50%) translate(var(--star-x),var(--star-y)) scale(.9) rotate(20deg); opacity: 1; }
    14%,100% { transform: translate(-50%,-50%) translate(var(--star-x),var(--star-y)) scale(.35) rotate(35deg); opacity: 0; }
  }
  @keyframes magneticSweep {
    from { stroke-dashoffset: 360; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes magneticSweepReverse {
    from { stroke-dashoffset: 0; }
    to { stroke-dashoffset: 360; }
  }
  @keyframes electricSpark {
    0%, 100% { opacity: 0.4; stroke-width: 0.8; }
    50% { opacity: 0.95; stroke-width: 1.6; }
  }
  @keyframes techRingRotate {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes techRingPulse {
    0%   { opacity: 0.35; }
    100% { opacity: 0.85; }
  }
  @media (prefers-reduced-motion: reduce) {
    .rank-splash,
    .rank-shine,
    .rank-star-burst,
    .tech-hud-ring {
      animation: none !important;
      box-shadow: none !important;
    }
    .rank-star-burst {
      display: none !important;
    }
    .rank-shine {
      display: none !important;
    }
  }
`;

function formatThreshold(points: number) {
    if (points === 0) return "START";
    if (points >= 1000 && points % 1000 === 0) return `${points / 1000}K`;
    return points.toLocaleString("en-US");
}

// ── RankBadge — tier info-sign nameplate ─────────────────────────────────────
export function RankBadge({
    lifetimePoints,
    size = "sm",
    showEmoji = true,
    showPoints = false,
    index = 0,
    displayLabel,
}: {
    lifetimePoints: number;
    size?: "xs" | "sm" | "md";
    showEmoji?: boolean;
    lang?: string;
    showPoints?: boolean;
    index?: number;
    displayLabel?: string;
}) {
    const tier = getRank(lifetimePoints);
    const Icon = TIER_ICONS[tier.id] || Star;
    const label = displayLabel?.trim() || tier.label;

    const sizeStyles = {
        xs: {
            iconSize: 10,
            iconPadding: "0 5px",
            bodyPadding: "2px 6px",
            labelSize: "8px",
            pointsSize: "7px",
            minHeight: 22,
        },
        sm: {
            iconSize: 13,
            iconPadding: "0 7px",
            bodyPadding: "3px 8px",
            labelSize: "10px",
            pointsSize: "8px",
            minHeight: 28,
        },
        md: {
            iconSize: 16,
            iconPadding: "0 9px",
            bodyPadding: "4px 10px",
            labelSize: "11px",
            pointsSize: "8px",
            minHeight: 34,
        },
    }[size];

    return (
        <>
            <style>{RANK_KEYFRAMES}</style>
            <span
                className="rank-splash relative inline-flex flex-shrink-0 items-stretch overflow-hidden bg-white font-system select-none"
                aria-label={displayLabel ? `${label}, ${tier.label} tier` : `${tier.label} tier`}
                style={{
                    width: "fit-content",
                    maxWidth: "100%",
                    flexShrink: displayLabel ? 1 : 0,
                    minHeight: sizeStyles.minHeight,
                    border: "3px solid #000",
                    borderRadius: 0,
                    boxShadow: "2px 2px 0 #000",
                    animation: "rankPlateIn .4s cubic-bezier(.22,1,.36,1) both",
                    animationDelay: `${Math.max(0, index) * 0.06}s`,
                    transformOrigin: "left center",
                    whiteSpace: "nowrap",
                }}
            >
                <span
                    className="relative z-[1] flex items-center justify-center"
                    style={{
                        minWidth: showEmoji ? undefined : size === "xs" ? 10 : 12,
                        padding: showEmoji ? sizeStyles.iconPadding : 0,
                        background: tier.accent,
                        color: tier.textColor,
                        borderRight: "3px solid #000",
                    }}
                    aria-hidden="true"
                >
                    {showEmoji && <Icon size={sizeStyles.iconSize} strokeWidth={2.5} />}
                </span>
                <span
                    className="relative z-[1] flex flex-col justify-center bg-white"
                    style={{
                        padding: sizeStyles.bodyPadding,
                        lineHeight: 1.15,
                        minWidth: 0,
                    }}
                >
                    <span
                        className={`truncate font-black ${displayLabel ? "" : "uppercase tracking-wider"}`}
                        style={{
                            color: tier.textDark,
                            fontSize: sizeStyles.labelSize,
                            letterSpacing: displayLabel ? "0.01em" : "0.05em",
                            maxWidth: "100%",
                        }}
                    >
                        {label}
                    </span>
                    {showPoints && (
                        <span
                            className="font-mono font-bold text-zinc-500"
                            style={{ fontSize: sizeStyles.pointsSize, lineHeight: 1.1 }}
                        >
                            {formatThreshold(tier.minPoints)}
                        </span>
                    )}
                </span>
                {tier.animated && (
                    <span
                        className="rank-shine pointer-events-none absolute top-0 z-[2] h-full"
                        aria-hidden="true"
                        style={{
                            left: "-50%",
                            width: "45%",
                            background: "linear-gradient(100deg,transparent,rgba(255,255,255,.5),transparent)",
                            transform: "skewX(-18deg)",
                            animation: "rankShine 2.4s ease-in-out infinite",
                            animationDelay: `${Math.max(0, index) * 0.06}s`,
                        }}
                    />
                )}
            </span>
        </>
    );
}

// ── RankedAvatarRing — circular tier frame with a periodic star burst ────────
export function RankedAvatarRing({
    lifetimePoints,
    size,
    children,
    index = 0,
}: {
    lifetimePoints: number;
    size: number;
    children: React.ReactNode;
    index?: number;
}) {
    const pts = lifetimePoints ?? 0;
    const rank = getRank(pts);
    const isSmall = size < 50;

    if (rank.id === "mythic") {
        return (
            <MythicAvatarBorder score={pts} size={size} alt="User avatar" animated={true}>
                {children}
            </MythicAvatarBorder>
        );
    }
    if (rank.id === "diamond") {
        return (
            <DiamondAvatarBorder score={pts} size={size} alt="User avatar" animated={true}>
                {children}
            </DiamondAvatarBorder>
        );
    }
    if (rank.id === "platinum") {
        return (
            <PlatinumAvatarBorder score={pts} size={size} alt="User avatar" animated={true}>
                {children}
            </PlatinumAvatarBorder>
        );
    }
    if (rank.id === "gold") {
        return (
            <GoldAvatarBorder score={pts} size={size} alt="User avatar" animated={true}>
                {children}
            </GoldAvatarBorder>
        );
    }
    if (rank.id === "rookie" || rank.id === "rising" || rank.id === "debut") {
        return (
            <RoadAvatarBorder score={pts} size={size} alt="User avatar" animated={true} showRankBadge={!isSmall}>
                {children}
            </RoadAvatarBorder>
        );
    }

    return (
        <PremiumRankedAvatar
            lifetimePoints={pts}
            size={size}
            showRankBadge={!isSmall}
            showDivisionBadge={true}
            showPointsBadge={size >= 80}
            showSafetyBadge={size >= 80}
            interactive={size >= 60}
            framePadding={isSmall ? 10 : 24}
        >
            {children}
        </PremiumRankedAvatar>
    );
}

// ── RankProgressBar — shows progress to next tier ────────────────────────────
export function RankProgressBar({
    lifetimePoints,
    lang = "en",
    compact = false,
}: {
    lifetimePoints: number;
    lang?: string;
    compact?: boolean;
}) {
    const tier = getRank(lifetimePoints);
    const next = getNextRank(lifetimePoints);
    const pct = tierProgress(lifetimePoints);
    const needed = pointsToNextRank(lifetimePoints);
    const isKh = lang === "kh";

    if (!next) {
        // Max tier
        return (
            <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black inline-flex items-center gap-1" style={{ color: tier.accent }}>
                    {(() => {
                        const Icon = TIER_ICONS[tier.id] || Star;
                        return <Icon size={11} className="inline-block" />;
                    })()}
                    <span>{isKh ? "ថ្នាក់ខ្ពស់បំផុត!" : "Max Tier!"}</span>
                </span>
            </div>
        );
    }

    return (
        <div className={compact ? "flex flex-col gap-0.5" : "flex flex-col gap-1"}>
            {!compact && (
                <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest inline-flex items-center gap-1">
                        <span>{isKh ? "ទៅថ្នាក់" : "Next"}:</span>
                        {(() => {
                            const Icon = TIER_ICONS[next.id] || Star;
                            return <Icon size={11} className="inline-block" />;
                        })()}
                        <span>{next.label}</span>
                    </span>
                    <span className="text-[9px] font-black tabular-nums" style={{ color: next.accent }}>
                        {needed.toLocaleString()} {isKh ? "pts ទៀត" : "pts to go"}
                    </span>
                </div>
            )}
            {/* Track */}
            <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "#e4e4e7" }}>
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                        width: `${pct}%`,
                        background: next.labelGradient,
                        backgroundSize: "200% 200%",
                        animation: next.animated ? "rankShimmer 2s ease infinite" : undefined,
                    }}
                />
            </div>
            {compact && (
                <span className="text-[8px] font-bold text-zinc-400 tabular-nums inline-flex items-center gap-1">
                    <span>{needed.toLocaleString()} pts →</span>
                    {(() => {
                        const Icon = TIER_ICONS[next.id] || Star;
                        return <Icon size={10} className="inline-block" />;
                    })()}
                </span>
            )}
        </div>
    );
}

// ── RankShowcase — full tier map shown on profile / leaderboard ───────────────
export function RankShowcase({
    lifetimePoints,
    lang = "en",
}: {
    lifetimePoints: number;
    lang?: string;
}) {
    const current = getRank(lifetimePoints);
    const isKh = lang === "kh";

    return (
        <>
            <style>{RANK_KEYFRAMES}</style>
            <div className="flex flex-col gap-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    All Tiers
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {RANK_TIERS.map((tier) => {
                        const unlocked = lifetimePoints >= tier.minPoints;
                        const isCurrent = tier.id === current.id;
                        return (
                            <div
                                key={tier.id}
                                className="flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all"
                                style={{
                                    borderColor: isCurrent ? tier.accent : unlocked ? `${tier.accent}55` : "#e4e4e7",
                                    background: isCurrent ? `${tier.glow}22` : unlocked ? `${tier.glow}0a` : "#fafafa",
                                    opacity: unlocked ? 1 : 0.45,
                                    boxShadow: isCurrent ? `0 0 12px ${tier.glow}66` : undefined,
                                }}
                            >
                                {(() => {
                                    const Icon = TIER_ICONS[tier.id] || Star;
                                    return <Icon size={22} style={{ color: unlocked ? tier.accent : "#d4d4d8" }} />;
                                })()}
                                <span
                                    className="text-[8px] font-black uppercase tracking-wide"
                                    style={{ color: unlocked ? tier.accent : "#a1a1aa" }}
                                >
                                    {tier.label}
                                </span>
                                <span className="text-[7px] text-zinc-400 tabular-nums">
                                    {tier.minPoints === 0 ? "Start" : `${tier.minPoints.toLocaleString()} pts`}
                                </span>
                                {isCurrent && (
                                    <span
                                        className="text-[7px] font-black px-1.5 py-0.5 rounded"
                                        style={{ background: tier.accent, color: tier.textColor }}
                                    >
                                        {isKh ? "ឥឡូវ" : "NOW"}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
