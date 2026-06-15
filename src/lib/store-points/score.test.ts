import { describe, it, expect } from "vitest";
import {
  calculateStorePoints,
  storePointsFromAccuracy,
  STORE_POINTS_MAX_PER_PLAY,
} from "./score";
import { resolveUnits, DEFAULT_UNITS } from "./units";

// Spec §3.3 — exact result table. Tuples: [eligibleUnits, accuracy, expectedPoints].
const RESULT_TABLE: [number, number, number][] = [
  [5, 0.4, 15], [5, 0.6, 20], [5, 0.8, 30], [5, 1.0, 35],
  [6, 0.4, 17], [6, 0.6, 23], [6, 0.8, 34], [6, 1.0, 40],
  [8, 0.4, 21], [8, 0.6, 29], [8, 0.8, 42], [8, 1.0, 50],
  [9, 0.4, 23], [9, 0.6, 32], [9, 0.8, 46], [9, 1.0, 55],
  [10, 0.4, 25], [10, 0.6, 35], [10, 0.8, 50], [10, 1.0, 60],
  // "10 or more" — units cap at 10
  [20, 0.4, 25], [20, 0.6, 35], [20, 0.8, 50], [20, 1.0, 60],
];

describe("storePointsFromAccuracy — spec §3.3 result table", () => {
  for (const [units, acc, expected] of RESULT_TABLE) {
    it(`${units} units @ ${Math.round(acc * 100)}% → ${expected}`, () => {
      expect(storePointsFromAccuracy(units, acc).points).toBe(expected);
    });
  }
});

describe("calculateStorePoints — spec §4 worked examples", () => {
  it("5-question Daily Challenge, 4/5 correct → 30", () => {
    expect(calculateStorePoints({ valid: true, totalUnits: 5, correctUnits: 4 }).points).toBe(30);
  });
  it("10-question Quick Quiz, 8/10 → 50", () => {
    expect(calculateStorePoints({ valid: true, totalUnits: 10, correctUnits: 8 }).points).toBe(50);
  });
  it("20-question Mixed Practice, 16/20 → 50 (units capped at 10)", () => {
    expect(calculateStorePoints({ valid: true, totalUnits: 20, correctUnits: 16 }).points).toBe(50);
  });
  it("unsuccessful 3/10 (30%) → 0", () => {
    expect(calculateStorePoints({ valid: true, totalUnits: 10, correctUnits: 3 }).points).toBe(0);
  });
});

describe("calculateStorePoints — guards", () => {
  it("invalid/incomplete play → 0", () => {
    expect(calculateStorePoints({ valid: false, totalUnits: 10, correctUnits: 10 }).points).toBe(0);
  });
  it("zero units → 0", () => {
    expect(calculateStorePoints({ valid: true, totalUnits: 0, correctUnits: 0 }).points).toBe(0);
  });
  it("never exceeds the per-play cap", () => {
    expect(
      calculateStorePoints({ valid: true, totalUnits: 100, correctUnits: 100 }).points,
    ).toBeLessThanOrEqual(STORE_POINTS_MAX_PER_PLAY);
  });
  it("exactly 40% accuracy is eligible (boundary)", () => {
    expect(calculateStorePoints({ valid: true, totalUnits: 10, correctUnits: 4 }).points).toBe(25);
  });
  it("clamps correctUnits above totalUnits", () => {
    expect(calculateStorePoints({ valid: true, totalUnits: 5, correctUnits: 99 }).points).toBe(35);
  });
});

describe("resolveUnits — spec §5 defaults", () => {
  it("prefers the server-validated unit count", () => {
    expect(resolveUnits("daily", 7)).toBe(7);
  });
  it("falls back to the mode default", () => {
    expect(resolveUnits("daily")).toBe(DEFAULT_UNITS.daily);
    expect(resolveUnits("sign-match")).toBe(6);
  });
  it("unknown mode with no count → 0", () => {
    expect(resolveUnits("nonexistent-mode")).toBe(0);
  });
});
