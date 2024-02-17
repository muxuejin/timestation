/* eslint-disable max-classes-per-file */

import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import BaseElement, {
  EventBusMixIn,
  LightDomMixIn,
  registerEventHandler,
  stringArrayConverter,
} from "@shared/element";
import EventBus from "@shared/eventbus";

import { delay } from "@test/utils";

const kTestEvent = "TestEvent" as const;
const eventSpy = vi.fn();
const handlerThisSpy = vi.fn();
const handlerSpy = vi.fn();

@customElement("base-lit-element")
class BaseLitElement extends BaseElement {}

@customElement("event-lit-element")
class EventLitElement extends EventBusMixIn(LitElement) {
  subscribedTopics = { [kTestEvent]: eventSpy };
}

@customElement("handler-lit-element")
class HandlerLitElement extends EventLitElement {
  @registerEventHandler(kTestEvent)
  handleTestEvent(...args: any[]) {
    handlerThisSpy(this);
    handlerSpy(...args);
  }
}

@customElement("light-lit-element")
class LightLitElement extends LightDomMixIn(LitElement) {}

describe("BaseLitElement", () => {
  let baseLitElement: BaseLitElement;

  beforeEach(() => {
    baseLitElement = document.createElement("base-lit-element");
  });

  it("component gains a publish() method", () => {
    expect(typeof baseLitElement.publish).toBe("function");
  });

  it("component returns itself as render root", () => {
    expect(baseLitElement.createRenderRoot()).toBe(baseLitElement);
  });
});

describe("EventBusMixIn", () => {
  let eventLitElement: EventLitElement;

  beforeEach(async () => {
    eventLitElement = document.createElement("event-lit-element");
    document.body.appendChild(eventLitElement);
    await delay();
  });

  afterEach(() => {
    eventLitElement.remove();
    vi.clearAllMocks();
  });

  it("component subscribes to test event when connected", () => {
    EventBus.publish(kTestEvent, "foo", null, 3);
    expect(eventSpy).toHaveBeenCalledWith("foo", null, 3);
    expect(eventSpy).toHaveBeenCalledOnce();
  });

  it("component gains a publish() method", () => {
    expect(typeof eventLitElement.publish).toBe("function");
  });

  it("publish() method wraps EventBus.publish()", () => {
    eventLitElement.publish(kTestEvent, "bar", undefined);
    expect(eventSpy).toHaveBeenCalledWith("bar", undefined);
    expect(eventSpy).toHaveBeenCalledOnce();
  });

  it("component unsubscribes from test event when disconnected", () => {
    eventLitElement.remove();
    EventBus.publish(kTestEvent, "foo", null, 3);
    expect(eventSpy).not.toHaveBeenCalled();
  });
});

describe("LightDomMixIn", () => {
  it("component returns itself as render root", () => {
    const lightLitElement = document.createElement("light-lit-element");
    expect(lightLitElement.createRenderRoot()).toBe(lightLitElement);
  });
});

describe("@registerEventHandler", () => {
  let handlerLitElement: HandlerLitElement;

  beforeEach(async () => {
    handlerLitElement = document.createElement("handler-lit-element");
    document.body.appendChild(handlerLitElement);
    await delay();
  });

  afterEach(() => {
    handlerLitElement.remove();
    vi.clearAllMocks();
  });

  it("decorated method binds to component instance", () => {
    EventBus.publish(kTestEvent);
    expect(handlerThisSpy).toHaveBeenCalledWith(handlerLitElement);
  });

  it("component subscribes to test event when connected", () => {
    EventBus.publish(kTestEvent, "foo", null, 3);
    expect(handlerSpy).toHaveBeenCalledWith("foo", null, 3);
    expect(handlerSpy).toHaveBeenCalledOnce();
  });
});

describe("stringArrayConverter", () => {
  describe("fromAttribute", () => {
    it("splits string on spaces", () => {
      const split = stringArrayConverter.fromAttribute("foo bar  baz\t\n\vqux");
      expect(split).toEqual(["foo", "bar", "baz", "qux"]);
    });

    it("returns an empty array on null", () => {
      expect(stringArrayConverter.fromAttribute(null)).toEqual([]);
    });
  });

  describe("toAttribute", () => {
    it("joins a string array with spaces", () => {
      const items = ["foo", "bar", "baz"];
      expect(stringArrayConverter.toAttribute(items)).toBe(items.join(" "));
    });
  });
});

declare global {
  interface HTMLElementTagNameMap {
    "base-lit-element": BaseLitElement;
    "event-lit-element": EventLitElement;
    "handler-lit-element": HandlerLitElement;
    "light-lit-element": LightLitElement;
  }
}
