import { test, expect } from "@playwright/test";
import { collectBrowserErrors, expectNoBrowserErrors } from "./helpers.js";

test("coordinate lessons expose direct manipulation and mode state", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto("/atlas.html?content=inequality-region-2d");
  const target = page.getByRole("button", { name: "判定する点P" });
  await expect(target).toBeVisible();
  const lineMode = page.getByRole("button", { name: "直線の上側" });
  const circleMode = page.getByRole("button", { name: "円の内側" });
  await expect(lineMode).toHaveAttribute("aria-pressed", "true");
  await circleMode.click();
  await expect(circleMode).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".atlas-observation")).toContainText("円の内側");
  await expectNoBrowserErrors(errors);
});

test("circle equation exposes angle control and a keyboard target", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto("/atlas.html?content=circle-equation");
  await expect(page.locator('input[aria-label="円周上の点Pの角度を操作"]')).toBeVisible();
  const target = page.getByRole("button", { name: "円周上の点P" });
  await expect(target).toBeVisible();
  await target.focus();
  await target.press("ArrowRight");
  await expect(page.locator(".atlas-observation")).toContainText("角度");
  await expectNoBrowserErrors(errors);
});

test("normal hypothesis test uses a normal curve with readable result text", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto("/atlas.html?content=normal-hypothesis-test");
  await expect(page.locator('svg[aria-label^="標準正規分布"]')).toBeVisible();
  await expect(page.locator(".atlas-observation")).toContainText("p値");
  await expectNoBrowserErrors(errors);
});
