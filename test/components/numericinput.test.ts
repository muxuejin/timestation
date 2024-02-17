import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@components/numericinput";
import { NumericInput } from "@components/numericinput";

import "@shared/styles.css";

import { delay } from "@test/utils";

const kTestGroup = "TestGroup" as const;

describe("Numeric input", () => {
  let numericInputs: NumericInput[] = [];
  let numericInput: NumericInput;
  let inputs: NodeListOf<HTMLInputElement>;
  let input: HTMLInputElement;

  beforeEach(async () => {
    for (let i = 0; i < 3; i++) {
      const curNumericInput = document.createElement("numeric-input");
      curNumericInput.setAttribute("classes", "foo bar");
      numericInputs.push(curNumericInput);
      document.body.appendChild(curNumericInput);
    }
    await delay();
    [numericInput] = numericInputs;
    inputs = document.body.querySelectorAll("numeric-input input");
    [input] = inputs;
  });

  afterEach(() => {
    numericInputs.forEach((curNumericInput) => curNumericInput.remove());
    numericInputs = [];
  });

  it("renders with defaults", () => {
    numericInputs.forEach((curNumericInput) => {
      expect(curNumericInput.value).toBe(0);
      expect(curNumericInput.min).toBe(0);
      expect(curNumericInput.max).toBe(0);
      expect(curNumericInput.group).toBe("");
    });
  });

  it("passes through its initial classes attribute", () => {
    numericInputs.forEach((curNumericInput) => {
      const curInput = curNumericInput.querySelector("input")!;
      expect(curInput.classList).toContain("foo");
      expect(curInput.classList).toContain("bar");
    });
  });

  describe("reacts to property changes", () => {
    it("reflects min", async () => {
      numericInput.min = 1;
      await delay();
      expect(numericInput.getAttribute("min")).toBe("1");
    });

    it("reflects max", async () => {
      numericInput.max = 123;
      await delay();
      expect(numericInput.getAttribute("max")).toBe("123");
    });

    it("reflects value", async () => {
      numericInput.min = 1;
      numericInput.max = 123;
      numericInput.value = 100;
      await delay();
      expect(numericInput.getAttribute("value")).toBe("100");
    });

    it("sets maxlength from max", async () => {
      numericInput.max = 12345;
      await delay();
      expect(input.maxLength).toBe(5);
    });
  });

  describe("reacts to attribute changes", () => {
    it("reflects min", async () => {
      numericInput.setAttribute("min", "1");
      await delay();
      expect(numericInput.min).toBe(1);
    });

    it("reflects max", async () => {
      numericInput.setAttribute("max", "1");
      await delay();
      expect(numericInput.max).toBe(1);
    });

    it("reflects value", async () => {
      numericInput.setAttribute("min", "1");
      numericInput.setAttribute("max", "123");
      numericInput.setAttribute("value", "100");
      await delay();
      expect(numericInput.value).toBe(100);
    });

    it("sets maxlength from max", async () => {
      numericInput.setAttribute("max", "12345");
      await delay();
      expect(input.maxLength).toBe(5);
    });
  });

  describe("validates user input", () => {
    it("allows numeric inputs", async () => {
      numericInput.max = 123;
      input.value = "99";
      input.dispatchEvent(new Event("input"));
      expect(input.checkValidity()).toBe(true);
    });

    it("disallows numeric inputs not in range", () => {
      const oobValues = ["-1", "124", "-32"];
      numericInput.max = 123;
      oobValues.forEach((oobValue) => {
        input.value = oobValue;
        input.dispatchEvent(new Event("input"));
        expect(input.checkValidity()).toBe(false);
      });
    });

    it("disallows non-numeric inputs", () => {
      const nonNumericValues = ["99a", "foo", "+3-"];
      numericInput.max = 123;
      nonNumericValues.forEach((oobValue) => {
        input.value = oobValue;
        input.dispatchEvent(new Event("input"));
        expect(input.checkValidity()).toBe(false);
      });
    });
  });

  it("accepts valid user input", () => {
    numericInput.max = 123;
    input.focus();
    input.value = "99";
    input.blur();
    expect(numericInput.value).toBe(99);
  });

  it("keeps the last value with invalid user input", () => {
    const invalidValues = ["-1", "99a", "foo"];
    numericInput.max = 123;
    input.focus();
    input.value = "99";
    input.blur();
    invalidValues.forEach((invalidValue) => {
      input.focus();
      input.value = invalidValue;
      input.blur();
      expect(numericInput.value).toBe(99);
    });
  });

  describe("navigates between inputs in group", () => {
    function pressKey(element: HTMLElement, key: string) {
      element.dispatchEvent(new KeyboardEvent("keydown", { key }));
      element.dispatchEvent(new KeyboardEvent("keyup", { key }));
    }

    beforeEach(async () => {
      while (numericInputs.length > 0) numericInputs.pop()?.remove();
      for (let i = 0; i < 3; i++) {
        const curNumericInput = document.createElement("numeric-input");
        curNumericInput.max = 123;
        curNumericInput.group = kTestGroup;
        numericInputs.push(curNumericInput);
        document.body.appendChild(curNumericInput);
      }
      await delay();
      inputs = document.body.querySelectorAll("numeric-input input");
      inputs.forEach((curInput) => {
        /* eslint-disable no-param-reassign */
        curInput.focus();
        curInput.value = "123";
        curInput.blur();
      });
    });

    describe("navigates to next input", () => {
      it("on Enter key", () => {
        inputs[0].focus();
        pressKey(inputs[0], "Enter");
        expect(document.activeElement).toStrictEqual(inputs[1]);
      });

      it("current input is full and cursor is at end", () => {
        inputs[0].focus();
        inputs[0].selectionStart = inputs[0].maxLength;
        inputs[0].selectionEnd = inputs[0].maxLength;
        inputs[0].dispatchEvent(new Event("input"));
        expect(document.activeElement).toStrictEqual(inputs[1]);
      });

      it("does nothing if current input is also final input", () => {
        inputs[2].focus();
        inputs[2].selectionStart = inputs[2].maxLength;
        inputs[2].selectionEnd = inputs[2].maxLength;
        inputs[2].dispatchEvent(new Event("input"));
        expect(document.activeElement).toStrictEqual(inputs[2]);
      });
    });

    describe("navigates to previous input", () => {
      it("on two Backspace if current input is empty", () => {
        inputs[1].focus();
        inputs[1].value = "";
        pressKey(inputs[1], "Backspace");
        pressKey(inputs[1], "Backspace");
        expect(document.activeElement).toStrictEqual(inputs[0]);
      });

      it("resets count of Backspace on blur", () => {
        inputs[2].focus();
        inputs[2].value = "";
        pressKey(inputs[2], "Backspace");
        inputs[2].blur();
        inputs[2].focus();
        pressKey(inputs[2], "Backspace");
        expect(document.activeElement).toStrictEqual(inputs[2]);
        pressKey(inputs[2], "Backspace");
        expect(document.activeElement).toStrictEqual(inputs[1]);
      });

      it("does nothing on one Backspace", () => {
        inputs[1].focus();
        inputs[1].value = "";
        pressKey(inputs[1], "Backspace");
        expect(document.activeElement).toStrictEqual(inputs[1]);
      });

      it("does nothing if current input is also first input", () => {
        inputs[0].focus();
        inputs[0].value = "";
        pressKey(inputs[0], "Backspace");
        pressKey(inputs[0], "Backspace");
        expect(document.activeElement).toStrictEqual(inputs[0]);
      });
    });
  });
});
