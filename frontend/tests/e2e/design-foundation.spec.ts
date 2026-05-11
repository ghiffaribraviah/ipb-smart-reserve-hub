import { expect, test } from "@playwright/test";

test("design foundation preview matches the documented component states", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Shared Design Foundation" })).toBeVisible();
  await expect(page).toHaveScreenshot("design-foundation.png", {
    fullPage: true,
    maxDiffPixelRatio: 0.02,
  });
});
