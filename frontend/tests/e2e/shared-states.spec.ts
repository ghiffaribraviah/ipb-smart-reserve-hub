import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("shared data, upload, and calendar states", () => {
  test("matches the data and auth states board", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/__reference__/data-auth-states");

    await expect(page.getByRole("heading", { name: "Data dan Auth States" })).toBeVisible();
    await expect(page.getByText("Belum Ada Reservasi")).toBeVisible();
    await expect(page.getByText("Sesi Anda berakhir")).toBeVisible();
    await expect(page.getByText("Melewati Batas Verifikasi")).toBeVisible();
    await expect(page.getByText("Pencarian Kosong")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `data-auth-states-${isMobile ? "mobile" : "desktop"}`);
  });

  test("matches the upload and calendar states board", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/__reference__/upload-calendar-states");

    await expect(page.getByRole("heading", { name: "Upload dan Calendar States" })).toBeVisible();
    await expect(page.getByText("surat-persetujuan-himalkom.pdf")).toBeVisible();
    await expect(page.getByText("File ditolak.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Oktober 2024" })).toBeVisible();
    await expect(page.getByText("Jadwal pada 24 Oktober 2024")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `upload-calendar-states-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});
