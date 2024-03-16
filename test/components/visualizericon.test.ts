import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@components/visualizericon";
import { VisualizerIcon } from "@components/visualizericon";

import EventBus from "@shared/eventbus";
import {
  ReadyBusyEvent,
  TimeSignalReadyEvent,
  TimeSignalStateChangeEvent,
  VisualizerIconEvent,
} from "@shared/events";
import "@shared/styles.css";

import { delay } from "@test/utils";

const kDelayMs = 500 as const;

describe("Visualizer icon", () => {
  let visualizerIcon: VisualizerIcon;

  beforeEach(() => {
    visualizerIcon = document.createElement("visualizer-icon");
    document.body.appendChild(visualizerIcon);
  });

  afterEach(() => {
    visualizerIcon.remove();
  });

  it("renders muted with loading spinner", () => {
    const spin = visualizerIcon.querySelector("span.loading");
    expect(visualizerIcon.iconState).toBe("mute");
    expect(spin).not.toBeNull();
  });

  it("renders a canvas", () => {
    const canvas = visualizerIcon.querySelector("canvas");
    expect(canvas).not.toBeNull();
  });

  describe("handles ReadyBusyEvent", () => {
    it("shows mute icon upon ready", async () => {
      EventBus.publish(ReadyBusyEvent, true);
      await delay();

      const spin = visualizerIcon.querySelector("span.loading");
      expect(spin).toBeNull();

      const svgParts = visualizerIcon.querySelectorAll("svg path");
      expect(svgParts.length).toBe(6);
    });

    it("shows loading spinner upon busy", async () => {
      EventBus.publish(ReadyBusyEvent, false);
      await delay();

      const spin = visualizerIcon.querySelector("span.loading");
      expect(spin).not.toBeNull();
    });
  });

  describe("handles TimeSignalStateChangeEvent", () => {
    it("starts pulsing upon startup", async () => {
      EventBus.publish(TimeSignalStateChangeEvent, "startup");
      await delay();

      const outerSpan = visualizerIcon.querySelector("span.animate-pulse");
      expect(outerSpan).not.toBeNull();
    });

    it("cycles through states and generates icon upon fadein", async () => {
      EventBus.publish(ReadyBusyEvent, true);
      EventBus.publish(TimeSignalStateChangeEvent, "fadein");
      await delay();

      expect(visualizerIcon.querySelectorAll("svg path").length).toBe(1);
      expect(visualizerIcon.iconState).toBe("off");
      await delay(kDelayMs);

      expect(visualizerIcon.querySelectorAll("svg path").length).toBe(2);
      expect(visualizerIcon.iconState).toBe("low");
      await delay(kDelayMs);

      expect(visualizerIcon.querySelectorAll("svg path").length).toBe(3);
      expect(visualizerIcon.iconState).toBe("medium");
      await delay(kDelayMs);

      expect(visualizerIcon.querySelectorAll("svg path").length).toBe(4);
      expect(visualizerIcon.iconState).toBe("high");
      await delay(kDelayMs);

      expect(visualizerIcon.querySelectorAll("svg path").length).toBe(1);
      expect(visualizerIcon.iconState).toBe("off");
    });

    it("returns to mute upon idle", async () => {
      EventBus.publish(ReadyBusyEvent, true);
      EventBus.publish(TimeSignalStateChangeEvent, "startup");
      EventBus.publish(TimeSignalStateChangeEvent, "fadein");
      await delay();

      expect(visualizerIcon.querySelectorAll("svg path").length).toBe(1);
      expect(visualizerIcon.iconState).toBe("off");

      EventBus.publish(TimeSignalStateChangeEvent, "idle");
      await delay();

      expect(visualizerIcon.querySelectorAll("svg path").length).toBe(6);
      expect(visualizerIcon.iconState).toBe("mute");
    });
  });

  describe("handles TimeSignalReadyEvent", () => {
    const subscriber = {};
    const spy = vi.fn();

    beforeEach(() => {
      EventBus.subscribe(subscriber, VisualizerIconEvent, spy);
    });

    afterEach(() => {
      EventBus.unsubscribe(subscriber, VisualizerIconEvent);
      spy.mockClear();
    });

    it("publishes VisualizerIconEvent", () => {
      const canvas = visualizerIcon.querySelector("canvas");
      EventBus.publish(TimeSignalReadyEvent);
      expect(spy).toHaveBeenCalledWith(canvas);
    });
  });
});
