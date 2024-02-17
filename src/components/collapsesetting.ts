import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import BaseElement, { registerEventHandler } from "@shared/element";
import { ArrowDropdownEvent } from "@shared/events";

@customElement("collapse-setting")
export class CollapseSetting extends BaseElement {
  @property({ type: Boolean, reflect: true })
  set open(value: boolean) {
    if (!value) this.#focused = false;
    this.#open = value;
  }

  get open() {
    return this.#open;
  }

  #open = false;

  @registerEventHandler(ArrowDropdownEvent)
  handleArrowDropdown(group: string, value?: boolean) {
    if (group === this.group) this.open = value!;
  }

  group = "";

  set content(value: ReturnType<typeof html>) {
    this.#content = value;
    this.requestUpdate();
  }

  get content() {
    return this.#content;
  }

  #content = html``;

  #focusin() {
    this.#focused = true;
    this.requestUpdate();
  }

  #focused = false;

  protected render() {
    const collapseClasses = classMap({
      "overflow-visible": this.#focused,
      "collapse-open": this.open,
    });

    return html`
      <div class="collapse ${collapseClasses}">
        <div
          class="collapse-content !p-0 relative inline-block"
          @focusin=${this.#focusin}
        >
          ${this.content}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "collapse-setting": CollapseSetting;
  }
}
