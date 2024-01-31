import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, ref } from "lit/directives/ref.js";
import AppSettings from "../shared/appsettings";
import BaseElement, { registerEventHandler } from "../shared/element";
import { ReadyBusyEvent, SettingsEvent } from "../shared/events";
import { decodeHtmlEntity } from "../shared/strings";
import { decomposeOffset } from "../shared/time";
import { ArrowDropdown } from "./arrowdropdown";
import { NumericInput } from "./numericinput";
import { SignButton } from "./signbutton";

const kOffsetSettingsGroup = "OffsetSettings";

@customElement("offset-settings")
export class OffsetSettings extends BaseElement {
  @property({ type: Number })
  accessor offset = 0;

  #refs = {
    arrowDropdown: createRef<ArrowDropdown>(),
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
    this.#closeCollapse();
  }

  @registerEventHandler(ReadyBusyEvent)
  handleReadyBusy(ready: boolean) {
    if (ready) this.#getSettings();
  }

  #requestUpdate = () => {
    /* .requestUpdate() complains otherwise when used as an event listener. */
    this.requestUpdate();
  };

  #getSettings() {
    this.offset = AppSettings.get("offset");

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

    this.requestUpdate();
  }

  #saveSettings() {
    AppSettings.set("offset", this.#unsavedOffset!);
  }

  #closeCollapse() {
    const arrowDropdown = this.#refs.arrowDropdown.value;
    if (arrowDropdown != null) arrowDropdown.open = false;
  }

  #makeCollapseContent() {
    return html`
      <div class="flex mt-4 ml-2 w-full justify-end items-center">
        <div class="join join-focus-within" @focusout=${this.#requestUpdate}>
          <sign-button
            ${ref(this.#refs.sign)}
            classes="join-item btn w-12 p-0"
            @click=${this.#requestUpdate}
            .value=${this.offset < 0}
          ></sign-button>

          <div class="join-item ms-0 w-2"></div>

          <span class="ms-0">
            <numeric-input
              ${ref(this.#refs.hh)}
              classes="join-item input border-0 w-6 px-0 font-bold text-center focus-within:outline-none"
              min="0"
              max="23"
              @blur=${this.#requestUpdate}
              .value=${this.#refs.hh.value?.value ?? NaN}
              .group=${kOffsetSettingsGroup}
            ></numeric-input>
          </span>

          <div class="join-item ms-0 grid w-3 place-items-center">h</div>

          <span class="ms-0">
            <numeric-input
              ${ref(this.#refs.mm)}
              classes="join-item input border-0 w-6 px-0 font-bold text-center focus-within:outline-none"
              min="0"
              max="59"
              @blur=${this.#requestUpdate}
              .value=${this.#refs.mm.value?.value ?? NaN}
              .group=${kOffsetSettingsGroup}
            ></numeric-input>
          </span>

          <div class="join-item ms-0 grid w-4 place-items-center">m</div>

          <span class="ms-0">
            <numeric-input
              ${ref(this.#refs.ss)}
              classes="join-item input border-0 w-6 px-0 font-bold text-center focus-within:outline-none"
              min="0"
              max="59"
              @blur=${this.#requestUpdate}
              .value=${this.#refs.ss.value?.value ?? NaN}
              .group=${kOffsetSettingsGroup}
            ></numeric-input>
          </span>

          <div class="join-item ms-0 grid w-3 place-items-center">s</div>

          <span class="ms-0">
            <numeric-input
              ${ref(this.#refs.ms)}
              classes="join-item input border-0 w-9 px-0 font-bold text-center focus-within:outline-none"
              min="0"
              max="999"
              @blur=${this.#requestUpdate}
              .value=${this.#refs.ms.value?.value ?? NaN}
              .group=${kOffsetSettingsGroup}
            ></numeric-input>
          </span>

          <div class="join-item ms-0 grid w-6 place-items-center">ms</div>

          <div class="join-item ms-0 w-2"></div>
        </div>
      </div>
    `;
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
    const displayOffset = this.#displayOffset();
    const collapseContent = this.#makeCollapseContent();

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

        <arrow-dropdown
          ${ref(this.#refs.arrowDropdown)}
          .group=${kOffsetSettingsGroup}
          .text=${html`${displayOffset}`}
        ></arrow-dropdown>
      </div>

      <collapse-setting
        .group=${kOffsetSettingsGroup}
        .content=${collapseContent}
      >
      </collapse-setting>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "offset-settings": OffsetSettings;
  }
}
