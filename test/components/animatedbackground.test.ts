import { afterEach, beforeEach, describe, expect, it } from "vitest";

import "@components/animatedbackground";
import { AnimatedBackground } from "@components/animatedbackground";

import "@shared/styles.css";

import { delay } from "@test/utils";

const kShapeCount = 64 as const;

describe("Animated background", async () => {
  let animatedBackground: AnimatedBackground;
  let shapes: NodeListOf<HTMLSpanElement>;

  beforeEach(async () => {
    animatedBackground = document.createElement("animated-background");
    document.body.appendChild(animatedBackground);
    await delay();
    shapes = animatedBackground.querySelectorAll("span.animate-shapes");
  });

  afterEach(() => {
    animatedBackground.remove();
  });

  it("renders with the correct number of shapes", () => {
    expect(shapes.length).toBe(kShapeCount);
  });

  it("renders randomly placed and animated shapes", () => {
    const shapeSpec = new Set<string>();
    shapes.forEach((shape) => {
      const { left, bottom, width, height } = shape.style;
      shapeSpec.add(`${left}/${bottom}/${width}/${height}`);
    });
    expect(shapeSpec.size).toBe(kShapeCount);
  });
});
