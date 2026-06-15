import { describe, it, expect } from "vitest";
import { resolveDelta, STORE_POINTS_WEEKLY_CAP } from "./award";

describe("resolveDelta — daily best-difference + weekly cap (spec §6)", () => {
  it("first play of the day credits the full gross", () => {
    expect(resolveDelta({ grossPoints: 30, todayBestForGame: 0, weeklyEarned: 0 })).toBe(30);
  });

  it("a replay credits only the positive daily improvement (30 then 45 → +15)", () => {
    expect(resolveDelta({ grossPoints: 45, todayBestForGame: 30, weeklyEarned: 30 })).toBe(15);
  });

  it("a non-improving replay credits 0", () => {
    expect(resolveDelta({ grossPoints: 20, todayBestForGame: 45, weeklyEarned: 45 })).toBe(0);
  });

  it("a replay after a 60-point result credits 0 that day", () => {
    expect(resolveDelta({ grossPoints: 40, todayBestForGame: 60, weeklyEarned: 60 })).toBe(0);
  });

  it("clamps the weekly cap (improvement 50 but only 20 left → 20)", () => {
    expect(resolveDelta({ grossPoints: 50, todayBestForGame: 0, weeklyEarned: 280 })).toBe(20);
  });

  it("credits 0 once the weekly cap is reached", () => {
    expect(
      resolveDelta({ grossPoints: 60, todayBestForGame: 0, weeklyEarned: STORE_POINTS_WEEKLY_CAP }),
    ).toBe(0);
  });

  it("never returns a negative delta", () => {
    expect(resolveDelta({ grossPoints: 10, todayBestForGame: 60, weeklyEarned: 500 })).toBe(0);
  });
});
