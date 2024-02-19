/** @type {import("tailwindcss").Config} */

import tailwindTheme from "tailwindcss/defaultTheme";
import daisyui from "daisyui";

export default {
  content: {
    files: ["./src/**/*.{js,ts}"],
  },
  theme: {
    extend: {
      animation: {
        boingo: "boingo 0.3s 1",
        shapes: "shapes linear infinite",
      },
      dropShadow: {
        aura: "0 0 0.125rem hsl(var(--color-drop-shadow) / 0.6)",
      },
      fontFamily: {
        sans: ["Inter", ...tailwindTheme.fontFamily.sans],
        serif: ["Time Station Emulator", ...tailwindTheme.fontFamily.serif],
        mono: ["Victor Mono", ...tailwindTheme.fontFamily.mono],
      },
      gridTemplateColumns: {
        fit: "minmax(min-content, max-content) minmax(min-content, max-content)",
      },
      keyframes: {
        boingo: {
          "0%, 100%": {
            "transform": "translateY(0)",
            "animation-timing-function": "cubic-bezier(0.5, -0.5, 0.5, 1)",
          },
          "20%": {
            "transform": "translateY(-6%)",
            "animation-timing-function": "cubic-bezier(0.5, 0, 0.5, 1)",
          },
          "40%": {
            "transform": "translateY(1.5%)",
            "animation-timing-function": "cubic-bezier(0.5, 0, 0.5, 1)",
          },
          "60%": {
            "transform": "translateY(-2%)",
            "animation-timing-function": "cubic-bezier(0.5, 0, 0.5, 1)",
          },
          "80%": {
            "transform": "translateY(0.5%)",
            "animation-timing-function": "cubic-bezier(0.5, 0, 0.5, 1.5)",
          },
        },
        shapes: {
          "0%": {
            transform: "translateY(0)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(-200vh)",
            opacity: "0",
          },
        },
      },
      width: {
        18: "4.5rem",
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        lightish: {
          "color-scheme": "light",
          "primary": "#5E81AC",
          "secondary": "#81A1C1",
          "accent": "#4D7399",
          "neutral": "#4C566A",
          "neutral-content": "#D8DEE9",
          "base-100": "#ECEFF4",
          "base-200": "#E5E9F0",
          "base-300": "#D8DEE9",
          "base-content": "#2E3440",
          "info": "#B48EAD",
          "success": "#A3BE8C",
          "warning": "#EBCB8B",
          "error": "#BF616A",
          "--rounded-box": "0.4rem",
          "--rounded-btn": "0.2rem",
          "--rounded-badge": "0.4rem",
          "--tab-radius": "0.2rem",
          "--animation-btn": "0.5s",
          "--animation-input": "0.5s",
        },
      },
      {
        darkish: {
          "color-scheme": "dark",
          "primary": "#1C4E80",
          "secondary": "#7C909A",
          "accent": "#061d45",
          "neutral": "#23282E",
          "base-100": "#1d232a",
          "base-200": "#191e24",
          "base-300": "#15191e",
          "base-content": "#B2CCD6",
          "info": "#0091D5",
          "success": "#6BB187",
          "warning": "#DBAE59",
          "error": "#AC3E31",
          "--rounded-box": "0.4rem",
          "--rounded-btn": "0.2rem",
          "--rounded-badge": "0.4rem",
          "--tab-radius": "0.2rem",
          "--animation-btn": "0.5s",
          "--animation-input": "0.5s",
        },
      },
    ],
  },
};
