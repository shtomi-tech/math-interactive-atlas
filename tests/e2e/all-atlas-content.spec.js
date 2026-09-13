import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { appPath, collectBrowserErrors, expectNoBrowserErrors } from "./helpers.js";

const contents = JSON.parse(readFileSync(new URL("../../static/atlas/content-data.json", import.meta.url), "utf8"));
const repositoryAudit = JSON.parse(readFileSync(new URL("../../research/repository-audit.json", import.meta.url), "utf8"));
if (contents.length !== 89) {
  throw new Error(`Expected 89 Atlas contents, found ${contents.length}`);
}
if (repositoryAudit.version !== 1 || repositoryAudit.contents.length !== 89) {
  throw new Error(`Expected version 1 repository audit with 89 records, found version ${repositoryAudit.version} and ${repositoryAudit.contents.length} records`);
}

const auditByContentId = new Map(repositoryAudit.contents.map((record) => [record.contentId, record]));
function auditLabel(record) {
  return record?.auditStatus === "verified" ? "Verified" : record?.auditStatus === "needs-review" ? "Needs Review" : "Pending Repository Audit";
}

const contentRenderTimeout = 45_000;

for (const content of contents) {
  test(`${content.id} mounts without fallback or reset errors`, async ({ page }) => {
    test.setTimeout(60_000);
    const errors = collectBrowserErrors(page);
    await page.goto(appPath(`atlas.html?content=${encodeURIComponent(content.id)}`));
    await expect(page.locator("#viewerTitle")).toHaveText(content.title, { timeout: contentRenderTimeout });
    await expect(page.locator(".atlas-audit-status")).toHaveText(auditLabel(auditByContentId.get(content.id)));
    await expect(page.locator(".atlas-interactive-frame")).toBeVisible();
    await expect(page.locator(".atlas-canvas-fallback"), `fallback for ${content.id}`).toHaveCount(0);
    const reset = page.getByRole("button", { name: "↺ 初期状態に戻す" });
    await expect(reset).toBeVisible();
    await reset.click();
    await expect(page.locator(".atlas-viewer")).toBeVisible();

    await expectNoBrowserErrors(errors);
  });
}
