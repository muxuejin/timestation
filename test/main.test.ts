import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FakeAppSettings, delay } from "@test/utils";

import EventBus from "@shared/eventbus";

import {
  EditDistanceReadyEvent,
  ReadyBusyEvent,
  ServerTimeReadyEvent,
  SettingsReadyEvent,
  TimeSignalReadyEvent,
} from "@shared/events";
import "@shared/styles.css";

import "@/main";
import { TimeStationEmulator } from "@/main";

describe("Main", () => {
  let main: TimeStationEmulator;

  beforeEach(async () => {
    main = document.createElement("time-station-emulator");
    document.body.appendChild(main);
    await delay();
  });

  afterEach(() => {
    main.remove();
  });

  it("renders components", () => {
    expect(main.querySelector("nav-bar")).not.toBeNull();
    expect(main.querySelector("transmit-clock")).not.toBeNull();
    expect(main.querySelector("visualizer-icon")).not.toBeNull();
    expect(main.querySelector("start-stop-button")).not.toBeNull();
  });

  it("gets settings when attached", async () => {
    FakeAppSettings.get.mockClear();
    main.remove();
    document.body.appendChild(main);
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

  it("checks browser support", async () => {
    /* checkBrowserSupport() runs by itself; we just need it to not throw. */
    await delay(5000);
  }, 10000);
});
