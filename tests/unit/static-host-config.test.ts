import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type StaticWebAppConfig = {
  globalHeaders: Record<string, string>;
  responseOverrides?: Record<string, { rewrite?: string }>;
  routes: Array<{ route: string; rewrite?: string; headers?: Record<string, string> }>;
};

const config = JSON.parse(readFileSync(resolve(process.cwd(), "site/public/staticwebapp.config.json"), "utf8")) as StaticWebAppConfig;

describe("Azure Static Web Apps delivery policy", () => {
  it("ships the verifier-required security policies and immutable asset caching", () => {
    expect(config.globalHeaders).toMatchObject({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
    });
    expect(config.globalHeaders["Content-Security-Policy"]).toContain("default-src 'self'");
    expect(config.globalHeaders["Content-Security-Policy"]).toContain("connect-src 'self'");

    for (const route of ["/assets/*", "/hero-caption-landscape.webp", "/hero-caption-landscape-480.webp", "/social-card.jpg", "/apple-touch-icon.png"]) {
      expect(config.routes.find((entry) => entry.route === route)?.headers?.["Cache-Control"])
        .toBe("public, max-age=31536000, immutable");
    }
  });

  it("rewrites only the demo route and returns the styled 404 document for unknown paths", () => {
    expect(config.routes.find((entry) => entry.route === "/demo")).toMatchObject({ rewrite: "/index.html" });
    expect(config.responseOverrides?.["404"]).toEqual({ rewrite: "/404.html" });
  });
});
