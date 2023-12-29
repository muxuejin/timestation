/** @type {import("tailwindcss").Config} */

import tailwindTheme from "tailwindcss/defaultTheme";
import daisyui from "daisyui";

export default {
  content: {
    files: ["./src/**/*.{js,ts}"],
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", ...tailwindTheme.fontFamily.sans],
        mono: ["Victor Mono", ...tailwindTheme.fontFamily.mono],
      },
      dropShadow: {
        1: "1px 2px 2px hsl(var(--color-drop-shadow) / 0.6)",
        2: [
          "1px 2px 2px hsl(var(--color-drop-shadow) / 0.333)",
          "2px 4px 4px hsl(var(--color-drop-shadow) / 0.333)",
          "3px 6px 6px hsl(var(--color-drop-shadow) / 0.333)",
        ],
        3: [
          "1px 2px 2px hsl(var(--color-drop-shadow) / 0.2)",
          "2px 4px 4px hsl(var(--color-drop-shadow) / 0.2)",
          "4px 8px 8px hsl(var(--color-drop-shadow) / 0.2)",
          "8px 16px 16px hsl(var(--color-drop-shadow) / 0.2)",
          "16px 32px 32px hsl(var(--color-drop-shadow) / 0.2)",
        ],
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
          "accent": "#88C0D0",
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
        },
      },
      {
        darkish: {
          "color-scheme": "dark",
          "primary": "#1C4E80",
          "secondary": "#7C909A",
          "accent": "#EA6947",
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
        },
      },
    ],
  },
};
