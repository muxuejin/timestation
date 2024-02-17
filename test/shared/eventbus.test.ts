import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import EventBus from "@shared/eventbus";

describe("EventBus", () => {
  afterEach(() => {
    vi.clearAllMocks();
    EventBus.clear();
  });

  it("is a singleton", () => {
    const Class = EventBus.constructor as any;
    expect(() => new Class()).toThrow("EventBus is a singleton class.");
  });

  describe("subscribe", () => {
    const sub = {};

    it("allows subscribing to a topic", () => {
      expect(() => EventBus.subscribe({}, "BEES", () => {})).not.toThrow();
    });

    it("allows one subscriber to subscribe to multiple topics", () => {
      expect(() => EventBus.subscribe(sub, "BEES", () => {})).not.toThrow();
      expect(() => EventBus.subscribe(sub, "BZZT", () => {})).not.toThrow();
    });

    it("throws if one subscriber subscribes repeatedly to one topic", () => {
      EventBus.subscribe(sub, "BEES", () => {});
      expect(() => EventBus.subscribe(sub, "BEES", () => {})).toThrow(
        `Subscriber is already subscribed to "BEES".`,
      );
    });
  });

  describe("publish", () => {
    const spy = vi.fn();
    const spy2 = vi.fn();
    const spy3 = vi.fn();
    const spy4 = vi.fn();

    beforeEach(() => {
      EventBus.subscribe({}, "BEES", spy);
      EventBus.subscribe({}, "BZZT", spy2);
      EventBus.subscribe({}, "BZZT", spy3);
      EventBus.subscribe({}, "cars maybe", spy4);
    });

    it("invokes event callback with arbitrary event data", () => {
      EventBus.publish("BEES", "foo", null);
      expect(spy).toHaveBeenCalledWith("foo", null);
      expect(spy).toHaveBeenCalledOnce();
    });

    it("invokes all callbacks for topic", () => {
      EventBus.publish("BZZT", 1);
      expect(spy2).toHaveBeenCalledWith(1);
      expect(spy2).toHaveBeenCalledOnce();
      expect(spy3).toHaveBeenCalledWith(1);
      expect(spy3).toHaveBeenCalledOnce();
    });

    it("does not invoke unrelated callbacks", () => {
      EventBus.publish("cars maybe");
      expect(spy).not.toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalled();
      expect(spy3).not.toHaveBeenCalled();
      expect(spy4).toHaveBeenCalled();
    });

    it("does not throw with nonexistent topic", () => {
      expect(() => EventBus.publish("fffffff")).not.toThrow();
    });
  });

  describe("unsubscribe", () => {
    const spy = vi.fn();
    const spy2 = vi.fn();
    const spy3 = vi.fn();
    const spy4 = vi.fn();

    const subscriber = {};
    const subscriber2 = {};
    const subscriber3 = {};
    const subscriber4 = {};

    beforeEach(() => {
      EventBus.subscribe(subscriber, "BEES", spy);
      EventBus.subscribe(subscriber2, "BZZT", spy2);
      EventBus.subscribe(subscriber3, "BZZT", spy3);
      EventBus.subscribe(subscriber4, "cars maybe", spy4);
    });

    it("does not unsubscribe nonexistent subscriber", () => {
      EventBus.publish("BEES", "foo", null);
      EventBus.unsubscribe(subscriber3, "BEES");
      EventBus.publish("BEES", null, "foo");
      expect(spy).toHaveBeenLastCalledWith(null, "foo");
      expect(spy).toHaveBeenCalledTimes(2);
    });

    it("does not throw when unsubscribing from nonexistent topic", () => {
      expect(() => EventBus.unsubscribe({}, "fffffff")).not.toThrow();
    });
  });
});
