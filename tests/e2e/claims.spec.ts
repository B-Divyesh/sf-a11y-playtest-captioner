import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const REAL_STORAGE_KEY = "a11y-playtest-captioner:project:v1";
const DEMO_STORAGE_KEY = "demo:a11y-playtest-captioner:project:v1";

async function openDemo(page: import("@playwright/test").Page): Promise<void> {
  await page.goto("/demo");
  await expect(page.locator("#captioner-app")).toHaveAttribute("aria-busy", "false");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Caption game states before playtests");
  await expect(page.getByLabel("Demo controls")).toBeVisible();
  await expect(page.getByText("Ravine crossing", { exact: true }).first()).toBeVisible();
}

test("keeps a real draft isolated from demo actions @claim:demo-isolation", async ({ page }) => {
  const realDraft = JSON.stringify({ sentinel: "ordinary-draft-must-survive" });
  await page.addInitScript(({ key, value }) => localStorage.setItem(key, value), { key: REAL_STORAGE_KEY, value: realDraft });
  await openDemo(page);

  await page.getByRole("button", { name: "Add action" }).click();
  await page.getByLabel("Action label").last().fill("Demo-only action");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByRole("button", { name: "Remove Loose rope" })).toBeVisible();

  const duringDemo = await page.evaluate(({ realKey, demoKey }) => ({
    real: localStorage.getItem(realKey),
    demo: localStorage.getItem(demoKey)
  }), { realKey: REAL_STORAGE_KEY, demoKey: DEMO_STORAGE_KEY });
  expect(duringDemo.real).toBe(realDraft);
  expect(duringDemo.demo).toContain("ravine-crossing");

  await page.getByRole("button", { name: "Start for real" }).click();
  await page.waitForURL(/\/$/);
  const afterExit = await page.evaluate(({ realKey, demoKey }) => ({
    real: localStorage.getItem(realKey),
    demo: localStorage.getItem(demoKey)
  }), { realKey: REAL_STORAGE_KEY, demoKey: DEMO_STORAGE_KEY });
  expect(afterExit).toEqual({ real: realDraft, demo: null });
});

test("reopens the sample demo offline after its first visit @claim:offline-reload", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await openDemo(page);
    await page.waitForFunction(async () => {
      const registration = await navigator.serviceWorker.ready;
      return registration.active?.state === "activated" && Boolean(navigator.serviceWorker.controller);
    });
    await page.reload();
    await expect(page.locator("#captioner-app")).toHaveAttribute("aria-busy", "false");

    await context.setOffline(true);
    await page.reload();
    await expect(page.locator("#captioner-app")).toHaveAttribute("aria-busy", "false");
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));
    await expect(page.getByText("Offline — local editing still works")).toBeVisible();
    await expect(page.getByText("Watcher alert", { exact: true }).first()).toBeVisible();
  } finally {
    await context.setOffline(false);
    await context.close();
  }
});

test("keeps demo edits and browser speech on this origin @claim:local-only", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await openDemo(page);

  await page.getByLabel(/State description/).fill("A broken bridge blocks the path. Secure the rope to cross.");
  await page.locator("#caption-monitor").focus();
  await page.locator("#caption-monitor").press("ArrowRight");
  await page.getByRole("button", { name: /Speak/ }).click();

  expect(await page.context().cookies()).toEqual([]);
  expect(requests).not.toHaveLength(0);
  for (const request of requests) expect(new URL(request).origin).toBe("http://127.0.0.1:4173");
  const storage = await page.evaluate((key) => localStorage.getItem(key), DEMO_STORAGE_KEY);
  expect(storage).toContain("A broken bridge blocks the path");
});

test("lets a visitor author in the free demo without a sign-in or payment step @claim:free-demo", async ({ page }) => {
  await openDemo(page);
  await page.getByRole("button", { name: "Add action" }).click();
  await page.getByLabel("Action label").last().fill("Free demo action");
  await page.getByLabel("Spoken hint").last().fill("This action was authored without an account.");
  await expect(page.getByText("Free demo action", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in|pay|checkout/i })).toHaveCount(0);
});

test("lets a visitor author localized captions and rehearse action order @claim:author-review", async ({ page }) => {
  await openDemo(page);
  await page.getByLabel(/State description/).fill("The north bridge is broken. Secure the rope before crossing.");
  const monitor = page.locator("#caption-monitor");
  await monitor.focus();
  await monitor.press("ArrowRight");
  await expect(page.locator("#active-cue")).toContainText("Loose rope");
  await monitor.press("End");
  await expect(page.locator("#active-cue")).toContainText("Anchor post");
});

test("exports the demo project as JSON @claim:json-export", async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export project" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("signal-hollow-captions.json");
  const stream = await download.createReadStream();
  if (!stream) throw new Error("The exported project did not expose a download stream.");
  const parts: Buffer[] = [];
  for await (const part of stream) parts.push(part as Buffer);
  const contents = Buffer.concat(parts).toString("utf8");
  expect(JSON.parse(contents)).toMatchObject({ version: 1, name: "Signal Hollow" });
});

test("has no axe accessibility violations in the populated demo", async ({ page }) => {
  await openDemo(page);
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations).toEqual([]);
});

test("opens the same isolated sample with the documented demo query", async ({ page }) => {
  await page.goto("/?demo=1");
  await expect(page.getByLabel("Demo controls")).toBeVisible();
  await expect(page.getByText("Watcher alert", { exact: true }).first()).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), REAL_STORAGE_KEY)).toBeNull();
  expect(await page.evaluate((key) => localStorage.getItem(key), DEMO_STORAGE_KEY)).toContain("watcher-alert");
});
