import { afterAll, describe, expect, it, vi } from "vitest";

import EventBus from "@shared/eventbus";
import { TimeSignalReadyEvent } from "@shared/events";
import RadioTimeSignal from "@shared/radiotimesignal";

import { delay } from "@test/utils";

const publishSpy = vi.spyOn(EventBus, "publish");

describe("RadioTimeSignal", () => {
  afterAll(() => {
    publishSpy.mockRestore();
  });

  it("publishes TimeSignalReadyEvent", async () => {
    /* May be flaky due to rapid WASM compilation. */
    for (let retries = 3; retries > 0; retries--) {
      /* eslint-disable no-await-in-loop */
      if (publishSpy.mock.calls.length > 0) break;
      await delay(100);
    }
    expect(publishSpy).toHaveBeenCalledWith(TimeSignalReadyEvent);
  });

  it("is a singleton", () => {
    const Class = RadioTimeSignal.constructor as any;
    expect(() => new Class()).toThrow("RadioTimeSignal is a singleton class.");
  });

  it("starts in idle state", () => {
    expect(RadioTimeSignal.state).toBe("idle");
  });
});
