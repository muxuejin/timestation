import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@components/transmitclock";
import { TransmitClock } from "@components/transmitclock";
import EventBus from "@shared/eventbus";
import { ReadyBusyEvent, ServerOffsetEvent } from "@shared/events";

import { defaultLocale } from "@shared/locales";
import { FakeAppSettings, delay } from "@test/utils";

describe("Transmit clock", () => {
  let transmitClock: TransmitClock;

  beforeEach(async () => {
    transmitClock = document.createElement("transmit-clock");
    document.body.appendChild(transmitClock);
    await delay();
  });

  afterEach(() => {
    transmitClock.remove();
    FakeAppSettings.get.mockClear();
  });

  function countSkeletons() {
    return transmitClock.querySelectorAll("div.skeleton").length;
  }

  it("renders with defaults", () => {
    expect(transmitClock.serverOffset).toBe(0);
    expect(countSkeletons()).toBe(6);
  });

  describe("handles ReadyBusyEvent", () => {
    it("gets settings upon true", () => {
      EventBus.publish(ReadyBusyEvent, true);
      expect(transmitClock.station).toBe("JJY");
      expect(transmitClock.locale).toBe(defaultLocale);
      expect(transmitClock.offset).toBe(-1234);
    });

    it("does not get settings upon false", () => {
      EventBus.publish(ReadyBusyEvent, false);
      expect(FakeAppSettings.get).not.toHaveBeenCalled();
    });

    it("shows skeletons upon transition to false", async () => {
      EventBus.publish(ReadyBusyEvent, true);
      await delay();
      expect(countSkeletons()).toBe(0);
      EventBus.publish(ReadyBusyEvent, false);
      await delay();
      expect(countSkeletons()).toBe(6);
    });
  });

  describe("handles ServerOffsetEvent", () => {
    it("saves server offset", () => {
      EventBus.publish(ServerOffsetEvent, 122333);
      expect(transmitClock.serverOffset).toBe(122333);
    });
  });

  describe("reacts to property changes", () => {
    it("reflects station", async () => {
      transmitClock.station = "BPC";
      await delay();
      expect(transmitClock.getAttribute("station")).toBe("BPC");
    });

    it("reflects locale", async () => {
      transmitClock.locale = defaultLocale;
      await delay();
      expect(transmitClock.getAttribute("locale")).toBe(defaultLocale);
    });

    it("reflects offset", async () => {
      transmitClock.offset = 322111;
      await delay();
      expect(transmitClock.getAttribute("offset")).toBe("322111");
    });

    it("reflects serverOffset", async () => {
      transmitClock.serverOffset = -1537;
      await delay();
      expect(transmitClock.getAttribute("serveroffset")).toBe("-1537");
    });
  });

  describe("reacts to attribute changes", () => {
    it("reflects station", async () => {
      transmitClock.setAttribute("station", "MSF");
      await delay();
      expect(transmitClock.station).toBe("MSF");
    });

    it("reflects locale", async () => {
      transmitClock.setAttribute("locale", "en-US");
      await delay();
      expect(transmitClock.locale).toBe("en-US");
    });

    it("reflects offset", async () => {
      transmitClock.setAttribute("offset", "92346");
      await delay();
      expect(transmitClock.offset).toBe(92346);
    });

    it("reflects serveroffset", async () => {
      transmitClock.setAttribute("serveroffset", "7351");
      await delay();
      expect(transmitClock.serverOffset).toBe(7351);
    });
  });

  it("updates itself every second", async () => {
    function getDisplayTime() {
      return [...transmitClock.querySelectorAll("span.countdown > span")]
        .map((span) =>
          window.getComputedStyle(span).getPropertyValue("--value"),
        )
        .join(":");
    }

    EventBus.publish(ReadyBusyEvent, true);
    await delay();
    const displayTime = getDisplayTime();
    await delay(1000);
    const displayTime2 = getDisplayTime();
    expect(displayTime).not.toBe(displayTime2);
    await delay(1000);
    const displayTime3 = getDisplayTime();
    expect(displayTime).not.toBe(displayTime3);
    expect(displayTime2).not.toBe(displayTime3);
  });
});
