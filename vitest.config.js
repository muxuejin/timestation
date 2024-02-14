import { defineConfig } from "vitest/config";
import babel from "vite-plugin-babel";

export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: "chrome",
      headless: true,
    },
  },
  plugins: [
    babel({
      babelConfig: {
        babelrc: false,
        configFile: false,
        presets: ["@babel/preset-typescript"],
        plugins: [
          ["@babel/plugin-proposal-decorators", { version: "2023-05" }],
        ],
        sourceMaps: "inline",
      },
      filter: /\.[jt]sx?$/,
    }),
  ],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
