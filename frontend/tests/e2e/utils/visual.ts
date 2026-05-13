import { expect, type Page } from "@playwright/test";

export const screenshotViewports = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
} as const;

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: document.documentElement.clientWidth,
    bodyWidth: document.body.scrollWidth,
  }));

  expect(overflow.documentWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(
    overflow.viewportWidth,
  );
  expect(overflow.bodyWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(
    overflow.viewportWidth,
  );
}

export async function expectPageScreenshot(page: Page, name: string) {
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage: true,
    animations: "disabled",
  });
}
