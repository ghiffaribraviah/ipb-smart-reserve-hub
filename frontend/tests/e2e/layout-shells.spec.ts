import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("role layout shells", () => {
  test("matches the shared layout shell board", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    const viewport = isMobile ? screenshotViewports.mobile : screenshotViewports.desktop;

    await page.setViewportSize(viewport);
    await page.goto("/__reference__/layout-shells");

    await expect(page.getByRole("heading", { name: "Layout Shells" })).toBeVisible();
    await expect(page.getByText("Student Shell")).toBeVisible();
    await expect(page.getByText("Staff Shell")).toBeVisible();
    await expect(page.getByText("Super Admin Shell")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Auth Layout" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `layout-shells-${isMobile ? "mobile" : "desktop"}`);
  });

  test("matches the opened mobile navigation drawer", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    const viewport = isMobile ? screenshotViewports.mobile : screenshotViewports.desktop;

    await page.setViewportSize(viewport);
    await page.goto("/__reference__/mobile-drawer");

    await expect(page.getByRole("navigation", { name: "Navigasi mobile" })).toBeVisible();
    await expect(page.getByText("Super Admin", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Beranda Mahasiswa" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sistem Super Admin" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Keluar" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `mobile-drawer-${isMobile ? "mobile" : "desktop"}`);
  });
});
