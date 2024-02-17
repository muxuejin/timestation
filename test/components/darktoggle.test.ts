import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@components/darktoggle";
import { DarkToggle } from "@components/darktoggle";

import EventBus from "@shared/eventbus";
import { ReadyBusyEvent } from "@shared/events";
import { svgIcons } from "@shared/icons";
import "@shared/styles.css";

import { FakeAppSettings, delay, isSvgEqual } from "@test/utils";

describe("Dark toggle", () => {
  let darkToggle: DarkToggle;
  let checkbox: HTMLInputElement;
  let swapOffSvg: SVGSVGElement;
  let swapOnSvg: SVGSVGElement;

  beforeEach(async () => {
    FakeAppSettings.get.mockReturnValueOnce(false);
    darkToggle = document.createElement("dark-toggle");
    document.body.appendChild(darkToggle);
    await delay();
    checkbox = darkToggle.querySelector("input")!;
    swapOffSvg = darkToggle.querySelector("span.swap-off svg")!;
    swapOnSvg = darkToggle.querySelector("span.swap-on svg")!;
  });

  afterEach(() => {
    darkToggle.remove();
    vi.clearAllMocks();
  });

  it("renders with default settings", () => {
    expect(checkbox.checked).toBe(false);
    expect(darkToggle.dark).toBe(false);
    expect(isSvgEqual(swapOffSvg, svgIcons.sun)).toBe(true);
    expect(isSvgEqual(swapOnSvg, svgIcons.moon)).toBe(true);
  });

  it("renders with saved settings", () => {
    darkToggle.remove();
    FakeAppSettings.get.mockReturnValueOnce(true);
    darkToggle = document.createElement("dark-toggle");
    document.body.appendChild(darkToggle);
    expect(darkToggle.dark).toBe(true);
  });

  describe("handles ReadyBusyEvent", () => {
    it("gets settings upon true", () => {
      expect(darkToggle.dark).toBe(false);
      FakeAppSettings.get.mockReturnValueOnce(true);
      EventBus.publish(ReadyBusyEvent, true);
      expect(darkToggle.dark).toBe(true);
    });

    it("does not get settings upon false", () => {
      EventBus.publish(ReadyBusyEvent, false);
      expect(FakeAppSettings.get).toHaveBeenCalledOnce();
    });
  });

  describe("reacts to clicks", () => {
    it("reflects checkbox", () => {
      checkbox.click();
      expect(checkbox.checked).toBe(true);
      expect(darkToggle.dark).toBe(true);
    });

    it("saves settings", () => {
      expect(FakeAppSettings.set).not.toHaveBeenCalled();
      checkbox.click();
      expect(FakeAppSettings.set).toHaveBeenCalledWith("dark", true);
      checkbox.click();
      expect(FakeAppSettings.set).toHaveBeenCalledWith("dark", false);
    });
  });

  describe("reacts to property changes", () => {
    it("reflects property", async () => {
      darkToggle.dark = true;
      await delay();
      expect(checkbox.checked).toBe(true);
      expect(darkToggle.hasAttribute("dark")).toBe(true);
    });
  });

  describe("reacts to attribute changes", () => {
    it("reflects dark", async () => {
      darkToggle.setAttribute("dark", "");
      await delay();
      expect(checkbox.checked).toBe(true);
      expect(darkToggle.dark).toBe(true);
    });
  });
});
