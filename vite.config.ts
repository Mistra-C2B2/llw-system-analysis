import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default {
  base: "./",
  build: {
    outDir: "dist",
  },
  plugins: [tailwindcss()],
};
