import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  build: {
    minify: "terser",
    rollupOptions: {
      external: [/wasm\/.*\.js/],
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
    basicSsl(),
  ],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
