import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ArrowDropdown } from "@components/arrowdropdown";
import { CollapseSetting } from "@components/collapsesetting";
import { NumericInput } from "@components/numericinput";
import "@components/offsetsettings";
import { OffsetSettings } from "@components/offsetsettings";
import { SignButton } from "@components/signbutton";

import EventBus from "@shared/eventbus";
import { ReadyBusyEvent, SettingsEvent } from "@shared/events";
import "@shared/styles.css";

import { FakeAppSettings, delay } from "@test/utils";

const kMinus = "\u{2212}" as const;

describe("Offset settings", () => {
  let offsetSettings: OffsetSettings;
  let arrowDropdown: ArrowDropdown;
  let summary: HTMLButtonElement; /* Not really a button, but keep TS happy. */
  let collapseSetting: CollapseSetting;
  let signButton: SignButton;
  let numericInputs: NodeListOf<NumericInput>;
  let hhNumericInput: NumericInput;
  let mmNumericInput: NumericInput;
  let ssNumericInput: NumericInput;
  let msNumericInput: NumericInput;

  beforeEach(async () => {
    offsetSettings = document.createElement("offset-settings");
    document.body.appendChild(offsetSettings);
    await delay();
    arrowDropdown = offsetSettings.querySelector("arrow-dropdown")!;
    summary = arrowDropdown.querySelector("summary.dropdown-arrow")!;
    collapseSetting = offsetSettings.querySelector("collapse-setting")!;
    signButton = collapseSetting.querySelector("sign-button")!;
    numericInputs = collapseSetting.querySelectorAll("numeric-input");
    [hhNumericInput, mmNumericInput, ssNumericInput, msNumericInput] =
      numericInputs;
  });

  afterEach(() => {
    offsetSettings.remove();
    vi.clearAllMocks();
  });

  it("renders closed with defaults", () => {
    const maxes = [23, 59, 59, 999];
    expect(offsetSettings.offset).toBe(0);
    expect(arrowDropdown.open).toBe(false);
    expect(summary.innerText).toBe("No offset");
    expect(collapseSetting.open).toBe(false);
    expect(signButton.negative).toBe(false);
    maxes.forEach((max, i) => {
      const numericInput = numericInputs[i];
      expect(numericInput.min).toBe(0);
      expect(numericInput.max).toBe(max);
      expect(numericInput.value).toBe(0);
    });
  });

  describe("handles ReadyBusyEvent", () => {
    it("gets settings upon true", () => {
      FakeAppSettings.get.mockReturnValueOnce(12345678);
      EventBus.publish(ReadyBusyEvent, true);
      expect(offsetSettings.offset).toBe(12345678);
      expect(hhNumericInput.value).toBe(3);
      expect(mmNumericInput.value).toBe(25);
      expect(ssNumericInput.value).toBe(45);
      expect(msNumericInput.value).toBe(678);
    });

    it("does not get settings upon false", () => {
      EventBus.publish(ReadyBusyEvent, false);
      expect(FakeAppSettings.get).not.toHaveBeenCalled();
    });
  });

  describe("handles SettingsEvent", () => {
    it("sets settings upon save", () => {
      signButton.negative = true;
      hhNumericInput.value = 1;
      mmNumericInput.value = 23;
      ssNumericInput.value = 45;
      msNumericInput.value = 678;
      EventBus.publish(SettingsEvent, "save");
      expect(FakeAppSettings.set).toHaveBeenCalledWith("offset", -5025678);
    });

    it("does not set settings unless save", () => {
      hhNumericInput.value = 1;
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

  describe("reacts to user input", () => {
    let innerButton: HTMLButtonElement;

    beforeEach(() => {
      innerButton = signButton.querySelector("button")!;
    });

    it("changes displayed offset", async () => {
      hhNumericInput.value = 1;
      mmNumericInput.value = 23;
      ssNumericInput.value = 45;
      msNumericInput.value = 678;
      msNumericInput.dispatchEvent(new Event("blur"));
      await delay();
      expect(summary.innerText).toBe(`+01:23:45.678`);
      innerButton.click();
      await delay();
      expect(summary.innerText).toBe(`${kMinus}01:23:45.678`);
    });

    it("does nothing with no offset upon only sign button click", async () => {
      innerButton.click();
      await delay();
      expect(summary.innerText).toBe(`No offset`);
    });
  });

  describe("reacts to property changes", () => {
    it("reflects offset", async () => {
      offsetSettings.offset = 12345678;
      await delay();
      expect(offsetSettings.getAttribute("offset")).toBe("12345678");
    });
  });

  describe("reacts to attribute changes", () => {
    it("reflects offset", async () => {
      offsetSettings.setAttribute("offset", "22333444");
      await delay();
      expect(offsetSettings.offset).toBe(22333444);
    });
  });
});
