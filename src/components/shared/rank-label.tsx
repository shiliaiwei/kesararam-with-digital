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
import { Sprout, PartyPopper, Star, Trophy, Gem, Crown } from "lucide-react";

const TIER_ICONS: Record<string, React.ComponentType<any>> = {
    rookie: Sprout,
    debut: PartyPopper,
    gold: Star,
    platinum: Trophy,
    diamond: Gem,
    mythic: Crown,
};

// ── Keyframe styles injected once ────────────────────────────────────────────
const RANK_KEYFRAMES = `
  @keyframes rankShimmer {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes rankGlow {
    0%,100% { box-shadow: 0 0 6px 2px var(--rank-glow); }
    50%      { box-shadow: 0 0 14px 5px var(--rank-glow); }
  }
  @keyframes rankPulse {
    0%,100% { opacity: 1; }
    50%      { opacity: 0.7; }
  }
`;

// ── RankBadge — small inline pill ────────────────────────────────────────────
export function RankBadge({
    lifetimePoints,
    size = "sm",
    showEmoji = true,
    lang = "en",
}: {
    lifetimePoints: number;
    size?: "xs" | "sm" | "md";
    showEmoji?: boolean;
    lang?: string;
}) {
    const tier = getRank(lifetimePoints);
    const isKh = lang === "kh";
    const label = tier.label;

    const sizeStyles = {
        xs: { fontSize: "8px", padding: "1px 5px", gap: 2 },
        sm: { fontSize: "9px", padding: "2px 7px", gap: 3 },
        md: { fontSize: "11px", padding: "3px 10px", gap: 4 },
    }[size];

    return (
        <>
            <style>{RANK_KEYFRAMES}</style>
            <span
                className="inline-flex items-center font-black uppercase tracking-widest select-none"
                style={{
                    ...sizeStyles,
                    background: tier.labelGradient,
                    backgroundSize: tier.animated ? "200% 200%" : "100%",
                    animation: tier.animated ? "rankShimmer 2.5s ease infinite" : undefined,
                    color: tier.textColor,
                    borderRadius: 3,
                    border: `1px solid rgba(255,255,255,0.25)`,
                    boxShadow: `0 1px 4px ${tier.glow}66`,
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                }}
            >
                {showEmoji && (
                    (() => {
                        const Icon = TIER_ICONS[tier.id] || Star;
                        const iconSize = size === "xs" ? 9 : size === "sm" ? 10 : 12;
                        return <Icon size={iconSize} style={{ marginRight: sizeStyles.gap, display: "inline-block" }} />;
                    })()
                )}
                {label}
            </span>
        </>
    );
}

// ── RankedAvatarRing — wraps any avatar with a tier-colored animated border ──
export function RankedAvatarRing({
    lifetimePoints,
    size,
    children,
}: {
    lifetimePoints: number;
    size: number;
    children: React.ReactNode;
}) {
    const tier = getRank(lifetimePoints);
    const pad = tier.id === "rookie" ? 2 : 3;

    return (
        <>
            <style>{RANK_KEYFRAMES}</style>
            <div
                className="relative flex-shrink-0"
                style={{
                    width: size + pad * 2,
                    height: size + pad * 2,
                    padding: pad,
                    borderRadius: "50%",
                    background: tier.borderGradient,
                    backgroundSize: tier.animated ? "300% 300%" : "100%",
                    animation: tier.animated ? "rankShimmer 2s ease infinite" : undefined,
                    // @ts-expect-error CSS custom property
                    "--rank-glow": tier.glow,
                }}
            >
                {tier.animated && (
                    <div
                        className="absolute inset-0 rounded-full pointer-events-none"
                        style={{ animation: "rankGlow 2s ease-in-out infinite" }}
                    />
                )}
                <div
                    className="w-full h-full rounded-full overflow-hidden"
                    style={{ background: "#fff" }}
                >
                    {children}
                </div>
            </div>
        </>
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
