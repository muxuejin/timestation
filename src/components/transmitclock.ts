import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import BaseElement, { registerEventHandler } from "../shared/element";
import { ReadyBusyEvent, ServerOffsetEvent } from "../shared/events";
import monotonicTime, {
  formatTimeZoneOffset,
  isEuropeanSummerTime,
} from "../shared/time";
import AppSettings, { Station } from "../shared/appsettings";
import { knownLocales } from "../shared/locales";

type TimeZone = [tzName: string, offset: number];

const kStationTimeZoneMap: Record<Station, TimeZone[]> = {
  BPC: [["CST", 28800000]] /* UTC+08:00 */,
  DCF77: [
    ["CET", 3600000] /* UTC+01:00 */,
    ["CEST", 7200000] /* UTC+02:00 */,
  ],
  JJY: [["JST", 32400000] /* UTC+09:00 */],
  MSF: [
    ["UTC", 0] /* UTC */,
    ["BST", 3600000] /* UTC+01:00 */,
  ],
  WWVB: [["UTC", 0]] /* UTC */,
} as const;

const kSkeletons = {
  hh: html`<div class="skeleton w-11 h-9 sm:w-28 sm:h-24"></div>`,
  mm: html`<div class="skeleton w-11 h-9 sm:w-28 sm:h-24"></div>`,
  ss: html`<div class="skeleton w-11 h-9 sm:w-28 sm:h-24"></div>`,
  amPm: html`<div class="skeleton w-10 h-8 sm:w-14 sm:h-10 self-end"></div>`,
  date: html`<div class="skeleton w-full h-8 sm:h-12"></div>`,
  tz: html`<div class="skeleton w-14 sm:w-24 h-7 sm:h-9"></div>`,
  offset: undefined,
} as const;

const kDateFormatOptions = {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
} as const;

/* cf. countdown digit transition override in shared/styles.css */
const kCssTransitionMs = 250 as const;

@customElement("transmit-clock")
export class TransmitClock extends BaseElement {
  @property({ type: String, reflect: true })
  accessor station!: Station;

  @property({ type: String, reflect: true })
  accessor locale!: string;

  @property({ type: Number, reflect: true })
  accessor offset!: number;

  @property({ type: Number, reflect: true })
  accessor serverOffset = 0;

  @state()
  private accessor ready = false;

  @state()
  private accessor timestamp = 0;

  #timeoutId?: ReturnType<typeof setTimeout>;

  #getSettings() {
    this.station = AppSettings.get("station");
    this.offset = AppSettings.get("offset");
    this.locale = AppSettings.get("locale");
  }

  #updateClock = () => {
    const offset = this.offset + this.serverOffset;
    const timestamp = monotonicTime(offset) + kCssTransitionMs;

    /* Due to timer drift, rollover may not have actually occurred yet. */
    const timestampMs = timestamp % 1000;
    if (timestampMs < 950) this.timestamp = timestamp;

    const ms = Math.max(1000 - (timestamp % 1000), 16);
    this.#timeoutId = setTimeout(this.#updateClock, ms);
  };

  #start() {
    this.#getSettings();
    this.#timeoutId = setTimeout(this.#updateClock);
  }

  #stop() {
    clearTimeout(this.#timeoutId);
  }

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.#start();
    else this.#stop();
    this.ready = ready;
  }

  @registerEventHandler(ServerOffsetEvent)
  handleServerOffset(serverOffset: number) {
    this.serverOffset = serverOffset;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.ready) this.#start();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.#stop();
  }

  #getDisplayTime() {
    const utcTimestamp = this.timestamp;

    const timeZones = kStationTimeZoneMap[this.station];
    const isDst = timeZones.length > 1 && isEuropeanSummerTime(utcTimestamp);
    const [tzName, offset] = timeZones[+isDst];

    const displayDate = new Date(utcTimestamp + offset);
    const displayOffset =
      this.offset !== 0 ? formatTimeZoneOffset(this.offset) : undefined;

    return { displayDate, tzName, displayOffset };
  }

  #makeParts() {
    function makeCountdown(value: number) {
      return html`
        <span class="countdown"><span style="--value:${value}"></span></span>
      `;
    }

    /*
     * We deal only with the h12 and h23 hour cycles. In the real world,
     * h11 locales concurrently use h23, and h24 isn't used at all.
     */

    const { displayDate, tzName, displayOffset } = this.#getDisplayTime();
    const [, am, pm] = knownLocales[this.locale];
    const isH12 = am !== "";

    const h23 = displayDate.getUTCHours();
    const hours = isH12 ? h23 % 12 || 12 : h23;
    const minutes = displayDate.getUTCMinutes();
    const seconds = displayDate.getUTCSeconds();

    const dateFormat = new Intl.DateTimeFormat(this.locale, kDateFormatOptions);
    const dateString = dateFormat.format(displayDate);

    const hh = makeCountdown(hours);
    const mm = makeCountdown(minutes);
    const ss = makeCountdown(seconds);
    const amPm = isH12 ? html`${h23 < 12 ? am : pm}` : undefined;
    const date = html`${dateString}`;
    const tz = html`${tzName}`;
    const offset = html`${displayOffset}`;

    return { hh, mm, ss, amPm, date, tz, offset };
  }

  protected render() {
    const { hh, mm, ss, amPm, date, tz, offset } =
      this.ready ? this.#makeParts() : kSkeletons;

    const isH12 = amPm != null;
    const dateWidth = classMap({
      "w-full": !this.ready,
      "max-w-0": this.ready,
    });
    const amPmHidden = classMap({ hidden: !isH12 });

    return html`
      <div class="indicator">
        <div class="indicator-item whitespace-normal">
          <info-dropdown
            classes="max-w-[15rem] sm:max-w-[31rem]"
            .content=${html`
              <span class="flex flex-col gap-2">
                <h4 class="font-bold sm:text-lg">Transmitted Time</h4>
                <span class="text-sm sm:text-base text-wrap">
                  The date, time, and time zone
                  <strong>that will be transmitted</strong>.
                </span>
                <span class="text-sm sm:text-base text-wrap">
                  Usually, this is <strong>not</strong> a &ldquo;preview&rdquo;
                  of how a device will display the time it receives, but it may
                  be a useful point of reference if you need to enter an offset.
                </span>
                <span class="text-sm sm:text-base text-wrap">
                  See <strong>About &gt; Calculating Offsets</strong> in the
                  menu for more details.
                </span>
              </span>
            `}
            grow
            end
          ></info-dropdown>
        </div>
        <div
          class="flex flex-col px-4 gap-2 sm:gap-4 max-w-fit min-w-fit font-semibold items-center"
        >
          <div class="flex gap-2 sm:gap-3 items-center">
            <div class="font-mono font-black text-4xl sm:text-8xl">${hh}</div>
            <span class="text-3xl sm:text-5xl">:</span>
            <div class="font-mono font-black text-4xl sm:text-8xl">${mm}</div>
            <span class="text-3xl sm:text-5xl">:</span>
            <div class="font-mono font-black text-4xl sm:text-8xl">${ss}</div>
            <div class="${amPmHidden} text-2xl sm:text-4xl self-end">
              ${amPm}
            </div>
          </div>

          <div
            class="flex ${dateWidth} justify-center text-2xl sm:text-5xl overflow-visible whitespace-nowrap"
          >
            ${date}
          </div>

          <span class="ml-auto text-xl sm:text-3xl">${tz}${offset}</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "transmit-clock": TransmitClock;
  }
}
