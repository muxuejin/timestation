import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@components/settingsmodal";
import { SettingsModal } from "@components/settingsmodal";

import EventBus from "@shared/eventbus";
import { SettingsEvent, SettingsReadyEvent } from "@shared/events";
import "@shared/styles.css";

import { FakeAppSettings, delay } from "@test/utils";

describe("Settings modal", () => {
  let settingsModal: SettingsModal;
  let innerDialog: HTMLDialogElement;
  let buttons: NodeListOf<HTMLButtonElement>;
  let dummyButton: HTMLButtonElement;
  let resetButton: HTMLButtonElement;
  let saveButton: HTMLButtonElement;
  let cancelButton: HTMLButtonElement;

  beforeEach(async () => {
    settingsModal = document.createElement("settings-modal");
    document.body.appendChild(settingsModal);
    await delay();
    innerDialog = settingsModal.querySelector("dialog")!;
    buttons = innerDialog.querySelectorAll(".modal-box > form > button");
    [dummyButton, resetButton, saveButton, cancelButton] = buttons;
  });

  afterEach(() => {
    settingsModal.remove();
    FakeAppSettings.set.mockReset();
    FakeAppSettings.reset.mockReset();
  });

  it("renders with a hidden dummy button", () => {
    expect(dummyButton.classList.length).toBe(0);
    expect(dummyButton.innerHTML).toBe("");
  });

  it("passes through call to showModal()", () => {
    const spy = vi.spyOn(innerDialog, "showModal");
    settingsModal.showModal();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  describe("publishes SettingsReadyEvent", () => {
    const subscriber = {};
    const spy = vi.fn();

    beforeEach(() => {
      EventBus.subscribe(subscriber, SettingsReadyEvent, spy);
    });

    afterEach(() => {
      EventBus.unsubscribe(subscriber, SettingsReadyEvent);
      spy.mockReset();
    });

    it("when modal is shown", () => {
      settingsModal.showModal();
      expect(spy).toHaveBeenCalledWith(false);
    });

    it("when modal is closed", async () => {
      for (let i = 0; i < buttons.length; i++) {
        /* eslint-disable no-await-in-loop */
        settingsModal.showModal();
        spy.mockReset();
        buttons[i].click();
        await delay(50);
        expect(spy).toHaveBeenCalledWith(true);
      }
    });
  });

  describe("publishes SettingsEvent", () => {
    const subscriber = {};
    const spy = vi.fn();

    beforeEach(() => {
      EventBus.subscribe(subscriber, SettingsEvent, spy);
      settingsModal.showModal();
      spy.mockReset();
    });

    afterEach(() => {
      EventBus.unsubscribe(subscriber, SettingsEvent);
      spy.mockReset();
    });

    it("when modal is closed by reset button", async () => {
      resetButton.click();
      await delay();
      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith("close");
    });

    it("when modal is closed by cancel button", async () => {
      cancelButton.click();
      await delay();
      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledWith("close");
    });

    it("when modal is closed by save button", async () => {
      saveButton.click();
      await delay();
      expect(spy).toHaveBeenCalledTimes(2);
      expect(spy).toHaveBeenCalledWith("save");
      expect(spy).toHaveBeenLastCalledWith("close");
    });
  });
});
