import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { live } from "lit/directives/live.js";
import { createRef, ref } from "lit/directives/ref.js";

import BaseElement, { stringArrayConverter } from "@shared/element";

const kNdash = "\u{2013}" as const;
const kNumericRe = /^-?\d+$/;

@customElement("numeric-input")
export class NumericInput extends BaseElement {
  private static groups: Record<string, NumericInput[]> = {};

  @property({ converter: stringArrayConverter, reflect: true })
  accessor classes: string[] = [];

  @property({ type: Number, reflect: true })
  accessor value = NaN;

  @property({ type: Number, reflect: true })
  accessor min = 0;

  @property({ type: Number, reflect: true })
  accessor max = 0;

  group = "";

  #backspacedWhileEmpty = false;

  #ref = createRef<HTMLInputElement>();

  connectedCallback() {
    super.connectedCallback();
    if (!this.#isValid(this.value)) this.value = this.min;
    if (this.group !== "") {
      if (!Object.hasOwn(NumericInput.groups, this.group))
        NumericInput.groups[this.group] = [];
      NumericInput.groups[this.group].push(this);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.group !== "") {
      const index = NumericInput.groups[this.group].indexOf(this);
      NumericInput.groups[this.group].splice(index, 1);
      if (NumericInput.groups[this.group].length === 0)
        delete NumericInput.groups[this.group];
    }
  }

  focus() {
    const input = this.#ref.value;
    input?.focus();
  }

  #isValid(value = this.value) {
    return this.min <= value && value <= this.max;
  }

  #isValidText(text: string) {
    return kNumericRe.test(text) && this.#isValid(+text);
  }

  #keyup(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;

    const input = event.target as HTMLInputElement;
    const group = NumericInput.groups[this.group] ?? [];
    const index = group.indexOf(this);

    switch (event.key) {
      case "Backspace":
        if (index > 0 && input.value === "") {
          this.#backspacedWhileEmpty = !this.#backspacedWhileEmpty;
          if (!this.#backspacedWhileEmpty) group[index - 1].focus();
        }
        break;

      case "Enter":
        if (index < group.length - 1) group[index + 1].focus();
        else input.blur();
        break;

      default:
        break;
    }
  }

  #input() {
    const input = this.#ref.value!;
    if (!this.#isValidText(input.value)) {
      const error = `Input must be a number from ${this.min} to ${this.max}`;
      input.setCustomValidity(error);
      return;
    }

    input.setCustomValidity("");
    if (this.group === "") return;

    const isCursorAtEnd =
      input.value.length === input.maxLength &&
      input.selectionStart === input.maxLength &&
      input.selectionEnd === input.maxLength;
    if (!isCursorAtEnd) return;

    const group = NumericInput.groups[this.group];
    const index = group.indexOf(this);
    if (index < group.length - 1) group[index + 1].focus();
  }

  #focus() {
    const input = this.#ref.value!;
    input.select();
    this.#backspacedWhileEmpty = false;
  }

  #blur() {
    const input = this.#ref.value!;
    if (this.#isValidText(input.value)) this.value = +input.value;
    input.value = `${this.value}`;
    input.setCustomValidity("");
    input.reportValidity();
    this.#backspacedWhileEmpty = false;
  }

  protected render() {
    const entries = this.classes.map((cls) => [cls, true]);
    const classes = classMap(Object.fromEntries(entries));
    return html`
      <span
        class="tooltip tooltip-open tooltip-error before:[&:not(:has(input:invalid))]:opacity-0 after:[&:not(:has(input:invalid))]:opacity-0"
        data-tip=${`${this.min}${kNdash}${this.max}`}
      >
        <input
          ${ref(this.#ref)}
          class="${classes} invalid:text-error"
          type="text"
          inputmode="numeric"
          maxlength=${`${this.max}`.length}
          .value=${live(`${this.value}`)}
          @keyup=${this.#keyup}
          @input=${this.#input}
          @focus=${this.#focus}
          @blur=${this.#blur}
        />
      </span>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "numeric-input": NumericInput;
  }
}
