import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { createRef, ref } from "lit/directives/ref.js";
import { resetAppSettings } from "../shared/appsettings";
import BaseElement, { registerEventHandler } from "../shared/element";
import { ReadyBusyEvent, SettingsEvent } from "../shared/events";
import { svgIcons } from "../shared/icons";

@customElement("settings-modal")
export class SettingsModal extends BaseElement {
  @state()
  private accessor ready = false;

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    this.ready = ready;
  }

  #dialogRef = createRef<HTMLDialogElement>();

  #showModal() {
    const dialog = this.#dialogRef.value!;
    dialog.showModal();
  }

  #closeModal() {
    this.publishEvent(SettingsEvent, "close");
    this.publishEvent(ReadyBusyEvent, true);
  }

  #clickIcon() {
    if (this.ready) {
      this.publishEvent(ReadyBusyEvent, false);
      this.#showModal();
    }
  }

  #clickSave() {
    this.publishEvent(SettingsEvent, "save");
  }

  protected render() {
    const iconClasses = classMap({
      "[&:not(:hover)]:text-secondary": this.ready,
      "hover:animate-boingo": this.ready,
      "cursor-pointer": this.ready,
      "cursor-default": !this.ready,
      "text-secondary": !this.ready,
    });

    return html`
      <div class=${iconClasses} @click=${this.#clickIcon}>
        <span class="fill-current">${svgIcons.settings}</span>
      </div>

      <dialog
        ${ref(this.#dialogRef)}
        class="modal modal-bottom sm:modal-middle"
        @close=${this.#closeModal}
      >
        <div class="modal-box max-h-screen flex flex-col gap-4">
          <form class="flex items-center pb-4" method="dialog">
            <h3 class="grow font-bold text-xl sm:text-2xl">Settings</h3>

            <!-- Invisible dummy button takes autofocus when modal is opened -->
            <button></button>

            <button
              class="btn btn-sm btn-ghost hover:bg-transparent"
              @click=${resetAppSettings}
            >
              Reset All
            </button>
          </form>

          <locale-settings></locale-settings>
          <station-settings></station-settings>
          <offset-settings></offset-settings>
          <clipping-settings></clipping-settings>

          <form class="flex gap-4 items-center pt-16" method="dialog">
            <div class="grow"></div>
            <button class="btn" @click=${this.#clickSave}>Save Settings</button>
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
