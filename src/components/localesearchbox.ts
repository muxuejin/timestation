import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import { classMap } from "lit/directives/class-map.js";
import BaseElement, { registerEventHandler } from "../shared/element";
import { LocaleSettingEvent, MenuListSelectEvent } from "../shared/events";
import LocaleEditDistance from "../shared/localeeditdistance";
import {
  defaultLocale,
  knownLocales,
  maxLocaleNameCodeUnits,
  supportedLocales,
} from "../shared/locales";
import { MenuList } from "./menulist";

@customElement("locale-searchbox")
export class LocaleSearchbox extends BaseElement {
  private static listId = "LocaleSearchbox";

  @state()
  private accessor locale: string = defaultLocale;

  @state()
  private accessor isOverflowVisible = false;

  @state()
  private set isCollapseOpen(value: boolean) {
    this.#isCollapseOpen = value;
    this.#clearInput();
    if (!value) this.isOverflowVisible = false;
  }

  private get isCollapseOpen() {
    return this.#isCollapseOpen;
  }

  #isCollapseOpen = false;

  #inputRef = createRef<HTMLInputElement>();

  #suggestionsRef = createRef<MenuList>();

  #isSuggestionsMousedown = false;

  @registerEventHandler(LocaleSettingEvent)
  handleLocaleSetting(eventType: string, value?: string) {
    if (eventType === "set") this.locale = value!;
    else if (eventType === "open") this.isCollapseOpen = true;
    else if (eventType === "close") this.isCollapseOpen = false;
  }

  @registerEventHandler(MenuListSelectEvent)
  handleMenuListSelect(listId: string, tag: string) {
    if (listId === LocaleSearchbox.listId) {
      this.publishEvent(LocaleSettingEvent, "set", tag);
      this.isCollapseOpen = false;
    }
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("mouseup", this.#refocusSuggestions);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("mouseup", this.#refocusSuggestions);
  }

  #focus() {
    this.isOverflowVisible = true;
  }

  #input() {
    const input = this.#inputRef.value!;
    const text = input.value;
    if (text.length > 0) this.#runQuery(text);
    else this.#closeSuggestions();
  }

  #clearInput() {
    const input = this.#inputRef.value;
    if (input != null) input.value = "";
    this.#closeSuggestions();
  }

  #keydown(event: KeyboardEvent) {
    const suggestions = this.#suggestionsRef.value;
    suggestions?.keydown(event);
  }

  #blur() {
    if (!this.#isSuggestionsMousedown) this.#clearInput();
  }

  #makeSuggestions() {
    return html`
      <menu-list
        ${ref(this.#suggestionsRef)}
        classes="menu flex-nowrap drop-shadow z-[1] mt-1 pt-0 w-full bg-base-200 absolute max-h-[13.5rem] overflow-auto rounded-box rounded-t-none"
        itemclasses="flex"
        .listId=${LocaleSearchbox.listId}
        .itemTemplate=${this.#makeSuggestion}
        @mousedown=${this.#mousedownSuggestions}
      ></menu-list>
    `;
  }

  #mousedownSuggestions() {
    this.#isSuggestionsMousedown = true;
  }

  #refocusSuggestions = () => {
    if (this.#isSuggestionsMousedown) {
      const input = this.#inputRef.value;
      input?.focus();
    }
    this.#isSuggestionsMousedown = false;
  };

  #closeSuggestions() {
    const suggestions = this.#suggestionsRef.value;
    if (suggestions != null) suggestions.enabledItems = [];
    this.#isSuggestionsMousedown = false;
  }

  #makeSuggestion = (tag: string) => {
    const name = knownLocales[tag][0];
    return html`
      <span class="flex grow items-center">
        <span class="grow text-sm font-semibold">${tag}</span>
        <span class="text-xs sm:text-sm text-end">${name}</span>
      </span>
    `;
  };

  #runQuery(text: string) {
    const query = text.slice(0, maxLocaleNameCodeUnits);
    const suggestions = this.#suggestionsRef?.value;
    if (suggestions != null) {
      if (suggestions.items.length === 0) suggestions.items = supportedLocales;
      suggestions.enabledItems = LocaleEditDistance.runQuery(query);
    }
    this.requestUpdate();
  }

  protected render() {
    const collapseClasses = classMap({
      "overflow-visible": this.isOverflowVisible,
      "collapse-open": this.isCollapseOpen,
    });

    return html`
      <div class="collapse ${collapseClasses}">
        <div class="collapse-content !p-0 relative inline-block">
          <div class="flex my-2 label-text">
            <span class="grow">Current locale:</span>
            ${this.locale}
          </div>

          <input
            ${ref(this.#inputRef)}
            class="input border-0 focus-within:outline-inherit w-full font-semibold placeholder:text-sm sm:placeholder:text-md"
            type="search"
            title="BCP47-like locale tag, language name, region name"
            placeholder="Enter 'en-US', '日本語', 'Perú', ..."
            maxlength=${maxLocaleNameCodeUnits}
            @focus=${this.#focus}
            @input=${this.#input}
            @keydown=${{
              handleEvent: (event: KeyboardEvent) => this.#keydown(event),
              capture: true,
            }}
            @blur=${this.#blur}
          />

          ${this.#makeSuggestions()}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "locale-searchbox": LocaleSearchbox;
  }
}
