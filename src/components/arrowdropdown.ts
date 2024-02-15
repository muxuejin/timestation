import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { createRef, ref } from "lit/directives/ref.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import BaseElement, { stringArrayConverter } from "../shared/element";
import { ArrowDropdownEvent } from "../shared/events";

@customElement("arrow-dropdown")
export class ArrowDropdown extends BaseElement {
  @property({ converter: stringArrayConverter, reflect: true })
  accessor classes: string[] = [];

  group = "";

  set text(value: ReturnType<typeof html> | string) {
    this.#text = value;
    this.requestUpdate();
  }

  get text() {
    return this.#text;
  }

  #text: ReturnType<typeof html> | string = "";

  #dropdownRef = createRef<HTMLDetailsElement>();

  @property({ type: Boolean, reflect: true })
  set open(value: boolean) {
    const isChange = this.#open !== value;
    this.#open = value;

    if (isChange && this.group !== "")
      this.publish(ArrowDropdownEvent, this.group, value);

    /*
     * The contained details element's "open" attribute should reflect ours.
     * We won't know if it needs some help to get there until later, though.
     */
    setTimeout(this.#reflectOpen);
  }

  get open() {
    return this.#open;
  }

  #open = false;

  #reflectOpen = () => {
    const dropdown = this.#dropdownRef.value;
    if (dropdown != null && this.open !== dropdown.hasAttribute("open")) {
      if (this.open) dropdown.setAttribute("open", "");
      else dropdown.removeAttribute("open");
    }
  };

  @property({ type: Boolean, reflect: true })
  accessor closeOnBlur = false;

  #blur() {
    if (this.closeOnBlur) this.open = false;
  }

  #click() {
    this.open = !this.open;
  }

  keydown: (event: KeyboardEvent) => void = () => {};

  content = html``;

  protected render() {
    const entries = this.classes.map((cls) => [cls, true]);
    const classes = classMap(Object.fromEntries(entries));

    return html`
      <details ${ref(this.#dropdownRef)} class="dropdown">
        <summary
          class="btn btn-ghost hover:bg-transparent dropdown-arrow ${classes}"
          @blur=${this.#blur}
          @click=${this.#click}
          @keydown=${{
            handleEvent: this.keydown,
            capture: true,
          }}
        >
          ${typeof this.text === "string" ? unsafeHTML(this.text) : this.text}
        </summary>

        ${this.content}
      </details>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "arrow-dropdown": ArrowDropdown;
  }
}
