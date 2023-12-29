import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import { getAppSetting, setAppSetting } from "../shared/appsettings";
import BaseElement, { registerEventHandler } from "../shared/element";
import {
  LocaleSettingEvent,
  ReadyBusyEvent,
  SettingsEvent,
} from "../shared/events";
import { defaultLocale, knownLocales } from "../shared/locales";

@customElement("locale-settings")
export class LocaleSettings extends BaseElement {
  @property({ type: String, reflect: true })
  accessor locale = defaultLocale;

  #dropdownRef = createRef<HTMLDetailsElement>();

  @registerEventHandler(SettingsEvent)
  handleSettings(eventType: string) {
    if (eventType === "save") this.#saveSettings();
    this.#closeDropdown();
  }

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.#getSettings();
  }

  @registerEventHandler(LocaleSettingEvent)
  handleLocaleSetting(type: string, value?: string) {
    if (type === "set") {
      this.locale = value!;
      this.#closeDropdown();
    }
  }

  #getSettings() {
    this.locale = getAppSetting("locale");
    this.publishEvent(LocaleSettingEvent, "set", this.locale);
  }

  #saveSettings() {
    setAppSetting("locale", this.locale);
  }

  #clickDropdown() {
    const dropdown = this.#dropdownRef.value;
    if (dropdown == null) return;

    const isOpen = !dropdown.hasAttribute("open");
    this.publishEvent(LocaleSettingEvent, isOpen ? "open" : "close");
  }

  #closeDropdown() {
    /* Call removeAttribute() async as a workaround for a visual bug. */
    const dropdown = this.#dropdownRef.value;
    setTimeout(() => dropdown?.removeAttribute("open"));
    this.publishEvent(LocaleSettingEvent, "close");
  }

  protected render() {
    const displayName = knownLocales[this.locale]?.[0] ?? "Unknown locale";

    return html`
      <div class="flex flex-col">
        <div class="flex items-center h-12">
          <h3 class="font-bold text-lg sm:text-xl">Locale</h3>

          <info-dropdown
            class="grow"
            classes="max-w-[9rem] min-[360px]:max-w-[17rem]"
            .content=${html`
              <h4 class="font-bold">Locale</h4>
              <span class="text-sm float-left">
                Changes how time is displayed.
              </span>
            `}
          ></info-dropdown>

          <details ${ref(this.#dropdownRef)} class="dropdown">
            <summary
              class="btn btn-ghost hover:bg-transparent dropdown-arrow flex-nowrap after:shrink-0"
              @click=${this.#clickDropdown}
            >
              <span class="text-right">${displayName}</span>
            </summary>
          </details>
        </div>

        <locale-searchbox></locale-searchbox>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "locale-settings": LocaleSettings;
  }
}
