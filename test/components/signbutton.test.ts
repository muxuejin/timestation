import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@components/signbutton";
import { SignButton } from "@components/signbutton";

import { svgIcons } from "@shared/icons";
import "@shared/styles.css";

import { delay, isSvgEqual } from "@test/utils";

describe("Settings modal", () => {
  let signButton: SignButton;
  let button: HTMLButtonElement;
  let svg: SVGSVGElement;

  beforeEach(async () => {
    signButton = document.createElement("sign-button");
    signButton.setAttribute("classes", "foo bar");
    document.body.appendChild(signButton);
    await delay();
    button = signButton.querySelector("button")!;
    svg = button.querySelector("svg")!;
  });

  afterEach(() => {
    signButton.remove();
  });

  it("renders with defaults", () => {
    expect(signButton.negative).toBe(false);
    expect(isSvgEqual(svg, svgIcons.add)).toBe(true);
  });

  it("renders a different icon if negative", async () => {
    signButton.negative = true;
    await delay();
    svg = button.querySelector("svg")!;
    expect(isSvgEqual(svg, svgIcons.remove)).toBe(true);
  });

  it("passes through its initial classes attribute", () => {
    expect(button.classList).toContain("foo");
    expect(button.classList).toContain("bar");
  });

  describe("reacts to property changes", () => {
    it("reflects negative", async () => {
      signButton.negative = true;
      await delay();
      expect(signButton.hasAttribute("negative")).toBe(true);
    });
  });

  describe("reacts to attribute changes", () => {
    it("reflects negative", () => {
      signButton.setAttribute("negative", "");
      expect(signButton.negative).toBe(true);
    });
  });
});
