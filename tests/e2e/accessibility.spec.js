import { test, expect } from "@playwright/test";
import { appPath, collectBrowserErrors, expectNoBrowserErrors } from "./helpers.js";

test("interactive controls have accessible names", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  for (const url of [
    appPath("interactions.html"),
    appPath("atlas.html?content=confidence-interval"),
    appPath("atlas.html?content=inequality-region-2d"),
    appPath("practice.html"),
    appPath("sets.html")
  ]) {
    await page.goto(url);
    const unnamed = await page.locator("button:visible, input:visible, select:visible, textarea:visible").evaluateAll((elements) => elements.filter((element) => {
      if (element.getAttribute("aria-label") || element.getAttribute("aria-labelledby")) return false;
      if (element.tagName === "BUTTON") return !Boolean(element.textContent?.trim());
      return !Boolean(element.labels?.length);
    }).map((element) => `${element.tagName}.${element.className}`));
    expect(unnamed, `${url} unnamed visible controls`).toEqual([]);
    const images = await page.locator('[role="img"]:visible').evaluateAll((elements) => elements.filter((element) => !element.getAttribute("aria-label") && !element.getAttribute("aria-labelledby")).length);
    expect(images, `${url} unnamed visible graphics`).toBe(0);
  }
  await expectNoBrowserErrors(errors);
});
