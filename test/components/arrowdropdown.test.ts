import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@components/arrowdropdown";
import { ArrowDropdown } from "@components/arrowdropdown";

import EventBus from "@shared/eventbus";
import { ArrowDropdownEvent } from "@shared/events";
import "@shared/styles.css";

import { delay } from "@test/utils";

describe("Arrow dropdown", () => {
  let arrowDropdown: ArrowDropdown;
  let details: HTMLDetailsElement;
  let summary: HTMLButtonElement; /* Not really a button, but keep TS happy. */

  beforeEach(async () => {
    arrowDropdown = document.createElement("arrow-dropdown");
    arrowDropdown.setAttribute("classes", "foo bar");
    document.body.appendChild(arrowDropdown);
    await delay();
    details = arrowDropdown.querySelector("details")!;
    summary = arrowDropdown.querySelector("summary.btn")!;
  });

  afterEach(() => {
    arrowDropdown.remove();
  });

  it("renders closed", () => {
    expect(arrowDropdown.hasAttribute("open")).toBe(false);
    expect(details.hasAttribute("open")).toBe(false);
    expect(arrowDropdown.open).toBe(false);
  });

  it("passes through its initial classes attribute", () => {
    expect(summary.classList).toContain("foo");
    expect(summary.classList).toContain("bar");
  });

  it("reacts to arrow clicks", () => {
    summary.click();
    expect(arrowDropdown.open).toBe(true);
    summary.click();
    expect(arrowDropdown.open).toBe(false);
  });

  describe("reacts to property changes", () => {
    const subscriber = {};
    const spy = vi.fn();

    beforeEach(() => {
      EventBus.subscribe(subscriber, ArrowDropdownEvent, spy);
    });

    afterEach(() => {
      EventBus.unsubscribe(subscriber, ArrowDropdownEvent);
      spy.mockClear();
    });

    it("reflects open", async () => {
      arrowDropdown.open = true;
      await delay();
      expect(arrowDropdown.hasAttribute("open")).toBe(true);
      expect(details.hasAttribute("open")).toBe(true);

      arrowDropdown.open = false;
      await delay();
      expect(arrowDropdown.hasAttribute("open")).toBe(false);
      expect(details.hasAttribute("open")).toBe(false);
    });

    it("publishes ArrowDropdownEvent", () => {
      arrowDropdown.group = "baz";
      arrowDropdown.open = true;
      expect(spy).toHaveBeenCalledWith("baz", true);
      arrowDropdown.open = false;
      expect(spy).toHaveBeenLastCalledWith("baz", false);
    });

    it("does not publish ArrowDropdownEvent without a group", () => {
      arrowDropdown.open = true;
      arrowDropdown.open = false;
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("reacts to attribute changes", () => {
    it("reflects open", async () => {
      arrowDropdown.setAttribute("open", "");
      await delay();
      expect(arrowDropdown.open).toBe(true);
      expect(details.hasAttribute("open")).toBe(true);

      arrowDropdown.removeAttribute("open");
      await delay();
      expect(arrowDropdown.open).toBe(false);
      expect(details.hasAttribute("open")).toBe(false);
    });
  });

  it("closes on blur of its contents", () => {
    arrowDropdown.open = true;
    summary.dispatchEvent(new Event("blur"));
    expect(arrowDropdown.open).toBe(true);

    arrowDropdown.closeOnBlur = true;
    summary.dispatchEvent(new Event("blur"));
    expect(arrowDropdown.open).toBe(false);
  });
});
