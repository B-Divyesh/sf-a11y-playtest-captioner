import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function page(path: string): string {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("site release surface", () => {
  it("keeps the first-screen demo action and its three observable facts", () => {
    const home = page("site/index.html");
    expect(home).toContain("<h1 id=\"hero-title\">Caption game states before playtests</h1>");
    expect(home).toContain('href="/demo">Try it with sample data</a>');
    expect(home).toContain("Private: sample data never changes your real draft.");
    expect(home).toContain("Offline: works after the first visit.");
    expect(home).toContain("Free: no account or payment.");
  });

  it("ships short titles, canonical/social metadata, build identity, and a styled 404 page", () => {
    for (const path of ["site/index.html", "site/privacy/index.html", "site/terms/index.html", "site/404.html"]) {
      const html = page(path);
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
      expect(title.length, path).toBeLessThanOrEqual(60);
      expect(html).toContain('rel="canonical"');
      expect(html).toContain('property="og:image"');
      expect(html).toContain('name="twitter:card"');
      expect(html).toContain('rel="apple-touch-icon"');
      expect(html).toContain('data-build-id>__BUILD_ID__');
    }
    expect(page("site/404.html")).toContain("<h1>Page not found</h1>");
  });
});
