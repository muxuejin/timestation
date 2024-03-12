import { html } from "lit";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@components/toastmanager";
import { ToastManager } from "@components/toastmanager";

import EventBus from "@shared/eventbus";
import { ToastEvent } from "@shared/events";
import { svgIcons } from "@shared/icons";
import "@shared/styles.css";

import { delay, isSvgEqual } from "@test/utils";

const severityInfo = [
  ["info", svgIcons.info, "alert-info"],
  ["warning", svgIcons.warning, "alert-warning"],
  ["error", svgIcons.sad, "alert-error"],
] as const;

describe("Toast manager", () => {
  let toastManager: ToastManager;
  let toasts: NodeListOf<HTMLDivElement>;
  let toast: HTMLDivElement;
  let svg: SVGSVGElement;
  let content: HTMLSpanElement;
  let closeButton: HTMLButtonElement;

  function getToast(index = 0) {
    toasts = toastManager.querySelectorAll("div.alert");
    if (toasts.length === 0) return;
    toast = toasts[index];
    svg = toast.querySelector("svg")!;
    content = toast.querySelector("span.text-sm") as HTMLSpanElement;
    closeButton = toast.querySelector("button")!;
  }

  beforeEach(async () => {
    toastManager = document.createElement("toast-manager");
    document.body.appendChild(toastManager);
    await delay();
  });

  afterEach(() => {
    toastManager.remove();
  });

  it("renders with defaults", () => {
    getToast();
    expect(toasts.length).toBe(0);
  });

  describe("creates toasts", () => {
    it("one toast", async () => {
      toastManager.toast("error", "foo");
      await delay();
      getToast();
      expect(toasts.length).toBe(1);
      expect(content.innerText).toBe("foo");
    });

    it("one toast with HTML template", async () => {
      toastManager.toast("error", html`<h3>HTML</h3>`);
      await delay();
      getToast();
      expect(toasts.length).toBe(1);
      expect(content.innerHTML).toContain("<h3>HTML</h3>");
    });

    it("multiple toasts", async () => {
      toastManager.toast("info", "bar");
      toastManager.toast("warning", "baz");
      await delay();
      getToast();
      expect(toasts.length).toBe(2);
    });
  });

  describe("closes toasts on button click", () => {
    it("one toast", async () => {
      toastManager.toast("error", "qux");
      await delay();
      getToast();
      closeButton.click();
      await delay();
      getToast();
      expect(toasts.length).toBe(0);
    });

    it("arbitrary toast of several", async () => {
      toastManager.toast("error", "one");
      toastManager.toast("warning", "two");
      toastManager.toast("info", "three");
      toastManager.toast("error", "four");
      await delay();
      getToast(2);
      closeButton.click();
      await delay();
      getToast(0);
      expect(toasts.length).toBe(3);
      expect(content.innerText).toBe("one");
      getToast(1);
      expect(content.innerText).toBe("two");
      getToast(2);
      expect(content.innerText).toBe("four");
    });
  });

  describe("renders toasts according to severity", () => {
    describe.each(severityInfo)("%s", (severity, icon, alertClass) => {
      beforeEach(async () => {
        toastManager.toast(severity, "quux");
        await delay();
        getToast();
      });

      it("shows icon", () => {
        expect(isSvgEqual(svg, icon)).toBe(true);
      });

      it("has alert class", () => {
        expect(toast.classList).toContain(alertClass);
      });
    });
  });

  it("handles ToastManagerEvent", async () => {
    EventBus.publish(ToastEvent, "info", "quuux");
    await delay();
    getToast();
    expect(content.innerText).toBe("quuux");
  });
});
