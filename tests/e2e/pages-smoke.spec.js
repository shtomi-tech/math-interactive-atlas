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
    [appPath("interactions.html"), "#libraryCatalogView"],
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
  const auditResponsePromise = page.waitForResponse((response) => new URL(response.url()).pathname.endsWith("/research/repository-audit.json"));
  await page.goto(appPath("atlas.html"));
  const auditResponse = await auditResponsePromise;
  expect(auditResponse.status()).toBe(200);
  expect(auditResponse.ok()).toBeTruthy();
  const audit = await auditResponse.json();
  expect(audit.version).toBe(1);
  expect(audit.contents).toHaveLength(89);
  expect(audit.contents.every((record) => ["verified", "needs-review"].includes(record.auditStatus))).toBeTruthy();
  await expect(page.locator(".atlas-audit-status").first()).toHaveText("Needs Review");
  await page.goto(appPath("practice.html"));
  await expect(page.locator(".practice-empty-state")).toContainText("現在、Practice問題は登録されていません。");
  await page.goto(appPath("sets.html"));
  await expect(page.locator("#problemBank .sets-empty")).toHaveText("現在、選択できる問題はありません。");
  await page.goto(appPath("worksheet.html"));
  await expect(page.locator(".worksheet-empty-state")).toHaveText("プリントに追加できる問題がありません。");
  await page.goto(appPath("progress.html"));
  await expect(page.locator(".progress-summary-lead")).toContainText("問題 0問");
  const assetVersion = await page.evaluate(async () => (await fetch("./static/asset-version.txt")).text());
  expect(assetVersion.trim()).toBe(expectedAssetVersion);
  await expectNoBrowserErrors(errors);
});

test("Atlas distinguishes an unavailable repository audit", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.route("**/research/repository-audit.json", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: "not-json"
  }));
  await page.goto(appPath("atlas.html"));
  await expect(page.locator(".atlas-audit-status").first()).toHaveText("Repository Audit unavailable");
  await expectNoBrowserErrors(errors);
});
