import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { Ref, createRef, ref } from "lit/directives/ref.js";
import { ItemTemplate, repeat } from "lit/directives/repeat.js";

import BaseElement, { stringArrayConverter } from "@shared/element";
import { MenuListSelectEvent } from "@shared/events";

export const MenuListPageStep = 6 as const;

@customElement("menu-list")
export class MenuList extends BaseElement {
  @property({ converter: stringArrayConverter, reflect: true })
  accessor classes: string[] = [];

  @property({ converter: stringArrayConverter, reflect: true })
  accessor itemClasses: string[] = [];

  @property({ type: Boolean, reflect: true })
  accessor spaceSelect = false;

  group = "";

  itemTemplate?: ItemTemplate<string>;

  set items(items: string[]) {
    this.#items = [...items];
    this.#itemIndex = Object.fromEntries(items.map((item, i) => [item, i]));
    this.#itemRef = Object.fromEntries(
      items.map((item) => [item, createRef<HTMLLIElement>()]),
    );
    this.enabledItems = undefined;
  }

  get items() {
    return this.#items;
  }

  #items: string[] = [];

  #itemIndex: Record<string, number> = {};

  #itemRef: Record<string, Ref<HTMLLIElement>> = {};

  set enabledItems(items: string[] | undefined) {
    this.#enabledItems =
      items == null ? undefined : (
        items.filter((item) => Object.hasOwn(this.#itemIndex, item))
      );
    this.#enabledItemIndex =
      items == null ? undefined : (
        Object.fromEntries(this.#enabledItems!.map((item, i) => [item, i]))
      );
    this.index = 0;
  }

  get enabledItems(): string[] {
    return this.#enabledItems != null ? this.#enabledItems : this.#items;
  }

  #enabledItems?: string[];

  #enabledItemIndex?: Record<string, number>;

  set item(item: string) {
    const itemIndex =
      this.#enabledItems != null ? this.#enabledItemIndex! : this.#itemIndex;
    if (!Object.hasOwn(itemIndex, item)) return;

    this.#item = item;
    this.index = itemIndex[item];
  }

  get item() {
    return this.#item;
  }

  #item = "";

  private set index(i: number) {
    const { length } = this.enabledItems;
    this.#index = i >= 0 && i < length ? i : -1;
    this.#scrollToCurrentItem();
    this.requestUpdate();
  }

  private get index() {
    return this.#index;
  }

  #index = -1;

  #mousedown(item: string) {
    this.item = item;
    if (this.group !== "") this.publish(MenuListSelectEvent, this.group, item);
  }

  #scrollToCurrentItem() {
    if (this.#index < 0) return;

    /* Call scrollIntoView() async to allow time for DOM to be created. */
    const item = this.enabledItems[this.index];
    const itemRef = this.#itemRef[item];

    setTimeout(() => {
      const itemElement = itemRef.value;
      itemElement?.scrollIntoView({ block: "nearest" });
      this.requestUpdate();
    });
  }

  keydown(event: KeyboardEvent) {
    const { length } = this.enabledItems;
    if (length === 0) return;

    const { ctrlKey, key, metaKey, shiftKey } = event;
    if (ctrlKey || metaKey || shiftKey) return;

    let i = this.index;
    const lastIndex = length - 1;

    switch (key) {
      case "ArrowUp":
        i--;
        break;
      case "ArrowDown":
        i++;
        break;
      case "PageUp":
        i = Math.max(0, i - MenuListPageStep);
        break;
      case "PageDown":
        i = Math.min(lastIndex, i + MenuListPageStep);
        break;
      case "Home":
        i = 0;
        break;
      case "End":
        i = lastIndex;
        break;
      case "Enter":
      case "Tab":
      case " ":
        if (key === " " && !this.spaceSelect) return;
        this.#mousedown(this.enabledItems[i]);
        break;
      default:
        return;
    }

    this.index = (i + length) % length;
    event.preventDefault();
  }

  protected render() {
    if (this.enabledItems.length === 0 || this.itemTemplate == null)
      return undefined;

    const entries = this.classes.map((cls) => [cls, true]);
    const classes = Object.fromEntries(entries);

    const itemEntries = this.itemClasses.map((cls) => [cls, true]);
    const itemClasses = Object.fromEntries(itemEntries);

    return html`<ul class=${classMap(classes)}>
      ${repeat(
        this.enabledItems,
        (item) => this.#itemIndex[item],
        (item, i) => html`
          <li ${ref(this.#itemRef[item])}>
            <button
              class="${classMap({ ...itemClasses, active: this.index === i })}"
              tabindex="-1"
              @mousedown=${() => this.#mousedown(item)}
            >
              ${this.itemTemplate!(item, i)}
            </button>
          </li>
        `,
      )}
    </ul>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menu-list": MenuList;
  }
}
