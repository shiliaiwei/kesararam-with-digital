/**
 * ── Rank / Tier System ────────────────────────────────────────────────────────
 *
 * Psychology principles applied:
 *  • Self-Determination Theory (Deci & Ryan) — clear tiers give autonomy + competence
 *  • Endowed Progress Effect (Nunes & Drèze) — show progress toward next tier
 *  • Status Signalling (Veblen) — visible rank label makes status public
 *  • Loss Aversion (Kahneman) — "X pts to next tier" framing
 *  • Variable Ratio Reinforcement (Skinner) — animated glow on higher tiers
 *  • Social Comparison (Festinger) — rank label visible on leaderboard to peers
 */

export interface RankTier {
    id: string;
    label: string;
    labelKh: string;
    emoji: string;
    minPoints: number;
    /** CSS gradient for the name label background */
    labelGradient: string;
    /** CSS gradient for the avatar border */
    borderGradient: string;
    /** Solid accent color (for fallback / text) */
    accent: string;
    /** Glow color for animated ring */
    glow: string;
    /** Whether this tier gets an animated shimmer on the border */
    animated: boolean;
    /** Text color on the label badge */
    textColor: string;
}

export const RANK_TIERS: RankTier[] = [
    {
        id: "rookie",
        label: "Rookie",
        labelKh: "អ្នកចាប់ផ្ដើម",
        emoji: "🌱",
        minPoints: 0,
        labelGradient: "linear-gradient(90deg,#71717a,#52525b)",
        borderGradient: "linear-gradient(135deg,#71717a,#a1a1aa)",
        accent: "#71717a",
        glow: "#a1a1aa",
        animated: false,
        textColor: "#fff",
    },
    {
        id: "debut",
        label: "Debut",
        labelKh: "ចាប់ផ្ដើម",
        emoji: "🎉",
        minPoints: 10000,
        labelGradient: "linear-gradient(90deg,#7c3aed,#a78bfa)",
        borderGradient: "linear-gradient(135deg,#7c3aed,#c4b5fd,#7c3aed)",
        accent: "#7c3aed",
        glow: "#a78bfa",
        animated: false,
        textColor: "#fff",
    },
    {
        id: "gold",
        label: "Gold",
        labelKh: "មាស",
        emoji: "⭐",
        minPoints: 30000,
        labelGradient: "linear-gradient(90deg,#b45309,#fbbf24,#b45309)",
        borderGradient: "linear-gradient(135deg,#b45309,#fbbf24,#f59e0b,#b45309)",
        accent: "#eab308",
        glow: "#fbbf24",
        animated: true,
        textColor: "#000",
    },
    {
        id: "platinum",
        label: "Platinum",
        labelKh: "ប្លាទីន",
        emoji: "🏆",
        minPoints: 60000,
        labelGradient: "linear-gradient(90deg,#0369a1,#38bdf8,#0369a1)",
        borderGradient: "linear-gradient(135deg,#0369a1,#7dd3fc,#38bdf8,#0369a1)",
        accent: "#38bdf8",
        glow: "#7dd3fc",
        animated: true,
        textColor: "#000",
    },
    {
        id: "diamond",
        label: "Diamond",
        labelKh: "ពេជ្រ",
        emoji: "💎",
        minPoints: 100000,
        labelGradient: "linear-gradient(90deg,#0891b2,#22d3ee,#06b6d4,#22d3ee,#0891b2)",
        borderGradient: "linear-gradient(135deg,#0891b2,#67e8f9,#22d3ee,#a5f3fc,#0891b2)",
        accent: "#06b6d4",
        glow: "#67e8f9",
        animated: true,
        textColor: "#000",
    },
    {
        id: "mythic",
        label: "Mythic",
        labelKh: "ព្រះ",
        emoji: "👑",
        minPoints: 200000,
        labelGradient: "linear-gradient(90deg,#9333ea,#ec4899,#f97316,#ec4899,#9333ea)",
        borderGradient: "linear-gradient(135deg,#9333ea,#f472b6,#fb923c,#f472b6,#9333ea)",
        accent: "#ec4899",
        glow: "#f9a8d4",
        animated: true,
        textColor: "#fff",
    },
];

/** Get the current tier for a given lifetime points value */
export function getRank(lifetimePoints: number): RankTier {
    for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
        if (lifetimePoints >= RANK_TIERS[i].minPoints) return RANK_TIERS[i];
    }
    return RANK_TIERS[0];
}

/** Get the next tier (null if already at max) */
export function getNextRank(lifetimePoints: number): RankTier | null {
    const current = getRank(lifetimePoints);
    const idx = RANK_TIERS.findIndex(t => t.id === current.id);
    return idx < RANK_TIERS.length - 1 ? RANK_TIERS[idx + 1] : null;
}

/** Points needed to reach the next tier */
export function pointsToNextRank(lifetimePoints: number): number {
    const next = getNextRank(lifetimePoints);
    return next ? next.minPoints - lifetimePoints : 0;
}

/** Progress percentage within the current tier (0–100) */
export function tierProgress(lifetimePoints: number): number {
    const current = getRank(lifetimePoints);
    const next = getNextRank(lifetimePoints);
    if (!next) return 100;
    const range = next.minPoints - current.minPoints;
    const earned = lifetimePoints - current.minPoints;
    return Math.min(100, Math.round((earned / range) * 100));
}
