import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator("#captioner-app")).toHaveAttribute("aria-busy", "false");
  (page as typeof page & { __errors?: string[] }).__errors = errors;
});

test.afterEach(async ({ page }) => {
  expect((page as typeof page & { __errors?: string[] }).__errors ?? []).toEqual([]);
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

test("fits a 390px viewport without page-level horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile-specific layout assertion");
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  await page.locator("#workspace").scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Add game state" })).toBeVisible();
});
