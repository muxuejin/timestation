import { html } from "lit";
import { customElement, query } from "lit/decorators.js";
import BaseElement from "../shared/element";
import { svgIcons } from "../shared/icons";

@customElement("about-modal")
export class AboutModal extends BaseElement {
  @query("about-modal dialog", true)
  private accessor dialog!: HTMLDialogElement;

  @query("about-modal input", true)
  private accessor firstInput!: HTMLInputElement;

  showModal() {
    this.firstInput.checked = true;
    this.dialog.showModal();
  }

  #closeModal() {
    this.firstInput.scrollIntoView();
  }

  protected render() {
    return html`
      <dialog class="modal" @close=${this.#closeModal}>
        <div class="modal-box flex flex-col gap-4 max-w-[90vw]">
          <form class="flex items-center" method="dialog">
            <h3 class="grow font-bold text-xl sm:text-2xl">About</h3>

            <!-- Invisible dummy button takes autofocus when modal is opened -->
            <button></button>

            <button class="btn btn-sm btn-ghost btn-circle">
              <span class="w-8 h-8">${svgIcons.close}</span>
            </button>
          </form>

          <div class="overflow-y-auto">
            <div class="join join-vertical max-w-full">
              <div class="collapse collapse-arrow join-item">
                <input name="about-accordion" type="radio" />
                <div class="collapse-title pl-0 font-bold text-lg">
                  Overview
                </div>
                <div class="collapse-content text-sm sm:text-base text-pretty">
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
                      watches ever sold (often marketed as &ldquo;atomic
                      clocks&rdquo;) rely on one of these five stations.
                      However, their broadcasts are limited in geographic range
                      and notoriously prone to interference in urban areas.
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
                <input name="about-accordion" type="radio" />
                <div class="collapse-title pl-0 font-bold text-lg">
                  Operating Principles
                </div>
                <div class="collapse-content text-sm sm:text-base text-pretty">
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
                      Nyquist frequencies of common playback sample rates. One
                      of the higher-frequency harmonics inevitably created by
                      any real-world DAC during playback will then be the
                      original fundamental, which should leak to the environment
                      as a short-range radio transmission via the ad-hoc antenna
                      formed by the physical wires and circuit traces in the
                      audio output path.
                    </p>
                    <div
                      class="alert grid-flow-col items-start text-start"
                      role="alert"
                    >
                      <span class="w-6 h-6 sm:w-8 sm:h-8">
                        ${svgIcons.info}
                      </span>
                      <span class="flex flex-col gap-2 min-w-0">
                        <p>
                          Higher-frequency harmonics are considered artifacts
                          beyond the range of human hearing, so they are
                          routinely suppressed by audio compression algorithms
                          and better equipment.
                        </p>
                        <p>
                          For best results, use this emulator with the
                          <span class="font-semibold">built-in speakers</span>
                          of a <span class="font-semibold">phone/tablet</span>.
                          In some cases,
                          <span class="font-semibold">
                            wired headphones/earbuds
                          </span>
                          may also be suitable.
                        </p>
                        <p>
                          Bluetooth devices and audiophile-grade equipment are
                          less likely to work.
                        </p>
                      </span>
                    </div>
                  </span>
                </div>
              </div>

              <div class="collapse collapse-arrow join-item">
                <input name="about-accordion" type="radio" />
                <div class="collapse-title pl-0 font-bold text-lg">
                  Quick Start
                </div>
                <div class="collapse-content text-sm sm:text-base text-pretty">
                  <span class="flex flex-col gap-2">
                    <p>
                      The following assumes you are using
                      <span class="font-semibold">Time Station Emulator</span>
                      with the
                      <span class="font-semibold">built-in speakers</span> of a
                      <span class="font-semibold">phone/tablet</span>.
                      &ldquo;Receiver&rdquo; refers to the clock/watch being
                      set.
                    </p>
                    <ul class="list-decimal pl-6">
                      <li>
                        <span class="flex flex-col gap-2">
                          <p>
                            <span class="font-semibold">
                              Choose suitable settings on both the emulator and
                              the receiver.
                            </span>
                          </p>
                          <p>
                            The most important emulator setting is the station
                            to emulate. Receivers that support more than one
                            station may (or may not) prefer one of them over the
                            others.
                          </p>
                          <p>
                            For receivers that have a time zone setting, choose
                            the correct one for your location.
                          </p>
                        </span>
                      </li>
                      <li class="pt-2">
                        <span class="flex flex-col gap-2">
                          <p>
                            <span class="font-semibold"
                              >Place the receiver into sync mode.
                            </span>
                          </p>
                          <p>
                            You may have to navigate menus or press a physical
                            switch.
                          </p>
                        </span>
                      </li>
                      <li class="pt-2">
                        <span class="flex flex-col gap-2">
                          <p>
                            <span class="font-semibold">
                              Position the speaker as close as possible to the
                              receiver&rsquo;s antenna.
                            </span>
                          </p>
                          <p>
                            The transmission range is quite short, so
                            positioning is crucial. Some experimentation will
                            probably be required, especially if you&rsquo;re
                            unsure where the antenna is.
                          </p>
                          <p>
                            The volume should be set so that the receiver picks
                            up the cleanest signal. Usually, this occurs at or
                            near the maximum possible volume.
                          </p>
                          <div
                            class="alert alert-warning grid-flow-col items-start text-start"
                            role="alert"
                          >
                            <span class="w-6 h-6 sm:w-8 sm:h-8">
                              ${svgIcons.warning}
                            </span>
                            <span class="flex flex-col gap-2 min-w-0">
                              <p>
                                <strong>
                                  Do not place your ears near the speaker
                                </strong>
                                to determine volume. Use a visual volume display
                                instead.
                              </p>
                              <p>
                                The pitch of the generated waveform is high
                                enough to be difficult to perceive, even if your
                                equipment is playing it back dangerously loud.
                              </p>
                              <p>
                                <strong>
                                  Any loud noise can cause permanent hearing
                                  damage
                                </strong>
                                in the wrong circumstances!
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
                            If all goes well, the receiver will set itself
                            within three minutes.
                          </p>
                        </span>
                      </li>
                    </ul>
                  </span>
                </div>
              </div>

              <div class="collapse collapse-arrow join-item">
                <input name="about-accordion" type="radio" />
                <div class="collapse-title pl-0 font-bold text-lg">
                  Calculating Offsets
                </div>
                <div class="collapse-content text-sm sm:text-base text-pretty">
                  <span class="flex flex-col gap-2">
                    <p>
                      Entering an offset changes the time encoded within the
                      transmitted signal by up to one day in either direction.
                      This can be used to correct time zone differences or
                      simply to set a clock (or watch) a few minutes fast/slow.
                    </p>
                    <p>
                      You probably <strong>shouldn&rsquo;t</strong> enter an
                      offset (or pay too much attention to the transmitted time)
                      when using this emulator for the first time. After your
                      clock has been set, the offset is simply the difference
                      between the time that the clock actually shows and the
                      time that you want it to show.
                    </p>
                    <p>Figuring out what it should be in advance is tricky:</p>
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
                      As a cautionary example, suppose you wish to set a watch
                      from the UK that syncs to
                      <span class="font-semibold">MSF</span> during a visit to
                      <span class="font-semibold">Sydney, NSW, Australia</span>
                      in the month of <span class="font-semibold">July</span>:
                    </p>
                    <ul class="list-disc pl-6">
                      <li>
                        Sydney observes
                        <span class="font-semibold">AEST (UTC+1000)</span>.
                      </li>
                      <li>
                        MSF in the UK transmits a
                        <span class="font-semibold">BST (UTC+0100)</span> time.
                      </li>
                      <li>
                        Sydney is 9 hours ahead of the UK, so the offset is
                        <span class="font-semibold">+0900</span> (entered as
                        <span class="font-semibold">+9:00:00.000</span>).
                      </li>
                    </ul>
                    <p>
                      However, if this visit were to occur in
                      <span class="font-semibold">January</span>:
                    </p>
                    <ul class="list-disc pl-6">
                      <li>
                        Sydney observes
                        <span class="font-semibold">AEDT (UTC+1100)</span>.
                      </li>
                      <li>
                        MSF transmits a
                        <span class="font-semibold">GMT (UTC+0000)</span> time.
                      </li>
                      <li>
                        The offset is then
                        <span class="font-semibold">+1100</span>!
                      </li>
                    </ul>
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
