import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("visual verification harness", () => {
  test("renders the smoke route with deterministic fixture content", async ({
    page,
  }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    const viewport = isMobile ? screenshotViewports.mobile : screenshotViewports.desktop;

    await page.setViewportSize(viewport);
    await page.goto("/__harness__/smoke");

    await expect(page.getByRole("heading", { name: "Visual Harness" })).toBeVisible();
    await expect(page.getByText("Fixture seed: visual-harness-2026-05")).toBeVisible();
    await expect(page.getByRole("button", { name: "Periksa Fixture" })).toBeVisible();
    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }
    await expectPageScreenshot(page, `harness-smoke-${isMobile ? "mobile" : "desktop"}`);
  });
});
