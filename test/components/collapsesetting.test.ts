import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@components/collapsesetting";
import { CollapseSetting } from "@components/collapsesetting";

import { ArrowDropdownEvent } from "@shared/events";
import "@shared/styles.css";

import { delay, getStyle } from "@test/utils";

describe("Collapse setting", () => {
  let collapseSetting: CollapseSetting;
  let collapse: HTMLDivElement;
  let content: HTMLDivElement;

  beforeEach(async () => {
    collapseSetting = document.createElement("collapse-setting");
    document.body.appendChild(collapseSetting);
    await delay();
    collapse = collapseSetting.querySelector(".collapse")!;
    content = collapseSetting.querySelector(".collapse-content")!;
  });

  afterEach(() => {
    collapseSetting.remove();
  });

  it("renders closed", () => {
    expect(collapseSetting.hasAttribute("open")).toBe(false);
    expect(collapseSetting.open).toBe(false);
    expect(collapse.classList).not.toContain("collapse-open");
  });

  describe("handles ArrowDropdownEvent", () => {
    it("opens on true", () => {
      collapseSetting.group = "foo";
      collapseSetting.publish(ArrowDropdownEvent, "foo", true);
      expect(collapseSetting.open).toBe(true);
    });

    it("closes on false", () => {
      collapseSetting.open = true;
      collapseSetting.group = "foo";
      collapseSetting.publish(ArrowDropdownEvent, "foo", false);
      expect(collapseSetting.open).toBe(false);
    });

    it("does not open or close without a group property", () => {
      const oldOpen = collapseSetting.open;
      collapseSetting.publish(ArrowDropdownEvent, "foo", true);
      expect(collapseSetting.open).toBe(oldOpen);
      collapseSetting.publish(ArrowDropdownEvent, "foo", false);
      expect(collapseSetting.open).toBe(oldOpen);
    });
  });

  describe("reacts to property changes", () => {
    it("reflects open", async () => {
      collapseSetting.open = true;
      await delay();
      expect(collapseSetting.hasAttribute("open")).toBe(true);
      expect(collapse.classList).toContain("collapse-open");

      collapseSetting.open = false;
      await delay();
      expect(collapseSetting.hasAttribute("open")).toBe(false);
      expect(collapse.classList).not.toContain("collapse-open");
    });
  });

  describe("reacts to attribute changes", () => {
    it("reflects open", async () => {
      collapseSetting.setAttribute("open", "");
      await delay();
      expect(collapseSetting.open).toBe(true);
      expect(collapse.classList).toContain("collapse-open");

      collapseSetting.removeAttribute("open");
      await delay();
      expect(collapseSetting.open).toBe(false);
      expect(collapse.classList).not.toContain("collapse-open");
    });
  });

  it("gets overflow: visible once focused until closed", async () => {
    collapseSetting.open = true;
    await delay();
    expect(getStyle(collapse, "overflow")).toBe("hidden");

    content.dispatchEvent(new Event("focusin"));
    await delay();
    expect(getStyle(collapse, "overflow")).toBe("visible");

    content.dispatchEvent(new Event("focusout"));
    await delay();

    collapseSetting.open = false;
    await delay();
    expect(getStyle(collapse, "overflow")).toBe("hidden");
  });
});
