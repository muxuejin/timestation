import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { ref } from "lit/directives/ref.js";

import BaseElement from "@shared/element";
import Rng from "@shared/rng";

const kShapeCount = 64 as const;
const kRngs = {
  left: new Rng(1, 100),
  bottom: new Rng(-100, -1),
  size: new Rng(2, 32, 6, 12),
  duration: new Rng(32, 128, 56, 16),
} as const;

@customElement("animated-background")
export class AnimatedBackground extends BaseElement {
  #shapeTemplates = new Array<ReturnType<typeof html>>(kShapeCount);

  #initShape = (element: Element | undefined) => {
    if (element == null) return;

    const li = element as HTMLSpanElement;
    li.style.left = `${kRngs.left.next()}%`;
    li.style.bottom = `${kRngs.bottom.next()}%`;
    li.style.width = `${kRngs.size.next()}px`;
    li.style.height = li.style.width;
    li.style.animationDuration = `${kRngs.duration.next()}s`;
  };

  connectedCallback() {
    super.connectedCallback();
    for (let i = 0; i < kShapeCount; i++) {
      this.#shapeTemplates[i] = html`
        <span
          ${ref(this.#initShape)}
          class="absolute bg-neutral-content animate-shapes rounded-full blur-lg"
        ></span>
      `;
    }
  }

  protected render() {
    return html`
      <span
        class="bg-gradient-to-b from-base-100 to-primary from-[4rem] sm:from-[5rem] fixed w-full h-full overflow-hidden"
      >
        ${this.#shapeTemplates}
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "animated-background": AnimatedBackground;
  }
}
