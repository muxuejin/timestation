import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@components/advancedsettings";
import { AdvancedSettings } from "@components/advancedsettings";
import { ArrowDropdown } from "@components/arrowdropdown";
import { CollapseSetting } from "@components/collapsesetting";

import EventBus from "@shared/eventbus";
import { ReadyBusyEvent, SettingsEvent } from "@shared/events";
import "@shared/styles.css";

import { FakeAppSettings, delay } from "@test/utils";

describe("Advanced settings", () => {
  let advancedSettings: AdvancedSettings;
  let arrowDropdown: ArrowDropdown;
  let summary: HTMLButtonElement; /* Not really a button, but keep TS happy. */
  let collapseSetting: CollapseSetting;
  let noclip: HTMLInputElement;
  let sync: HTMLInputElement;

  beforeEach(async () => {
    advancedSettings = document.createElement("advanced-settings");
    document.body.appendChild(advancedSettings);
    await delay();
    [noclip, sync] = advancedSettings.querySelectorAll("input");
    arrowDropdown = advancedSettings.querySelector("arrow-dropdown")!;
    summary = advancedSettings.querySelector("summary.dropdown-arrow")!;
    collapseSetting = advancedSettings.querySelector("collapse-setting")!;
  });

  afterEach(() => {
    advancedSettings.remove();
    vi.clearAllMocks();
  });

  it("renders closed with defaults", () => {
    expect(advancedSettings.noclip).toBe(true);
    expect(advancedSettings.sync).toBe(true);
    expect(arrowDropdown.open).toBe(false);
    expect(collapseSetting.open).toBe(false);
    expect(noclip.checked).toBe(true);
    expect(sync.checked).toBe(true);
  });

  describe("handles ReadyBusyEvent", () => {
    it("gets settings upon true", () => {
      advancedSettings.noclip = true;
      advancedSettings.sync = false;
      FakeAppSettings.get.mockReturnValueOnce(false);
      FakeAppSettings.get.mockReturnValueOnce(true);
      EventBus.publish(ReadyBusyEvent, true);
      expect(advancedSettings.noclip).toBe(false);
      expect(advancedSettings.sync).toBe(true);
    });

    it("does not get settings upon false", () => {
      EventBus.publish(ReadyBusyEvent, false);
      expect(FakeAppSettings.get).not.toHaveBeenCalled();
    });
  });

  describe("handles SettingsEvent", () => {
    it("sets settings upon save", () => {
      advancedSettings.noclip = false;
      advancedSettings.sync = true;
      EventBus.publish(SettingsEvent, "save");
      expect(FakeAppSettings.set).toHaveBeenCalledWith("noclip", false);
      expect(FakeAppSettings.set).toHaveBeenCalledWith("sync", true);
    });

    it("does not set settings unless save", () => {
      advancedSettings.noclip = false;
      advancedSettings.sync = true;
      EventBus.publish(SettingsEvent, "baz");
      expect(FakeAppSettings.set).not.toHaveBeenCalled();
    });

    it("closes contents", () => {
      arrowDropdown.open = true;
      EventBus.publish(SettingsEvent);
      expect(arrowDropdown.open).toBe(false);
    });
  });

  it("opens and closes contents on arrow clicks", () => {
    summary.click();
    expect(arrowDropdown.open).toBe(true);
    expect(collapseSetting.open).toBe(true);
    summary.click();
    expect(arrowDropdown.open).toBe(false);
    expect(collapseSetting.open).toBe(false);
  });

  describe("reacts to property/attribute/checkbox changes", () => {
    describe.each([["noclip"], ["sync"]])("%s", (name) => {
      it("reflects property", async () => {
        const checkbox = name === "noclip" ? noclip : sync;
        (advancedSettings as any)[name] = false;
        await delay();
        expect(advancedSettings.hasAttribute(name)).toBe(false);
        expect(checkbox.checked).toBe(false);
      });

      it("reflects attribute", async () => {
        const checkbox = name === "noclip" ? noclip : sync;
        advancedSettings.removeAttribute(name);
        await delay();
        expect((advancedSettings as any)[name]).toBe(false);
        expect(checkbox.checked).toBe(false);
      });

      it("reflects checkbox state", async () => {
        const checkbox = name === "noclip" ? noclip : sync;
        checkbox.click();
        await delay();
        expect(advancedSettings.hasAttribute(name)).toBe(false);
        expect((advancedSettings as any)[name]).toBe(false);
      });
    });
  });
});
