import { html, svg } from "lit";
import { customElement, state } from "lit/decorators.js";

import BaseElement from "@shared/element";

const kSvgFragments = [
  svg`<rect width="1" height="2" x="8" y="6" fill="#000000"/>`,
  svg`<rect width="1" height="1" x="9" y="7" fill="#000000"/><rect width="1" height="1" x="10" y="6" fill="#000000"/>`,
  svg`<rect width="2" height="1" x="9" y="8" fill="#000000"/>`,
  svg`<rect width="1" height="1" x="9" y="9" fill="#000000"/>`,
  svg`<rect width="1" height="2" x="8" y="9" fill="#000000"/>`,
  svg`<rect width="1" height="1" x="6" y="10" fill="#000000"/><rect width="1" height="1" x="7" y="9" fill="#000000"/>`,
  svg`<rect width="1" height="1" x="5" y="8" fill="#000000"/>`,
  svg`<rect width="1" height="1" x="6" y="6" fill="#000000"/><rect width="1" height="1" x="7" y="7" fill="#000000"/>`,
] as const;

const kDelayMs = 250 as const;

@customElement("loading-icon")
export class LoadingIcon extends BaseElement {
  @state()
  private accessor iconState = 0;

  #timeoutId?: ReturnType<typeof setTimeout>;

  #updateIcon = (iconState: number) => {
    const nextIconState = (iconState + 1) % kSvgFragments.length;
    this.#timeoutId = setTimeout(this.#updateIcon, kDelayMs, nextIconState);
    this.iconState = iconState;
  };

  connectedCallback() {
    super.connectedCallback();
    this.#updateIcon(0);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.#timeoutId);
  }

  protected render() {
    return html`
      <div
        class="grid size-full place-items-center fill-current drop-shadow-aura"
      >
        <svg
          class="size-full"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
        >
          <rect width="6" height="8" x="5" y="4" fill="#fefefe" />
          <rect width="8" height="6" x="4" y="5" fill="#fefefe" />
          <rect width="1" height="6" x="3" y="5" fill="#000000" />
          <rect width="1" height="1" x="4" y="4" fill="#000000" />
          <rect width="1" height="1" x="4" y="11" fill="#000000" />
          <rect width="6" height="4" x="5" y="0" fill="#000000" />
          <rect width="6" height="4" x="5" y="12" fill="#000000" />
          <rect width="3" height="1" x="6" y="8" fill="#000000" />
          <rect width="1" height="1" x="11" y="4" fill="#000000" />
          <rect width="1" height="1" x="11" y="11" fill="#000000" />
          <rect width="1" height="6" x="12" y="5" fill="#000000" />
          <rect width="1" height="2" x="13" y="7" fill="#000000" />
          ${kSvgFragments[this.iconState]}
        </svg>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "loading-icon": LoadingIcon;
  }
}
