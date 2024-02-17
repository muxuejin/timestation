import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ArrowDropdown } from "@components/arrowdropdown";
import { CollapseSetting } from "@components/collapsesetting";
import "@components/localesettings";
import { LocaleSettings } from "@components/localesettings";

import EventBus from "@shared/eventbus";
import {
  LocaleSettingsEvent,
  ReadyBusyEvent,
  SettingsEvent,
} from "@shared/events";
import { defaultLocale, knownLocales, supportedLocales } from "@shared/locales";
import "@shared/styles.css";

import { FakeAppSettings, delay } from "@test/utils";

describe("Locale settings", () => {
  let localeSettings: LocaleSettings;
  let arrowDropdown: ArrowDropdown;
  let summary: HTMLButtonElement; /* Not really a button, but keep TS happy. */
  let collapseSetting: CollapseSetting;
  const userLocale = supportedLocales.at(-1)!;

  beforeEach(async () => {
    localeSettings = document.createElement("locale-settings");
    document.body.appendChild(localeSettings);
    await delay();
    arrowDropdown = localeSettings.querySelector("arrow-dropdown")!;
    summary = localeSettings.querySelector("summary.dropdown-arrow")!;
    collapseSetting = localeSettings.querySelector("collapse-setting")!;
  });

  afterEach(() => {
    localeSettings.remove();
    vi.clearAllMocks();
  });

  it("renders closed with defaults", () => {
    const localeDescription = knownLocales[defaultLocale][0];
    expect(localeSettings.locale).toBe(defaultLocale);
    expect(arrowDropdown.open).toBe(false);
    expect(collapseSetting.open).toBe(false);
    expect(summary.innerText).toBe(localeDescription);
  });

  describe("handles ReadyBusyEvent", () => {
    it("gets settings upon true", () => {
      FakeAppSettings.get.mockReturnValueOnce(userLocale);
      EventBus.publish(ReadyBusyEvent, true);
      expect(localeSettings.locale).toBe(userLocale);
    });

    it("does not get settings upon false", () => {
      EventBus.publish(ReadyBusyEvent, false);
      expect(FakeAppSettings.get).not.toHaveBeenCalled();
    });

    it("publishes LocaleSettingsEvent with the saved setting", () => {
      const subscriber = {};
      const spy = vi.fn();
      FakeAppSettings.get.mockReturnValueOnce(userLocale);
      EventBus.subscribe(subscriber, LocaleSettingsEvent, spy);
      EventBus.publish(ReadyBusyEvent, true);
      expect(spy).toHaveBeenCalledWith(userLocale);
      EventBus.unsubscribe(subscriber, LocaleSettingsEvent);
    });
  });

  describe("handles LocaleSettingsEvent", () => {
    it("sets locale from event data", () => {
      EventBus.publish(LocaleSettingsEvent, userLocale);
      expect(localeSettings.locale).toBe(userLocale);
    });

    it("closes contents", () => {
      arrowDropdown.open = true;
      EventBus.publish(LocaleSettingsEvent, userLocale);
      expect(arrowDropdown.open).toBe(false);
    });
  });

  describe("handles SettingsEvent", () => {
    it("sets settings upon save", () => {
      localeSettings.locale = userLocale;
      EventBus.publish(SettingsEvent, "save");
      expect(FakeAppSettings.set).toHaveBeenCalledWith("locale", userLocale);
    });

    it("does not set settings unless save", () => {
      localeSettings.locale = userLocale;
      EventBus.publish(SettingsEvent, "baz");
      expect(FakeAppSettings.set).not.toHaveBeenCalled();
    });

    it("closes contents", () => {
      arrowDropdown.open = true;
      EventBus.publish(SettingsEvent);
      expect(arrowDropdown.open).toBe(false);
    });
  });

  describe("reacts to property changes", () => {
    it("reflects locale", async () => {
      localeSettings.locale = userLocale;
      await delay();
      expect(localeSettings.getAttribute("locale")).toBe(userLocale);
    });
  });

  describe("reacts to attribute changes", () => {
    it("reflects locale", () => {
      localeSettings.setAttribute("locale", userLocale);
      expect(localeSettings.locale).toBe(userLocale);
    });
  });
});
