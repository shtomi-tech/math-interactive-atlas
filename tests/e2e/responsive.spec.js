import { test, expect } from "@playwright/test";
import { appPath, collectBrowserErrors, expectNoBrowserErrors, expectNoHorizontalOverflow } from "./helpers.js";

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
      appPath("atlas.html"),
      appPath("interactions.html"),
      appPath("atlas.html?content=confidence-interval"),
      appPath("atlas.html?content=inequality-region-2d"),
      appPath("atlas.html?content=function-and-derivative"),
      appPath("atlas.html?content=sequence-partial-sum"),
      appPath("practice.html"),
      appPath("sets.html"),
      appPath("progress.html")
    ]) {
      await page.goto(url);
      await expectNoHorizontalOverflow(page);
    }
    await expectNoBrowserErrors(errors);
    await context.close();
  });
}
