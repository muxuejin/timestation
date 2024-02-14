import { HTMLTemplateResult, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import AppSettings, {
  JjyKhz,
  Station,
  knownJjyKhz,
  knownStations,
} from "../shared/appsettings";
import BaseElement, { registerEventHandler } from "../shared/element";
import {
  ArrowDropdownEvent,
  MenuListSelectEvent,
  ReadyBusyEvent,
  SettingsEvent,
} from "../shared/events";
import { StationSettingsGroup } from "../shared/groups";
import { svgFlags } from "../shared/icons";
import "./arrowdropdown";
import { ArrowDropdown } from "./arrowdropdown";
import "./collapsesetting";
import "./menulist";
import { MenuList } from "./menulist";
import "./numericinput";
import { NumericInput } from "./numericinput";
import "./signbutton";
import { SignButton } from "./signbutton";

const kStationIcons: Record<Station, HTMLTemplateResult> = {
  BPC: svgFlags.cn,
  DCF77: svgFlags.de,
  JJY: svgFlags.jp,
  MSF: svgFlags.uk,
  WWVB: svgFlags.us,
} as const;

@customElement("station-settings")
export class StationSettings extends BaseElement {
  @property({ type: String, reflect: true })
  accessor station: Station = "WWVB";

  @query("station-settings arrow-dropdown", true)
  private accessor arrowDropdown!: ArrowDropdown;

  @query("station-settings menu-list", true)
  private accessor stationList!: MenuList;

  @property({ type: Number, reflect: true })
  accessor dut1 = 0;

  @query("station-settings collapse-setting sign-button", true)
  private accessor dut1SignButton!: SignButton;

  @query("station-settings collapse-setting numeric-input", true)
  private accessor dut1Input!: NumericInput;

  @property({ type: Number, reflect: true })
  accessor jjyKhz: JjyKhz = 40;

  #isRendered = false;

  @registerEventHandler(SettingsEvent)
  handleSettings(eventType: string) {
    this.#closeArrowDropdown();
    if (eventType === "save") this.#saveSettings();
  }

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.#getSettings();
  }

  @registerEventHandler(MenuListSelectEvent)
  handleMenuListSelect(group: string, station: string) {
    if (group === StationSettingsGroup) {
      this.station = station as Station;
      this.#closeArrowDropdown();
    }
  }

  #getSettings() {
    this.station = AppSettings.get("station");
    this.dut1 = AppSettings.get("dut1");
    this.jjyKhz = AppSettings.get("jjyKhz");

    this.stationList.item = this.station;
    this.dut1SignButton.negative = this.dut1 < 0;
    this.dut1Input.value = Math.abs(this.dut1);

    this.requestUpdate();
  }

  #saveSettings() {
    const isNegative = this.dut1SignButton.negative;
    const dut1Abs = Math.abs(this.dut1Input.value);
    this.dut1 = isNegative ? -dut1Abs : dut1Abs;

    AppSettings.set("station", this.station);
    if (this.station === "MSF" || this.station === "WWVB")
      AppSettings.set("dut1", this.dut1);
    if (this.station === "JJY") AppSettings.set("jjyKhz", this.jjyKhz);
  }

  #makeStationListItem = (station: string) => {
    const icon = kStationIcons[station as Station];
    return html`
      <span class="w-8 h-6">${icon}</span>
      <span class="grow">${station}</span>
    `;
  };

  #keydown = (event: KeyboardEvent) => {
    if (this.arrowDropdown.open) this.stationList.keydown(event);
  };

  #closeArrowDropdown() {
    this.arrowDropdown.open = false;
  }

  #makeDut1() {
    return html`
      <h4 class="font-semibold sm:text-lg">DUT1</h4>

      <info-dropdown
        class="grow"
        classes="max-w-[14rem] min-[400px]:max-w-[19rem]"
        .content=${html`
          <h4 class="font-bold">DUT1</h4>
          <span class="text-sm">
            Leap second correction up to &pm;999 ms. Actual value depends on
            Earth&rsquo;s rotation.
          </span>
        `}
        grow
      ></info-dropdown>

      <div class="join join-focus-within">
        <sign-button
          classes="join-item btn w-12 p-0"
          .value=${this.dut1 < 0}
        ></sign-button>

        <div class="join-item ms-0 w-2"></div>

        <span class="ms-0">
          <numeric-input
            classes="join-item input border-0 w-12 px-0 font-bold text-center focus-within:outline-none"
            min="0"
            max="999"
          ></numeric-input>
        </span>

        <div class="join-item ms-0 w-2"></div>

        <div class="join-item ms-0 grid w-6 place-items-center">ms</div>

        <div class="join-item ms-0 w-2"></div>
      </div>
    `;
  }

  #makeJjyKhz() {
    return html`
      <h4 class="grow font-semibold sm:text-lg">Frequency</h4>

      <div class="join">
        ${knownJjyKhz.map(
          (kHz) => html`
            <input
              class="join-item btn ms-0 w-18"
              type="radio"
              name="jjy_khz"
              aria-label="${kHz}KHz"
              .checked=${this.jjyKhz === kHz}
              @click=${() => this.#clickJjyKhz(kHz)}
            />
          `,
        )}
      </div>
    `;
  }

  #clickJjyKhz(kHz: JjyKhz) {
    this.jjyKhz = kHz;
  }

  protected firstUpdated() {
    this.#isRendered = true;
  }

  protected render() {
    /* DUT1 picker loses unsaved values if GC'd. Render once & hide in CSS. */
    const hasDut1 = this.station === "MSF" || this.station === "WWVB";
    const hasJjyKhz = this.station === "JJY";
    const hideDut1 = classMap({ hidden: !hasDut1 });
    const hideJjyKhz = classMap({ hidden: !hasJjyKhz });

    /*
     * Providing a group attribute to our arrow-dropdown would make our
     * collapse-setting open/close in tandem. Instead, manually publish
     * the events that open it only when the station is MSF, JJY, or WWVB.
     */
    const isOpen = hasDut1 || hasJjyKhz;
    this.publish(ArrowDropdownEvent, StationSettingsGroup, isOpen);

    if (this.#isRendered && this.stationList.items.length === 0) {
      this.stationList.items = [...knownStations];
      this.stationList.item = this.station;
    }

    return html`
      <div class="flex flex-col">
        <div class="flex items-center">
          <h3 class="grow font-bold text-lg sm:text-xl">Station</h3>
          <arrow-dropdown
            classes="w-36 flex-nowrap after:shrink-0"
            .keydown=${this.#keydown}
            .text=${html`
              <span class="flex gap-2 w-full items-center">
                <span class="w-8 h-6 border border-base-100"
                  >${kStationIcons[this.station]}</span
                >
                <span class="grow">${this.station}</span>
              </span>
            `}
            .content=${html`
              <menu-list
                classes="dropdown-content menu mt-1 pt-1 w-36 drop-shadow z-[1] bg-base-200 rounded-box"
                itemclasses="gap-4 px-2"
                .group=${StationSettingsGroup}
                .itemTemplate=${this.#makeStationListItem}
                .item=${this.station}
                spaceselect
              ></menu-list>
            `}
          ></arrow-dropdown>
        </div>

        <collapse-setting
          .group=${StationSettingsGroup}
          .content=${html`
            <div class="h-12 mt-4 ml-2">
              <span class="flex items-center ${hideDut1}">
                ${this.#makeDut1()}
              </span>

              <span class="flex items-center ${hideJjyKhz}">
                ${this.#makeJjyKhz()}
              </span>
            </div>
          `}
        ></collapse-setting>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "station-settings": StationSettings;
  }
}
