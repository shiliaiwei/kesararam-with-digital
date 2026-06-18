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
    /** Dark tier color used for the English tier name on white */
    textDark: string;
}

/**
 * minPoints are LIFETIME-EARNED Store Points on the small "premium" scale
 * (live-games-only economy; see src/lib/store-points/award.ts). Numbers are kept
 * deliberately small and scarce so each point feels valuable — psychology:
 * scarcity + endowed status (a low, hard-won number reads as more elite than an
 * inflated one). Spending never lowers a tier: rank reads lifetime-earned, claims
 * spend the store balance. Calibration: Rising 5, Gold 12, Platinum 20,
 * Diamond 30, Mythic 45 (lifetime live points).
 */
export const RANK_TIERS: RankTier[] = [
    {
        id: "rookie",
        label: "Rookie",
        labelKh: "Rookie",
        emoji: "🌱",
        minPoints: 0,
        labelGradient: "linear-gradient(90deg,#71717a,#52525b)",
        borderGradient: "linear-gradient(135deg,#71717a,#a1a1aa)",
        accent: "#71717a",
        glow: "#a1a1aa",
        animated: false,
        textColor: "#fff",
        textDark: "#3f3f46",
    },
    {
        id: "rising",
        label: "Rising",
        labelKh: "Rising",
        emoji: "⚡",
        minPoints: 50,
        labelGradient: "linear-gradient(90deg,#d97706,#fbbf24)",
        borderGradient: "linear-gradient(135deg,#eab308,#ffd700)",
        accent: "#eab308",
        glow: "#ffd700",
        animated: true,
        textColor: "#000",
        textDark: "#854d0e",
    },
    {
        id: "gold",
        label: "Gold",
        labelKh: "Gold",
        emoji: "⭐",
        minPoints: 150,
        labelGradient: "linear-gradient(90deg,#b45309,#fbbf24,#b45309)",
        borderGradient: "linear-gradient(135deg,#b45309,#fbbf24,#f59e0b,#b45309)",
        accent: "#eab308",
        glow: "#fbbf24",
        animated: true,
        textColor: "#000",
        textDark: "#a16207",
    },
    {
        id: "platinum",
        label: "Platinum",
        labelKh: "Platinum",
        emoji: "🏆",
        minPoints: 350,
        labelGradient: "linear-gradient(90deg,#0369a1,#38bdf8,#0369a1)",
        borderGradient: "linear-gradient(135deg,#0369a1,#7dd3fc,#38bdf8,#0369a1)",
        accent: "#3b82f6",
        glow: "#7dd3fc",
        animated: true,
        textColor: "#fff",
        textDark: "#0369a1",
    },
    {
        id: "diamond",
        label: "Diamond",
        labelKh: "Diamond",
        emoji: "💎",
        minPoints: 700,
        labelGradient: "linear-gradient(90deg,#0891b2,#22d3ee,#0891b2)",
        borderGradient: "linear-gradient(135deg,#0891b2,#67e8f9,#22d3ee,#a5f3fc,#0891b2)",
        accent: "#06b6d4",
        glow: "#67e8f9",
        animated: true,
        textColor: "#000",
        textDark: "#0e7490",
    },
    {
        id: "master",
        label: "Master",
        labelKh: "Master",
        emoji: "🛡️",
        minPoints: 1200,
        labelGradient: "linear-gradient(90deg,#1e3a8a,#2563eb,#1e3a8a)",
        borderGradient: "linear-gradient(135deg,#1e3a8a,#3b82f6,#2563eb,#1e3a8a)",
        accent: "#2563eb",
        glow: "#3b82f6",
        animated: true,
        textColor: "#fff",
        textDark: "#1e3a8a",
    },
    {
        id: "elite",
        label: "Elite",
        labelKh: "Elite",
        emoji: "🔥",
        minPoints: 2000,
        labelGradient: "linear-gradient(90deg,#6b21a8,#a855f7,#6b21a8)",
        borderGradient: "linear-gradient(135deg,#6b21a8,#c084fc,#a855f7,#6b21a8)",
        accent: "#a855f7",
        glow: "#c084fc",
        animated: true,
        textColor: "#fff",
        textDark: "#6b21a8",
    },
    {
        id: "legend",
        label: "Legend",
        labelKh: "Legend",
        emoji: "👑",
        minPoints: 3000,
        labelGradient: "linear-gradient(90deg,#d97706,#ffd700,#d97706)",
        borderGradient: "linear-gradient(135deg,#d97706,#fbbf24,#ffffff,#d97706)",
        accent: "#ffd700",
        glow: "#ffffff",
        animated: true,
        textColor: "#000",
        textDark: "#b45309",
    },
    {
        id: "highmaster",
        label: "Highmaster",
        labelKh: "Highmaster",
        emoji: "⚜️",
        minPoints: 5000,
        labelGradient: "linear-gradient(90deg,#78350f,#fbbf24,#78350f)",
        borderGradient: "linear-gradient(135deg,#78350f,#fbbf24,#ffd700,#78350f)",
        accent: "#ffd700",
        glow: "#fbbf24",
        animated: true,
        textColor: "#fff",
        textDark: "#78350f",
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

/** Division type: Roman numerals IV to I */
export type RankDivision = "I" | "II" | "III" | "IV";

/** Get the division for a given lifetime points value */
export function getDivision(lifetimePoints: number): RankDivision {
    const current = getRank(lifetimePoints);
    const next = getNextRank(lifetimePoints);
    
    // Highmaster is the highest rank. We divide Highmaster progress based on 500pt brackets.
    if (!next) {
        const excess = lifetimePoints - current.minPoints;
        if (excess < 500) return "IV";
        if (excess < 1000) return "III";
        if (excess < 1500) return "II";
        return "I";
    }

    const range = next.minPoints - current.minPoints;
    if (range <= 0) return "IV";
    
    const earned = lifetimePoints - current.minPoints;
    const pct = earned / range;
    
    if (pct < 0.25) return "IV";
    if (pct < 0.50) return "III";
    if (pct < 0.75) return "II";
    return "I";
}

