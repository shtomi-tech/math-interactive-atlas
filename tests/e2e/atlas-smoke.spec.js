import { test, expect } from "@playwright/test";
import { appPath, collectBrowserErrors, expectNoBrowserErrors } from "./helpers.js";

test("atlas catalog and representative learning surfaces load", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto(appPath("atlas.html"));
  await expect(page.locator(".atlas-catalog-card")).toHaveCount(89);
  await expect(page.locator(".atlas-catalog-result-count")).toContainText("89件の教材");

  await page.goto(appPath("atlas.html?content=confidence-interval"));
  await expect(page.locator("#viewerTitle")).toHaveText("信頼区間を何度も作る");
  await expect(page.locator('select[aria-label="信頼水準"]')).toBeVisible();
  await page.getByRole("button", { name: "100区間を作る" }).click();
  await expect(page.locator(".atlas-observation")).toContainText("100");
  await expectNoBrowserErrors(errors);
});

test("practice, classroom pack, worksheet, and progress routes load", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto(appPath("practice.html"));
  await expect(page.locator(".practice-problem-card")).toHaveCount(0);
  await expect(page.locator(".practice-catalog-summary")).toContainText("全0問");
  await expect(page.locator(".practice-empty-state")).toContainText("現在、Practice問題は登録されていません。");

  await page.goto(appPath("sets.html"));
  await expect(page.locator(".set-bank-card")).toHaveCount(0);
  await expect(page.locator("#problemBank .sets-empty")).toHaveText("現在、選択できる問題はありません。");
  await expect(page.locator("#selectedProblems .selected-problem-item")).toHaveCount(0);

  await page.goto(appPath("worksheet.html"));
  await expect(page.locator("#worksheetTitle")).toBeVisible();
  await expect(page.locator(".worksheet-empty-state")).toHaveText("プリントに追加できる問題がありません。");
  await page.goto(appPath("progress.html"));
  await expect(page.locator("#progressSummary")).toBeVisible();
  await expect(page.locator("#progressSummary")).toContainText("教材 0 / 89");
  await expect(page.locator("#progressSummary")).toContainText("問題 0問");
  await expectNoBrowserErrors(errors);
});
