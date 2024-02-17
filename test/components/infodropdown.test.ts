import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@components/infodropdown";
import { InfoDropdown } from "@components/infodropdown";

import { svgIcons } from "@shared/icons";
import "@shared/styles.css";

import { delay, isSvgEqual } from "@test/utils";

describe("Info dropdown", () => {
  let infoDropdown: InfoDropdown;
  let dropdown: HTMLDivElement;
  let iconSpan: HTMLSpanElement;
  let content: HTMLDivElement;
  let svg: SVGSVGElement;

  beforeEach(async () => {
    infoDropdown = document.createElement("info-dropdown");
    infoDropdown.setAttribute("classes", "foo bar");
    document.body.appendChild(infoDropdown);
    await delay();
    dropdown = infoDropdown.querySelector("div.dropdown")!;
    iconSpan = dropdown.querySelector(".btn span")!;
    content = infoDropdown.querySelector(".dropdown-content")!;
    svg = iconSpan.querySelector("svg")!;
  });

  afterEach(() => {
    infoDropdown.remove();
  });

  it("renders with defaults", () => {
    expect(infoDropdown.grow).toBe(false);
    expect(infoDropdown.end).toBe(false);
    expect(iconSpan.classList).not.toContain("sm:w-8");
    expect(iconSpan.classList).not.toContain("sm:h-8");
    expect(dropdown.classList).not.toContain("dropdown-end");
    expect(isSvgEqual(svg, svgIcons.info)).toBe(true);
  });

  it("passes through its initial classes attribute", () => {
    expect(content.classList).toContain("foo");
    expect(content.classList).toContain("bar");
  });

  describe("renders according to properties", () => {
    it("grow affects icon", async () => {
      infoDropdown.grow = true;
      await delay();
      expect(iconSpan.classList).toContain("sm:w-8");
      expect(iconSpan.classList).toContain("sm:h-8");
    });

    it("end affects positioning", async () => {
      infoDropdown.end = true;
      await delay();
      expect(dropdown.classList).toContain("dropdown-end");
    });
  });

  describe("reacts to property/attribute changes", () => {
    describe.each([["grow"], ["end"]])("%s", (name) => {
      it("reflects property", async () => {
        (infoDropdown as any)[name] = true;
        await delay();
        expect(infoDropdown.hasAttribute(name)).toBe(true);
      });

      it("reflects attribute", async () => {
        infoDropdown.setAttribute(name, "");
        await delay();
        expect((infoDropdown as any)[name]).toBe(true);
      });
    });
  });
});
