import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { ArrowDropdown } from "@components/arrowdropdown";
import { CollapseSetting } from "@components/collapsesetting";
import { NumericInput } from "@components/numericinput";
import { SignButton } from "@components/signbutton";
import "@components/stationsettings";
import { StationSettings } from "@components/stationsettings";

import { Station, knownStations } from "@shared/appsettings";
import EventBus from "@shared/eventbus";
import { ReadyBusyEvent, SettingsEvent } from "@shared/events";
import { svgFlags } from "@shared/icons";

import { FakeAppSettings, delay, isSvgEqual } from "@test/utils";

type StationRenderInfo = [
  station: Station,
  flag: ReturnType<typeof html>,
  hasDut1: boolean,
  hasJjyKhz: boolean,
];

const stationInfo: StationRenderInfo[] = [
  ["BPC", svgFlags.cn, false, false],
  ["DCF77", svgFlags.de, false, false],
  ["JJY", svgFlags.jp, false, true],
  ["MSF", svgFlags.uk, true, false],
  ["WWVB", svgFlags.us, true, false],
] as const;

describe("Station settings", () => {
  let stationSettings: StationSettings;
  let arrowDropdown: ArrowDropdown;
  let summary: HTMLButtonElement; /* Not really a button, but keep TS happy. */
  let menuContents: HTMLUListElement;
  let collapseSetting: CollapseSetting;
  let dut1Span: HTMLSpanElement;
  let dut1SignButton: SignButton;
  let dut1NumericInput: NumericInput;
  let jjyKhzSpan: HTMLSpanElement;
  let jjyKhz40Input: HTMLInputElement;
  let jjyKhz60Input: HTMLInputElement;

  beforeEach(async () => {
    stationSettings = document.createElement("station-settings");
    document.body.appendChild(stationSettings);
    await delay();
    stationSettings.requestUpdate();
    await delay();
    arrowDropdown = stationSettings.querySelector("arrow-dropdown")!;
    summary = arrowDropdown.querySelector("summary.dropdown-arrow")!;
    menuContents = arrowDropdown.querySelector("menu-list .dropdown-content")!;
    collapseSetting = stationSettings.querySelector("collapse-setting")!;
    dut1SignButton = collapseSetting.querySelector("sign-button")!;
    dut1NumericInput = collapseSetting.querySelector("numeric-input")!;
    [dut1Span, jjyKhzSpan] = collapseSetting.querySelectorAll<HTMLSpanElement>(
      ".collapse-content > div > span",
    );
    [jjyKhz40Input, jjyKhz60Input] = jjyKhzSpan.querySelectorAll("input");
  });

  afterEach(() => {
    stationSettings.remove();
    FakeAppSettings.get.mockClear();
    FakeAppSettings.set.mockClear();
  });

  it("renders with defaults", () => {
    expect(stationSettings.station).toBe("WWVB");
    expect(stationSettings.dut1).toBe(0);
    expect(stationSettings.jjyKhz).toBe(40);
    expect(arrowDropdown.open).toBe(false);
    expect(collapseSetting.open).toBe(true);
    expect(dut1Span.classList).not.toContain("hidden");
    expect(jjyKhzSpan.classList).toContain("hidden");
  });

  describe("renders according to settings", () => {
    describe.each(stationInfo)("%s", (station, flag, hasDut1, hasJjyKhz) => {
      let svg: SVGSVGElement;

      beforeEach(async () => {
        stationSettings.station = station;
        await delay();
        svg = summary.querySelector("svg")!;
      });

      it("shows flag", () => {
        expect(isSvgEqual(svg, flag)).toBe(true);
      });

      if (hasDut1) {
        it("shows DUT1 selector", () => {
          expect(collapseSetting.open).toBe(true);
          expect(dut1Span.classList).not.toContain("hidden");
          expect(jjyKhzSpan.classList).toContain("hidden");
          expect(jjyKhz40Input.checked).toBe(true);
          expect(jjyKhz60Input.checked).toBe(false);
        });
      } else if (hasJjyKhz) {
        it("shows frequency selector", () => {
          expect(collapseSetting.open).toBe(true);
          expect(dut1Span.classList).toContain("hidden");
          expect(jjyKhzSpan.classList).not.toContain("hidden");
          expect(dut1SignButton.negative).toBe(stationSettings.dut1 < 0);
          expect(dut1NumericInput.value).toBe(Math.abs(stationSettings.dut1));
        });
      } else {
        it("does not show contents", () => {
          expect(collapseSetting.open).toBe(false);
        });
      }
    });
  });

  describe("creates menu options from known stations", () => {
    let buttons: NodeListOf<HTMLButtonElement>;
    let svgs: NodeListOf<SVGSVGElement>;
    let labelSpans: NodeListOf<HTMLSpanElement>;

    beforeEach(() => {
      buttons = menuContents.querySelectorAll("button");
      svgs = menuContents.querySelectorAll("button svg");
      labelSpans = menuContents.querySelectorAll("button span:last-of-type");
    });

    describe.each(stationInfo)("%s", (station, flag) => {
      const i = knownStations.indexOf(station as Station);

      it("shows flag", () => {
        expect(isSvgEqual(svgs[i], flag)).toBe(true);
      });

      it("shows station name", () => {
        expect(labelSpans[i].innerHTML).toMatch(station);
      });

      it("changes station when clicked", () => {
        buttons[i].dispatchEvent(new Event("mousedown"));
        expect(stationSettings.station).toBe(station);
      });
    });
  });

  describe("handles ReadyBusyEvent", () => {
    it("gets settings upon true", () => {
      EventBus.publish(ReadyBusyEvent, true);
      expect(stationSettings.station).toBe("JJY");
      expect(stationSettings.dut1).toBe(123);
      expect(stationSettings.jjyKhz).toBe(60);
    });

    it("does not get settings upon false", () => {
      EventBus.publish(ReadyBusyEvent, false);
      expect(FakeAppSettings.get).not.toHaveBeenCalled();
    });
  });

  describe("handles SettingsEvent", () => {
    beforeEach(() => {
      dut1SignButton.negative = true;
      dut1NumericInput.value = 321;
      stationSettings.jjyKhz = 40;
    });

    describe("sets settings upon save", () => {
      const fakeSet = FakeAppSettings.set;
      let etc: any;

      describe.each(stationInfo)("%s", (station, _, hasDut1, hasJjyKhz) => {
        beforeEach(() => {
          stationSettings.station = station;
          EventBus.publish(SettingsEvent, "save");
          etc = expect.anything();
        });

        it("sets station", () => {
          expect(fakeSet).toHaveBeenCalledWith("station", station);
        });

        it(`${hasDut1 ? "sets" : "does not set"} DUT1`, () => {
          if (hasDut1) expect(fakeSet).toHaveBeenCalledWith("dut1", -321);
          else expect(fakeSet).not.toHaveBeenCalledWith("dut1", etc);
        });

        it(`${hasJjyKhz ? "sets" : "does not set"} frequency`, () => {
          if (hasJjyKhz) expect(fakeSet).toHaveBeenCalledWith("jjyKhz", 40);
          else expect(fakeSet).not.toHaveBeenCalledWith("jjyKhz", etc);
        });
      });
    });

    it("does not set settings unless save", () => {
      EventBus.publish(SettingsEvent, "baz");
      expect(FakeAppSettings.set).not.toHaveBeenCalled();
    });

    it("closes contents", () => {
      arrowDropdown.open = true;
      EventBus.publish(SettingsEvent);
      expect(arrowDropdown.open).toBe(false);
    });
  });

  it("toggles caret state on click", () => {
    summary.click();
    expect(arrowDropdown.open).toBe(true);
    summary.click();
    expect(arrowDropdown.open).toBe(false);
  });

  describe("reacts to property/attribute changes", () => {
    describe.each([
      ["station", "station", "DCF77"],
      ["dut1", "dut1", 555],
      ["jjyKhz", "jjykhz", 60],
    ])("reflects %s property to %s attribute", (property, attribute, value) => {
      it(`${property} property`, async () => {
        (stationSettings as any)[property] = value;
        await delay();
        expect(stationSettings.getAttribute(attribute)).toBe(`${value}`);
      });

      it(`${attribute} attribute`, async () => {
        stationSettings.setAttribute(attribute, `${value}`);
        await delay();
        expect((stationSettings as any)[property]).toBe(value);
      });
    });
  });
});
