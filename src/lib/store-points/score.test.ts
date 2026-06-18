import { describe, it, expect } from "vitest";
import {
  calculateStorePoints,
  storePointsFromAccuracy,
  STORE_POINTS_MAX_PER_PLAY,
} from "./score";
import { resolveUnits, DEFAULT_UNITS } from "./units";

// Spec §3.3 — exact result table (v3: 1 pt per correct answer = round(units×acc),
// capped at 30/play). Tuples: [eligibleUnits, accuracy, expectedPoints].
const RESULT_TABLE: [number, number, number][] = [
  [5, 0.4, 2], [5, 0.6, 3], [5, 0.8, 4], [5, 1.0, 5],
  [6, 0.4, 2], [6, 0.6, 4], [6, 0.8, 5], [6, 1.0, 6],
  [8, 0.4, 3], [8, 0.6, 5], [8, 0.8, 6], [8, 1.0, 8],
  [9, 0.4, 4], [9, 0.6, 5], [9, 0.8, 7], [9, 1.0, 9],
  [10, 0.4, 4], [10, 0.6, 6], [10, 0.8, 8], [10, 1.0, 10],
  [15, 0.4, 6], [15, 0.6, 9], [15, 0.8, 12], [15, 1.0, 15],
  [20, 0.4, 8], [20, 0.6, 12], [20, 0.8, 16], [20, 1.0, 20],
  [30, 0.4, 12], [30, 0.6, 18], [30, 0.8, 24], [30, 1.0, 30],
  // "30 or more" — points cap at 30/play
  [100, 0.4, 30], [100, 0.6, 30], [100, 0.8, 30], [100, 1.0, 30],
];

describe("storePointsFromAccuracy — spec §3.3 result table", () => {
  for (const [units, acc, expected] of RESULT_TABLE) {
    it(`${units} units @ ${Math.round(acc * 100)}% → ${expected}`, () => {
      expect(storePointsFromAccuracy(units, acc).points).toBe(expected);
    });
  }
});

describe("calculateStorePoints — spec §4 worked examples (1 pt per correct)", () => {
  it("5-question Daily Challenge, 4/5 correct → 4", () => {
    expect(calculateStorePoints({ valid: true, totalUnits: 5, correctUnits: 4 }).points).toBe(4);
  });
  it("10-question Quick Quiz, 8/10 → 8", () => {
    expect(calculateStorePoints({ valid: true, totalUnits: 10, correctUnits: 8 }).points).toBe(8);
  });
  it("20-question Mixed Practice, 16/20 → 16", () => {
    expect(calculateStorePoints({ valid: true, totalUnits: 20, correctUnits: 16 }).points).toBe(16);
  });
  it("30-question Speed Round, 30/30 → 30", () => {
    expect(calculateStorePoints({ valid: true, totalUnits: 30, correctUnits: 30 }).points).toBe(30);
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
    expect(calculateStorePoints({ valid: true, totalUnits: 10, correctUnits: 4 }).points).toBe(4);
  });
  it("just below 40% accuracy → 0", () => {
    expect(calculateStorePoints({ valid: true, totalUnits: 100, correctUnits: 39 }).points).toBe(0);
  });
  it("clamps correctUnits above totalUnits", () => {
    expect(calculateStorePoints({ valid: true, totalUnits: 5, correctUnits: 99 }).points).toBe(5);
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
