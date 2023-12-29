import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getAppSetting, setAppSetting } from "../shared/appsettings";
import BaseElement, { registerEventHandler } from "../shared/element";
import { ReadyBusyEvent, SettingsEvent } from "../shared/events";

@customElement("clipping-settings")
export class ClippingSettings extends BaseElement {
  @property({ type: Boolean, reflect: true })
  accessor noclip = true;

  @registerEventHandler(SettingsEvent)
  handleSettings(eventType: string) {
    if (eventType === "save") this.#saveSettings();
  }

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.#getSettings();
  }

  #getSettings() {
    this.noclip = getAppSetting("noclip");
  }

  #saveSettings() {
    setAppSetting("noclip", this.noclip);
  }

  #clickCheckbox() {
    this.noclip = !this.noclip;
  }

  protected render() {
    return html`
      <div class="flex flex-col">
        <div class="flex items-center h-12">
          <h3 class="font-bold text-lg sm:text-xl">Noclip</h3>

          <info-dropdown
            class="grow"
            classes="max-w-[12rem] min-[420px]:max-w-[21rem]"
            .content=${html`
              <h4 class="font-bold">Noclip</h4>
              <span class="text-sm float-left">
                Prevents clipping, but may be less compatible.
              </span>
            `}
          ></info-dropdown>

          <input
            class="checkbox mr-2"
            type="checkbox"
            name="noclip"
            .checked=${this.noclip}
            @click=${this.#clickCheckbox}
          />
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "clipping-settings": ClippingSettings;
  }
}
