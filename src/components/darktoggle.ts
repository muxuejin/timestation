import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import AppSettings from "@shared/appsettings";
import BaseElement, { registerEventHandler } from "@shared/element";
import { ReadyBusyEvent } from "@shared/events";
import { svgIcons } from "@shared/icons";

@customElement("dark-toggle")
export class DarkToggle extends BaseElement {
  @property({ type: Boolean, reflect: true })
  accessor dark = AppSettings.get("dark");

  @query("dark-toggle input.theme-controller", true)
  private accessor checkbox!: HTMLInputElement;

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.dark = AppSettings.get("dark");
  }

  #change() {
    this.dark = this.checkbox.checked;
    AppSettings.set("dark", this.dark);
  }

  protected render() {
    return html`
      <label
        class="swap swap-rotate [&:not(:hover)]:text-secondary hover:animate-boingo"
      >
        <input
          class="theme-controller"
          type="checkbox"
          value="darkish"
          @change=${this.#change}
          .checked=${this.dark}
        />
        <span class="swap-off w-6 h-6 sm:w-8 sm:h-8">${svgIcons.sun}</span>
        <span class="swap-on w-6 h-6 sm:w-8 sm:h-8">${svgIcons.moon}</span>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dark-toggle": DarkToggle;
  }
}
