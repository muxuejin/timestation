import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { getAppSetting } from "./shared/appsettings";
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

import "./components/clippingsettings";
import "./components/darktoggle";
import "./components/indicatoricon";
import "./components/infodropdown";
import "./components/localesearchbox";
import "./components/localesettings";
import "./components/menulist";
import "./components/numericinput";
import "./components/offsetsettings";
import "./components/servertimesettings";
import "./components/settingsmodal";
import "./components/signbutton";
import "./components/startstopbutton";
import "./components/stationsettings";
import "./components/utcclock";

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
    if (prereqsReady) this.publishEvent(ReadyBusyEvent, this.#settingsReady);
  }

  connectedCallback() {
    super.connectedCallback();
    if (getAppSetting("sync")) serverTimeTask();
    else this.#serverTimeReady = true;
  }

  protected render() {
    return html`
      <div class="flex justify-center items-center w-screen h-screen">
        <div class="flex flex-col items-center gap-4">
          <div class="flex w-64 h-8 sm:w-[36rem] sm:h-16 gap-3 items-center">
            <span class="grow"></span>
            <settings-modal class="inline-flex items-center"></settings-modal>
            <dark-toggle class="inline-flex items-center"></dark-toggle>
          </div>

          <utc-clock></utc-clock>

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
