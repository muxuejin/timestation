import { html } from "lit";
import { customElement } from "lit/decorators.js";
import BaseElement, { registerEventHandler } from "./shared/element";
import { EditDistanceReadyEvent, ReadyBusyEvent } from "./shared/events";

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
import "./components/settingsmodal";
import "./components/signbutton";
import "./components/startstopbutton";
import "./components/stationsettings";
import "./components/utcclock";

@customElement("time-signal")
export class TimeSignal extends BaseElement {
  #editDistanceReady = false;

  @registerEventHandler(EditDistanceReadyEvent)
  handleEditDistanceReady() {
    this.#editDistanceReady = true;
    this.#notifyReadyBusy();
  }

  #notifyReadyBusy() {
    if (this.#editDistanceReady) this.publishEvent(ReadyBusyEvent, true);
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
