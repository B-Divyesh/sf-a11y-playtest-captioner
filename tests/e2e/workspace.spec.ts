import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

type ConsoleTracker = {
  errors: string[];
  allowOfflineFetchFailures: boolean;
};

function isExpectedOfflineFetchFailure(text: string): boolean {
  return /^Failed to load resource: net::ERR_(INTERNET_DISCONNECTED|FAILED)$/i.test(text);
}

async function waitForControlledOfflineShell(page: Page): Promise<void> {
  const cacheName = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    const source = await fetch("/sw.js", { cache: "no-store" }).then((response) => response.text());
    const cacheName = source.match(/const CACHE = "([^"]+)"/)?.[1];
    if (!cacheName) throw new Error("The service worker does not declare an offline cache.");
    return cacheName;
  });

  await page.waitForFunction(async (expectedCache) => {
    const registration = await navigator.serviceWorker.ready;
    const cacheNames = await caches.keys();
    const controller = navigator.serviceWorker.controller;
    const controllerCache = controller ? await new Promise<string | null>((resolve) => {
      const channel = new MessageChannel();
      const timeout = window.setTimeout(() => resolve(null), 250);
      channel.port1.onmessage = (event) => {
        window.clearTimeout(timeout);
        resolve(event.data?.type === "a11y-captioner:cache-version" ? event.data.cache : null);
      };
      controller.postMessage({ type: "a11y-captioner:cache-version" }, [channel.port2]);
    }) : null;
    return registration.active?.state === "activated"
      && controllerCache === expectedCache
      // Activation removes older releases. Merely finding the new cache is not
      // enough: an installing worker can populate it before it controls us.
      && cacheNames.length === 1
      && cacheNames[0] === expectedCache;
  }, cacheName);

  const result = await page.evaluate(async (expectedCache) => {
    const registration = await navigator.serviceWorker.ready;
    const controller = navigator.serviceWorker.controller;
    const required = [
      new URL("/", location.href).href,
      ...[...document.querySelectorAll<HTMLImageElement | HTMLScriptElement>("img[src], script[src]")].map((element) => new URL(element.src, location.href).href)
    ];
    const cache = await caches.open(expectedCache);
    const missing = (await Promise.all(required.map(async (url) => (await cache.match(url, { ignoreVary: true })) ? null : url))).filter((url): url is string => url !== null);
    return {
      active: registration.active?.state,
      controller: controller?.scriptURL,
      missing
    };
  }, cacheName);

  expect(result.active).toBe("activated");
  expect(result.controller).toMatch(/\/sw\.js$/);
  expect(result.missing).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  const tracker: ConsoleTracker = { errors: [], allowOfflineFetchFailures: false };
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (tracker.allowOfflineFetchFailures && isExpectedOfflineFetchFailure(text)) return;
    tracker.errors.push(text);
  });
  page.on("pageerror", (error) => tracker.errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("#captioner-app")).toHaveAttribute("aria-busy", "false");
  (page as typeof page & { __consoleTracker?: ConsoleTracker }).__consoleTracker = tracker;
});

test.afterEach(async ({ page }) => {
  expect((page as typeof page & { __consoleTracker?: ConsoleTracker }).__consoleTracker?.errors ?? []).toEqual([]);
});

test("authors a state and rehearses its focus order with the keyboard", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByText("No states yet.")).toBeVisible();
  await page.getByRole("button", { name: "Add first state" }).click();

  await page.getByLabel("State name").fill("Gate warning");
  await page.getByLabel("State ID").fill("gate-warning");
  await page.getByLabel("State ID").press("Tab");
  await page.getByLabel(/State description/).fill("The north gate is closing. Reach it before the timer ends.");
  await page.getByRole("button", { name: "Add action" }).click();
  await page.getByLabel("Action label").fill("North gate lever");
  await page.getByLabel("Spoken hint").fill("Press E to hold the gate open.");

  const monitor = page.locator("#caption-monitor");
  await monitor.focus();
  await monitor.press("ArrowRight");
  await expect(page.locator("#active-cue")).toContainText("North gate lever");
  await expect(page.locator("#active-cue")).toContainText("ACTION 1 / 1");

  await page.reload();
  await expect(page.getByText("Gate warning", { exact: true }).first()).toBeVisible();
  await expect(page.locator("#preview-description")).toContainText("north gate is closing");
});

test("recovers from an invalid language tag and adds the corrected locale", async ({ page }) => {
  await page.getByRole("button", { name: "Add first state" }).click();
  const language = page.getByLabel("Language tag");

  await language.fill("!!");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(language).toHaveJSProperty("validationMessage", "Enter a valid BCP 47 language tag, such as fr or pt-BR.");
  expect(await language.evaluate((input) => (input as HTMLInputElement).validity.valid)).toBe(false);

  // Use real keyboard editing after a native validation failure: this is the
  // recovery path that previously remained blocked until a page reload.
  await language.focus();
  await language.press("ControlOrMeta+A");
  await language.pressSequentially("es-MX");
  expect(await language.evaluate((input) => (input as HTMLInputElement).validity.valid)).toBe(true);
  await page.getByRole("button", { name: "Add", exact: true }).click();

  await expect(page.getByRole("button", { name: "es-MX" })).toBeVisible();
  await expect(page.getByLabel(/State description/)).toHaveAccessibleName(/State description es-MX/);
  await expect(page.locator("#review-language")).toHaveValue("es-MX");
});

test("loads, exports, and restores the example project", async ({ page }) => {
  await page.getByRole("button", { name: "Load example project" }).click();
  await expect(page.getByText("Ravine crossing", { exact: true }).first()).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export project" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("signal-hollow-captions.json");
  await page.getByRole("button", { name: /Delete “Ravine crossing”/ }).click();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Ravine crossing", { exact: true }).first()).toBeVisible();
});

test("has no serious accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page: page as never }).analyze();
  const serious = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""));
  expect(serious).toEqual([]);
});

test("reopens the workspace offline after the first visit", async ({ page, context }) => {
  // A first install can claim the current client after its initial navigation.
  // Reload while online first so the offline navigation is unquestionably
  // controlled by the activated worker and its finished precache.
  await waitForControlledOfflineShell(page);
  await page.reload();
  await expect(page.locator("#captioner-app")).toHaveAttribute("aria-busy", "false");
  await waitForControlledOfflineShell(page);

  const tracker = (page as typeof page & { __consoleTracker?: ConsoleTracker }).__consoleTracker;
  expect(tracker).toBeDefined();
  if (tracker) tracker.allowOfflineFetchFailures = true;
  try {
    await context.setOffline(true);
    await page.reload();
    // The heading is static HTML; wait for the module to finish wiring its
    // connection listener before asserting the dynamic offline status.
    await expect(page.locator("#captioner-app")).toHaveAttribute("aria-busy", "false");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Describe what the canvas can’t say.");
    // Playwright's mobile network emulation can leave navigator.onLine unchanged
    // and does not consistently emit this browser event. Dispatch the same
    // platform signal a real offline transition supplies.
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));
    await expect(page.getByText("Offline — local editing still works")).toBeVisible();

    // The useful offline path is more than a cached headline: local authoring
    // must still accept and retain a new state after the reload.
    await page.getByRole("button", { name: "Add first state" }).click();
    await page.getByLabel("State name").fill("Offline checkpoint");
    await page.getByLabel("State name").blur();
    await expect(page.getByText("Offline checkpoint", { exact: true }).first()).toBeVisible();
  } finally {
    await context.setOffline(false);
    if (tracker) tracker.allowOfflineFetchFailures = false;
  }
});

test("fits a 390px viewport without page-level horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile-specific layout assertion");
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  await page.locator("#workspace").scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Add game state" })).toBeVisible();
});
