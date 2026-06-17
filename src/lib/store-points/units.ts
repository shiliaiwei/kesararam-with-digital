/**
 * Learning-unit normalization per game type — spec docs/store-points-economy.md (§5).
 *
 * A "learning unit" is one independently validated decision (a question, a sign
 * pair, a scenario decision, a worksheet row, a normalized Traffic Commander
 * scene). Complex activities must define units on the SERVER — a scene with many
 * objects is still one unit unless the server explicitly says otherwise.
 *
 * DEFAULT_UNITS is each mode's current default activity size, used only as a
 * fallback. Phase 3 passes the REAL validated unit count from the play; prefer
 * that over the default. The Store Points formula caps reward units at 30 regardless
 * (STORE_POINTS_UNIT_CAP) — 30+ validated units reach the full 60-point per-play cap.
 */

export const DEFAULT_UNITS: Record<string, number> = {
  // Quiz family (solo or live)
  "quick-quiz": 10,
  "speed-round": 20,
  "sign-challenge": 15,
  "mixed-practice": 20,
  "category-quiz": 10,
  // GameKit formats (gameType ids as used in points_ledger)
  daily: 5,
  "priority-puzzle": 5,
  "traffic-commander": 5,
  "sign-match": 6,
  "catch-sign": 8,
  "light-hero": 9,
  "safe-street-smart": 10,
  "safety-adventure": 8,
  "sign-connect": 20,
  "word-bank": 16,
  "tick-sign": 12,
};

/**
 * Resolve the eligible unit count for a play.
 * Prefer the server-validated count; fall back to the mode default; finally 0.
 */
export function resolveUnits(gameType: string, validatedUnits?: number | null): number {
  if (typeof validatedUnits === "number" && validatedUnits > 0) return Math.floor(validatedUnits);
  return DEFAULT_UNITS[gameType] ?? 0;
}
