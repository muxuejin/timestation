import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import BaseElement, { registerEventHandler } from "../shared/element";
import { svgIcons } from "../shared/icons";
import AppSettings from "../shared/appsettings";
import { ReadyBusyEvent } from "../shared/events";

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
        <span class="swap-off w-8 h-8 sm:w-10 sm:h-10">${svgIcons.sun}</span>
        <span class="swap-on w-8 h-8 sm:w-10 sm:h-10">${svgIcons.moon}</span>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dark-toggle": DarkToggle;
  }
}
