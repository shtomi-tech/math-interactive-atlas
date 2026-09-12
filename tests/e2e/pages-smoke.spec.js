import { test, expect } from "@playwright/test";
import { collectBrowserErrors, expectNoBrowserErrors } from "./helpers.js";

test("deployed learning surfaces initialize and load their versioned assets", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  const routes = [
    ["./", "#atlasCatalogView"],
    ["./atlas.html", "#atlasCatalogView"],
    ["./practice.html", "#practiceCatalogView"],
    ["./sets.html", "#setsMain"],
    ["./worksheet.html", ".worksheet-page"],
    ["./progress.html", "#progressMain"]
  ];
  for (const [route, selector] of routes) {
    const response = await page.goto(route);
    expect(response?.ok(), `${route} did not return a successful response`).toBeTruthy();
    await expect(page.locator(selector)).toBeVisible();
  }
  const assetVersion = await page.evaluate(async () => (await fetch("./static/asset-version.txt")).text());
  expect(assetVersion.trim()).toMatch(/^20260913-/);
  await expectNoBrowserErrors(errors);
});
