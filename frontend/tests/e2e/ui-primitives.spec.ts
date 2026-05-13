import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("UI primitives reference board", () => {
  test("matches the shared primitives reference board", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    const viewport = isMobile ? screenshotViewports.mobile : screenshotViewports.desktop;

    await page.setViewportSize(viewport);
    await page.goto("/__reference__/ui-primitives");

    await expect(page.getByRole("heading", { name: "UI Primitives" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Lanjutkan" })).toBeVisible();
    await expect(page.getByText("Menunggu Verifikasi Dokumen")).toBeVisible();
    await expect(page.getByText("Tanggal mulai wajib dipilih.")).toBeVisible();
    await expect(page.getByRole("radio", { name: "4 dari 5" })).toBeChecked();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `ui-primitives-${isMobile ? "mobile" : "desktop"}`);
  });
});
