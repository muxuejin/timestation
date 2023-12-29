import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import BaseElement, { registerEventHandler } from "../shared/element";
import { ReadyBusyEvent, StartStopEvent } from "../shared/events";
import { Station, getAppSetting } from "../shared/appsettings";

@customElement("start-stop-button")
export class StartStopButton extends BaseElement {
  @state()
  private accessor ready = false;

  @state()
  private accessor start = false;

  @state()
  private accessor station!: Station;

  #start() {
    this.start = true;
    this.publishEvent(StartStopEvent, true);
  }

  #stop() {
    this.start = false;
    this.publishEvent(StartStopEvent, false);
  }

  #click() {
    if (this.start) this.#stop();
    else this.#start();
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

  protected render() {
    const classes = classMap({
      "btn-success": this.ready && !this.start,
      "btn-error": this.ready && this.start,
      "btn-disabled": !this.ready,
    });

    const buttonText =
      !this.ready ? "loading"
      : !this.start ? `Start ${this.station}`
      : `Stop ${this.station}`;

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
