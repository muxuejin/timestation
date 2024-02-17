import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@components/aboutmodal";
import { AboutModal } from "@components/aboutmodal";

import "@shared/styles.css";

import { delay } from "@test/utils";

describe("About modal", () => {
  let aboutModal: AboutModal;
  let innerDialog: HTMLDialogElement;
  let inputs: NodeListOf<HTMLInputElement>;
  let dummyButton: HTMLButtonElement;
  let closeButton: HTMLButtonElement;

  beforeEach(async () => {
    aboutModal = document.createElement("about-modal");
    document.body.appendChild(aboutModal);
    await delay();
    innerDialog = aboutModal.querySelector("dialog")!;
    inputs = aboutModal.querySelectorAll("input");
    [dummyButton, closeButton] = aboutModal.querySelectorAll("button");
  });

  afterEach(() => {
    aboutModal.remove();
  });

  it("renders with a hidden dummy button", () => {
    expect(dummyButton.classList.length).toBe(0);
    expect(dummyButton.innerHTML).toBe("");
  });

  it("passes through call to showModal()", () => {
    const spy = vi.spyOn(innerDialog, "showModal");
    aboutModal.showModal();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("displays the first section when opened", () => {
    const firstInput = aboutModal.querySelector("input")!;
    aboutModal.showModal();
    expect(firstInput.checked).toBe(true);
  });

  it("switches between sections", () => {
    aboutModal.showModal();
    for (let i = 0; i < inputs.length; i++) {
      if (!inputs[i].checked) inputs[i].checked = true;
      for (let j = 0; j < inputs.length; j++)
        expect(inputs[j].checked).toBe(i === j);
    }
  });

  it("displays the first section when reopened", () => {
    aboutModal.showModal();
    inputs[inputs.length - 1].checked = true;
    expect(inputs[0].checked).toBe(false);
    closeButton.click();
    aboutModal.showModal();
    expect(inputs[0].checked).toBe(true);
  });
});
