import { test, expect } from "@playwright/test";
import { collectBrowserErrors, expectNoBrowserErrors } from "./helpers.js";

test("atlas catalog and representative learning surfaces load", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto("/atlas.html");
  await expect(page.locator(".atlas-catalog-card")).toHaveCount(89);
  await expect(page.locator(".atlas-catalog-result-count")).toContainText("89件の教材");

  await page.goto("/atlas.html?content=confidence-interval");
  await expect(page.locator("#viewerTitle")).toHaveText("信頼区間を何度も作る");
  await expect(page.locator('select[aria-label="信頼水準"]')).toBeVisible();
  await page.getByRole("button", { name: "100区間を作る" }).click();
  await expect(page.locator(".atlas-observation")).toContainText("100");
  await expectNoBrowserErrors(errors);
});

test("practice, classroom pack, worksheet, and progress routes load", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto("/practice.html");
  await expect(page.locator(".practice-problem-card")).toHaveCount(267);
  await expect(page.locator(".practice-catalog-summary")).toContainText("全267問");
  await page.locator(".practice-problem-card").first().getByRole("button", { name: /を開く$/ }).click();
  await expect(page.locator(".practice-runner")).toBeVisible();
  await expect(page.locator(".practice-submit")).toBeVisible();

  await page.goto("/sets.html");
  await expect(page.locator(".set-bank-card")).toHaveCount(267);
  await page.locator(".set-bank-card").first().getByRole("button", { name: /問題セットに追加/ }).click();
  await expect(page.locator("#selectedProblems .selected-problem-item")).toHaveCount(1);

  await page.goto("/worksheet.html");
  await expect(page.locator("#worksheetTitle")).toBeVisible();
  await page.goto("/progress.html");
  await expect(page.locator("#progressSummary")).toBeVisible();
  await expect(page.locator("#progressSummary")).toContainText("教材 0 / 89");
  await expectNoBrowserErrors(errors);
});
