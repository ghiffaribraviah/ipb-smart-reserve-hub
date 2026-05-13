import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("super admin facilities and reports pages", () => {
  test("matches the super admin fasilitas reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/super-admin/facilities");

    await expect(page.getByRole("heading", { exact: true, name: "Fasilitas" })).toBeVisible();
    if (!isMobile) {
      await expect(page.getByRole("link", { name: "Fasilitas" }).first()).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
    await expect(page.getByText("Fasilitas Aktif")).toBeVisible();
    await expect(page.getByText("Tanpa Staff")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Daftar Fasilitas" })).toBeVisible();
    await expect(page.getByText("Grand Auditorium").first()).toBeVisible();
    await expect(page.getByText("Laboratorium Multimedia").first()).toBeVisible();
    await expect(page.getByText("Butuh Staff")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Penugasan Terbaru" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Impor Data" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tambah Fasilitas" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `super-admin-facilities-${isMobile ? "mobile" : "desktop"}`);
  });

  test("matches the super admin laporan reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/super-admin/reports");

    await expect(page.getByRole("heading", { exact: true, name: "Laporan" })).toBeVisible();
    if (!isMobile) {
      await expect(page.getByRole("link", { name: "Laporan" }).first()).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
    await expect(page.getByText("Reservasi Bulan Ini")).toBeVisible();
    await expect(page.getByText("Rp128 jt")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tren Reservasi Mingguan" })).toBeVisible();
    await expect(page.getByLabel("Grafik tren reservasi")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Log Audit Terbaru" })).toBeVisible();
    await expect(page.getByText("Akun staff dibuat")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Moderasi Ulasan" })).toBeVisible();
    await expect(page.getByText("Perlu Tinjauan").nth(isMobile ? 1 : 0)).toBeVisible();
    await expect(page.getByRole("button", { name: "Rentang Waktu" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ekspor Laporan" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `super-admin-reports-${isMobile ? "mobile" : "desktop"}`);
  });
});
