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
          class="modal-box flex max-h-[calc(100dvh-2rem)] w-[90%] max-w-[calc(100dvw-2rem)] flex-col gap-4"
        >
          <form class="flex items-center" method="dialog">
            <h3 class="grow text-xl font-bold sm:text-2xl">About</h3>

            <!-- Invisible dummy button takes autofocus when modal is opened -->
            <button></button>

            <button class="btn btn-circle btn-ghost btn-sm p-0">
              <span class="size-6 sm:size-8">${svgIcons.close}</span>
            </button>
          </form>

          <div class="overflow-y-auto">
            <div class="join join-vertical max-w-full">
              <div class="collapse join-item collapse-arrow">
                <input
                  name="about-accordion"
                  type="radio"
                  @change=${this.#changeSection}
                />
                <div class="collapse-title pl-0 text-lg font-bold">
                  Overview
                </div>
                <div
                  class="${overflowY[0]} collapse-content text-pretty text-sm sm:text-base [@media(min-height:600px)]:max-h-[calc(100dvh-23rem)]"
                >
                  <span class="flex flex-col gap-2">
                    <p>
                      <span class="font-semibold">时间站模拟器</span>
                      模拟来自
                      <span class="font-semibold">BPC</span>,
                      <span class="font-semibold">DCF77</span>,
                      <span class="font-semibold">JJY</span>,
                      <span class="font-semibold">MSF</span>,
                      <span class="font-semibold">WWVB</span>的无线电时间信号广播.
                    </p>
                    <p>
                      绝大多数无线电控制钟表 (通常被称为 &ldquo;原子钟s&rdquo;)都依赖于这五个电台之一. 
                      然而,它们的广播在地理范围上受到限制,而且众所周知,在城市地区容易受到干扰,
                      因此许多这样的时钟最终从未真正使用过它们的自设置功能.
                    </p>
                    <p>
                      <span class="font-semibold">时间站模拟器</span>
                      可以在没有合适信号的情况下设置此类时钟.
                    </p>
                  </span>
                </div>
              </div>

              <div class="collapse join-item collapse-arrow">
                <input
                  name="about-accordion"
                  type="radio"
                  @change=${this.#changeSection}
                />
                <div class="collapse-title pl-0 text-lg font-bold">
                  快速入门
                </div>
                <div
                  class="${overflowY[1]} collapse-content text-pretty text-sm sm:text-base [@media(min-height:600px)]:max-h-[calc(100dvh-23rem)]"
                >
                  <span class="flex flex-col gap-2">
                    <p>
                      <span class="font-semibold">时间站模拟器</span>
                      与
                      <span class="font-semibold">手机或平板电脑</span>的
                      <span class="font-semibold">内置扬声器</span>配合使用效果最佳.
                    </p>
                    <ul class="list-decimal pl-6">
                      <li>
                        <span class="flex flex-col gap-2">
                          <p>
                            <span class="font-semibold">
                              选择模拟器设置.
                            </span>
                          </p>
                          <p>
                            最重要的设置是模拟哪个时间站点. 某些设置仅适用于某些站点.
                          </p>
                          <p>
                            支持多个站点的时钟 (或手表) 可能会优先选择其中一个站点.
                          </p>
                        </span>
                      </li>
                      <li class="pt-2">
                        <span class="flex flex-col gap-2">
                          <p>
                            <span class="font-semibold">
                              选择任意时钟设置并将时钟置于同步模式.
                            </span>
                          </p>
                          <p>
                            如果您的时钟有这些设置, 请尝试选择适合您位置的站点和/或时区设置.
                          </p>
                          <p>
                            大多数时钟都提供强制同步的功能. 你可能需要浏览菜单和/或按下实体按钮.
                          </p>
                        </span>
                      </li>
                      <li class="pt-2">
                        <span class="flex flex-col gap-2">
                          <p>
                            <span class="font-semibold">
                              将扬声器放置在尽可能靠近时钟天线的位置.
                            </span>
                          </p>
                          <p>
                            传输距离很短,所以定位至关重要.可能需要进行一些实验,尤其是在你不确定天线位置的情况下.
                          </p>
                          <p>
                            应将音量设置为使时钟拾取最干净的信号.通常,音量应设置为最大或接近最大音量.
                          </p>
                          <div
                            class="alert alert-warning grid-flow-col items-start text-start"
                            role="alert"
                          >
                            <span class="size-6 sm:size-8">
                              ${svgIcons.warning}
                            </span>
                            <span class="flex min-w-0 flex-col gap-2">
                              <p>
                                <span class="font-bold">
                                  请勿将耳朵靠近扬声器来确定音量.
                                </span>
                              </p>
                              <p>请改用可视音量指示器.</p>
                              <p>
                                生成的波形具有全动态范围,但音调较高,难以察觉.
                              </p>
                              <p>
                                <span class="font-bold">
                                  即使你 &ldquo;什么也听不到&rdquo;,
                                </span>
                                许多常见设备能够播放足够大的声音,可能会造成
                                <span class="font-bold">
                                  永久性听力损伤!
                                </span>
                              </p>
                            </span>
                          </div>
                        </span>
                      </li>
                      <li class="pt-2">
                        <span class="flex flex-col gap-2">
                          <p>
                            <span class="font-semibold">
                              开始发射并将扬声器保持在原位.
                            </span>
                          </p>
                          <p>
                            如果一切顺利,时钟将在三分钟内自行设置.
                          </p>
                        </span>
                      </li>
                    </ul>
                  </span>
                </div>
              </div>

              <div class="collapse join-item collapse-arrow">
                <input
                  name="about-accordion"
                  type="radio"
                  @change=${this.#changeSection}
                />
                <div class="collapse-title pl-0 text-lg font-bold">
                  计算偏移量
                </div>
                <div
                  class="${overflowY[2]} collapse-content text-pretty text-sm sm:text-base [@media(min-height:600px)]:max-h-[calc(100dvh-23rem)]"
                >
                  <span class="flex flex-col gap-2">
                    <p>
                      输入偏移量会使传输信号中编码的时间在任意方向上最多改变一天.
                      这对于校正时区差异以及将时钟(或手表)调快/慢几分钟非常有用.
                    </p>
                    <p>
                      首次使用此模拟器设置时钟时,您可能<span class="font-semibold">不应该</span>输入偏移量. 
                      之后,偏移量很容易计算出来,即时钟应显示的时间与实际显示的时间之间的差值.如果两者相同,则无需偏移.
                    </p>
                    <p>提前计算出偏移量通常很棘手:</p>
                    <ul class="list-disc pl-6">
                      <li>
                        所有五个时间站都广播相对于不同时区的时间.
                      </li>
                      <li>
                        <span class="font-semibold">DCF77</span> 和
                        <span class="font-semibold">MSF</span> 根据夏令时改变传输的小时值.
                      </li>
                      <li>
                        许多时钟在显示接收时间时会应用自己的偏移量, 例如北美市场的时钟允许选择美国时区
                        (太平洋东部).
                      </li>
                    </ul>
                    <p>
                      假设您希望在<span class="font-semibold">7月</span>访问
                      <span class="font-semibold">澳大利亚新南威尔士州悉尼</span>时设置一个来自英国的手表
                      该手表与<span class="font-semibold">MSF</span>同步:
                    </p>
                    <ul class="list-disc pl-6">
                      <li>
                        悉尼遵守
                        <span class="font-semibold">澳大利亚东部标准时间 (UTC+10:00)</span>.
                      </li>
                      <li>
                        英国的 MSF 传输
                        <span class="font-semibold">BST (UTC+01:00)</span> 时间.
                      </li>
                      <li>
                        悉尼比英国早9个小时, 因此偏移量为
                        <span class="font-semibold">+09:00</span>.
                      </li>
                    </ul>
                    <p>
                      但是, 如果您在
                      <span class="font-semibold">一月</span>访问:
                    </p>
                    <ul class="list-disc pl-6">
                      <li>
                        悉尼遵守
                        <span class="font-semibold">澳大利亚东部标准时间 (UTC+11:00)</span>.
                      </li>
                      <li>
                        MSF 传输 GMT
                        <span class="font-semibold">GMT (UTC+00:00)</span> 时间.
                      </li>
                      <li>
                        偏移量为
                        <span class="font-semibold">+11:00</span>!
                      </li>
                    </ul>
                  </span>
                </div>
              </div>

              <div class="collapse join-item collapse-arrow">
                <input
                  name="about-accordion"
                  type="radio"
                  @change=${this.#changeSection}
                />
                <div class="collapse-title pl-0 text-lg font-bold">
                  技术细节
                </div>
                <div
                  class="${overflowY[3]} collapse-content text-pretty text-sm sm:text-base [@media(min-height:600px)]:max-h-[calc(100dvh-23rem)]"
                >
                  <span class="flex min-w-0 flex-col gap-2">
                    <p>
                      <span class="font-semibold">时间站模拟器</span>
                      生成一种精心设计的音频波形,以便在通过消费级音频硬件播放时产生正确的RF噪声,从而被误认为是时间站广播.
                    </p>
                    <p>
                      具体来说,给定一个实时电台使用的基本载波频率,
                      它会生成并调制最高的奇数次谐波,该次谐波也低于常见播放采样率的奈奎斯特频率.
                    </p>
                    <p>
                      任何现实世界的 DAC 在播放过程中不可避免地会产生高频谐波, 
                      其中之一就是原始基波,它会通过音频输出路径中的物理线路和电路走线形成的临时天线，
                      以短距离无线电传输的形式泄漏到环境中.
                    </p>
                    <div
                      class="alert grid-flow-col items-start text-start"
                      role="alert"
                    >
                      <span class="size-6 sm:size-8">${svgIcons.info}</span>
                      <span class="flex min-w-0 flex-col gap-2">
                        <p>
                          由于它利用了这种泄漏,
                          <span class="font-semibold">
                            时间站模拟器
                          </span>
                          最适合
                          <span class="font-semibold">内置扬声器</span> 的
                          a <span class="font-semibold">手机或平板电脑</span>.
                        </p>
                        <p>
                          在某些情况下,
                          <span class="font-semibold">
                            有线耳机或耳塞
                          </span>
                          也可能适用.
                        </p>
                        <p>
                          高频谐波被认为是超出人类听觉范围的人工制品，因此它们通常会被音频压缩算法和更好的设备抑制.
                        </p>
                        <p>
                          因此蓝牙设备和发烧级设备不太可能正常工作.
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
