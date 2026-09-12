import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { appPath, collectBrowserErrors, expectNoBrowserErrors } from "./helpers.js";

const problems = JSON.parse(readFileSync(new URL("../../static/practice/problem-data.json", import.meta.url), "utf8"));
const contents = JSON.parse(readFileSync(new URL("../../static/atlas/content-data.json", import.meta.url), "utf8"));
const scenarios = [
  "algebra-factor-01",
  "prob-permutation-01",
  "math2-exponent-extension-01",
  "mathB-arithmetic-sequence-01"
].map((id) => problems.find((problem) => problem.id === id));

if (scenarios.some((problem) => !problem)) {
  throw new Error("Learning loop scenarios must reference existing Practice problems");
}

async function submitAnswer(page, problem, correct) {
  if (problem.type === "single-choice") {
    const choiceId = correct
      ? problem.answer.choiceId
      : problem.choices.find((choice) => choice.id !== problem.answer.choiceId).id;
    const choice = problem.choices.find((candidate) => candidate.id === choiceId);
    await page.getByRole("radio", { name: choice.text, exact: true }).check();
  } else {
    await page.getByLabel("数値の答え").fill(correct ? String(problem.answer.value) : "0");
  }
  await page.getByRole("button", { name: "答え合わせ" }).click();
}

for (const problem of scenarios) {
  test(`${problem.subject} learning loop recovers the same practice problem`, async ({ page }) => {
    const errors = collectBrowserErrors(page);
    const content = contents.find((candidate) => candidate.id === problem.atlasContentId);
    if (!content) throw new Error(`Missing Atlas content for ${problem.id}`);
    const atlasUrl = appPath(`atlas.html?content=${encodeURIComponent(problem.atlasContentId)}`);
    const practiceUrl = appPath(`practice.html?problem=${encodeURIComponent(problem.id)}&atlasContentId=${encodeURIComponent(problem.atlasContentId)}`);

    await page.goto(atlasUrl);
    await expect(page.locator("#viewerTitle")).toBeVisible();
    const practiceLink = page.locator(`.atlas-practice-links a[href*="problem=${problem.id}"]`);
    await expect(practiceLink).toBeVisible();
    await practiceLink.click();
    await expect(page.locator(".practice-runner")).toHaveAttribute("data-atlas-content-id", problem.atlasContentId);

    await submitAnswer(page, problem, false);
    await expect(page.locator(".practice-result")).toHaveText("もう一度確認してみよう");
    await page.getByRole("link", { name: "図鑑で確認する" }).click();
    await expect(page).toHaveURL(new RegExp(`atlas\\.html\\?content=${problem.atlasContentId}&fromProblem=${problem.id}`));
    await expect(page.getByRole("link", { name: "← 問題に戻る" })).toBeVisible();
    await page.getByRole("link", { name: "← 問題に戻る" }).click();
    await expect(page).toHaveURL(new RegExp(`practice\\.html\\?problem=${problem.id}.*atlasContentId=${problem.atlasContentId}`));

    await page.goto(practiceUrl);
    await submitAnswer(page, problem, true);
    await expect(page.locator(".practice-result")).toHaveText("正解");

    await page.goto(appPath("progress.html"));
    const row = page.locator(".progress-content-row").filter({ hasText: content.title });
    await expect(row.getByRole("link", { name: "図鑑を開く" })).toBeVisible();
    await expect(row.getByRole("link", { name: /練習/ })).toBeVisible();
    await page.reload();
    await expect(row).toContainText("練習中 1");
    await expectNoBrowserErrors(errors);
  });
}
