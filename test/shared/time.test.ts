import { describe, expect, it } from "vitest";

import monotonicTime, {
  isEuropeanSummerTime,
  formatTimeZoneOffset,
  decomposeOffset,
} from "@shared/time";

import { delay } from "@test/utils";

const kMinus = "\u{2212}" as const;

describe("monotonicTime", () => {
  it("returns a monotonically increasing time", async () => {
    const earlier = monotonicTime();
    await delay(500);
    const now = monotonicTime();
    expect(now).toBeGreaterThan(earlier);
  });
});

describe("isEuropeanSummerTime", () => {
  function utime(formattedTime: string) {
    return new Date(formattedTime).getTime();
  }

  it("detects summer time", () => {
    expect(isEuropeanSummerTime(utime("1970-03-29T01:00:00.000Z"))).toBe(true);
    expect(isEuropeanSummerTime(utime("1970-10-25T00:59:59.999Z"))).toBe(true);
    expect(isEuropeanSummerTime(utime("2038-03-28T01:00:00.000Z"))).toBe(true);
    expect(isEuropeanSummerTime(utime("2038-10-31T00:59:59.999Z"))).toBe(true);
  });

  it("detects non-summer time", () => {
    expect(isEuropeanSummerTime(utime("1970-03-29T00:59:59.999Z"))).toBe(false);
    expect(isEuropeanSummerTime(utime("1970-10-25T01:00:00.000Z"))).toBe(false);
    expect(isEuropeanSummerTime(utime("2038-03-28T00:59:59.999Z"))).toBe(false);
    expect(isEuropeanSummerTime(utime("2038-10-31T01:00:00.000Z"))).toBe(false);
  });
});

describe("formatTimeZoneOffset", () => {
  it("formats negative offset", () => {
    expect(formatTimeZoneOffset(-81708919)).toBe(`${kMinus}22:41:48.919`);
  });

  it("formats zero offset", () => {
    expect(formatTimeZoneOffset(0)).toBe("+00:00");
  });

  it("formats positive offset", () => {
    expect(formatTimeZoneOffset(55812432)).toBe("+15:30:12.432");
  });
});

describe("decomposeOffset", () => {
  it("decomposes negative offset", () => {
    expect(decomposeOffset(-81708919)).toEqual({
      negative: true,
      hh: 22,
      mm: 41,
      ss: 48,
      ms: 919,
    });
  });

  it("decomposes zero offset", () => {
    expect(decomposeOffset(0)).toEqual({
      negative: false,
      hh: 0,
      mm: 0,
      ss: 0,
      ms: 0,
    });
  });

  it("decomposes positive offset", () => {
    expect(decomposeOffset(55812432)).toEqual({
      negative: false,
      hh: 15,
      mm: 30,
      ss: 12,
      ms: 432,
    });
  });
});
