/**
 * Store Points formula — spec docs/store-points-economy.md (§3.2).
 *
 * Pure. NO speed, NO streak, NO subscription, NO rank. Depends only on valid
 * completion, accuracy, and the number of CORRECT learning units.
 *
 * v3 (2026-06-18): one correct answer is worth exactly ONE Store Point — the
 * simplest, most auditable, hardest-to-inflate rule. No more ×60/30 multiplier.
 * A play earns `correctUnits` points (capped at 30/play), gated by a 40%
 * accuracy floor. Speed and streak never change the result.
 */

export interface StorePointsResult {
  points: number;
  accuracy: number; // 0..1
  performance: number;
  completionBonus: number;
  qualityBonus: number;
}

/** Hard ceiling on a single play: at most 30 correct answers count. */
export const STORE_POINTS_MAX_PER_PLAY = 30;
export const STORE_POINTS_MIN_ACCURACY = 0.4; // below this → 0 spendable points
export const STORE_POINTS_UNIT_CAP = 30; // correct answers beyond 30 in one play do not pay
export const STORE_POINTS_PER_CORRECT = 1; // one correct answer = one Store Point
export const STORE_POINTS_COMPLETION_BONUS = 0;
export const STORE_POINTS_QUALITY_ACCURACY = 1; // retained for ledger compatibility
export const STORE_POINTS_QUALITY_BONUS = 0;

const zero = (accuracy = 0): StorePointsResult => ({
  points: 0,
  accuracy,
  performance: 0,
  completionBonus: 0,
  qualityBonus: 0,
});

/**
 * Core math from an already-computed accuracy and total eligible unit count.
 * Correct answers ≈ round(units × accuracy); one correct answer = one point,
 * capped at STORE_POINTS_MAX_PER_PLAY. Kept for the spec §3.3 result table.
 */
export function storePointsFromAccuracy(units: number, accuracy: number): StorePointsResult {
  if (units <= 0 || accuracy < STORE_POINTS_MIN_ACCURACY) return zero(Math.max(0, accuracy));

  const correct = Math.round(units * accuracy);
  const performance = Math.min(STORE_POINTS_MAX_PER_PLAY, correct * STORE_POINTS_PER_CORRECT);
  const completionBonus = STORE_POINTS_COMPLETION_BONUS;
  const qualityBonus = accuracy >= STORE_POINTS_QUALITY_ACCURACY ? STORE_POINTS_QUALITY_BONUS : 0;
  const points = Math.min(STORE_POINTS_MAX_PER_PLAY, performance + completionBonus + qualityBonus);

  return { points, accuracy, performance, completionBonus, qualityBonus };
}

/**
 * Award math from a validated play. `correctUnits` is clamped into
 * [0, totalUnits]; accuracy is correctUnits / totalUnits over the FULL set.
 * Points = correct answers (1 each), capped at STORE_POINTS_MAX_PER_PLAY, and
 * zeroed when accuracy is below the 40% floor.
 */
export function calculateStorePoints(p: {
  valid: boolean;
  totalUnits: number;
  correctUnits: number;
}): StorePointsResult {
  if (!p.valid || p.totalUnits <= 0) return zero();
  const correct = Math.max(0, Math.min(p.correctUnits, p.totalUnits));
  const accuracy = correct / p.totalUnits;
  if (accuracy < STORE_POINTS_MIN_ACCURACY) return zero(accuracy);

  const performance = Math.min(STORE_POINTS_MAX_PER_PLAY, correct * STORE_POINTS_PER_CORRECT);
  const completionBonus = STORE_POINTS_COMPLETION_BONUS;
  const qualityBonus = accuracy >= STORE_POINTS_QUALITY_ACCURACY ? STORE_POINTS_QUALITY_BONUS : 0;
  const points = Math.min(STORE_POINTS_MAX_PER_PLAY, performance + completionBonus + qualityBonus);

  return { points, accuracy, performance, completionBonus, qualityBonus };
}
