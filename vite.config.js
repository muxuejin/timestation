import { defineConfig } from "vite";

import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";
import babel from "vite-plugin-babel";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";

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
    viteStaticCopy({
      targets: [{ src: "./wasm/*.{js,wasm}", dest: "wasm" }],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },
});
