import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import "@components/indicatoricon";
import "@components/infodropdown";
import "@components/loadingicon";
import "@components/navbar";
import "@components/startstopbutton";
import "@components/transmitclock";

import AppSettings from "@shared/appsettings";
import BaseElement, { registerEventHandler } from "@shared/element";
import {
  EditDistanceReadyEvent,
  ReadyBusyEvent,
  ServerTimeReadyEvent,
  SettingsReadyEvent,
  TimeSignalReadyEvent,
} from "@shared/events";
import { svgIcons } from "@shared/icons";
import serverTimeTask from "@shared/servertime";
import "@shared/styles.css";

type MainState = "loading" | "normal" | "error";

function registerServiceWorker() {
  navigator.serviceWorker
    .register("/sw.js", { scope: "/", type: "module" })
    .then((registration) => {
      if (registration.installing) {
        registration.installing.addEventListener("statechange", () => {
          window.location.reload();
        });
      }
    });
}

function checkBrowserSupport() {
  /*
   * Secure context: Necessary to enable most of these features
   * Service Worker: PWA and cross-origin isolation headers
   * WebAssembly: Edit distance computation and waveform generation
   * Audio Worklet: Waveform playback
   */
  if (
    !window.isSecureContext ||
    typeof navigator.serviceWorker === "undefined" ||
    typeof SharedArrayBuffer === "undefined" ||
    typeof AudioWorklet === "undefined"
  )
    return false;

  try {
    /* cf. https://stackoverflow.com/a/47880734 */
    const bytes = Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00);
    const module = new WebAssembly.Module(bytes);
    return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
  } catch {
    return false;
  }
}

const kDelayMs = 5000;

@customElement("time-signal")
export class TimeSignal extends BaseElement {
  @state()
  accessor mainState: MainState = "loading";

  #timeoutId?: ReturnType<typeof setTimeout>;

  #editDistanceReady = false;

  #serverTimeReady = false;

  #settingsReady = true;

  #timeSignalReady = false;

  @registerEventHandler(EditDistanceReadyEvent)
  handleEditDistanceReady() {
    this.#editDistanceReady = true;
    this.#notifyReadyBusy();
  }

  @registerEventHandler(ServerTimeReadyEvent)
  handleServerTimeReady() {
    this.#serverTimeReady = true;
    this.#notifyReadyBusy();
  }

  @registerEventHandler(SettingsReadyEvent)
  handleSettingsReady(ready: boolean) {
    this.#settingsReady = ready;
    this.#notifyReadyBusy();
  }

  @registerEventHandler(TimeSignalReadyEvent)
  handleTimeSignalReady() {
    this.#timeSignalReady = true;
    this.#notifyReadyBusy();
  }

  #notifyReadyBusy() {
    const wasmReady = this.#editDistanceReady && this.#timeSignalReady;
    const prereqsReady = wasmReady && this.#serverTimeReady;
    if (prereqsReady) {
      if (this.mainState === "loading") this.mainState = "normal";
      this.publish(ReadyBusyEvent, this.#settingsReady);
      clearTimeout(this.#timeoutId);
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this.#timeoutId = setTimeout(() => {
      if (!checkBrowserSupport()) this.mainState = "error";
    }, kDelayMs);

    if (import.meta.env.MODE === "production") registerServiceWorker();

    if (AppSettings.get("sync")) serverTimeTask();
    else this.#serverTimeReady = true;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.#timeoutId);
  }

  protected render() {
    const showIfLoading = classMap({ hidden: this.mainState !== "loading" });
    const showIfNormal = classMap({ hidden: this.mainState !== "normal" });
    const showIfError = classMap({ hidden: this.mainState !== "error" });

    /*
     * Unfortunately, adding a custom screen variant to Tailwind for the height
     * media query necessary for small widescreen breaks min-* and max-*, and
     * we are forced to make the query an arbitrary CSS value.
     * cf. https://github.com/tailwindlabs/tailwindcss/pull/9558#restrictions
     */

    return html`
      <div class="flex flex-col size-full absolute">
        <loading-icon class="m-auto size-1/2 ${showIfLoading}"></loading-icon>

        <div
          class="grid grid-cols-1 m-auto h-3/4 min-h-[408px] sm:min-h-[600px] [@media((min-width:640px)_and_(max-height:600px))]:grid-cols-fit [@media((min-width:640px)_and_(max-height:600px))]:auto-cols-min [@media((min-width:640px)_and_(max-height:600px))]:min-h-[400px] max-h-[960px] place-items-center ${showIfNormal}"
        >
          <span
            class="text-center align-text-bottom font-semibold text-2xl min-[480px]:text-3xl sm:text-4xl [@media((min-width:640px)_and_(max-height:600px))]:col-span-3"
          >
            Time Station Emulator
          </span>

          <transmit-clock
            class="[@media((min-width:640px)_and_(max-height:600px))]:col-span-3"
          ></transmit-clock>

          <!-- spacer -->
          <span
            class="[@media((max-width:639px)_or_(min-height:601px))]:hidden [@media((min-width:640px)_and_(max-height:600px))]:size-16 [@media((min-width:640px)_and_(max-height:600px))]:my-auto [@media((min-width:640px)_and_(max-height:600px))]:mr-4"
          ></span>

          <indicator-icon
            class="size-36 [@media((min-width:640px)_and_(max-height:600px))]:size-16 sm:size-48 [@media((min-width:640px)_and_(max-height:600px))]:col-start-3 [@media((min-width:640px)_and_(max-height:600px))]:place-self-start [@media((min-width:640px)_and_(max-height:600px))]:my-auto [@media((min-width:640px)_and_(max-height:600px))]:ml-4"
          ></indicator-icon>

          <start-stop-button
            class="[@media((min-width:640px)_and_(max-height:600px))]:row-start-3 [@media((min-width:640px)_and_(max-height:600px))]:col-start-2"
          ></start-stop-button>
        </div>

        <div
          class="grid m-auto h-1/2 min-h-[360px] place-items-center ${showIfError}"
        >
          <span class="font-bold text-center text-lg sm:text-2xl">
            Browser may be unsupported!
          </span>
          <span class="size-36 sm:size-48 drop-shadow-aura">
            ${svgIcons.sad}
          </span>
          <span class="font-bold text-center text-lg sm:text-2xl">
            Try reloading this page.
          </span>
        </div>
      </div>

      <nav-bar></nav-bar>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "time-signal": TimeSignal;
  }
}
