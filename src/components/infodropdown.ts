import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import BaseElement, { stringArrayConverter } from "@shared/element";
import { svgIcons } from "@shared/icons";

@customElement("info-dropdown")
export class InfoDropdown extends BaseElement {
  @property({ converter: stringArrayConverter, reflect: true })
  accessor classes: string[] = [];

  @property({ type: Boolean, reflect: true })
  accessor grow = false;

  @property({ type: Boolean, reflect: true })
  accessor end = false;

  content = html``;

  #makeIcon() {
    const grow = classMap({ "sm:size-8": this.grow });
    return html`<span class="size-6 ${grow}">${svgIcons.info}</span>`;
  }

  protected render() {
    const end = classMap({ "dropdown-end": this.end });
    const entries = this.classes.map((cls) => [cls, true]);
    const classes = classMap(Object.fromEntries(entries));

    return html`
      <div class="dropdown flex flex-col ${end}">
        <div
          class="btn btn-ghost btn-circle btn-sm hover:bg-transparent text-info"
          role="button"
          tabindex="0"
        >
          ${this.#makeIcon()}
        </div>
        <div class="block">
          <div
            class="dropdown-content flex flex-col p-3 z-[1] drop-shadow bg-base-200 rounded-box w-max text-balance ${classes}"
          >
            ${this.content}
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "info-dropdown": InfoDropdown;
  }
}
