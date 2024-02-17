import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import basicSsl from "@vitejs/plugin-basic-ssl";
import path from "path";

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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
});
