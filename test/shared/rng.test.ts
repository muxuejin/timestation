import { describe, expect, it } from "vitest";

import Rng from "@shared/rng";

const kIterations = 10000 as const;

describe("Rng", () => {
  describe("next()", () => {
    it.each([
      ["default range of [0, 1)", [], 0, 1],
      ["given range", [-5, 10], -5, 10],
    ])("generates floats in %s", (_, args, low, high) => {
      const rng = new Rng(...args);
      for (let i = 0; i < kIterations; i++) {
        const value = rng.next();
        expect(Number.isInteger(value)).toBe(false);
        expect(value).toBeGreaterThanOrEqual(low);
        expect(value).toBeLessThan(high);
      }
    });

    it("generates normally distributed floats", () => {
      const rng = new Rng(0, 10, 5, 1);
      const values = Array.from({ length: kIterations }, () => rng.next());
      const mean = values.reduce((sum, val) => sum + val, 0) / kIterations;
      const stdDev = Math.sqrt(
        values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / kIterations,
      );
      expect(mean).toBeCloseTo(5, 1);
      expect(stdDev).toBeCloseTo(1, 1);
    });

    it("normally distributed floats are in given range", () => {
      const rng = new Rng(0, 100, 80, 30);
      for (let i = 0; i < kIterations; i++) {
        const value = rng.next();
        expect(Number.isInteger(value)).toBe(false);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(100);
      }
    });
  });
});
