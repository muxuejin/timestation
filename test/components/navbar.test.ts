import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@components/navbar";
import { NavBar } from "@components/navbar";

import EventBus from "@shared/eventbus";
import { ReadyBusyEvent } from "@shared/events";
import { svgIcons } from "@shared/icons";
import "@shared/styles.css";

import { delay, getStyle, isSvgEqual } from "@test/utils";

describe("Nav bar", () => {
  let navBar: NavBar;
  let dropdown: HTMLDetailsElement;
  let summary: HTMLButtonElement; /* Not really a button, but keep TS happy. */
  let aboutLink: HTMLAnchorElement;
  let settingsLink: HTMLAnchorElement;
  let aboutDialog: HTMLDialogElement;
  let settingsDialog: HTMLDialogElement;
  let menuSvg: SVGSVGElement;
  let aboutSvg: SVGSVGElement;
  let settingsSvg: SVGSVGElement;

  beforeEach(async () => {
    navBar = document.createElement("nav-bar");
    document.body.appendChild(navBar);
    await delay();
    dropdown = navBar.querySelector("details.dropdown")!;
    summary = dropdown.querySelector("summary.btn")!;
    aboutLink = dropdown.querySelector("ul li a")!;
    settingsLink = dropdown.querySelector("ul li:last-of-type a")!;
    aboutDialog = navBar.querySelector("about-modal dialog.modal")!;
    settingsDialog = navBar.querySelector("settings-modal dialog.modal")!;
    [menuSvg, aboutSvg, settingsSvg] = dropdown.querySelectorAll("svg");
  });

  afterEach(() => {
    navBar.remove();
  });

  it("renders with defaults", () => {
    expect(dropdown.hasAttribute("open")).toBe(false);
    expect(getStyle(settingsLink, "pointer-events")).toBe("none");
    expect(aboutDialog.hasAttribute("open")).toBe(false);
    expect(settingsDialog.hasAttribute("open")).toBe(false);
    expect(isSvgEqual(menuSvg, svgIcons.menu)).toBe(true);
    expect(isSvgEqual(aboutSvg, svgIcons.help)).toBe(true);
    expect(isSvgEqual(settingsSvg, svgIcons.settings)).toBe(true);
  });

  describe("handles ReadyBusyEvent", () => {
    it("enables settings item from event data", async () => {
      EventBus.publish(ReadyBusyEvent, true);
      await delay();
      expect(getStyle(settingsLink, "pointer-events")).not.toBe("none");
      EventBus.publish(ReadyBusyEvent, false);
      await delay();
      expect(getStyle(settingsLink, "pointer-events")).toBe("none");
    });
  });

  it("shows menu on click", () => {
    summary.click();
    expect(dropdown.hasAttribute("open")).toBe(true);
  });

  it("shows about modal on click", () => {
    summary.click();
    aboutLink.click();
    expect(aboutDialog.hasAttribute("open")).toBe(true);
  });

  it("shows settings modal on click", () => {
    summary.click();
    settingsLink.click();
    expect(settingsDialog.hasAttribute("open")).toBe(true);
  });
});
