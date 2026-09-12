import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev-only config for the interactive playground.
// Library build stays untouched in vite.config.ts.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5199,
  },
  build: {
    outDir: "playground-dist",
  },
  preview: {
    port: 5199,
  },
});
