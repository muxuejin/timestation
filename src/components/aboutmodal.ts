import { html } from "lit";
import { customElement, query, queryAll } from "lit/decorators.js";

import BaseElement from "@shared/element";
import { svgIcons } from "@shared/icons";
import { classMap } from "lit/directives/class-map.js";

const kTransitionMs = 500 as const;

@customElement("about-modal")
export class AboutModal extends BaseElement {
  @query("about-modal dialog", true)
  private accessor dialog!: HTMLDialogElement;

  @queryAll("about-modal input")
  private accessor inputs!: NodeListOf<HTMLInputElement>;

  @queryAll("about-modal .collapse-content")
  private accessor contents!: NodeListOf<HTMLDivElement>;

  private set overflowIndex(value: number) {
    clearTimeout(this.#timeoutId);
    this.#timeoutId = setTimeout(() => {
      this.#overflowIndex = value;
      this.requestUpdate();
    }, kTransitionMs);
  }

  private get overflowIndex() {
    return this.#overflowIndex;
  }

  #timeoutId?: ReturnType<typeof setTimeout>;

  #overflowIndex = -1;

  showModal() {
    this.dialog.showModal();
    this.inputs[0].scrollIntoView({ behavior: "instant" });
    this.inputs[0].checked = true;
    this.#scrollSectionsToFront();
    this.overflowIndex = 0;
  }

  #changeSection(event: Event) {
    const input = event.target as HTMLInputElement;
    this.#scrollSectionsToFront();
    this.overflowIndex = [...this.inputs].indexOf(input);
  }

  #scrollSectionsToFront() {
    this.contents.forEach((content) =>
      content.scroll({ top: 0, left: 0, behavior: "instant" }),
    );
  }

  protected render() {
    const overflowY = [
      classMap({
        "[@media(min-height:600px)]:overflow-y-auto": this.overflowIndex === 0,
      }),
      classMap({
        "[@media(min-height:600px)]:overflow-y-auto": this.overflowIndex === 1,
      }),
      classMap({
        "[@media(min-height:600px)]:overflow-y-auto": this.overflowIndex === 2,
      }),
      classMap({
        "[@media(min-height:600px)]:overflow-y-auto": this.overflowIndex === 3,
      }),
    ];

    return html`
      <dialog class="modal">
        <div
          class="modal-box flex flex-col gap-4 w-[90%] max-w-[calc(100dvw-2rem)] max-h-[calc(100dvh-2rem)]"
        >
          <form class="flex items-center" method="dialog">
            <h3 class="grow font-bold text-xl sm:text-2xl">About</h3>

            <!-- Invisible dummy button takes autofocus when modal is opened -->
            <button></button>

            <button class="btn btn-sm btn-ghost p-0">
              <span class="size-8">${svgIcons.close}</span>
            </button>
          </form>

          <div class="overflow-y-auto">
            <div class="join join-vertical max-w-full">
              <div class="collapse collapse-arrow join-item">
                <input
                  name="about-accordion"
                  type="radio"
                  @change=${this.#changeSection}
                />
                <div class="collapse-title pl-0 font-bold text-lg">
                  Overview
                </div>
                <div
                  class="collapse-content text-sm sm:text-base text-pretty [@media(min-height:600px)]:max-h-[calc(100dvh-23rem)] ${overflowY[0]}"
                >
                  <span class="flex flex-col gap-2">
                    <p>
                      <span class="font-semibold">Time Station Emulator</span>
                      emulates radio time signal broadcasts from
                      <span class="font-semibold">BPC</span>,
                      <span class="font-semibold">DCF77</span>,
                      <span class="font-semibold">JJY</span>,
                      <span class="font-semibold">MSF</span>, and
                      <span class="font-semibold">WWVB</span>.
                    </p>
                    <p>
                      The vast majority of all radio-controlled clocks and
                      watches (often marketed as &ldquo;atomic clocks&rdquo;)
                      rely on one of these five stations. However, their
                      broadcasts are limited in geographic range and notoriously
                      prone to interference in urban areas, so many such clocks
                      end up never actually using their self-setting
                      functionality.
                    </p>
                    <p>
                      <span class="font-semibold">Time Station Emulator</span>
                      may allow setting such clocks when/where a suitable signal
                      is not otherwise available.
                    </p>
                  </span>
                </div>
              </div>

              <div class="collapse collapse-arrow join-item">
                <input
                  name="about-accordion"
                  type="radio"
                  @change=${this.#changeSection}
                />
                <div class="collapse-title pl-0 font-bold text-lg">
                  Quick Start
                </div>
                <div
                  class="collapse-content text-sm sm:text-base text-pretty [@media(min-height:600px)]:max-h-[calc(100dvh-23rem)] ${overflowY[1]}"
                >
                  <span class="flex flex-col gap-2">
                    <p>
                      <span class="font-semibold">Time Station Emulator</span>
                      works best with a
                      <span class="font-semibold">built-in speaker</span> of a
                      <span class="font-semibold">phone or tablet</span>.
                    </p>
                    <ul class="list-decimal pl-6">
                      <li>
                        <span class="flex flex-col gap-2">
                          <p>
                            <span class="font-semibold">
                              Choose emulator settings.
                            </span>
                          </p>
                          <p>
                            The most important setting is which time station to
                            emulate. Certain settings are only available for
                            certain stations.
                          </p>
                          <p>
                            Clocks (or watches) that support more than one
                            station may prefer one of them over the others.
                          </p>
                        </span>
                      </li>
                      <li class="pt-2">
                        <span class="flex flex-col gap-2">
                          <p>
                            <span class="font-semibold">
                              Choose any clock settings and place the clock into
                              sync mode.
                            </span>
                          </p>
                          <p>
                            If your clock has them, try to choose station and/or
                            time zone settings that make sense for your
                            location.
                          </p>
                          <p>
                            Most clocks provide a way to force a synchronization
                            attempt. You will probably have to navigate menus
                            and/or press physical buttons.
                          </p>
                        </span>
                      </li>
                      <li class="pt-2">
                        <span class="flex flex-col gap-2">
                          <p>
                            <span class="font-semibold">
                              Position the speaker as close as possible to the
                              clock&rsquo;s antenna.
                            </span>
                          </p>
                          <p>
                            The transmission range is quite short, so
                            positioning is crucial. Some experimentation will
                            probably be required, especially if you&rsquo;re
                            unsure where the antenna is.
                          </p>
                          <p>
                            The volume should be set so that the clock picks up
                            the cleanest signal. Usually, this occurs at or near
                            the maximum possible volume.
                          </p>
                          <div
                            class="alert alert-warning grid-flow-col items-start text-start"
                            role="alert"
                          >
                            <span class="size-6 sm:size-8">
                              ${svgIcons.warning}
                            </span>
                            <span class="flex flex-col gap-2 min-w-0">
                              <p>
                                <span class="font-bold">
                                  DO NOT PLACE YOUR EARS NEAR THE SPEAKER TO
                                  DETERMINE VOLUME.
                                </span>
                                Use a visual volume indicator instead.
                              </p>
                              <p>
                                The generated waveform has full dynamic range,
                                but is pitched high enough to be difficult to
                                perceive.
                              </p>
                              <p>
                                Many common devices are capable of playing it
                                back loud enough to potentially cause
                                <span class="font-bold">
                                  permanent hearing damage,
                                </span>
                                even if you &ldquo;can&rsquo;t hear
                                anything&rdquo;!
                              </p>
                            </span>
                          </div>
                        </span>
                      </li>
                      <li class="pt-2">
                        <span class="flex flex-col gap-2">
                          <p>
                            <span class="font-semibold">
                              Start transmitting and hold the speaker in
                              position.
                            </span>
                          </p>
                          <p>
                            If all goes well, the clock will set itself within
                            three minutes.
                          </p>
                        </span>
                      </li>
                    </ul>
                  </span>
                </div>
              </div>

              <div class="collapse collapse-arrow join-item">
                <input
                  name="about-accordion"
                  type="radio"
                  @change=${this.#changeSection}
                />
                <div class="collapse-title pl-0 font-bold text-lg">
                  Calculating Offsets
                </div>
                <div
                  class="collapse-content text-sm sm:text-base text-pretty [@media(min-height:600px)]:max-h-[calc(100dvh-23rem)] ${overflowY[2]}"
                >
                  <span class="flex flex-col gap-2">
                    <p>
                      Entering an offset changes the time encoded within the
                      transmitted signal by up to one day in either direction.
                      This is useful for correcting time zone differences as
                      well as for setting a clock (or watch) a few minutes
                      fast/slow.
                    </p>
                    <p>
                      You probably
                      <span class="font-semibold">shouldn&rsquo;t</span> enter
                      an offset when using this emulator to set your clock for
                      the first time. Afterwards, the offset is easily
                      calculated as the difference between the time that the
                      clock should show and the time that the clock actually
                      shows. If these are the same, no offset is needed.
                    </p>
                    <p>Figuring out the offset in advance is often tricky:</p>
                    <ul class="list-disc pl-6">
                      <li>
                        All five time stations broadcast the time relative to a
                        different time zone.
                      </li>
                      <li>
                        <span class="font-semibold">DCF77</span> and
                        <span class="font-semibold">MSF</span> change the
                        transmitted hour value according to daylight saving
                        time.
                      </li>
                      <li>
                        Many clocks apply their own offset when displaying the
                        received time, as with clocks for the North American
                        market that allow selection of a US time zone
                        (Pacific&ndash;Eastern).
                      </li>
                    </ul>
                    <p>
                      Suppose you wish to set a watch from the UK that syncs to
                      <span class="font-semibold">MSF</span> during a visit to
                      <span class="font-semibold">Sydney, NSW, Australia</span>
                      in the month of <span class="font-semibold">July</span>:
                    </p>
                    <ul class="list-disc pl-6">
                      <li>
                        Sydney observes
                        <span class="font-semibold">AEST (UTC+10:00)</span>.
                      </li>
                      <li>
                        MSF in the UK transmits a
                        <span class="font-semibold">BST (UTC+01:00)</span> time.
                      </li>
                      <li>
                        Sydney is 9 hours ahead of the UK, so the offset is
                        <span class="font-semibold">+09:00</span>.
                      </li>
                    </ul>
                    <p>
                      However, if your visit were to occur in
                      <span class="font-semibold">January</span>:
                    </p>
                    <ul class="list-disc pl-6">
                      <li>
                        Sydney observes
                        <span class="font-semibold">AEDT (UTC+11:00)</span>.
                      </li>
                      <li>
                        MSF transmits a
                        <span class="font-semibold">GMT (UTC+00:00)</span> time.
                      </li>
                      <li>
                        The offset is then
                        <span class="font-semibold">+11:00</span>!
                      </li>
                    </ul>
                  </span>
                </div>
              </div>

              <div class="collapse collapse-arrow join-item">
                <input
                  name="about-accordion"
                  type="radio"
                  @change=${this.#changeSection}
                />
                <div class="collapse-title pl-0 font-bold text-lg">
                  Technical Details
                </div>
                <div
                  class="collapse-content text-sm sm:text-base text-pretty [@media(min-height:600px)]:max-h-[calc(100dvh-23rem)] ${overflowY[3]}"
                >
                  <span class="flex flex-col gap-2 min-w-0">
                    <p>
                      <span class="font-semibold">Time Station Emulator</span>
                      generates an audio waveform intentionally crafted to
                      create, when played back through consumer-grade audio
                      hardware, the right kind of RF noise to be mistaken for a
                      time station broadcast.
                    </p>
                    <p>
                      Specifically, given a fundamental carrier frequency used
                      by a real time station, it generates and modulates the
                      highest odd-numbered subharmonic that also falls below the
                      Nyquist frequencies of common playback sample rates.
                    </p>
                    <p>
                      One of the higher-frequency harmonics inevitably created
                      by any real-world DAC during playback will then be the
                      original fundamental, which should leak to the environment
                      as a short-range radio transmission via the ad-hoc antenna
                      formed by the physical wires and circuit traces in the
                      audio output path.
                    </p>
                    <div
                      class="alert grid-flow-col items-start text-start"
                      role="alert"
                    >
                      <span class="size-6 sm:size-8">${svgIcons.info}</span>
                      <span class="flex flex-col gap-2 min-w-0">
                        <p>
                          Because it works by exploiting this leakage,
                          <span class="font-semibold">
                            Time Station Emulator
                          </span>
                          works best with a
                          <span class="font-semibold">built-in speaker</span> of
                          a <span class="font-semibold">phone or tablet</span>.
                        </p>
                        <p>
                          In some cases,
                          <span class="font-semibold">
                            wired headphones or earbuds
                          </span>
                          may also be suitable.
                        </p>
                        <p>
                          Higher-frequency harmonics are considered artifacts
                          beyond the range of human hearing, so they are
                          routinely suppressed by audio compression algorithms
                          and better equipment.
                        </p>
                        <p>
                          Bluetooth devices and audiophile-grade equipment are
                          therefore less likely to work.
                        </p>
                      </span>
                    </div>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form method="dialog" class="modal-backdrop">
          <!-- Invisible button closes modal when user clicks outside it. -->
          <button></button>
        </form>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "about-modal": AboutModal;
  }
}
