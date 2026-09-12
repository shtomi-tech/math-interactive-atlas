import { expect } from "@playwright/test";

export function collectBrowserErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console.error: ${message.text()}`);
  });
  return errors;
}

export async function expectNoBrowserErrors(errors) {
  expect(errors, errors.join("\n")).toEqual([]);
}

export async function expectNoHorizontalOverflow(page) {
  await page.waitForTimeout(250);
  const overflow = await page.evaluate(() => ({
    href: location.href,
    viewport: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    offenders: [...document.querySelectorAll("body *")].map((element) => ({ tag: element.tagName, className: String(element.className), right: Math.round(element.getBoundingClientRect().right) })).filter(({ right }) => right > window.innerWidth + 1).slice(0, 5)
  }));
  expect(overflow.scrollWidth, `horizontal overflow: ${JSON.stringify(overflow)}`).toBeLessThanOrEqual(overflow.viewport + 1);
}
