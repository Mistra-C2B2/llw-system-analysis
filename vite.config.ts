import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    assetsInlineLimit: 0, // ensures all assets are copied rather than inlined
  },
  plugins: [tailwindcss()],
  publicDir: "public", // this ensures files in the public directory are copied to dist
});
