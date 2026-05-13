import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("super admin system page", () => {
  test("matches the super admin sistem reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/super-admin/system");

    await expect(page.getByRole("heading", { exact: true, name: "Sistem" })).toBeVisible();
    if (!isMobile) {
      await expect(page.getByRole("link", { name: "Sistem" }).first()).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
    await expect(page.getByText("Kesehatan API")).toBeVisible();
    await expect(page.getByText("99,9%")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Status Layanan" })).toBeVisible();
    await expect(page.getByText("Backend API")).toBeVisible();
    await expect(page.getByText("Private File Storage")).toBeVisible();
    await expect(page.getByText("Pantau", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Aturan Booking" })).toBeVisible();
    await expect(page.getByLabel("Domain email mahasiswa")).toHaveValue("@apps.ipb.ac.id");
    await expect(page.getByLabel("Batas unggah surat")).toHaveValue("24 jam setelah reservasi");
    await expect(page.getByLabel("Cutoff pembayaran")).toHaveValue(
      "12 jam setelah dokumen disetujui",
    );
    await expect(page.getByRole("switch", { name: "Aktifkan notifikasi sistem" })).toBeChecked();
    await expect(page.getByRole("button", { name: "Lihat Riwayat" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Simpan Pengaturan" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `super-admin-system-${isMobile ? "mobile" : "desktop"}`);
  });
});
