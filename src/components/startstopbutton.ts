import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import BaseElement, { registerEventHandler } from "../shared/element";
import { ReadyBusyEvent, TimeSignalStateChangeEvent } from "../shared/events";
import {
  Station,
  getAppSetting,
  getAppSettings,
  jjyKhz,
  stations,
} from "../shared/appsettings";
import RadioTimeSignal from "../shared/radiotimesignal";

const kStartStopButtonText = {
  stopped: "Start",
  starting: "Stop",
  started: "Stop",
  stopping: "Stopping",
} as const;

type StartStopButtonState = keyof typeof kStartStopButtonText;

@customElement("start-stop-button")
export class StartStopButton extends BaseElement {
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
    const { station, jjyKhz: khz, offset, dut1, noclip } = getAppSettings();
    const stationIndex = stations.indexOf(station);
    const jjyKhzIndex = jjyKhz.indexOf(khz);
    RadioTimeSignal.start({ stationIndex, jjyKhzIndex, offset, dut1, noclip });
  }

  #stop() {
    RadioTimeSignal.stop();
  }

  #click() {
    if (this.#state === "stopped") this.#start();
    else this.#stop();
  }

  #getSettings() {
    this.station = getAppSetting("station");
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

  protected render() {
    const classes = classMap({
      "btn-success": this.ready && this.#state === "stopped",
      "btn-error":
        this.ready && (this.#state === "starting" || this.#state === "started"),
      "btn-disabled": !this.ready || this.#state === "stopping",
    });

    const stateText = kStartStopButtonText[this.#state];
    const buttonText = !this.ready ? "loading" : `${stateText} ${this.station}`;

    return html`
      <button
        class="btn btn-md sm:btn-lg btn-wide drop-shadow ${classes}"
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
