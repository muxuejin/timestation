import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import { classMap } from "lit/directives/class-map.js";
import { getAppSetting, setAppSetting } from "../shared/appsettings";
import BaseElement, { registerEventHandler } from "../shared/element";
import { ReadyBusyEvent, SettingsEvent } from "../shared/events";
import { NumericInput } from "./numericinput";
import { SignButton } from "./signbutton";
import { decomposeOffset } from "../shared/time";
import { decodeHtmlEntity } from "../shared/strings";

@customElement("offset-settings")
export class OffsetSettings extends BaseElement {
  @property({ type: Number })
  accessor offset = 0;

  @state()
  private accessor isOverflowVisible = false;

  @state()
  private accessor isCollapseOpen = false;

  #refs = {
    dropdown: createRef<HTMLDetailsElement>(),
    sign: createRef<SignButton>(),
    hh: createRef<NumericInput>(),
    mm: createRef<NumericInput>(),
    ss: createRef<NumericInput>(),
    ms: createRef<NumericInput>(),
  };

  get #unsavedOffset() {
    const signRef = this.#refs.sign.value;
    const hhRef = this.#refs.hh.value;
    const mmRef = this.#refs.mm.value;
    const ssRef = this.#refs.ss.value;
    const msRef = this.#refs.ms.value;

    if (
      signRef == null ||
      hhRef == null ||
      mmRef == null ||
      ssRef == null ||
      msRef == null
    )
      return undefined;

    const hh = hhRef.value;
    const mm = mmRef.value;
    const ss = ssRef.value;
    const ms = msRef.value;

    const absOffset = 60 * 60 * 1000 * hh + 60 * 1000 * mm + 1000 * ss + ms;
    return signRef.negative ? -absOffset : absOffset;
  }

  @registerEventHandler(SettingsEvent)
  handleSettings(eventType: string) {
    if (eventType === "save") this.#saveSettings();
    this.#closeDropdown();
  }

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.#getSettings();
  }

  #getSettings() {
    this.offset = getAppSetting("offset");

    const { negative, hh, mm, ss, ms } = decomposeOffset(this.offset);

    const signRef = this.#refs.sign.value;
    const hhRef = this.#refs.hh.value;
    const mmRef = this.#refs.mm.value;
    const ssRef = this.#refs.ss.value;
    const msRef = this.#refs.ms.value;

    if (signRef != null) signRef.negative = negative;
    if (hhRef != null) hhRef.value = hh;
    if (mmRef != null) mmRef.value = mm;
    if (ssRef != null) ssRef.value = ss;
    if (msRef != null) msRef.value = ms;
  }

  #saveSettings() {
    setAppSetting("offset", this.#unsavedOffset!);
  }

  #clickDropdown() {
    const dropdown = this.#refs.dropdown.value;
    if (dropdown != null) this.isCollapseOpen = !dropdown.hasAttribute("open");
  }

  #closeDropdown() {
    /* Call removeAttribute() async as a workaround for a visual bug. */
    const dropdown = this.#refs.dropdown.value;
    setTimeout(() => dropdown?.removeAttribute("open"));
    this.isOverflowVisible = false;
    this.isCollapseOpen = false;
  }

  #makeCollapse() {
    const collapseClasses = classMap({
      "overflow-visible": this.isOverflowVisible,
      "collapse-open": this.isCollapseOpen,
    });
    return html` <div class="collapse ${collapseClasses}">
      <div class="collapse-content !p-0">
        <div class="flex mt-4 w-full justify-end items-center">
          <div
            class="join join-focus-within"
            @focusin=${this.#focusInCollapse}
            @focusout=${this.#focusOutCollapse}
          >
            <sign-button
              ${ref(this.#refs.sign)}
              classes="join-item btn w-12 p-0"
              @click=${() => this.requestUpdate()}
              .value=${this.offset < 0}
            ></sign-button>

            <div class="join-item ms-0 w-2"></div>

            <span class="ms-0">
              <numeric-input
                ${ref(this.#refs.hh)}
                classes="join-item input border-0 w-6 px-0 font-bold text-center focus-within:outline-none"
                min="0"
                max="23"
                .value=${this.#refs.hh.value?.value ?? NaN}
                .group=${"offset-settings"}
              >
              </numeric-input>
            </span>

            <div class="join-item ms-0 grid w-3 place-items-center">h</div>

            <span class="ms-0">
              <numeric-input
                ${ref(this.#refs.mm)}
                classes="join-item input border-0 w-6 px-0 font-bold text-center focus-within:outline-none"
                min="0"
                max="59"
                .value=${this.#refs.mm.value?.value ?? NaN}
                .group=${"offset-settings"}
              >
              </numeric-input>
            </span>

            <div class="join-item ms-0 grid w-4 place-items-center">m</div>

            <span class="ms-0">
              <numeric-input
                ${ref(this.#refs.ss)}
                classes="join-item input border-0 w-6 px-0 font-bold text-center focus-within:outline-none"
                min="0"
                max="59"
                .value=${this.#refs.ss.value?.value ?? NaN}
                .group=${"offset-settings"}
              >
              </numeric-input>
            </span>

            <div class="join-item ms-0 grid w-3 place-items-center">s</div>

            <span class="ms-0">
              <numeric-input
                ${ref(this.#refs.ms)}
                classes="join-item input border-0 w-9 px-0 font-bold text-center focus-within:outline-none"
                min="0"
                max="999"
                .value=${this.#refs.ms.value?.value ?? NaN}
                .group=${"offset-settings"}
              >
              </numeric-input>
            </span>

            <div class="join-item ms-0 grid w-6 place-items-center">ms</div>

            <div class="join-item ms-0 w-2"></div>
          </div>
        </div>
      </div>
    </div>`;
  }

  #focusInCollapse() {
    this.isOverflowVisible = true;
  }

  #focusOutCollapse() {
    this.isOverflowVisible = false;
    this.requestUpdate();
  }

  #displayOffset() {
    const offset = this.#unsavedOffset ?? this.offset;
    const { negative, hh, mm, ss, ms } = decomposeOffset(offset);
    if (hh === 0 && mm === 0 && ss === 0 && ms === 0) return "No offset";

    const sign =
      negative ? decodeHtmlEntity("&minus;") : decodeHtmlEntity("&plus;");
    const hhText = `${hh}`.padStart(2, "0");
    const mmText = `${mm}`.padStart(2, "0");
    const ssText = `${ss}`.padStart(2, "0");
    const msText = `${ms}`.padStart(3, "0");

    return `${sign}${hhText}:${mmText}:${ssText}.${msText}`;
  }

  protected render() {
    return html`
      <div class="flex items-center">
        <h3 class="font-bold text-lg sm:text-xl">Offset</h3>

        <info-dropdown
          class="grow"
          classes="max-w-[13rem] min-[460px]:max-w-[24rem]"
          .content=${html`
            <h4 class="font-bold">Offset</h4>
            <span class="text-sm">
              Time offset up to &pm;1 day. Use to correct minor errors.
            </span>
          `}
        ></info-dropdown>

        <details ${ref(this.#refs.dropdown)} class="dropdown">
          <summary
            class="btn btn-ghost hover:bg-transparent dropdown-arrow flex-nowrap after:shrink-0"
            @click=${this.#clickDropdown}
          >
            <span class="text-right">${this.#displayOffset()}</span>
          </summary>
        </details>
      </div>

      ${this.#makeCollapse()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "offset-settings": OffsetSettings;
  }
}
