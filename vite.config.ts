import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src"],
      outDir: "dist",
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: {
        "ask-ai-badge": "src/index.ts",
        "element": "src/element.ts",
      },
      name: "AskAiBadge",
      fileName: (format, entryName) => {
        if (entryName === "element") {
          return format === "es" ? "element.js" : "element.cjs";
        }
        return format === "es" ? "ask-ai-badge.js" : "ask-ai-badge.cjs";
      },
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: (id, parentId) => {
        // Only externalize React for the React entry, NOT for the Web Component element
        if (parentId && parentId.includes("element.ts")) {
          return false;
        }
        return ["react", "react-dom", "react/jsx-runtime"].includes(id);
      },
      output: {
        exports: "named",
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
    minify: "esbuild",
  },
});
