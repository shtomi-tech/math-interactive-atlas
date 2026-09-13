import { test, expect } from "@playwright/test";
import { appPath, collectBrowserErrors, expectNoBrowserErrors } from "./helpers.js";

test("empty Practice state is explicit and does not offer a broken runner", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto(appPath("practice.html"));
  await expect(page.locator(".practice-catalog-summary")).toHaveText(/全0問/);
  await expect(page.locator(".practice-empty-state")).toContainText("現在、Practice問題は登録されていません。");
  await expect(page.locator(".practice-empty-state")).toContainText("外部Repository由来");
  await expect(page.locator(".practice-runner")).toHaveCount(0);
  await expectNoBrowserErrors(errors);
});

test("Atlas hides Practice links while the external repository audit is unresolved", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto(appPath("atlas.html?content=quadratic-basic"));
  await expect(page.locator("#viewerTitle")).toBeVisible();
  await expect(page.locator(".atlas-practice-links")).toHaveCount(0);
  await expectNoBrowserErrors(errors);
});

test("Classroom Pack surfaces remain safe with no available problems", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto(appPath("sets.html"));
  await expect(page.locator("#problemBank .sets-empty")).toHaveText("現在、選択できる問題はありません。");
  await expect(page.locator("#selectedProblems .sets-empty")).toContainText("右の問題一覧から問題を追加してください。");

  await page.goto(appPath("worksheet.html"));
  await expect(page.locator(".worksheet-empty-state")).toHaveText("プリントに追加できる問題がありません。");

  await page.goto(appPath("progress.html"));
  await expect(page.locator(".progress-summary-lead")).toContainText("問題 0問");
  await expect(page.locator(".progress-content-practice-empty").first()).toHaveText("Practiceは準備中です。");
  await expectNoBrowserErrors(errors);
});
