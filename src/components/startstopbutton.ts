import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

import AppSettings, {
  Station,
  knownJjyKhz,
  knownStations,
} from "@shared/appsettings";
import BaseElement, { registerEventHandler } from "@shared/element";
import {
  ReadyBusyEvent,
  ServerOffsetEvent,
  TimeSignalStateChangeEvent,
} from "@shared/events";
import RadioTimeSignal from "@shared/radiotimesignal";

const kStartStopButtonText = {
  stopped: "Start",
  starting: "Stop",
  started: "Stop",
  stopping: "Stopping",
} as const;

type StartStopButtonState = keyof typeof kStartStopButtonText;

@customElement("start-stop-button")
export class StartStopButton extends BaseElement {
  #serverOffset = 0;

  @state()
  private accessor ready = false;

  @state()
  private accessor station!: Station;

  get #state(): StartStopButtonState {
    switch (RadioTimeSignal.state) {
      case "idle":
        return "stopped";

      case "startup":
      case "reqparams":
      case "loadparams":
        return "starting";

      case "fadein":
      case "running":
      case "fadeout":
        return "started";

      case "suspend":
      default:
        return "stopping";
    }
  }

  #start() {
    RadioTimeSignal.start({
      stationIndex: knownStations.indexOf(AppSettings.get("station")),
      jjyKhzIndex: knownJjyKhz.indexOf(AppSettings.get("jjyKhz")),
      offset: AppSettings.get("offset") + this.#serverOffset,
      dut1: AppSettings.get("dut1"),
      noclip: AppSettings.get("noclip"),
    });
  }

  #stop() {
    RadioTimeSignal.stop();
  }

  #click() {
    if (this.#state === "stopped") this.#start();
    else this.#stop();
  }

  #getSettings() {
    this.station = AppSettings.get("station");
  }

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.#getSettings();
    else this.#stop();
    this.ready = ready;
  }

  @registerEventHandler(TimeSignalStateChangeEvent)
  handleTimeSignalStateChange() {
    this.requestUpdate();
  }

  @registerEventHandler(ServerOffsetEvent)
  handleServerOffset(serverOffset: number) {
    this.#serverOffset = serverOffset;
  }

  protected render() {
    const classes = classMap({
      "btn-success": this.ready && this.#state === "stopped",
      "btn-error":
        this.ready && (this.#state === "starting" || this.#state === "started"),
      "btn-disabled": !this.ready || this.#state === "stopping",
    });

    let buttonText = "loading";
    if (this.ready) {
      const stateText = kStartStopButtonText[this.#state];
      const station =
        this.station === "JJY" ?
          `${this.station}${AppSettings.get("jjyKhz")}`
        : this.station;
      buttonText = `${stateText} ${station}`;
    }

    return html`
      <button
        class="btn btn-md btn-wide sm:btn-lg sm:w-[24rem] drop-shadow ${classes}"
        @click=${this.#click}
      >
        ${buttonText}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "start-stop-button": StartStopButton;
  }
}
