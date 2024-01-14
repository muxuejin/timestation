/* eslint-disable no-restricted-globals */
/* eslint-disable no-await-in-loop */

import { ServerOffsetEstimate, ServerTimeParams } from "./servertime";
import monotonicTime from "./time";

type ServerTimeResponse = {
  serverSec: number;
  localTime: number;
  duration: number;
};

const ctx: Worker = self as any;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

class ServerTimeWorker {
  #absTimeout: number;

  #precision: number;

  #serverHighMs = 1000;

  #serverLowMs = 0;

  get #serverMs() {
    return (this.#serverLowMs + this.#serverHighMs) / 2;
  }

  #serverSec = -1;

  #localTime = -1;

  #latency = -1;

  constructor(timeout: number, precision: number) {
    this.#absTimeout = monotonicTime() + timeout;
    this.#precision = precision;
  }

  async #fetchServerTime(): Promise<ServerTimeResponse | undefined> {
    try {
      /* This just needs to be good enough to (maybe) defeat caching. */
      const randomUrl = `serverTime.${Math.random().toString(36).slice(2)}`;

      const now = monotonicTime();
      const timeoutMs = Math.max(this.#absTimeout - now, 1);
      const signal = AbortSignal.timeout(timeoutMs);
      const response = await fetch(randomUrl, { method: "HEAD", signal });
      const later = monotonicTime();

      const dateHeader = response.headers.get("Date")!;
      const parsedDate = new Date(dateHeader).getTime();
      const serverSec = Math.trunc(parsedDate / 1000);
      const duration = later - now;
      const localTime = now + duration / 2;

      return { serverSec, localTime, duration };
    } catch {
      /* We probably timed out. The exact reason we failed doesn't matter. */
      return undefined;
    }
  }

  async refineEstimate() {
    const fetchResult = await this.#fetchServerTime();
    if (fetchResult == null) return;

    const { serverSec, localTime, duration } = fetchResult;

    this.#latency = duration / 2;
    if (this.#serverSec < 0) {
      this.#serverSec = serverSec;
      this.#localTime = localTime;
      return; /* First run, we can't do more. */
    }

    const currentPrecision = this.#serverHighMs - this.#serverLowMs;
    if (duration > currentPrecision) return;

    const msSinceFirst = localTime - this.#localTime;
    const serverMs = 1000 - (msSinceFirst % 1000);
    if (serverMs < this.#serverLowMs || this.#serverHighMs < serverMs) return;

    const secSinceFirst = Math.trunc(msSinceFirst / 1000);
    const expectedServerSec = this.#serverSec + secSinceFirst;
    if (serverSec === expectedServerSec)
      this.#serverHighMs = Math.min(this.#serverHighMs, serverMs);
    else this.#serverLowMs = Math.max(this.#serverLowMs, serverMs);
  }

  nextDelayMs() {
    const precisionMs = this.#serverHighMs - this.#serverLowMs;
    if (precisionMs < this.#precision) return undefined;

    const now = monotonicTime();
    let delayMs = 1000;
    if (this.#serverSec >= 0) {
      const msSinceFirst = now - this.#localTime;
      const secSinceFirst = Math.trunc(msSinceFirst / 1000);
      const nextRequestMs = 1000 * (secSinceFirst + 1) - this.#serverMs;
      const nextRequestTime = this.#localTime + nextRequestMs - this.#latency;
      delayMs = nextRequestTime - now;
    }

    while (delayMs < 0) delayMs += 1000;
    if (now + delayMs > this.#absTimeout) return undefined;

    return delayMs;
  }

  estimate() {
    return this.#serverSec >= 0 ?
        1000 * this.#serverSec + this.#serverMs - this.#localTime
      : undefined;
  }
}

async function handleMessage(event: MessageEvent) {
  const { timeout, precision } = event.data as ServerTimeParams;
  const serverTimeWorker = new ServerTimeWorker(timeout, precision);

  for (;;) {
    await serverTimeWorker.refineEstimate();

    const serverOffset = serverTimeWorker.estimate();
    const delayMs = serverTimeWorker.nextDelayMs();
    const finished = delayMs == null;

    const curEstimate: ServerOffsetEstimate = { serverOffset, finished };
    ctx.postMessage(curEstimate);

    if (finished) break;

    await sleep(delayMs);
  }
}

ctx.addEventListener("message", handleMessage);
