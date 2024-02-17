import { describe, expect, it, vi } from "vitest";

import EventBus from "@shared/eventbus";
import { EditDistanceReadyEvent } from "@shared/events";
import LocaleEditDistance from "@shared/localeeditdistance";
import { defaultLocale, supportedLocales } from "@shared/locales";

import { delay } from "@test/utils";

const publishSpy = vi.spyOn(EventBus, "publish");

describe("LocaleEditDistance", () => {
  it("publishes EditSignalReadyEvent", async () => {
    /* May be flaky due to WASM compilation. */
    for (let retries = 10; retries > 0; retries--) {
      /* eslint-disable no-await-in-loop */
      if (publishSpy.mock.calls.length > 0) break;
      await delay(100);
    }
    expect(publishSpy).toHaveBeenCalledWith(EditDistanceReadyEvent);
  });

  it("is a singleton", () => {
    const Class = LocaleEditDistance.constructor as any;
    expect(() => new Class()).toThrow(
      "LocaleEditDistance is a singleton class.",
    );
  });

  describe("runQuery", () => {
    it("returns undefined for empty query", () => {
      expect(LocaleEditDistance.runQuery("")).toBe(undefined);
    });

    it("returns undefined for whitespace", () => {
      expect(LocaleEditDistance.runQuery(" ")).toBe(undefined);
      expect(LocaleEditDistance.runQuery("\t")).toBe(undefined);
      expect(LocaleEditDistance.runQuery("\n\v\r")).toBe(undefined);
    });

    it("returns undefined for ASCII garbage", () => {
      expect(LocaleEditDistance.runQuery("\x01")).toBe(undefined);
      expect(LocaleEditDistance.runQuery("\x7b")).toBe(undefined);
    });

    it("returns a single perfect match", () => {
      expect(LocaleEditDistance.runQuery(defaultLocale)).toEqual([
        defaultLocale,
      ]);
    });

    it("excludes locales based on writing script", () => {
      expect(LocaleEditDistance.runQuery("a")!.length).toBeLessThan(
        supportedLocales.length,
      );
    });
  });
});
