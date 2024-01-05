import createTimeSignalModule from "../../wasm/timesignal.js";
import EventBus from "./eventbus";
import { TimeSignalReadyEvent, TimeSignalStateChangeEvent } from "./events";

interface TimeSignalModule extends EmscriptenModule {
  /* Emscripten library and WebAudio API functions. */
  addFunction(func: (...args: any) => any, signature: string): number;
  emscriptenRegisterAudioObject(object: AudioContext | AudioNode): number;
  emscriptenGetAudioObject(handle: number): AudioNode;

  /* Our functions. */
  _tsig_init(
    audioContextHandle: number,
    sampleRate: number,
    jsFinishInitCallbackPtr: number,
    jsCallbackPtr: number,
  ): void;

  _tsig_start(): void;

  _tsig_load_params(
    offset: number,
    stationIndex: number,
    jjyKhzIndex: number,
    dut1: number,
    noclip: boolean,
  ): void;

  _tsig_stop(): void;

  _tsig_print_timestamp(timestamp: number, iters: number): number;
}

type TimeSignalModuleParams = {
  stationIndex: number;
  jjyKhzIndex: number;
  offset: number;
  dut1: number;
  noclip: boolean;
};

const kTimeSignalState = [
  "idle",
  "startup",
  "reqparams",
  "loadparams",
  "fadein",
  "running",
  "fadeout",
  "suspend",
] as const;
export type TimeSignalState = (typeof kTimeSignalState)[number];

class RadioTimeSignal {
  static #instance: RadioTimeSignal;

  #module!: TimeSignalModule;

  #params?: TimeSignalModuleParams;

  audioContext!: AudioContext;

  audioWorkletNode!: AudioWorkletNode;

  #state = 0;

  get state(): TimeSignalState {
    return kTimeSignalState[this.#state];
  }

  private set state(state: number) {
    this.#state = state;
    EventBus.publish(TimeSignalStateChangeEvent, this.state);
  }

  constructor() {
    if (RadioTimeSignal.#instance != null)
      throw new Error("RadioTimeSignal is a singleton class.");
    createTimeSignalModule().then(this.#init);
    RadioTimeSignal.#instance = this;
  }

  #init = (module: TimeSignalModule) => {
    this.#module = module;

    this.audioContext = new AudioContext({ latencyHint: "playback" });
    const audioContextHandle = module.emscriptenRegisterAudioObject(
      this.audioContext,
    );

    /* Init continues below when Wasm invokes #finishInit() as a callback. */
    const finishInitPtr = module.addFunction(this.#finishInit, "vi");
    const communicatePtr = module.addFunction(this.#communicate, "vi");
    module._tsig_init(
      audioContextHandle,
      this.audioContext.sampleRate,
      finishInitPtr,
      communicatePtr,
    );
  };

  #finishInit = (audioWorkletNodeHandle: number) => {
    this.audioWorkletNode = this.#module.emscriptenGetAudioObject(
      audioWorkletNodeHandle,
    ) as AudioWorkletNode;
    this.audioWorkletNode.connect(this.audioContext.destination);

    /* Rarely, against spec, the AudioContext seems to start on its own?! */
    if (this.audioContext.state === "running") this.audioContext.suspend();

    EventBus.publish(TimeSignalReadyEvent);
  };

  #communicate = (state: number) => {
    console.log(`RadioTimeSignal.#communicate(${state});`);
    this.state = state;

    if (this.state === "idle") {
      this.audioContext.suspend().then(() => {
        console.log(`Suspended playback at ${Date.now()}`);
      });
    } else if (this.state === "reqparams") {
      this.#sendParams();
    }
  };

  #sendParams = () => {
    if (this.#params == null) return;

    const { dut1, jjyKhzIndex, noclip, offset, stationIndex } = this.#params;
    const outputLatencyMs = 1000 * this.audioContext.outputLatency;

    this.#module._tsig_load_params(
      offset + outputLatencyMs,
      stationIndex,
      jjyKhzIndex,
      dut1,
      noclip,
    );

    console.log(
      `Sent params at ${Date.now()}, output latency ${outputLatencyMs}`,
    );
  };

  start(params: TimeSignalModuleParams) {
    /*
     * We don't send parameters to the Audio Worklet thread immediately, as
     * AudioContext.outputLatency becomes available and somewhat stable only
     * *well* after audio playback has actually begun. The thread generates
     * silence for some time and signals an appropriate state change to
     * request params.
     */
    console.log(`RadioTimeSignal.start() at ${Date.now()}`);
    this.#params = params;
    if (this.audioContext.state === "suspended")
      this.audioContext.resume().then(this.#module._tsig_start);
  }

  stop() {
    /*
     * Once again, we don't stop the Audio Worklet thread immediately, as
     * invoking AudioContext.suspend() with nonzero PCM values remaining in
     * output buffers discards those samples unplayed and results in an
     * audible pop as the output waveform abruptly becomes zero. So the thread
     * fades out and generates silence for some time before signaling an
     * appropriate state change to indicate that we may suspend it.
     */
    if (this.audioContext.state === "running") this.#module._tsig_stop();
  }
}

export default new RadioTimeSignal();
