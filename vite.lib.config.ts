import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/lib",
    emptyOutDir: true,
    target: "es2022",
    lib: {
      entry: "src/index.ts",
      formats: ["es", "cjs"],
      fileName: (format) => format === "es" ? "index.js" : "index.cjs"
    },
    sourcemap: true,
    minify: "esbuild"
  }
});
