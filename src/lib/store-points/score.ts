/**
 * Store Points formula — spec docs/store-points-economy.md (§3.2).
 *
 * Pure. NO speed, NO streak, NO subscription, NO rank. Depends only on valid
 * completion, accuracy, and the number of learning units. One play ≤ 60.
 */

export interface StorePointsResult {
  points: number;
  accuracy: number; // 0..1
  performance: number;
  completionBonus: number;
  qualityBonus: number;
}

export const STORE_POINTS_MAX_PER_PLAY = 60;
export const STORE_POINTS_MIN_ACCURACY = 0.4; // below this → 0 spendable points
export const STORE_POINTS_UNIT_CAP = 10; // a longer activity cannot pay unboundedly
export const STORE_POINTS_COMPLETION_BONUS = 5;
export const STORE_POINTS_QUALITY_ACCURACY = 0.8; // accuracy at/above this → quality bonus
export const STORE_POINTS_QUALITY_BONUS = 5;

const zero = (accuracy = 0): StorePointsResult => ({
  points: 0,
  accuracy,
  performance: 0,
  completionBonus: 0,
  qualityBonus: 0,
});

/**
 * Core math from an already-computed accuracy and eligible unit count.
 * `units` is capped to STORE_POINTS_UNIT_CAP here.
 */
export function storePointsFromAccuracy(units: number, accuracy: number): StorePointsResult {
  if (units <= 0 || accuracy < STORE_POINTS_MIN_ACCURACY) return zero(Math.max(0, accuracy));

  const u = Math.min(units, STORE_POINTS_UNIT_CAP);
  const performance = Math.round((50 * accuracy * u) / 10);
  const completionBonus = STORE_POINTS_COMPLETION_BONUS;
  const qualityBonus = accuracy >= STORE_POINTS_QUALITY_ACCURACY ? STORE_POINTS_QUALITY_BONUS : 0;
  const points = Math.min(STORE_POINTS_MAX_PER_PLAY, performance + completionBonus + qualityBonus);

  return { points, accuracy, performance, completionBonus, qualityBonus };
}

/**
 * Award math from a validated play. `correctUnits` is clamped into
 * [0, totalUnits]; accuracy is correctUnits / totalUnits over the FULL set, while
 * the unit cap applies only to the performance term.
 */
export function calculateStorePoints(p: {
  valid: boolean;
  totalUnits: number;
  correctUnits: number;
}): StorePointsResult {
  if (!p.valid || p.totalUnits <= 0) return zero();
  const correct = Math.max(0, Math.min(p.correctUnits, p.totalUnits));
  const accuracy = correct / p.totalUnits;
  return storePointsFromAccuracy(p.totalUnits, accuracy);
}
