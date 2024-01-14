/* eslint-disable no-console */

import EventBus from "./eventbus";
import { ServerOffsetEvent, ServerTimeReadyEvent } from "./events";

export type ServerOffsetEstimate = {
  serverOffset: number | undefined;
  finished: boolean;
};

export type ServerTimeParams = {
  timeout: number;
  precision: number;
};

export const kServerTimePrecision = 100 as const;

export const kServerTimeTimeout = 8000 as const;

class ServerTimeTask {
  #worker?: Worker;

  #serverOffset?: number;

  constructor() {
    this.#worker = new Worker(
      new URL("./servertimeworker.ts", import.meta.url),
      { type: "module" },
    );
    this.#worker.addEventListener("message", this.#handleWorkerMessage);
    this.#worker.postMessage({
      timeout: kServerTimeTimeout,
      precision: kServerTimePrecision,
    });
  }

  #handleWorkerMessage = (event: MessageEvent) => {
    const { serverOffset, finished } = event.data as ServerOffsetEstimate;

    if (serverOffset != null) this.#serverOffset = serverOffset;
    if (!finished) return;

    this.#worker?.terminate();
    this.#worker = undefined;

    if (this.#serverOffset != null) {
      const absServerOffset = Math.abs(this.#serverOffset);
      const isAlreadySynced = absServerOffset <= kServerTimePrecision;
      if (!isAlreadySynced)
        EventBus.publish(ServerOffsetEvent, this.#serverOffset);

      let message = `Server is ${absServerOffset.toFixed(3)} ms `;
      message += this.#serverOffset < 0 ? "behind " : "ahead ";
      message += `(±${kServerTimePrecision} ms), `;
      message += isAlreadySynced ? "close enough." : "synced.";
      console.log(message);

      this.#serverOffset = undefined;
    } else {
      console.error("Failed to determine server time.");
    }

    EventBus.publish(ServerTimeReadyEvent);
  };
}

export default function serverTimeTask() {
  /* eslint-disable-next-line no-new */
  new ServerTimeTask();
}
