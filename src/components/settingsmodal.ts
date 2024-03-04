import { html } from "lit";
import { customElement, query } from "lit/decorators.js";

import "@components/advancedsettings";
import "@components/localesettings";
import "@components/offsetsettings";
import "@components/stationsettings";

import AppSettings from "@shared/appsettings";
import BaseElement from "@shared/element";
import { SettingsEvent, SettingsReadyEvent } from "@shared/events";

@customElement("settings-modal")
export class SettingsModal extends BaseElement {
  @query("settings-modal dialog.modal", true)
  private accessor dialog!: HTMLDialogElement;

  showModal() {
    this.publish(SettingsReadyEvent, false);
    this.dialog.showModal();
  }

  #closeModal() {
    this.publish(SettingsEvent, "close");
    this.publish(SettingsReadyEvent, true);
  }

  #clickSave() {
    this.publish(SettingsEvent, "save");
  }

  #clickReset() {
    AppSettings.reset();
  }

  protected render() {
    return html`
      <dialog
        class="modal modal-bottom sm:modal-middle"
        @close=${this.#closeModal}
      >
        <div class="modal-box flex max-h-screen flex-col gap-4">
          <form class="mb-8 flex items-center" method="dialog">
            <h3 class="grow text-xl font-bold sm:text-2xl">Settings</h3>

            <!-- Invisible dummy button takes autofocus when modal is opened -->
            <button></button>

            <button
              class="btn btn-ghost btn-sm hover:bg-transparent"
              @click=${this.#clickReset}
            >
              Reset All
            </button>
          </form>

          <locale-settings></locale-settings>
          <station-settings></station-settings>
          <offset-settings></offset-settings>
          <advanced-settings></advanced-settings>

          <form class="mt-8 flex items-center gap-4" method="dialog">
            <button class="btn ml-auto" @click=${this.#clickSave}>
              Save Settings
            </button>
            <button class="btn">Cancel</button>
          </form>
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "settings-modal": SettingsModal;
  }
}
