import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { createRef, ref } from "lit/directives/ref.js";
import BaseElement, { registerEventHandler } from "../shared/element";
import { ReadyBusyEvent } from "../shared/events";
import { svgIcons } from "../shared/icons";
import { SettingsModal } from "./settingsmodal";
import { AboutModal } from "./aboutmodal";

@customElement("nav-bar")
export class NavBar extends BaseElement {
  @state()
  private accessor ready = false;

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    this.ready = ready;
  }

  #dropdownRef = createRef<HTMLDetailsElement>();

  #aboutModalRef = createRef<AboutModal>();

  #settingsModalRef = createRef<SettingsModal>();

  #closeDropdown() {
    /* Call removeAttribute() async as a workaround for a visual bug. */
    const dropdown = this.#dropdownRef.value!;
    setTimeout(() => dropdown.removeAttribute("open"));
  }

  #clickAbout() {
    this.#closeDropdown();
    const aboutModal = this.#aboutModalRef.value;
    aboutModal?.showModal();
  }

  #clickSettings() {
    this.#closeDropdown();
    const settingsModal = this.#settingsModalRef.value;
    settingsModal?.showModal();
  }

  protected render() {
    const disabled = classMap({
      "pointer-events-none": !this.ready,
      "text-secondary": !this.ready,
    });

    return html`
      <div class="navbar sm:min-h-20">
        <div class="navbar-start">
          <details ${ref(this.#dropdownRef)} class="dropdown">
            <summary class="btn btn-ghost p-0 w-12 h-12 sm:w-16 sm:h-16">
              <span class="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-aura">
                ${svgIcons.menu}
              </span>
            </summary>
            <ul
              class="p-2 drop-shadow menu dropdown-content z-[1] bg-base-100 rounded-box font-medium sm:text-lg"
            >
              <li>
                <a class="px-1 sm:px-2" @click=${this.#clickAbout}>
                  <span class="flex sm:py-1 items-center">
                    <span class="w-6 h-6 sm:w-8 sm:h-8">${svgIcons.help}</span>
                    <span class="mx-2">About</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  class="px-1 sm:px-2 ${disabled}"
                  @click=${this.#clickSettings}
                >
                  <span class="flex sm:py-1 items-center">
                    <span class="w-6 h-6 sm:w-8 sm:h-8">
                      ${svgIcons.settings}
                    </span>
                    <span class="mx-2">Settings</span>
                  </span>
                </a>
              </li>
            </ul>
          </details>
        </div>

        <div class="navbar-center">
          <span
            class="font-serif text-xl min-[370px]:text-2xl min-[430px]:text-3xl min-[500px]:text-4xl sm:text-5xl inline-flex drop-shadow-aura align-text-bottom"
          >
            Time Station Emulator
          </span>
        </div>

        <div class="navbar-end">
          <dark-toggle class="pr-2 inline-flex drop-shadow-aura"></dark-toggle>
        </div>
      </div>

      <about-modal ${ref(this.#aboutModalRef)}></about-modal>
      <settings-modal ${ref(this.#settingsModalRef)}></settings-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "nav-bar": NavBar;
  }
}
