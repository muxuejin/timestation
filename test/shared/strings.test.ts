import { describe, expect, it } from "vitest";

import { findScriptsInString, foldUnicodeString } from "@shared/strings";

describe("foldUnicodeString", () => {
  it("case-folds, normalizes, and removes diacritics", () => {
    expect(foldUnicodeString("English")).toBe("english");
    expect(foldUnicodeString("héLlÖ")).toBe("hello");
    expect(foldUnicodeString("ŉŘꞍＣ")).toBe("ʼnrɥｃ");
  });

  it("returns empty string on empty string", () => {
    expect(foldUnicodeString("")).toBe("");
  });
});

describe("findScriptsInString", () => {
  it("finds scripts", () => {
    expect(findScriptsInString("hi")).toEqual(["latin"]);
    expect(findScriptsInString("ㅁ")).toEqual(["hangul"]);
    expect(findScriptsInString("ᾕ")).toEqual(["greekAndCoptic"]);
    expect(findScriptsInString("Ɣ")).toEqual(["latinExtB"]);
  });

  it("finds multiple scripts", () => {
    expect(findScriptsInString("中Ω")).toEqual(["cjk", "greekAndCoptic"]);
  });

  it("returns empty array on empty string", () => {
    expect(findScriptsInString("")).toEqual([]);
  });
});
