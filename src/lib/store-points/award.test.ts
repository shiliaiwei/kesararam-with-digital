import { describe, it, expect } from "vitest";
import { resolveDelta, STORE_POINTS_WEEKLY_CAP } from "./award";

describe("resolveDelta — daily best-difference + weekly cap (spec §6)", () => {
  it("first play of the day credits the full gross", () => {
    expect(resolveDelta({ grossPoints: 20, todayBestForGame: 0, weeklyEarned: 0 })).toBe(20);
  });

  it("a replay credits only the positive daily improvement (20 then 28 → +8)", () => {
    expect(resolveDelta({ grossPoints: 28, todayBestForGame: 20, weeklyEarned: 20 })).toBe(8);
  });

  it("a non-improving replay credits 0", () => {
    expect(resolveDelta({ grossPoints: 15, todayBestForGame: 28, weeklyEarned: 28 })).toBe(0);
  });

  it("a replay after a max (30-point) result credits 0 that day", () => {
    expect(resolveDelta({ grossPoints: 25, todayBestForGame: 30, weeklyEarned: 30 })).toBe(0);
  });

  it("clamps the weekly cap (improvement 30 but only 20 left → 20)", () => {
    expect(
      resolveDelta({ grossPoints: 30, todayBestForGame: 0, weeklyEarned: STORE_POINTS_WEEKLY_CAP - 20 }),
    ).toBe(20);
  });

  it("credits 0 once the weekly cap is reached", () => {
    expect(
      resolveDelta({ grossPoints: 30, todayBestForGame: 0, weeklyEarned: STORE_POINTS_WEEKLY_CAP }),
    ).toBe(0);
  });

  it("never returns a negative delta", () => {
    expect(resolveDelta({ grossPoints: 10, todayBestForGame: 30, weeklyEarned: 500 })).toBe(0);
  });
});
