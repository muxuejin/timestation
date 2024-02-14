import { html } from "lit";
import { customElement } from "lit/decorators.js";
import "./components/animatedbackground";
import "./components/indicatoricon";
import "./components/infodropdown";
import "./components/navbar";
import "./components/startstopbutton";
import "./components/transmitclock";
import AppSettings from "./shared/appsettings";
import BaseElement, { registerEventHandler } from "./shared/element";
import {
  EditDistanceReadyEvent,
  ReadyBusyEvent,
  ServerTimeReadyEvent,
  SettingsReadyEvent,
  TimeSignalReadyEvent,
} from "./shared/events";
import serverTimeTask from "./shared/servertime";
import "./shared/styles.css";

@customElement("time-signal")
export class TimeSignal extends BaseElement {
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
    if (prereqsReady) this.publish(ReadyBusyEvent, this.#settingsReady);
  }

  connectedCallback() {
    super.connectedCallback();
    if (AppSettings.get("sync")) serverTimeTask();
    else this.#serverTimeReady = true;
  }

  protected render() {
    return html`
      <animated-background></animated-background>

      <nav-bar></nav-bar>

      <div class="flex justify-center items-center w-screen py-8 sm:py-16">
        <div class="flex flex-col items-center gap-4">
          <transmit-clock></transmit-clock>
          <indicator-icon></indicator-icon>
          <start-stop-button></start-stop-button>
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
