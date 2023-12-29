import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { svgIcons } from "../shared/icons";
import BaseElement, { stringArrayConverter } from "../shared/element";

@customElement("sign-button")
export class SignButton extends BaseElement {
  @property({ converter: stringArrayConverter, reflect: true })
  accessor classes: string[] = [];

  @property({ type: Boolean, reflect: true })
  accessor negative = false;

  #click() {
    this.negative = !this.negative;
  }

  protected render() {
    const entries = this.classes.map((cls) => [cls, true]);
    const classes = classMap(Object.fromEntries(entries));
    return html`
      <button class=${classes} type="button" @click=${this.#click}>
        <span class="w-10 h-10">
          ${this.negative ? svgIcons.remove : svgIcons.add}
        </span>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "sign-button": SignButton;
  }
}
