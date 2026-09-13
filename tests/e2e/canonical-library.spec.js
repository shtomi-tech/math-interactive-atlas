import { test, expect } from "@playwright/test";
import { appPath, collectBrowserErrors, expectNoBrowserErrors } from "./helpers.js";

async function openInteraction(page, id) {
  await page.goto(appPath(`interactions.html?interaction=${encodeURIComponent(id)}`));
  await expect(page.locator("#libraryViewerView")).toBeVisible();
}

test("canonical library renders all mapped statuses and evidence", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await page.goto(appPath("interactions.html"));
  await expect(page.locator(".library-card")).toHaveCount(8);
  await expect(page.locator(".library-runtime-status.is-implemented")).toHaveCount(3);
  await expect(page.locator(".library-runtime-status.is-planned")).toHaveCount(5);
  await expect(page.locator(".library-runtime-status.is-blocked-evidence")).toHaveCount(0);
  await expect(page.locator(".library-card").nth(0)).toContainText("phetsims/graphing-quadratics");
  await expect(page.locator(".library-card").nth(0)).toContainText("MIT");
  await expectNoBrowserErrors(errors);
});

test("MATH-INT-001 supports pointer and keyboard vertex movement plus reset", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await openInteraction(page, "MATH-INT-001");
  await expect(page.locator(".library-demo")).toBeVisible();
  const state = page.locator(".library-demo-state");
  const initial = JSON.parse(await state.getAttribute("data-state"));
  const handle = page.getByTestId("canonical-vertex-handle");
  await handle.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 35, box.y + box.height / 2 + 20, { steps: 10 });
  await page.mouse.up();
  const afterPointer = JSON.parse(await state.getAttribute("data-state"));
  expect(afterPointer.h).not.toBe(initial.h);
  const keyboard = page.getByRole("button", { name: "頂点を選択して矢印キーで移動" });
  await keyboard.focus();
  await page.keyboard.press("ArrowRight");
  const afterKeyboard = JSON.parse(await state.getAttribute("data-state"));
  expect(afterKeyboard.h).toBeGreaterThan(afterPointer.h);
  await page.getByRole("button", { name: "MATH-INT-001を初期状態に戻す" }).click();
  await expect(state).toHaveAttribute("data-state", JSON.stringify(initial));
  await expectNoBrowserErrors(errors);
});

test("MATH-INT-002 supports configurable slider keyboard input and reset", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await openInteraction(page, "MATH-INT-002");
  const state = page.locator(".library-demo-state");
  const initial = JSON.parse(await state.getAttribute("data-state"));
  const slider = page.getByRole("slider", { name: "二次関数の係数aを操作" });
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  const afterKeyboard = JSON.parse(await state.getAttribute("data-state"));
  expect(afterKeyboard.a).toBeGreaterThan(initial.a);
  await slider.click({ position: { x: 0, y: 10 } });
  const afterMouse = JSON.parse(await state.getAttribute("data-state"));
  expect(afterMouse.a).not.toBe(afterKeyboard.a);
  await page.getByRole("button", { name: "MATH-INT-002を初期状態に戻す" }).click();
  await expect(state).toHaveAttribute("data-state", JSON.stringify(initial));
  await expectNoBrowserErrors(errors);
});

test("MATH-INT-003 keeps the curve probe on the function and supports keyboard input", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  await openInteraction(page, "MATH-INT-003");
  const state = page.locator(".library-demo-state");
  const initial = JSON.parse(await state.getAttribute("data-state"));
  const keyboard = page.getByRole("button", { name: "曲線上の点を選択して左右キーで移動" });
  await keyboard.focus();
  await page.keyboard.press("ArrowRight");
  const afterKeyboard = JSON.parse(await state.getAttribute("data-state"));
  expect(afterKeyboard.probeX).toBe(initial.probeX + 1);
  expect(afterKeyboard.probeY).toBe(afterKeyboard.a * (afterKeyboard.probeX - afterKeyboard.h) ** 2 + afterKeyboard.k);
  const handle = page.getByTestId("canonical-curve-probe");
  await handle.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const box = await handle.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 28, box.y + box.height / 2 + 4, { steps: 10 });
  await page.mouse.up();
  const afterPointer = JSON.parse(await state.getAttribute("data-state"));
  expect(afterPointer.probeY).toBe(afterPointer.a * (afterPointer.probeX - afterPointer.h) ** 2 + afterPointer.k);
  await expect(page.locator(".library-source-item").first()).toContainText("inspired-by");
  await page.getByRole("button", { name: "MATH-INT-003を初期状態に戻す" }).click();
  await expect(state).toHaveAttribute("data-state", JSON.stringify(initial));
  await expectNoBrowserErrors(errors);
});

test("planned and evidence-review interactions do not mount demos", async ({ page }) => {
  const errors = collectBrowserErrors(page);
  for (const id of ["MATH-INT-004", "MATH-INT-005", "MATH-INT-006", "MATH-INT-007", "MATH-INT-008"]) {
    await openInteraction(page, id);
    await expect(page.locator(".library-demo")).toHaveCount(0);
    await expect(page.locator(".library-source-item")).toHaveCount(["MATH-INT-007", "MATH-INT-008"].includes(id) ? 2 : 1);
    await expect(page.locator(".library-unavailable")).toHaveText("Runtime implementation is not yet available.");
  }
  await expectNoBrowserErrors(errors);
});
