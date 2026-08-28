import { defineConfig } from "vite";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

function injectOfflineAssets() {
  return {
    name: "inject-offline-assets",
    apply: "build" as const,
    async closeBundle() {
      const output = resolve(process.cwd(), "dist/site");
      const assets = (await readdir(resolve(output, "assets"))).map((file) => `/assets/${file}`);
      const workerPath = resolve(output, "sw.js");
      const worker = await readFile(workerPath, "utf8");
      await writeFile(workerPath, worker.replace(
        "const BUILD_ASSETS = []; // __BUILD_ASSETS__",
        `const BUILD_ASSETS = ${JSON.stringify(assets)};`
      ));
    }
  };
}

export default defineConfig({
  plugins: [injectOfflineAssets()],
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
