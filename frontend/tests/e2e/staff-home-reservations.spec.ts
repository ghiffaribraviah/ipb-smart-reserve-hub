import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("staff operations pages", () => {
  test("matches the staff verification hub reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/staff");

    await expect(page.getByRole("heading", { name: "Hub Verifikasi" })).toBeVisible();
    await expect(page.getByText("MENUNGGU VERIFIKASI", { exact: true })).toBeVisible();
    await expect(page.getByText("24", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pengajuan Reservasi" })).toBeVisible();
    await expect(page.getByText("Johnathan Doe")).toBeVisible();
    await expect(page.getByText("Dokumen Diunggah")).toBeVisible();
    await expect(page.getByText("Bukti Bayar Diunggah")).toBeVisible();
    await expect(page.getByRole("table").getByText("Menunggu Peninjauan")).toBeVisible();
    await expect(page.getByRole("button", { name: "Unduh dokumen Johnathan Doe" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Verifikasi Johnathan Doe" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tolak Johnathan Doe" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `staff-home-${isMobile ? "mobile" : "desktop"}`);
  });

  test("matches the staff reservation list reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/staff/reservations");

    await expect(page.getByRole("heading", { name: "Semua Reservasi" })).toBeVisible();
    await expect(page.getByLabel("Filter fasilitas")).toHaveValue("all");
    await expect(page.getByLabel("Filter status")).toHaveValue("all");
    await expect(page.getByText("Menampilkan 6 hasil")).toBeVisible();
    await expect(page.getByText("Johnathan Doe")).toBeVisible();
    await expect(page.getByText("Disetujui", { exact: true }).nth(1)).toBeVisible();
    await expect(page.getByText("Menunggu Pembayaran")).toBeVisible();
    await expect(page.getByRole("table").getByText("Menunggu Peninjauan")).toBeVisible();
    await expect(page.getByRole("link", { name: "Lihat Detail Johnathan Doe" })).toHaveAttribute(
      "href",
      "/staff/reservations/RSV-STF-001",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `staff-reservation-list-${isMobile ? "mobile" : "desktop"}`);
  });
});
