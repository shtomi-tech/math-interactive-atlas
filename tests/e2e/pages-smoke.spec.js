import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { appPath, collectBrowserErrors, expectNoBrowserErrors } from "./helpers.js";

const expectedAssetVersion = process.env.EXPECTED_ASSET_VERSION?.trim()
  || readFileSync(new URL("../../static/asset-version.txt", import.meta.url), "utf8").trim();

test("deployed learning surfaces initialize and load their versioned assets", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  const routes = [
    [appPath(), "#atlasCatalogView"],
    [appPath("atlas.html"), "#atlasCatalogView"],
    [appPath("practice.html"), "#practiceCatalogView"],
    [appPath("sets.html"), "#setsMain"],
    [appPath("worksheet.html"), ".worksheet-page"],
    [appPath("progress.html"), "#progressMain"]
  ];
  for (const [route, selector] of routes) {
    const response = await page.goto(route);
    expect(response?.ok(), `${route} did not return a successful response`).toBeTruthy();
    await expect(page.locator(selector)).toBeVisible();
  }
  const assetVersion = await page.evaluate(async () => (await fetch("./static/asset-version.txt")).text());
  expect(assetVersion.trim()).toBe(expectedAssetVersion);
  await expectNoBrowserErrors(errors);
});
