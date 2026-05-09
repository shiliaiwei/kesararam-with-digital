/**
 * Unit tests for ranking system utility functions
 */

import { describe, it, expect } from "vitest";
import { getPeriodStart } from "./ranking";

describe("Ranking System Utilities", () => {
  describe("getPeriodStart", () => {
    it("should return epoch date for all-time period", () => {
      const result = getPeriodStart("all-time");
      expect(result).toBe("1970-01-01");
    });

    it("should return first day of current month for monthly period", () => {
      const testDate = new Date("2024-03-15T10:30:00Z");
      const result = getPeriodStart("monthly", testDate);
      expect(result).toBe("2024-03-01");
    });

    it("should return Sunday of current week for weekly period", () => {
      // March 15, 2024 is a Friday
      const testDate = new Date("2024-03-15T10:30:00Z");
      const result = getPeriodStart("weekly", testDate);
      // Week should start on Sunday, March 10, 2024
      expect(result).toBe("2024-03-10");
    });

    it("should handle Sunday as week start correctly", () => {
      // March 10, 2024 is a Sunday
      const testDate = new Date("2024-03-10T10:30:00Z");
      const result = getPeriodStart("weekly", testDate);
      expect(result).toBe("2024-03-10");
    });

    it("should handle Saturday correctly", () => {
      // March 16, 2024 is a Saturday
      const testDate = new Date("2024-03-16T10:30:00Z");
      const result = getPeriodStart("weekly", testDate);
      // Week should start on Sunday, March 10, 2024
      expect(result).toBe("2024-03-10");
    });

    it("should handle year boundary for monthly period", () => {
      const testDate = new Date("2024-01-15T10:30:00Z");
      const result = getPeriodStart("monthly", testDate);
      expect(result).toBe("2024-01-01");
    });

    it("should handle year boundary for weekly period", () => {
      // January 1, 2024 is a Monday
      const testDate = new Date("2024-01-01T10:30:00Z");
      const result = getPeriodStart("weekly", testDate);
      // Week should start on Sunday, December 31, 2023
      expect(result).toBe("2023-12-31");
    });
  });
});
