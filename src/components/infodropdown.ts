import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { svgIcons } from "../shared/icons";
import BaseElement, { stringArrayConverter } from "../shared/element";

@customElement("info-dropdown")
export class InfoDropdown extends BaseElement {
  @property({ converter: stringArrayConverter, reflect: true })
  accessor classes: string[] = [];

  content = html``;

  protected render() {
    const entries = this.classes.map((cls) => [cls, true]);
    const classes = classMap(Object.fromEntries(entries));
    return html`
      <div class="dropdown">
        <button
          class="btn btn-ghost btn-circle btn-sm hover:bg-transparent text-info"
        >
          ${svgIcons.info}
        </button>
        <div
          class="dropdown-content flex flex-col p-3 z-[1] drop-shadow bg-base-200 rounded-box w-max ${classes}"
        >
          ${this.content}
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
