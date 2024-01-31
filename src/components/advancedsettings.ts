import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import AppSettings from "../shared/appsettings";
import BaseElement, { registerEventHandler } from "../shared/element";
import { ReadyBusyEvent, SettingsEvent } from "../shared/events";
import { ArrowDropdown } from "./arrowdropdown";

const kAdvancedSettingsGroup = "AdvancedSettings" as const;

@customElement("advanced-settings")
export class AdvancedSettings extends BaseElement {
  @property({ type: Boolean, reflect: true })
  accessor noclip = true;

  @property({ type: Boolean, reflect: true })
  accessor sync = true;

  #arrowDropdownRef = createRef<ArrowDropdown>();

  @registerEventHandler(SettingsEvent)
  handleSettings(eventType: string) {
    this.#closeArrowDropdown();
    if (eventType === "save") this.#saveSettings();
  }

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.#getSettings();
  }

  #getSettings() {
    this.noclip = AppSettings.get("noclip");
    this.sync = AppSettings.get("sync");
  }

  #saveSettings() {
    AppSettings.set("noclip", this.noclip);
    AppSettings.set("sync", this.sync);
  }

  #closeArrowDropdown() {
    const arrowDropdown = this.#arrowDropdownRef.value;
    if (arrowDropdown != null) arrowDropdown.open = false;
  }

  #changeNoclip = () => {
    this.noclip = !this.noclip;
  };

  #changeSync = () => {
    this.sync = !this.sync;
  };

  protected render() {
    return html`
      <div class="flex flex-col">
        <div class="flex items-center">
          <h3 class="grow font-bold text-lg sm:text-xl">Advanced</h3>

          <arrow-dropdown
            ${ref(this.#arrowDropdownRef)}
            classes="flex-nowrap after:shrink-0"
            .group=${kAdvancedSettingsGroup}
          ></arrow-dropdown>
        </div>

        <collapse-setting
          .group=${kAdvancedSettingsGroup}
          .content=${html`
            <div class="flex flex-col gap-4 mt-4 ml-2">
              <div class="flex items-center h-12">
                <h4 class="font-semibold sm:text-lg">Noclip</h4>

                <info-dropdown
                  class="grow"
                  classes="max-w-[12rem] min-[420px]:max-w-[21rem]"
                  .content=${html`
                    <h4 class="font-bold">Noclip</h4>
                    <span class="text-sm">
                      Prevents clipping, but may be less compatible.
                    </span>
                  `}
                  grow
                ></info-dropdown>

                <input
                  class="checkbox mr-2"
                  type="checkbox"
                  name="noclip"
                  @change=${this.#changeNoclip}
                  .checked=${this.noclip}
                />
              </div>

              <div class="flex items-center h-12">
                <h4 class="font-semibold sm:text-lg">Sync time</h4>

                <info-dropdown
                  class="grow"
                  classes="max-w-[11rem] min-[420px]:max-w-[20rem]"
                  .content=${html`
                    <h4 class="font-bold">Sync time</h4>
                    <span class="text-sm float-left">
                      Sync time with server on next page reload.
                    </span>
                  `}
                  grow
                ></info-dropdown>

                <input
                  class="checkbox mr-2"
                  type="checkbox"
                  name="sync"
                  @change=${this.#changeSync}
                  .checked=${this.sync}
                />
              </div>
            </div>
          `}
        ></collapse-setting>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "advanced-settings": AdvancedSettings;
  }
}
