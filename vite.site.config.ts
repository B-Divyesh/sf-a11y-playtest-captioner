import { defineConfig } from "vite";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
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
      const homePage = await readFile(resolve(output, "index.html"), "utf8");
      const demoPage = homePage
        .replace('content="Author localized game-state captions and rehearse their keyboard order before browser-game playtests."', 'content="Try the isolated sample workspace for browser-game caption authoring."')
        .replace('href="https://a11y-playtest-captioner.sociobot.in/"', 'href="https://a11y-playtest-captioner.sociobot.in/demo"')
        .replaceAll('content="A11y Playtest Captioner — game-state captions"', 'content="Demo — A11y Playtest Captioner"')
        .replaceAll('content="Author localized game-state captions and rehearse their keyboard order before browser-game playtests."', 'content="Try the isolated sample workspace for browser-game caption authoring."')
        .replace('content="https://a11y-playtest-captioner.sociobot.in/"', 'content="https://a11y-playtest-captioner.sociobot.in/demo"')
        .replace('<title>A11y Playtest Captioner — game-state captions</title>', '<title>Demo — A11y Playtest Captioner</title>')
        .replace('<h1 id="hero-title">Caption game states before playtests</h1>', '<h2 id="hero-title">Caption game states before playtests</h2>')
        .replace('<h2 id="demo-overview-title"><span id="demo-preview-state"></span></h2>', '<h1 id="demo-overview-title"><span id="demo-preview-state"></span></h1>');
      await mkdir(resolve(output, "demo"), { recursive: true });
      await writeFile(resolve(output, "demo/index.html"), demoPage);
      const pageFiles = ["index.html", "demo/index.html", "privacy/index.html", "terms/index.html", "404.html"];
      const shellFiles = [
        "index.html",
        "privacy/index.html",
        "terms/index.html",
        "hero-caption-landscape.webp",
        "hero-caption-landscape-480.webp",
        "favicon.svg",
        ...assets.map((asset) => asset.slice(1))
      ];
      const hasher = createHash("sha256").update(worker);
      for (const file of shellFiles) hasher.update(file).update(await readFile(resolve(output, file)));
      const buildId = hasher.digest("hex").slice(0, 12);
      const injected = worker.replace(
        "const BUILD_ASSETS = []; // __BUILD_ASSETS__",
        `const BUILD_ASSETS = ${JSON.stringify(assets)};`
      ).replaceAll("__BUILD_ID__", buildId);
      if (injected === worker || injected.includes("__BUILD_ID__")) throw new Error("Service worker build markers were not injected.");
      await writeFile(workerPath, injected);
      await Promise.all(pageFiles.map(async (file) => {
        const pagePath = resolve(output, file);
        const page = await readFile(pagePath, "utf8");
        if (!page.includes("__BUILD_ID__")) throw new Error(`Build marker was not found in ${file}.`);
        await writeFile(pagePath, page.replaceAll("__BUILD_ID__", buildId));
      }));
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
        terms: "site/terms/index.html",
        notFound: "site/404.html"
      }
    }
  },
  server: {
    host: "127.0.0.1"
  }
});
