import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import "@components/arrowdropdown";
import { ArrowDropdown } from "@components/arrowdropdown";
import "@components/collapsesetting";
import "@components/numericinput";
import { NumericInput } from "@components/numericinput";
import "@components/signbutton";
import { SignButton } from "@components/signbutton";

import AppSettings from "@shared/appsettings";
import BaseElement, { registerEventHandler } from "@shared/element";
import { ReadyBusyEvent, SettingsEvent } from "@shared/events";
import { OffsetSettingsGroup } from "@shared/groups";
import { decomposeOffset } from "@shared/time";

@customElement("offset-settings")
export class OffsetSettings extends BaseElement {
  @property({ type: Number, reflect: true })
  accessor offset = 0;

  @query("offset-settings arrow-dropdown", true)
  private accessor arrowDropdown!: ArrowDropdown;

  @query("offset-settings sign-button", true)
  private accessor signButton!: SignButton;

  @query("offset-settings div.join span:nth-of-type(1) numeric-input", true)
  private accessor hhInput!: NumericInput;

  @query("offset-settings div.join span:nth-of-type(2) numeric-input", true)
  private accessor mmInput!: NumericInput;

  @query("offset-settings div.join span:nth-of-type(3) numeric-input", true)
  private accessor ssInput!: NumericInput;

  @query("offset-settings div.join span:nth-of-type(4) numeric-input", true)
  private accessor msInput!: NumericInput;

  #isRendered = false;

  #displayOffset() {
    const offset = this.#isRendered ? this.#unsavedOffset() : this.offset;
    const { negative, hh, mm, ss, ms } = decomposeOffset(offset);
    if (hh === 0 && mm === 0 && ss === 0 && ms === 0) return "No offset";

    const sign = negative ? "&minus;" : "+";
    const hhText = `${hh}`.padStart(2, "0");
    const mmText = `${mm}`.padStart(2, "0");
    const ssText = `${ss}`.padStart(2, "0");
    const msText = `${ms}`.padStart(3, "0");

    return `${sign}${hhText}:${mmText}:${ssText}.${msText}`;
  }

  #unsavedOffset() {
    const hh = this.hhInput.value;
    const mm = this.mmInput.value;
    const ss = this.ssInput.value;
    const ms = this.msInput.value;

    const absOffset = 60 * 60 * 1000 * hh + 60 * 1000 * mm + 1000 * ss + ms;
    return this.signButton.negative ? -absOffset : absOffset;
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

    this.signButton.negative = negative;
    this.hhInput.value = hh;
    this.mmInput.value = mm;
    this.ssInput.value = ss;
    this.msInput.value = ms;

    this.requestUpdate();
  }

  #saveSettings() {
    AppSettings.set("offset", this.#unsavedOffset());
  }

  #closeCollapse() {
    this.arrowDropdown.open = false;
  }

  #makeCollapseContent() {
    return html`
      <div class="flex mt-4 ml-2 w-full justify-end items-center">
        <div class="join join-focus-within" @focusout=${this.#requestUpdate}>
          <sign-button
            classes="join-item btn w-12 p-0"
            @click=${this.#requestUpdate}
            .value=${this.offset < 0}
          ></sign-button>

          <div class="join-item ms-0 w-2"></div>

          <span class="ms-0">
            <numeric-input
              classes="join-item input border-0 w-6 px-0 font-bold text-center focus-within:outline-none"
              min="0"
              max="23"
              @blur=${this.#requestUpdate}
              .group=${OffsetSettingsGroup}
            ></numeric-input>
          </span>

          <div class="join-item ms-0 grid w-3 place-items-center">h</div>

          <span class="ms-0">
            <numeric-input
              classes="join-item input border-0 w-6 px-0 font-bold text-center focus-within:outline-none"
              min="0"
              max="59"
              @blur=${this.#requestUpdate}
              .group=${OffsetSettingsGroup}
            ></numeric-input>
          </span>

          <div class="join-item ms-0 grid w-4 place-items-center">m</div>

          <span class="ms-0">
            <numeric-input
              classes="join-item input border-0 w-6 px-0 font-bold text-center focus-within:outline-none"
              min="0"
              max="59"
              @blur=${this.#requestUpdate}
              .group=${OffsetSettingsGroup}
            ></numeric-input>
          </span>

          <div class="join-item ms-0 grid w-3 place-items-center">s</div>

          <span class="ms-0">
            <numeric-input
              classes="join-item input border-0 w-9 px-0 font-bold text-center focus-within:outline-none"
              min="0"
              max="999"
              @blur=${this.#requestUpdate}
              .group=${OffsetSettingsGroup}
            ></numeric-input>
          </span>

          <div class="join-item ms-0 grid w-6 place-items-center">ms</div>

          <div class="join-item ms-0 w-2"></div>
        </div>
      </div>
    `;
  }

  protected firstUpdated() {
    this.#isRendered = true;
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
          grow
        ></info-dropdown>

        <arrow-dropdown
          .group=${OffsetSettingsGroup}
          .text=${displayOffset}
        ></arrow-dropdown>
      </div>

      <collapse-setting
        .group=${OffsetSettingsGroup}
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
