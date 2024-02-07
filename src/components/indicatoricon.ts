import { SVGTemplateResult, TemplateResult, html, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import BaseElement, { registerEventHandler } from "../shared/element";
import { ReadyBusyEvent, TimeSignalStateChangeEvent } from "../shared/events";
import { TimeSignalState } from "../shared/radiotimesignal";

/* ionicons v5.0.0: https://ionic.io/ionicons */
const kSvgFragments = {
  /* volume-high */
  off: svg`<path d="M232 416a23.88 23.88 0 01-14.2-4.68 8.27 8.27 0 01-.66-.51L125.76 336H56a24 24 0 01-24-24V200a24 24 0 0124-24h69.75l91.37-74.81a8.27 8.27 0 01.66-.51A24 24 0 01256 120v272a24 24 0 01-24 24zm-106.18-80zm-.27-159.86z"/>`,
  low: svg`<path d="M320 336a16 16 0 01-14.29-23.19c9.49-18.87 14.3-38 14.3-56.81 0-19.38-4.66-37.94-14.25-56.73a16 16 0 0128.5-14.54C346.19 208.12 352 231.44 352 256c0 23.86-6 47.81-17.7 71.19A16 16 0 01320 336z"/>`,
  medium: svg`<path d="M368 384a16 16 0 01-13.86-24C373.05 327.09 384 299.51 384 256c0-44.17-10.93-71.56-29.82-103.94a16 16 0 0127.64-16.12C402.92 172.11 416 204.81 416 256c0 50.43-13.06 83.29-34.13 120a16 16 0 01-13.87 8z"/>`,
  high: svg`<path d="M416 432a16 16 0 01-13.39-24.74C429.85 365.47 448 323.76 448 256c0-66.5-18.18-108.62-45.49-151.39a16 16 0 1127-17.22C459.81 134.89 480 181.74 480 256c0 64.75-14.66 113.63-50.6 168.74A16 16 0 01416 432z"/>`,

  /* volume-mute */
  mute: [
    svg`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M416 432L64 80"/>`,
    svg`<path d="M243.33 98.86a23.89 23.89 0 00-25.55 1.82l-.66.51-28.52 23.35a8 8 0 00-.59 11.85l54.33 54.33a8 8 0 0013.66-5.66v-64.49a24.51 24.51 0 00-12.67-21.71z"/>`,
    svg`<path d="M251.33 335.29L96.69 180.69A16 16 0 0085.38 176H56a24 24 0 00-24 24v112a24 24 0 0024 24h69.76l92 75.31a23.9 23.9 0 0025.87 1.69A24.51 24.51 0 00256 391.45v-44.86a16 16 0 00-4.67-11.3z"/>`,
    svg`<path d="M352 256c0-24.56-5.81-47.87-17.75-71.27a16 16 0 10-28.5 14.55C315.34 218.06 320 236.62 320 256q0 4-.31 8.13a8 8 0 002.32 6.25l14.36 14.36a8 8 0 0013.55-4.31A146 146 0 00352 256z"/>`,
    svg`<path d="M416 256c0-51.18-13.08-83.89-34.18-120.06a16 16 0 00-27.64 16.12C373.07 184.44 384 211.83 384 256c0 23.83-3.29 42.88-9.37 60.65a8 8 0 001.9 8.26L389 337.4a8 8 0 0013.13-2.79C411 311.76 416 287.26 416 256z"/>`,
    svg`<path d="M480 256c0-74.25-20.19-121.11-50.51-168.61a16 16 0 10-27 17.22C429.82 147.38 448 189.5 448 256c0 46.19-8.43 80.27-22.43 110.53a8 8 0 001.59 9l11.92 11.92a8 8 0 0012.92-2.16C471.6 344.9 480 305 480 256z"/>`,
  ],
} as const;

type IndicatorIconState = keyof typeof kSvgFragments;

const kSpinner = html`
  <span class="loading loading-spinner sm:loading-lg"></span>
`;

const kDelayMs = 500 as const;

@customElement("indicator-icon")
export class IndicatorIcon extends BaseElement {
  @property({ type: String })
  accessor iconState: IndicatorIconState = "mute";

  @state()
  private accessor ready = false;

  @state()
  private accessor pulse = false;

  #timeoutId?: ReturnType<typeof setTimeout>;

  #updateIcon = (iconState: IndicatorIconState) => {
    const nextIconState: IndicatorIconState =
      iconState === "off" ? "low"
      : iconState === "low" ? "medium"
      : iconState === "medium" ? "high"
      : "off";
    this.#timeoutId = setTimeout(this.#updateIcon, kDelayMs, nextIconState);
    this.iconState = iconState;
  };

  #start() {
    this.#timeoutId = setTimeout(this.#updateIcon, 0, "off");
  }

  #stop() {
    clearTimeout(this.#timeoutId);
    this.iconState = "mute";
    this.pulse = false;
  }

  @registerEventHandler(TimeSignalStateChangeEvent)
  handleTimeSignalStateChange(newState: TimeSignalState) {
    if (newState === "startup") this.pulse = true;
    if (newState === "fadein") this.#start();
    if (newState === "idle") this.#stop();
  }

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (!ready) this.#stop();
    this.ready = ready;
  }

  #makeIcon(): TemplateResult {
    let fragments: SVGTemplateResult[] = [];
    if (this.iconState === "mute") {
      fragments = [...kSvgFragments.mute];
    } else {
      Object.entries(kSvgFragments).some(([knownState, fragment]) => {
        fragments.push(fragment as SVGTemplateResult);
        return this.iconState === knownState;
      });
    }

    return html`
      <svg
        class="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        ${fragments}
      </svg>
    `;
  }

  protected render() {
    const animate = classMap({ "animate-pulse": this.pulse });

    return html`
      <div class="grid w-36 h-36 sm:w-48 sm:h-48 place-items-center">
        <span class="drop-shadow-aura fill-current ${animate}">
          ${this.ready ? this.#makeIcon() : kSpinner}
        </span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "indicator-icon": IndicatorIcon;
  }
}
