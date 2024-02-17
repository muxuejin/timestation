import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@components/menulist";
import { MenuList, MenuListPageStep } from "@components/menulist";

import EventBus from "@shared/eventbus";
import { MenuListSelectEvent } from "@shared/events";
import "@shared/styles.css";

import { delay } from "@test/utils";

const kTestGroup = "TestGroup" as const;

describe("Menu list", () => {
  let menuList: MenuList;
  let ul: HTMLUListElement;
  let renderedItems: NodeListOf<HTMLLIElement>;
  let renderedItemButtons: NodeListOf<HTMLButtonElement>;
  let renderedTemplates: NodeListOf<HTMLHeadingElement>;

  function pressKeys(...keys: string[]) {
    keys.forEach((key) => {
      menuList.keydown(new KeyboardEvent("keydown", { key }));
    });
  }

  beforeEach(async () => {
    menuList = document.createElement("menu-list");
    menuList.setAttribute("classes", "foo bar");
    menuList.setAttribute("itemclasses", "baz qux");
    menuList.itemTemplate = (item: string) => html`<h1>${item}</h1>`;
    menuList.items = ["quux", "quuux", "quuuux"];
    document.body.appendChild(menuList);
    await delay();
    ul = menuList.querySelector("ul")!;
    renderedItems = menuList.querySelectorAll("li");
    renderedItemButtons = menuList.querySelectorAll("li button");
    renderedTemplates = menuList.querySelectorAll("h1");
  });

  afterEach(() => {
    menuList.remove();
  });

  it("renders with defaults", async () => {
    menuList.itemTemplate = undefined;
    menuList.items = [];
    await delay();
    expect(menuList.spaceSelect).toBe(false);
    expect(menuList.items.length).toBe(0);
    expect(menuList.enabledItems.length).toBe(0);
    expect(menuList.item).toBe("");
    expect(menuList.innerText).toBe("");
  });

  it("passes through its initial classes attribute", () => {
    expect(ul.classList).toContain("foo");
    expect(ul.classList).toContain("bar");
  });

  it("passes through its initial itemclasses attribute", () => {
    renderedItemButtons.forEach((renderedItemButton) => {
      expect(renderedItemButton.classList).toContain("baz");
      expect(renderedItemButton.classList).toContain("qux");
    });
  });

  it("enables and renders all items by default", () => {
    expect(menuList.items).toEqual(menuList.enabledItems);
    expect(renderedItems.length).toBe(menuList.items.length);
  });

  it("uses the specified template for rendering items", () => {
    menuList.enabledItems.forEach((item, i) => {
      expect(renderedTemplates[i].textContent).toBe(item);
    });
  });

  describe("reacts to property changes", () => {
    it("reflects spaceSelect", async () => {
      menuList.spaceSelect = true;
      await delay();
      expect(menuList.hasAttribute("spaceselect")).toBe(true);
    });
  });

  describe("reacts to attribute changes", () => {
    it("reflects spaceselect", () => {
      menuList.setAttribute("spaceselect", "");
      expect(menuList.spaceSelect).toBe(true);
    });
  });

  it("allows enabling only specific known items", async () => {
    menuList.enabledItems = ["quux", "foo", "quuuux"];
    expect(menuList.enabledItems).toEqual(["quux", "quuuux"]);
    await delay();
    renderedItems = menuList.querySelectorAll("li");
    expect(renderedItems.length).toBe(2);
  });

  describe("allows selecting an item", () => {
    const subscriber = {};
    const spy = vi.fn();

    beforeEach(() => {
      EventBus.subscribe(subscriber, MenuListSelectEvent, spy);
      menuList.group = kTestGroup;
    });

    afterEach(() => {
      EventBus.unsubscribe(subscriber, MenuListSelectEvent);
      spy.mockClear();
    });

    it("publishes MenuListSelectEvent", () => {
      const item = menuList.enabledItems[0];
      renderedItemButtons[0].dispatchEvent(new Event("mousedown"));
      expect(spy).toHaveBeenCalledWith(kTestGroup, item);
    });

    it("does not publish MenuListSelectEvent without a group", () => {
      menuList.group = "";
      renderedItemButtons[0].dispatchEvent(new Event("mousedown"));
      expect(spy).not.toHaveBeenCalled();
    });

    it("selects on Enter", () => {
      const item = menuList.enabledItems[0];
      pressKeys("Enter");
      expect(spy).toHaveBeenCalledWith(kTestGroup, item);
    });

    it("selects on Tab", () => {
      const item = menuList.enabledItems[0];
      pressKeys("Tab");
      expect(spy).toHaveBeenCalledWith(kTestGroup, item);
    });

    it("selects on space", () => {
      const item = menuList.enabledItems[0];
      menuList.spaceSelect = true;
      pressKeys(" ");
      expect(spy).toHaveBeenCalledWith(kTestGroup, item);
    });

    it("does not select on space without spaceSelect", () => {
      pressKeys(" ");
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("allows keyboard navigation", async () => {
    const items: string[] = [];
    const enabledItems: string[] = [];
    for (let i = 0; i < 100; i++) {
      /* eslint-disable no-bitwise */
      items.push(`${i}`);
      if ((i & 1) !== 0) enabledItems.push(`${i}`);
    }

    beforeEach(async () => {
      menuList.items = items;
      menuList.enabledItems = enabledItems;
      await delay();
      renderedItems = menuList.querySelectorAll("li");
      renderedItemButtons = menuList.querySelectorAll("li button");
    });

    it("wraps to last on ArrowUp", async () => {
      const lastButton = renderedItemButtons[enabledItems.length - 1];
      pressKeys("ArrowUp");
      await delay();
      expect(lastButton.classList).toContain("active");
    });

    it("wraps to first on ArrowDown", async () => {
      const secondButton = renderedItemButtons[1];
      pressKeys("ArrowUp", "ArrowDown", "ArrowDown");
      await delay();
      expect(secondButton.classList).toContain("active");
    });

    it("jumps towards first on PageUp", async () => {
      const secondButton = renderedItemButtons[1];
      for (let i = 0; i <= MenuListPageStep; i++) pressKeys("ArrowDown");
      pressKeys("PageUp");
      await delay();
      expect(secondButton.classList).toContain("active");
    });

    it("does not wrap to last on PageUp", async () => {
      const firstButton = renderedItemButtons[0];
      pressKeys("PageUp");
      await delay();
      expect(firstButton.classList).toContain("active");
    });

    it("jumps towards last on PageDown", async () => {
      const button = renderedItemButtons[MenuListPageStep];
      pressKeys("PageDown");
      await delay();
      expect(button.classList).toContain("active");
    });

    it("does not wrap to first on PageDown", async () => {
      const firstButton = renderedItemButtons[0];
      pressKeys("PageUp");
      await delay();
      expect(firstButton.classList).toContain("active");
    });

    it("jumps to first on Home", async () => {
      const firstButton = renderedItemButtons[0];
      pressKeys("ArrowDown", "PageDown", "Home");
      await delay();
      expect(firstButton.classList).toContain("active");
    });

    it("jumps to last on End", async () => {
      const lastButton = renderedItemButtons[enabledItems.length - 1];
      pressKeys("End");
      await delay();
      expect(lastButton.classList).toContain("active");
    });
  });
});
