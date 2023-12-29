import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import BaseElement, { registerEventHandler } from "../shared/element";
import { svgIcons } from "../shared/icons";
import { getAppSetting, setAppSetting } from "../shared/appsettings";
import { ReadyBusyEvent } from "../shared/events";

@customElement("dark-toggle")
export class DarkToggle extends BaseElement {
  @state()
  accessor dark = getAppSetting("dark");

  #checkboxRef = createRef<HTMLInputElement>();

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.dark = getAppSetting("dark");
  }

  #change() {
    const checkbox = this.#checkboxRef.value!;
    setAppSetting("dark", checkbox.checked);
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
        <span class="swap-off fill-current">${svgIcons.sun}</span>
        <span class="swap-on fill-current">${svgIcons.moon}</span>
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dark-toggle": DarkToggle;
  }
}
