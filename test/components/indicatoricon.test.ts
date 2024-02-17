import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@components/indicatoricon";
import { IndicatorIcon } from "@components/indicatoricon";

import EventBus from "@shared/eventbus";
import { ReadyBusyEvent, TimeSignalStateChangeEvent } from "@shared/events";
import "@shared/styles.css";

import { delay } from "@test/utils";

const kDelayMs = 500 as const;

describe("Indicator icon", () => {
  let indicatorIcon: IndicatorIcon;

  beforeEach(() => {
    indicatorIcon = document.createElement("indicator-icon");
    document.body.appendChild(indicatorIcon);
  });

  afterEach(() => {
    indicatorIcon.remove();
  });

  it("renders muted with loading spinner", () => {
    const spin = indicatorIcon.querySelector("span.loading");
    expect(indicatorIcon.iconState).toBe("mute");
    expect(spin).not.toBeNull();
  });

  describe("handles ReadyBusyEvent", () => {
    it("shows mute icon upon ready", async () => {
      EventBus.publish(ReadyBusyEvent, true);
      await delay();

      const spin = indicatorIcon.querySelector("span.loading");
      expect(spin).toBeNull();

      const svgParts = indicatorIcon.querySelectorAll("svg path");
      expect(svgParts.length).toBe(6);
    });

    it("shows loading spinner upon busy", async () => {
      EventBus.publish(ReadyBusyEvent, false);
      await delay();

      const spin = indicatorIcon.querySelector("span.loading");
      expect(spin).not.toBeNull();
    });
  });

  describe("handles TimeSignalStateChangeEvent", () => {
    it("starts pulsing upon startup", async () => {
      EventBus.publish(TimeSignalStateChangeEvent, "startup");
      await delay();

      const outerSpan = indicatorIcon.querySelector("span.animate-pulse");
      expect(outerSpan).not.toBeNull();
    });

    it("cycles through states and generates icon upon fadein", async () => {
      EventBus.publish(ReadyBusyEvent, true);
      EventBus.publish(TimeSignalStateChangeEvent, "fadein");
      await delay();

      expect(indicatorIcon.querySelectorAll("svg path").length).toBe(1);
      expect(indicatorIcon.iconState).toBe("off");
      await delay(kDelayMs);

      expect(indicatorIcon.querySelectorAll("svg path").length).toBe(2);
      expect(indicatorIcon.iconState).toBe("low");
      await delay(kDelayMs);

      expect(indicatorIcon.querySelectorAll("svg path").length).toBe(3);
      expect(indicatorIcon.iconState).toBe("medium");
      await delay(kDelayMs);

      expect(indicatorIcon.querySelectorAll("svg path").length).toBe(4);
      expect(indicatorIcon.iconState).toBe("high");
      await delay(kDelayMs);

      expect(indicatorIcon.querySelectorAll("svg path").length).toBe(1);
      expect(indicatorIcon.iconState).toBe("off");
    });

    it("returns to mute upon idle", async () => {
      EventBus.publish(ReadyBusyEvent, true);
      EventBus.publish(TimeSignalStateChangeEvent, "startup");
      EventBus.publish(TimeSignalStateChangeEvent, "fadein");
      await delay();

      expect(indicatorIcon.querySelectorAll("svg path").length).toBe(1);
      expect(indicatorIcon.iconState).toBe("off");

      EventBus.publish(TimeSignalStateChangeEvent, "idle");
      await delay();

      expect(indicatorIcon.querySelectorAll("svg path").length).toBe(6);
      expect(indicatorIcon.iconState).toBe("mute");
    });
  });
});
