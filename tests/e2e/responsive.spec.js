import { test, expect } from "@playwright/test";
import { collectBrowserErrors, expectNoBrowserErrors, expectNoHorizontalOverflow } from "./helpers.js";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 900 },
  { width: 375, height: 812 },
  { width: 320, height: 568 }
]) {
  test(`key routes fit at ${viewport.width}px`, async ({ browser }) => {
    const context = await browser.newContext({ viewport, locale: "ja-JP" });
    const page = await context.newPage();
    const errors = collectBrowserErrors(page);
    for (const url of [
      "/atlas.html",
      "/atlas.html?content=confidence-interval",
      "/practice.html",
      "/sets.html",
      "/progress.html"
    ]) {
      await page.goto(url);
      await expectNoHorizontalOverflow(page);
    }
    await expectNoBrowserErrors(errors);
    await context.close();
  });
}
