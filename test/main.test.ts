import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FakeAppSettings, delay } from "@test/utils";

import EventBus from "@/shared/eventbus";

import "@/main";
import { TimeSignal } from "@/main";

import {
  EditDistanceReadyEvent,
  ReadyBusyEvent,
  ServerTimeReadyEvent,
  SettingsReadyEvent,
  TimeSignalReadyEvent,
} from "@/shared/events";
import "@shared/styles.css";

describe("Main", () => {
  let timeSignal: TimeSignal;

  beforeEach(async () => {
    timeSignal = document.createElement("time-signal");
    document.body.appendChild(timeSignal);
    await delay();
  });

  afterEach(() => {
    timeSignal.remove();
  });

  it("renders components", () => {
    expect(timeSignal.querySelector("animated-background")).not.toBeNull();
    expect(timeSignal.querySelector("nav-bar")).not.toBeNull();
    expect(timeSignal.querySelector("transmit-clock")).not.toBeNull();
    expect(timeSignal.querySelector("indicator-icon")).not.toBeNull();
    expect(timeSignal.querySelector("start-stop-button")).not.toBeNull();
  });

  it("gets settings when attached", async () => {
    FakeAppSettings.get.mockClear();
    timeSignal.remove();
    document.body.appendChild(timeSignal);
    await delay();
    expect(FakeAppSettings.get).toHaveBeenCalledWith("sync");
    expect(FakeAppSettings.get).toHaveBeenCalledOnce();
  });

  describe("handles SettingsReadyEvent", () => {
    const subscriber = {};
    const spy = vi.fn();

    beforeEach(() => {
      EventBus.subscribe(subscriber, ReadyBusyEvent, spy);
    });

    afterEach(() => {
      EventBus.unsubscribe(subscriber, ReadyBusyEvent);
      spy.mockClear();
    });

    it.each([[true], [false]])("publishes ReadyBusyEvent on %s", (value) => {
      EventBus.publish(EditDistanceReadyEvent);
      EventBus.publish(ServerTimeReadyEvent);
      EventBus.publish(TimeSignalReadyEvent);
      EventBus.publish(SettingsReadyEvent, value);
      expect(spy).toHaveBeenCalledWith(value);
    });
  });
});
