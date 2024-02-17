import { html } from "lit";
import { customElement, query, state } from "lit/decorators.js";

import "@components/menulist";
import { MenuList } from "@components/menulist";

import BaseElement, { registerEventHandler } from "@shared/element";
import {
  ArrowDropdownEvent,
  LocaleSettingsEvent,
  MenuListSelectEvent,
} from "@shared/events";
import { LocaleSettingsGroup } from "@shared/groups";
import LocaleEditDistance from "@shared/localeeditdistance";
import {
  defaultLocale,
  knownLocales,
  maxLocaleNameCodeUnits,
  supportedLocales,
} from "@shared/locales";

@customElement("locale-searchbox")
export class LocaleSearchbox extends BaseElement {
  @state()
  private accessor locale: string = defaultLocale;

  @query('locale-searchbox input[type="search"].input', true)
  private accessor searchBox!: HTMLInputElement;

  @query("locale-searchbox menu-list", true)
  private accessor suggestions!: MenuList;

  #isSuggestionsMousedown = false;

  @registerEventHandler(ArrowDropdownEvent)
  handleArrowDropdown(group: string, value: boolean) {
    if (group === LocaleSettingsGroup && value) this.#clearInput();
    if (!value) this.#isSuggestionsMousedown = false;
  }

  @registerEventHandler(LocaleSettingsEvent)
  handleLocaleSetting(value: string) {
    this.locale = value;
  }

  @registerEventHandler(MenuListSelectEvent)
  handleMenuListSelect(group: string, tag: string) {
    if (group === LocaleSettingsGroup) this.publish(LocaleSettingsEvent, tag);
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("mouseup", this.#refocusSuggestions);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("mouseup", this.#refocusSuggestions);
  }

  #input() {
    const text = this.searchBox.value;
    if (text.length > 0) this.#runQuery(text);
    else this.#closeSuggestions();
  }

  #clearInput() {
    this.searchBox.value = "";
    this.#closeSuggestions();
  }

  #keydown(event: KeyboardEvent) {
    this.suggestions.keydown(event);
  }

  #blur() {
    if (!this.#isSuggestionsMousedown) this.#clearInput();
  }

  #resetLocale() {
    this.publish(LocaleSettingsEvent, defaultLocale);
  }

  #mousedownSuggestions() {
    this.#isSuggestionsMousedown = true;
  }

  #refocusSuggestions = () => {
    if (this.#isSuggestionsMousedown) this.searchBox.focus();
    this.#isSuggestionsMousedown = false;
  };

  #closeSuggestions() {
    this.suggestions.enabledItems = [];
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
    const searchQuery = text.slice(0, maxLocaleNameCodeUnits);
    if (this.suggestions.items.length === 0)
      this.suggestions.items = supportedLocales;
    this.suggestions.enabledItems = LocaleEditDistance.runQuery(searchQuery);
    this.requestUpdate();
  }

  protected render() {
    return html`
      <div class="flex mr-2 mb-2 label-text">
        <span class="grow font-semibold">Current locale:</span>
        <span class="font-medium">${this.locale}</span>
      </div>

      <div class="join join-focus-within w-full">
        <input
          class="input border-0 focus-within:outline-none w-full font-semibold placeholder:text-sm sm:placeholder:text-md"
          type="search"
          title="BCP47-like locale tag, native language/region name"
          placeholder="en-US / 日本語 / Perú..."
          maxlength=${maxLocaleNameCodeUnits}
          @input=${this.#input}
          @keydown=${{
            handleEvent: (event: KeyboardEvent) => this.#keydown(event),
            capture: true,
          }}
          @blur=${this.#blur}
        />

        <button class="join-item btn ms-0" @click=${this.#resetLocale}>
          Reset
        </button>
      </div>

      <menu-list
        classes="menu flex-nowrap drop-shadow z-[1] mt-1 pt-0 w-full bg-base-200 absolute max-h-[13.5rem] overflow-auto rounded-box rounded-t-none"
        itemclasses="flex"
        .group=${LocaleSettingsGroup}
        .itemTemplate=${this.#makeSuggestion}
        @mousedown=${this.#mousedownSuggestions}
      ></menu-list>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "locale-searchbox": LocaleSearchbox;
  }
}
