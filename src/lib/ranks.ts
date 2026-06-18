/**
 * ── KWD Road Safety Rank System ───────────────────────────────────────────────
 * Avatar Border & Profile Badge System — LOGIC CORE
 *
 * Self-contained scoring / rank / division / migration / leaderboard logic for
 * the KWD (Kesararam With Digital) road-safety quiz platform.
 *
 * This module is intentionally framework-agnostic (pure TypeScript, no React, no
 * DB) so it can be reused anywhere. UI components in `src/components/rank/*`
 * import from here. It coexists with the legacy `src/lib/rank-utils.ts` system
 * and does not modify it.
 *
 * Design rules baked in:
 *  • Only `score` is the permanent source of truth — rank & division are ALWAYS
 *    derived from score so they can never drift out of sync.
 *  • English, uppercase rank names. The highest rank is MYTHIC (never
 *    "Supreme"). Rank names are never translated to Khmer.
 *  • Old leaderboard scores migrate via a single, easy-to-change multiplier.
 */

/* ────────────────────────────── Core types ─────────────────────────────── */

export type RankName =
    | "Rookie"
    | "Rising"
    | "Gold"
    | "Platinum"
    | "Diamond"
    | "Mythic";

/** Roman-numeral divisions inside a rank. IV = lowest, I = highest before rank-up. */
export type Division = "IV" | "III" | "II" | "I";

export type AvatarSize = "sm" | "md" | "lg" | "xl";

/**
 * Icon identifier (string, not a component) so this pure-logic file stays free of
 * React. `SafetyIconBadge` maps these ids to Lucide icons.
 */
export type RankIconId =
    | "traffic-cone"
    | "chevrons-up"
    | "triangle-alert"
    | "info"
    | "gem"
    | "shield-check"
    | "octagon-alert"
    | "trophy"
    | "crown";

export interface RankConfig {
    /** stable machine id, e.g. "gold" */
    id: string;
    /** display rank name, e.g. "Gold" */
    name: RankName;
    /** UPPERCASE label shown on badges, e.g. "GOLD" */
    label: string;
    /** lifetime points required to enter this rank */
    minPoints: number;
    /** what the points chip shows on a showcase card, e.g. "150 PTS" / "START NOW" */
    displayPoints: string;
    /** main rank color */
    primaryColor: string;
    /** secondary / contrast color */
    secondaryColor: string;
    /** accent color (caution stripe, division badge, glow) */
    accentColor: string;
    /** readable text color on top of the primary color */
    textColor: string;
    /** css class that paints the static frame, e.g. "rank-frame--gold" */
    borderClass: string;
    /** css class that drives the looping animation, e.g. "rank-anim-gold" */
    animationClass: string;
    /** road-safety icon id (see RankIconId) */
    icon: RankIconId;
    /** short road-safety theme line */
    safetyTheme: string;
    /** longer description for showcase cards */
    description: string;
    /**
     * OPTIONAL custom division lower-bounds [IV, III, II, I]. Use only when the
     * rank's divisions are NOT even quarters of its point range (e.g. Mythic, the
     * open-ended top rank). When omitted, divisions are even quarters between this
     * rank's minPoints and the next rank's minPoints.
     */
    divisionThresholds?: readonly [number, number, number, number];
}

export interface UserRankResult {
    rank: RankConfig;
    division: Division;
    score: number;
    /** minPoints of the current rank */
    currentRankMin: number;
    /** minPoints of the next rank, or null for the top rank (Mythic) */
    nextRankMin: number | null;
    /** points earned past the current rank threshold */
    pointsIntoRank: number;
    /** points still needed to reach the next rank (0 once maxed) */
    pointsNeededForNextRank: number;
    /** progress through the current rank, 0–100 (percentage) */
    progressToNextRank: number;
    avatarBorderClass: string;
    animationClass: string;
}

export interface LeaderboardUser {
    id: string;
    username: string;
    name: string;
    imageUrl: string;
    score: number;
    oldScore?: number;
    /** ISO date string or epoch ms — newer wins ties */
    lastActivityAt?: string | number;
    /** seconds — faster wins ties */
    fastestQuizTime?: number;
}

/* ───────────────────────────── Configuration ───────────────────────────── */

/**
 * Migration multiplier — the OLD small leaderboard scores (25, 23, 21 …) are
 * scaled onto the new larger curve. Change this one number to re-tune migration.
 */
export const MIGRATION_MULTIPLIER = 10;

/**
 * The top rank (Mythic) has no next rank, but still earns divisions. Every
 * `TOP_RANK_DIVISION_STEP` points past its threshold advances one division (IV→I).
 */
export const TOP_RANK_DIVISION_STEP = 500;

/** Division order, lowest → highest. */
export const DIVISIONS: readonly Division[] = ["IV", "III", "II", "I"] as const;

/**
 * The 6 ranks, in ascending order. EDIT THIS to re-theme or re-tune the system —
 * everything else derives from it. minPoints must stay ascending.
 */
export const RANK_CONFIGS: readonly RankConfig[] = [
    {
        id: "rookie",
        name: "Rookie",
        label: "ROOKIE",
        minPoints: 0,
        displayPoints: "START NOW",
        primaryColor: "#000000",
        secondaryColor: "#ffffff",
        accentColor: "#eab308",
        textColor: "#ffffff",
        borderClass: "rank-frame--rookie",
        animationClass: "rank-anim-rookie",
        icon: "traffic-cone",
        safetyTheme: "Beginner road learner",
        description: "Just starting the road-safety journey. Learn the signs.",
    },
    {
        id: "rising",
        name: "Rising",
        label: "RISING",
        minPoints: 1000,
        displayPoints: "1,000 PTS",
        primaryColor: "#eab308",
        secondaryColor: "#000000",
        accentColor: "#f59e0b",
        textColor: "#000000",
        borderClass: "rank-frame--rising",
        animationClass: "rank-anim-rising",
        icon: "chevrons-up",
        safetyTheme: "Learner improving fast",
        description: "Climbing fast — answering more road-safety questions right.",
    },
    {
        id: "gold",
        name: "Gold",
        label: "GOLD",
        minPoints: 2500,
        displayPoints: "2,500 PTS",
        primaryColor: "#eab308",
        secondaryColor: "#000000",
        accentColor: "#f97316",
        textColor: "#000000",
        borderClass: "rank-frame--gold",
        animationClass: "rank-anim-gold",
        icon: "triangle-alert",
        safetyTheme: "Warning-sign learner",
        description: "Knows the warning signs and reads the road with care.",
    },
    {
        id: "platinum",
        name: "Platinum",
        label: "PLATINUM",
        minPoints: 3500,
        displayPoints: "3,500 PTS",
        primaryColor: "#3b82f6",
        secondaryColor: "#ffffff",
        accentColor: "#1d4ed8",
        textColor: "#ffffff",
        borderClass: "rank-frame--platinum",
        animationClass: "rank-anim-platinum",
        icon: "info",
        safetyTheme: "Official road knowledge",
        description: "Solid, official road-rule knowledge. Reads every sign.",
    },
    {
        id: "diamond",
        name: "Diamond",
        label: "DIAMOND",
        minPoints: 7000,
        displayPoints: "7,000 PTS",
        primaryColor: "#3b82f6",
        secondaryColor: "#06b6d4",
        accentColor: "#22d3ee",
        textColor: "#ffffff",
        borderClass: "rank-frame--diamond",
        animationClass: "rank-anim-diamond",
        icon: "gem",
        safetyTheme: "Expert road-safety player",
        description: "An expert player — sharp, consistent, road-safety smart.",
    },
    {
        id: "mythic",
        name: "Mythic",
        label: "MYTHIC",
        minPoints: 12000,
        displayPoints: "12,000 PTS",
        primaryColor: "#a855f7",
        secondaryColor: "#eab308",
        accentColor: "#c084fc",
        textColor: "#ffffff",
        borderClass: "rank-frame--mythic",
        animationClass: "rank-anim-mythic",
        icon: "crown",
        safetyTheme: "Elite road-safety champion",
        description: "The highest KWD road-safety rank — the elite champion.",
        // Mythic divisions are open-ended and NOT even quarters:
        // IV 12,000+ · III 15,000+ · II 20,000+ · I 30,000+
        divisionThresholds: [12000, 15000, 20000, 30000],
    },
] as const;

/* ─────────────────────────── Utility functions ─────────────────────────── */

/** Clamp a number into [min, max]. */
function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/** Coerce any incoming score to a safe, non-negative integer. */
function normalizeScore(score: number): number {
    if (!Number.isFinite(score) || score < 0) return 0;
    return Math.floor(score);
}

/** Highest rank whose threshold the score has reached. */
export function getRankByScore(score: number): RankConfig {
    const s = normalizeScore(score);
    let current: RankConfig = RANK_CONFIGS[0];
    for (const rank of RANK_CONFIGS) {
        if (s >= rank.minPoints) current = rank;
        else break;
    }
    return current;
}

/** Look up a rank config by its name. */
export function getRankConfig(rankName: RankName): RankConfig {
    const found = RANK_CONFIGS.find((r) => r.name === rankName);
    // RANK_CONFIGS covers every RankName, so this is a safety net only.
    return found ?? RANK_CONFIGS[0];
}

/** The next rank up, or null if already at the top rank (Mythic). */
export function getNextRank(rankName: RankName): RankConfig | null {
    const index = RANK_CONFIGS.findIndex((r) => r.name === rankName);
    if (index < 0 || index >= RANK_CONFIGS.length - 1) return null;
    return RANK_CONFIGS[index + 1];
}

/**
 * Division within a given rank, derived from how far the score has progressed
 * between this rank's threshold and the next one.
 *   0–24.99% → IV · 25–49.99% → III · 50–74.99% → II · 75–99.99% → I
 * A rank may override this with explicit `divisionThresholds` (e.g. Mythic, whose
 * divisions are open-ended and uneven). The open-ended top rank without explicit
 * thresholds falls back to a fixed TOP_RANK_DIVISION_STEP per division.
 */
export function getDivisionByScore(score: number, rank: RankConfig): Division {
    const s = normalizeScore(score);

    // Explicit per-division lower-bounds (used by the open-ended top rank).
    if (rank.divisionThresholds) {
        let index = 0;
        rank.divisionThresholds.forEach((threshold, i) => {
            if (s >= threshold) index = i;
        });
        return DIVISIONS[index];
    }

    const next = getNextRank(rank.name);

    if (!next) {
        // Open-ended top rank without explicit thresholds: fixed step per division.
        const stepsPast = Math.floor((s - rank.minPoints) / TOP_RANK_DIVISION_STEP);
        const index = clamp(stepsPast, 0, DIVISIONS.length - 1);
        return DIVISIONS[index];
    }

    const range = next.minPoints - rank.minPoints;
    const progress = range > 0 ? (s - rank.minPoints) / range : 0;
    // 0–0.249→IV(0) … 0.75–0.999→I(3)
    const index = clamp(Math.floor(progress * DIVISIONS.length), 0, DIVISIONS.length - 1);
    return DIVISIONS[index];
}

export interface RankProgress {
    currentRankMin: number;
    nextRankMin: number | null;
    pointsIntoRank: number;
    pointsNeededForNextRank: number;
    /** 0–100 percentage through the current rank (toward next division for Mythic) */
    progressToNextRank: number;
}

/** Progress numbers for the current rank (used by the progress bar). */
export function getRankProgress(score: number): RankProgress {
    const s = normalizeScore(score);
    const rank = getRankByScore(s);
    const next = getNextRank(rank.name);

    if (!next) {
        // Open-ended top rank (Mythic) — show progress toward the next division.
        const pointsPast = s - rank.minPoints;

        if (rank.divisionThresholds) {
            const thresholds = rank.divisionThresholds;
            // current division index = highest threshold reached
            let idx = 0;
            thresholds.forEach((t, i) => {
                if (s >= t) idx = i;
            });
            const atTop = idx >= thresholds.length - 1;
            const lower = thresholds[idx];
            const upper = atTop ? lower : thresholds[idx + 1];
            const span = upper - lower;
            return {
                currentRankMin: rank.minPoints,
                nextRankMin: null,
                pointsIntoRank: pointsPast,
                pointsNeededForNextRank: atTop ? 0 : Math.max(upper - s, 0),
                progressToNextRank: atTop ? 100 : clamp(((s - lower) / span) * 100, 0, 100),
            };
        }

        const intoStep = pointsPast % TOP_RANK_DIVISION_STEP;
        const maxedOut = pointsPast >= TOP_RANK_DIVISION_STEP * (DIVISIONS.length - 1);
        return {
            currentRankMin: rank.minPoints,
            nextRankMin: null,
            pointsIntoRank: pointsPast,
            pointsNeededForNextRank: maxedOut ? 0 : TOP_RANK_DIVISION_STEP - intoStep,
            progressToNextRank: maxedOut
                ? 100
                : clamp((intoStep / TOP_RANK_DIVISION_STEP) * 100, 0, 100),
        };
    }

    const range = next.minPoints - rank.minPoints;
    const pointsIntoRank = s - rank.minPoints;
    return {
        currentRankMin: rank.minPoints,
        nextRankMin: next.minPoints,
        pointsIntoRank,
        pointsNeededForNextRank: Math.max(next.minPoints - s, 0),
        progressToNextRank: range > 0 ? clamp((pointsIntoRank / range) * 100, 0, 100) : 0,
    };
}

/** Full rank + division + progress result for a score. The one function the UI calls. */
export function calculateRankAndDivision(score: number): UserRankResult {
    const s = normalizeScore(score);
    const rank = getRankByScore(s);
    const division = getDivisionByScore(s, rank);
    const progress = getRankProgress(s);

    return {
        rank,
        division,
        score: s,
        currentRankMin: progress.currentRankMin,
        nextRankMin: progress.nextRankMin,
        pointsIntoRank: progress.pointsIntoRank,
        pointsNeededForNextRank: progress.pointsNeededForNextRank,
        progressToNextRank: progress.progressToNextRank,
        avatarBorderClass: rank.borderClass,
        animationClass: rank.animationClass,
    };
}

/* ──────────────────────────── Score migration ──────────────────────────── */

/** newScore = oldScore × multiplier. Never resets, never deletes the old value. */
export function migrateOldScore(oldScore: number, multiplier: number = MIGRATION_MULTIPLIER): number {
    return normalizeScore(oldScore) * multiplier;
}

export interface MigratedUser extends LeaderboardUser {
    oldScore: number;
    migratedScore: number;
    isScoreMigrated: true;
}

/**
 * Migrate a list of users by the same multiplier. Preserves the original score as
 * `oldScore`, writes the scaled value into both `migratedScore` and the live
 * `score` field, and flags the user as migrated. Pure — returns new objects.
 */
export function migrateUsers(
    users: readonly LeaderboardUser[],
    multiplier: number = MIGRATION_MULTIPLIER,
): MigratedUser[] {
    return users.map((user) => {
        const old = normalizeScore(user.oldScore ?? user.score);
        const migrated = migrateOldScore(old, multiplier);
        return {
            ...user,
            oldScore: old,
            migratedScore: migrated,
            score: migrated,
            isScoreMigrated: true,
        };
    });
}

/* ──────────────────────────── Leaderboard sort ─────────────────────────── */

/** ms since epoch for the tie-break comparison (missing → oldest). */
function activityMs(value: LeaderboardUser["lastActivityAt"]): number {
    if (value === undefined) return 0;
    if (typeof value === "number") return value;
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Sort highest score first. Ties → most recent activity. Still tied → fastest
 * quiz time. Returns a new array; does not mutate the input.
 */
export function sortLeaderboardUsers<T extends LeaderboardUser>(users: readonly T[]): T[] {
    return [...users].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        const actDiff = activityMs(b.lastActivityAt) - activityMs(a.lastActivityAt);
        if (actDiff !== 0) return actDiff;
        const aTime = a.fastestQuizTime ?? Number.POSITIVE_INFINITY;
        const bTime = b.fastestQuizTime ?? Number.POSITIVE_INFINITY;
        return aTime - bTime;
    });
}

/* ─────────────────────────────── Formatting ────────────────────────────── */

/** Format a point total with thousands separators, e.g. 5000 → "5,000". */
export function formatPoints(points: number): string {
    return normalizeScore(points).toLocaleString("en-US");
}
