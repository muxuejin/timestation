import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@components/loadingicon";
import { LoadingIcon } from "@components/loadingicon";

import "@shared/styles.css";

import { delay } from "@test/utils";

const kDelayMs = 250 as const;

describe("Loading icon", () => {
  let loadingIcon: LoadingIcon;

  beforeEach(() => {
    loadingIcon = document.createElement("loading-icon");
    document.body.appendChild(loadingIcon);
  });

  afterEach(() => {
    loadingIcon.remove();
  });

  it("renders an icon", () => {
    const iconSvg = loadingIcon.querySelector("svg")!;
    expect(iconSvg).not.toBeNull();
  });

  it("cycles through eight icons", async () => {
    const firstIconSvg = loadingIcon.querySelector("svg")!.cloneNode(true);
    let iconSvg = firstIconSvg;
    for (let i = 0; i < 8; i++) {
      /* eslint-disable no-await-in-loop */
      await delay(kDelayMs);
      const curIconSvg = loadingIcon.querySelector("svg")!.cloneNode(true);
      expect(iconSvg.isEqualNode(curIconSvg)).toBe(false);
      iconSvg = curIconSvg;
    }
    expect(firstIconSvg.isEqualNode(iconSvg)).toBe(true);
  });
});
