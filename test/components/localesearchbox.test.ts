import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "@components/localesearchbox";
import { LocaleSearchbox } from "@components/localesearchbox";
import { MenuList } from "@components/menulist";

import EventBus from "@shared/eventbus";
import {
  ArrowDropdownEvent,
  LocaleSettingsEvent,
  MenuListSelectEvent,
} from "@shared/events";
import { LocaleSettingsGroup } from "@shared/groups";
import { defaultLocale, supportedLocales } from "@shared/locales";
import "@shared/styles.css";

import { delay } from "@test/utils";

describe("Locale searchbox", () => {
  let localeSearchbox: LocaleSearchbox;
  let localeTag: HTMLSpanElement;
  let searchBox: HTMLInputElement;
  let resetButton: HTMLButtonElement;
  let suggestions: MenuList;
  const userLocale = supportedLocales.at(-1)!;

  beforeEach(async () => {
    localeSearchbox = document.createElement("locale-searchbox");
    document.body.appendChild(localeSearchbox);
    await delay();
    localeTag = localeSearchbox.querySelector(
      "div.label-text span:last-of-type",
    )!;
    searchBox = localeSearchbox.querySelector("input.input")!;
    resetButton = localeSearchbox.querySelector("button")!;
    suggestions = localeSearchbox.querySelector("menu-list")!;
  });

  afterEach(() => {
    localeSearchbox.remove();
  });

  it("renders with defaults", () => {
    expect(localeTag.innerText).toBe(defaultLocale);
    expect(searchBox.value).toBe("");
    expect(suggestions.group).toBe(LocaleSettingsGroup); /* Is subcomponent. */
  });

  describe("handles ArrowDropdownEvent", () => {
    it("clears search box on true", () => {
      searchBox.value = "bar";
      EventBus.publish(ArrowDropdownEvent, LocaleSettingsGroup, true);
      expect(searchBox.value).toBe("");
    });
  });

  describe("handles MenuListSelectEvent", () => {
    const subscriber = {};
    const spy = vi.fn();

    beforeEach(() => {
      EventBus.subscribe(subscriber, LocaleSettingsEvent, spy);
    });

    afterEach(() => {
      EventBus.unsubscribe(subscriber, LocaleSettingsEvent);
      spy.mockClear();
    });

    it("publishes LocaleSettingsEvent", () => {
      EventBus.publish(MenuListSelectEvent, LocaleSettingsGroup, userLocale);
      expect(spy).toHaveBeenCalledWith(userLocale);
    });

    it("does not publish LocaleSettingsEvent without a group", () => {
      EventBus.publish(MenuListSelectEvent, "baz", userLocale);
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("handles LocaleSettingsEvent", () => {
    it("sets its locale tag from event data", async () => {
      EventBus.publish(LocaleSettingsEvent, userLocale);
      await delay();
      expect(localeTag.innerText).toBe(userLocale);
    });
  });

  describe("shows suggestions when a query is entered into the search box", () => {
    it("shows all supported locales with whitespace", async () => {
      /* eslint-disable no-await-in-loop */
      for (let i = 0; i < 10; i++) {
        searchBox.value += " ";
        searchBox.dispatchEvent(new Event("input"));
        await delay();
        const suggestionsLIs = localeSearchbox.querySelectorAll("menu-list li");
        expect(suggestionsLIs.length).toBe(supportedLocales.length);
      }
    });

    it("shows fewer suggestions with a more specific query", async () => {
      searchBox.value = "a";
      searchBox.dispatchEvent(new Event("input"));
      await delay();
      const suggestionsLIs = localeSearchbox.querySelectorAll("menu-list li");
      expect(suggestionsLIs.length).toBeLessThan(supportedLocales.length);
    });

    it("shows a single suggestion with a specific locale tag", async () => {
      searchBox.value = userLocale;
      searchBox.dispatchEvent(new Event("input"));
      await delay();
      const suggestionsLIs = localeSearchbox.querySelectorAll("menu-list li");
      expect(suggestionsLIs.length).toBe(1);
      expect(suggestionsLIs[0].textContent).toMatch(userLocale);
    });

    it("refocuses on search box if it loses focus to suggestions", async () => {
      searchBox.value = "a";
      searchBox.dispatchEvent(new Event("input"));
      await delay();
      suggestions.dispatchEvent(new Event("mousedown"));
      expect(document.activeElement).not.toStrictEqual(searchBox);
      suggestions.dispatchEvent(new Event("mouseup", { bubbles: true }));
      expect(document.activeElement).toStrictEqual(searchBox);
    });
  });

  it("restores default locale on reset button click", () => {
    EventBus.publish(LocaleSettingsEvent, supportedLocales.at(-1));
    resetButton.click();
    expect(localeTag.innerText).toBe(defaultLocale);
  });

  it("clears search box on blur", () => {
    searchBox.value = "foo";
    searchBox.dispatchEvent(new Event("blur"));
    expect(searchBox.value).toBe("");
  });
});
