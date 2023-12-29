import { HTMLTemplateResult, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { createRef, ref } from "lit/directives/ref.js";
import {
  JjyKhz,
  Station,
  getAppSetting,
  jjyKhz,
  setAppSetting,
  stations,
} from "../shared/appsettings";
import BaseElement, { registerEventHandler } from "../shared/element";
import {
  MenuListSelectEvent,
  ReadyBusyEvent,
  SettingsEvent,
} from "../shared/events";
import { svgFlags } from "../shared/icons";
import { MenuList } from "./menulist";
import { NumericInput } from "./numericinput";
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
  static listId = "StationSettings";

  @property({ type: String, reflect: true })
  accessor station: Station = "WWVB";

  #dropdownRef = createRef<HTMLDetailsElement>();

  #stationListRef = createRef<MenuList>();

  @state()
  private accessor isOverflowVisible = false;

  @property({ type: Number, reflect: true })
  accessor dut1 = 0;

  #dut1SignRef = createRef<SignButton>();

  #dut1Ref = createRef<NumericInput>();

  @property({ type: Number, reflect: true })
  accessor jjyKhz: JjyKhz = 40;

  @registerEventHandler(SettingsEvent)
  handleSettings(eventType: string) {
    this.#closeDropdown();
    if (eventType === "save") this.#saveSettings();
  }

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.#getSettings();
  }

  @registerEventHandler(MenuListSelectEvent)
  handleMenuListSelect(listId: string, station: string) {
    if (listId === StationSettings.listId) {
      this.station = station as Station;
      this.#closeDropdown();
    }
  }

  #getSettings() {
    this.station = getAppSetting("station");
    this.dut1 = getAppSetting("dut1");
    this.jjyKhz = getAppSetting("jjyKhz");

    const stationList = this.#stationListRef.value;
    const sign = this.#dut1SignRef.value;
    const input = this.#dut1Ref.value;

    if (stationList != null) stationList.item = this.station;
    if (sign != null) sign.negative = this.dut1 < 0;
    if (input != null) input.value = Math.abs(this.dut1);

    this.requestUpdate();
  }

  #saveSettings() {
    const isNegative = this.#dut1SignRef.value!.negative;
    const dut1Abs = Math.abs(this.#dut1Ref.value!.value);
    this.dut1 = isNegative ? -dut1Abs : dut1Abs;

    setAppSetting("station", this.station);
    setAppSetting("dut1", this.dut1);
    setAppSetting("jjyKhz", this.jjyKhz);
  }

  #makeDropdown() {
    const stationList = this.#stationListRef.value;
    if (stationList != null && stationList.items.length === 0) {
      stationList.items = [...stations];
      stationList.item = this.station;
    }

    return html`
      <details ${ref(this.#dropdownRef)} class="dropdown">
        <summary
          class="btn btn-ghost hover:bg-transparent dropdown-arrow w-36"
          @click=${() => this.requestUpdate()}
          @keydown=${{
            handleEvent: this.#keydownDropdown,
            capture: true,
          }}
          @blur=${this.#closeDropdown}
        >
          ${kStationIcons[this.station]}
          <span class="grow">${this.station}</span>
        </summary>

        <menu-list
          ${ref(this.#stationListRef)}
          classes="dropdown-content menu mt-1 pt-1 w-36 drop-shadow z-[1] bg-base-200 rounded-box"
          itemclasses="gap-4 px-2"
          .listId=${StationSettings.listId}
          .itemTemplate=${this.#makeStationListItem}
          .item=${this.station}
          spaceSelects
        ></menu-list>
      </details>
    `;
  }

  #makeStationListItem = (station: string) => {
    const icon = kStationIcons[station as Station];
    return html`
      ${icon}
      <span class="grow">${station}</span>
    `;
  };

  #focusInCollapse() {
    this.isOverflowVisible = true;
  }

  #focusOutCollapse() {
    this.isOverflowVisible = false;
  }

  #keydownDropdown = (event: KeyboardEvent) => {
    const dropdown = this.#dropdownRef.value!;
    if (!dropdown.hasAttribute("open")) return;

    const stationList = this.#stationListRef.value;
    stationList?.keydown(event);
  };

  #closeDropdown() {
    /* Call removeAttribute() async as a workaround for a visual bug. */
    const dropdown = this.#dropdownRef.value!;
    setTimeout(() => dropdown.removeAttribute("open"));
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
            Leap second correction up to &pm;999 ms.
            <br class="hidden min-[400px]:grid" />
            Actual value depends on Earth's rotation.
          </span>
        `}
      ></info-dropdown>

      <div class="join join-focus-within">
        <sign-button
          ${ref(this.#dut1SignRef)}
          classes="join-item btn w-12 p-0"
          .value=${this.dut1 < 0}
        ></sign-button>

        <div class="join-item ms-0 w-2"></div>

        <span class="ms-0">
          <numeric-input
            ${ref(this.#dut1Ref)}
            classes="join-item input border-0 w-12 px-0 font-bold text-center focus-within:outline-none"
            min="0"
            max="999"
            .value=${this.#dut1Ref.value?.value ?? NaN}
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
        ${jjyKhz.map(
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

  protected render() {
    /* DUT1 picker loses unsaved values if GC'd. Render once & hide in CSS. */
    const hasDut1 = this.station === "MSF" || this.station === "WWVB";
    const hasJjyKhz = this.station === "JJY";
    const isOpen = hasDut1 || hasJjyKhz;

    const hideDut1 = classMap({ hidden: !hasDut1 });
    const hideJjyKhz = classMap({ hidden: !hasJjyKhz });
    const collapseClasses = classMap({
      "overflow-visible": this.isOverflowVisible,
      "collapse-open": isOpen,
    });

    return html`
      <div class="flex flex-col">
        <div class="flex items-center">
          <h3 class="grow font-bold text-lg sm:text-xl">Station</h3>
          ${this.#makeDropdown()}
        </div>

        <div
          class="collapse ${collapseClasses}"
          @focusin=${this.#focusInCollapse}
          @focusout=${this.#focusOutCollapse}
        >
          <div class="collapse-content !p-0">
            <div class="h-12 mt-4">
              <span class="flex items-center ${hideDut1}">
                ${this.#makeDut1()}
              </span>

              <span class="flex items-center ${hideJjyKhz}">
                ${this.#makeJjyKhz()}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "station-settings": StationSettings;
  }
}
