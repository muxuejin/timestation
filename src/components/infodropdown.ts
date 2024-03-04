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
    return html`<span class="${grow} size-6">${svgIcons.info}</span>`;
  }

  protected render() {
    const end = classMap({ "dropdown-end": this.end });
    const entries = this.classes.map((cls) => [cls, true]);
    const classes = classMap(Object.fromEntries(entries));

    return html`
      <div class="${end} dropdown flex flex-col">
        <div
          class="btn btn-circle btn-ghost btn-sm text-info hover:bg-transparent"
          role="button"
          tabindex="0"
        >
          ${this.#makeIcon()}
        </div>
        <div class="block">
          <div
            class="${classes} dropdown-content z-[1] flex w-max flex-col text-balance rounded-box bg-base-200 p-3 drop-shadow"
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
