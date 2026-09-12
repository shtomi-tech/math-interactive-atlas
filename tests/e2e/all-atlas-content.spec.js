import { test, expect } from "@playwright/test";
import { collectBrowserErrors, expectNoBrowserErrors } from "./helpers.js";

test("all atlas contents mount without fallback or reset errors", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto("/atlas.html");
  const contents = await page.evaluate(async () => (await fetch("./static/atlas/content-data.json")).json());
  expect(contents).toHaveLength(89);

  for (const content of contents) {
    await page.goto(`/atlas.html?content=${encodeURIComponent(content.id)}`);
    await expect(page.locator("#viewerTitle")).toHaveText(content.title);
    await expect(page.locator(".atlas-interactive-frame")).toBeVisible();
    await expect(page.locator(".atlas-canvas-fallback"), `fallback for ${content.id}`).toHaveCount(0);
    const reset = page.getByRole("button", { name: "↺ 初期状態に戻す" });
    await expect(reset).toBeVisible();
    await reset.click();
    await expect(page.locator(".atlas-viewer")).toBeVisible();
  }

  await expectNoBrowserErrors(errors);
});
