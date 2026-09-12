import { test, expect } from "@playwright/test";
import { collectBrowserErrors, expectNoBrowserErrors } from "./helpers.js";

test("atlas to practice to progress and back forms a recoverable learning loop", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto("/atlas.html?content=quadratic-basic");
  await expect(page.locator("#viewerTitle")).toHaveText("y = ax² を動かす");
  const practiceLink = page.locator('.atlas-practice-links a[href*="problem=quad-basic-01"]');
  await expect(practiceLink).toBeVisible();
  await practiceLink.click();
  await expect(page.locator(".practice-runner")).toHaveAttribute("data-atlas-content-id", "quadratic-basic");
  await page.getByRole("radio", { name: "上向き" }).check();
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(page.locator(".practice-result")).toHaveText("もう一度確認してみよう");
  const atlasReturn = page.getByRole("link", { name: "図鑑で確認する" });
  await atlasReturn.click();
  await expect(page).toHaveURL(/atlas\.html\?content=quadratic-basic&fromProblem=quad-basic-01/);
  await expect(page.getByRole("link", { name: "← 問題に戻る" })).toBeVisible();
  await page.getByRole("link", { name: "← 問題に戻る" }).click();
  await expect(page).toHaveURL(/practice\.html\?problem=quad-basic-01/);

  await page.goto("/practice.html?problem=quad-basic-01&atlasContentId=quadratic-basic");
  await page.getByRole("radio", { name: "下向き" }).check();
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(page.locator(".practice-result")).toHaveText("正解");
  await page.getByRole("button", { name: "もう一度解く" }).click();
  await page.getByRole("radio", { name: "下向き" }).check();
  await page.getByRole("button", { name: "答え合わせ" }).click();
  await expect(page.locator(".practice-result")).toHaveText("正解");
  await page.goto("/progress.html");
  await expect(page.locator(".progress-content-row").filter({ hasText: "y = ax² を動かす" }).getByRole("link", { name: "図鑑を開く" })).toBeVisible();
  await expect(page.locator(".progress-content-row").filter({ hasText: "y = ax² を動かす" }).getByRole("link", { name: "この教材を練習" })).toBeVisible();
  await page.reload();
  await expect(page.locator(".progress-content-row").filter({ hasText: "y = ax² を動かす" })).toContainText("習得 1");
  await expectNoBrowserErrors(errors);
});
