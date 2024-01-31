import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import BaseElement, { registerEventHandler } from "../shared/element";
import { svgIcons } from "../shared/icons";
import AppSettings from "../shared/appsettings";
import { ReadyBusyEvent } from "../shared/events";

@customElement("dark-toggle")
export class DarkToggle extends BaseElement {
  @state()
  accessor dark = AppSettings.get("dark");

  #checkboxRef = createRef<HTMLInputElement>();

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.dark = AppSettings.get("dark");
  }

  #change() {
    const checkbox = this.#checkboxRef.value!;
    AppSettings.set("dark", checkbox.checked);
    this.dark = checkbox.checked;
  }

  protected render() {
    return html`
      <label
        class="swap swap-rotate [&:not(:hover)]:text-secondary hover:animate-boingo"
      >
        <input
          ${ref(this.#checkboxRef)}
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
