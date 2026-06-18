/**
 * Road-frame rank helpers — thin, spec-named wrappers around the locked 6-tier
 * logic in `src/lib/ranks.ts` (single source of truth). Used by the skeuomorphic
 * RoadAvatarBorder. Division segments match the locked table
 * (.claude/skills/kwd-brand-design/references/rank-tiers.md): e.g. Rookie IV 0–249,
 * III 250–499, II 500–749, I 750–999; Rising IV starts at 1,000.
 */

import {
    getRankByScore,
    getDivisionByScore,
    getNextRank,
    DIVISIONS,
    type RankName,
    type Division,
} from "@/lib/ranks";

export type { RankName, Division };

/** Rank name for a score, e.g. 120 → "Rookie", 1200 → "Rising". */
export function getRankNameByScore(score: number): RankName {
    return getRankByScore(score).name;
}

/** Roman-numeral division for a score within its rank. */
export function getDivisionForScore(score: number): Division {
    const rank = getRankByScore(score);
    return getDivisionByScore(score, rank);
}

/** Inclusive lower / exclusive upper point bounds of the current division segment. */
export function getDivisionBounds(score: number): {
    rank: RankName;
    division: Division;
    lower: number;
    upper: number; // Infinity for an open-ended top division
} {
    const s = Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
    const rank = getRankByScore(s);
    const division = getDivisionByScore(s, rank);
    const idx = DIVISIONS.indexOf(division);

    // Open-ended / custom-threshold rank (e.g. Mythic).
    if (rank.divisionThresholds) {
        const t = rank.divisionThresholds;
        const lower = t[idx];
        const upper = idx < t.length - 1 ? t[idx + 1] : Number.POSITIVE_INFINITY;
        return { rank: rank.name, division, lower, upper };
    }

    // Even-quarter rank.
    const next = getNextRank(rank.name);
    const rangeTop = next ? next.minPoints : rank.minPoints; // guarded below
    const quarter = next ? (rangeTop - rank.minPoints) / DIVISIONS.length : 0;
    const lower = rank.minPoints + idx * quarter;
    const upper = quarter > 0 ? lower + quarter : Number.POSITIVE_INFINITY;
    return { rank: rank.name, division, lower, upper };
}

/** Progress (0–100) WITHIN the current division segment. */
export function getDivisionProgress(score: number): number {
    const s = Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
    const { lower, upper } = getDivisionBounds(s);
    if (!Number.isFinite(upper) || upper <= lower) return 100;
    const pct = ((s - lower) / (upper - lower)) * 100;
    return Math.min(100, Math.max(0, pct));
}

/** The next milestone: next division in this rank, or the next rank's division IV. */
export function getNextDivision(score: number): {
    rank: RankName;
    division: Division;
    pointsNeeded: number;
} {
    const s = Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0;
    const { rank, division, upper } = getDivisionBounds(s);
    const idx = DIVISIONS.indexOf(division);

    // Not yet at division I → next division in the same rank.
    if (idx < DIVISIONS.length - 1) {
        return {
            rank,
            division: DIVISIONS[idx + 1],
            pointsNeeded: Math.max(0, Math.ceil(upper) - s),
        };
    }

    // At division I → rank up to the next rank's division IV (or stay if top rank).
    const next = getNextRank(rank);
    if (!next) {
        return { rank, division: "I", pointsNeeded: 0 };
    }
    return { rank: next.name, division: "IV", pointsNeeded: Math.max(0, next.minPoints - s) };
}
