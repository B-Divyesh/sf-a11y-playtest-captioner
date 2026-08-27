import { defineConfig } from "vite";

export default defineConfig({
  root: "site",
  publicDir: "public",
  build: {
    outDir: "../dist/site",
    emptyOutDir: true,
    target: "es2022",
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        main: "site/index.html",
        privacy: "site/privacy/index.html",
        terms: "site/terms/index.html"
      }
    }
  },
  server: {
    host: "127.0.0.1"
  }
});
