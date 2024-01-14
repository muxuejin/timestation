import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { getAppSetting, setAppSetting } from "../shared/appsettings";
import BaseElement, { registerEventHandler } from "../shared/element";
import { ReadyBusyEvent, SettingsEvent } from "../shared/events";

@customElement("server-time-settings")
export class ServerTimeSettings extends BaseElement {
  @property({ type: Boolean, reflect: true })
  accessor sync = true;

  @registerEventHandler(SettingsEvent)
  handleSettings(eventType: string) {
    if (eventType === "save") this.#saveSettings();
  }

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.#getSettings();
  }

  #getSettings() {
    this.sync = getAppSetting("sync");
  }

  #saveSettings() {
    setAppSetting("sync", this.sync);
  }

  #clickCheckbox() {
    this.sync = !this.sync;
  }

  protected render() {
    return html`
      <div class="flex flex-col">
        <div class="flex items-center h-12">
          <h3 class="font-bold text-lg sm:text-xl">Sync time</h3>

          <info-dropdown
            class="grow"
            classes="max-w-[11rem] min-[420px]:max-w-[20rem]"
            .content=${html`
              <h4 class="font-bold">Sync time</h4>
              <span class="text-sm float-left">
                Sync time with server on next page reload.
              </span>
            `}
          ></info-dropdown>

          <input
            class="checkbox mr-2"
            type="checkbox"
            name="noclip"
            .checked=${this.sync}
            @click=${this.#clickCheckbox}
          />
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "server-time-settings": ServerTimeSettings;
  }
}
