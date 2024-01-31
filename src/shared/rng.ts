export default class Rng {
  #min: number;

  #max: number;

  #isNormal: boolean;

  #mean?: number;

  #stdDev?: number;

  constructor(min = 0, max = 1, mean?: number, stdDev?: number) {
    this.#min = min;
    this.#max = max;
    this.#isNormal = mean != null && stdDev != null && stdDev > 0;
    if (this.#isNormal) {
      this.#mean = mean;
      this.#stdDev = stdDev;
    }
  }

  #next: number[] = [];

  next() {
    if (!this.#isNormal)
      return Math.random() * (this.#max - this.#min) + this.#min;

    /* Box-Muller. */
    while (this.#next.length === 0) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
      const cand0 = z0 * this.#stdDev! + this.#mean!;
      const cand1 = z1 * this.#stdDev! + this.#mean!;
      if (this.#min <= cand0 && cand0 <= this.#max) this.#next.push(cand0);
      if (this.#min <= cand1 && cand1 <= this.#max) this.#next.push(cand1);
    }

    return this.#next.pop()!;
  }
}
