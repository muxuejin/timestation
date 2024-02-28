import { html } from "lit";
import { customElement, state } from "lit/decorators.js";

import "@components/animatedbackground";
import "@components/indicatoricon";
import "@components/infodropdown";
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

const kDelayMs = 8000;

@customElement("time-signal")
export class TimeSignal extends BaseElement {
  @state()
  private accessor showError = false;

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
      this.publish(ReadyBusyEvent, this.#settingsReady);
      clearTimeout(this.#timeoutId);
    }
  }

  connectedCallback() {
    super.connectedCallback();

    this.#timeoutId = setTimeout(() => {
      if (!checkBrowserSupport()) this.showError = true;
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
    const contents =
      this.showError ?
        html`
          <div
            class="[@media((min-width:800px)_and_(max-height:600px))]:col-span-2"
          >
            <span class="font-bold text-center text-lg sm:text-2xl">
              Something went wrong!
            </span>
            <span class="w-36 h-36 sm:w-48 sm:h-48 drop-shadow-aura">
              ${svgIcons.sad}
            </span>
            <span class="font-bold text-center text-lg sm:text-2xl">
              Try reloading this page.
            </span>
          </div>
        `
      : html`
          <transmit-clock></transmit-clock>
          <indicator-icon
            class="[@media((min-width:800px)_and_(max-height:600px))]:col-start-2"
          ></indicator-icon>
          <start-stop-button
            class="[@media((min-width:800px)_and_(max-height:600px))]:col-span-2"
          ></start-stop-button>
        `;

    return html`
      <animated-background></animated-background>

      <nav-bar></nav-bar>

      <div
        class="flex justify-center my-8 [@media(((max-width:639px)_and_(min_height:600px)_or_(min-height:640px))]:my-12 [@media(((min-width:800px)_and_(max-height:600px))_or_(min-height:720px))]:my-16"
      >
        <div
          class="grid grid-cols-1 [@media((min-width:800px)_and_(max-height:600px))]:grid-cols-fit place-items-center gap-4 [@media((max-width:639px)_and_(min-height:512px))]:gap-8 [@media((max-width:639px)_and_(min-height:640px))]:gap-12 [@media(((min-width:800px)_and_(max-height:600px))_or_(min-height:800px))]:gap-16"
        >
          ${contents}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "time-signal": TimeSignal;
  }
}
