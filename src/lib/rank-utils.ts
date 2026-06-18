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
 * minPoints are LIFETIME-EARNED rank points. This UI helper mirrors the canonical
 * Rookie → Mythic score curve in src/lib/ranks.ts so leaderboard labels, profile
 * badges, and avatar frames never drift apart.
 */
export const RANK_TIERS: RankTier[] = [
    {
        id: "rookie",
        label: "Rookie",
        labelKh: "Rookie",
        emoji: "",
        minPoints: 0,
        labelGradient: "linear-gradient(90deg,#000000,#27272a)",
        borderGradient: "linear-gradient(135deg,#000000,#eab308)",
        accent: "#eab308",
        glow: "#facc15",
        animated: false,
        textColor: "#fff",
        textDark: "#000000",
    },
    {
        id: "rising",
        label: "Rising",
        labelKh: "Rising",
        emoji: "",
        minPoints: 1000,
        labelGradient: "linear-gradient(90deg,#15803d,#22c55e)",
        borderGradient: "linear-gradient(135deg,#22c55e,#eab308)",
        accent: "#22c55e",
        glow: "#86efac",
        animated: true,
        textColor: "#000",
        textDark: "#14532d",
    },
    {
        id: "gold",
        label: "Gold",
        labelKh: "Gold",
        emoji: "",
        minPoints: 2500,
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
        emoji: "",
        minPoints: 3500,
        labelGradient: "linear-gradient(90deg,#1d4ed8,#3b82f6,#1d4ed8)",
        borderGradient: "linear-gradient(135deg,#1d4ed8,#60a5fa,#3b82f6,#93c5fd,#1d4ed8)",
        accent: "#3b82f6",
        glow: "#93c5fd",
        animated: true,
        textColor: "#fff",
        textDark: "#1e3a8a",
    },
    {
        id: "diamond",
        label: "Diamond",
        labelKh: "Diamond",
        emoji: "",
        minPoints: 7000,
        labelGradient: "linear-gradient(90deg,#0891b2,#22d3ee,#0891b2)",
        borderGradient: "linear-gradient(135deg,#0891b2,#67e8f9,#22d3ee,#a5f3fc,#0891b2)",
        accent: "#06b6d4",
        glow: "#67e8f9",
        animated: true,
        textColor: "#000",
        textDark: "#0e7490",
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
    
    // Diamond is open-ended: IV 7,000+ · III 10,000+ · II 15,000+ · I 25,000+.
    if (!next) {
        if (lifetimePoints < 10000) return "IV";
        if (lifetimePoints < 15000) return "III";
        if (lifetimePoints < 25000) return "II";
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
