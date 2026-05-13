import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("super admin dashboard and users pages", () => {
  test("matches the super admin dashboard reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/super-admin");

    await expect(page.getByRole("heading", { name: "Dashboard Super Admin" })).toBeVisible();
    if (!isMobile) {
      await expect(page.getByRole("link", { name: "Dashboard" }).first()).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
    await expect(page.getByText("Total Pengguna")).toBeVisible();
    await expect(page.getByText("12,450")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Administrator Departemen" })).toBeVisible();
    await expect(page.getByText("Budi Santoso").nth(isMobile ? 1 : 0)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Log Aktivitas Sistem" })).toBeVisible();
    await expect(page.getByText("Super Admin membuat akun admin baru")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ekspor Laporan" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tambah Admin" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `super-admin-dashboard-${isMobile ? "mobile" : "desktop"}`);
  });

  test("matches the super admin pengguna reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/super-admin/users");

    await expect(page.getByRole("heading", { exact: true, name: "Pengguna" })).toBeVisible();
    if (!isMobile) {
      await expect(page.getByRole("link", { name: "Pengguna" }).first()).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
    await expect(page.getByText("Total Akun")).toBeVisible();
    await expect(page.getByText("12.450")).toBeVisible();
    await expect(page.getByLabel("Cari pengguna")).toHaveValue("Cari nama, email, atau NIM");
    await expect(page.getByLabel("Filter role")).toHaveValue("Semua role");
    await expect(page.getByLabel("Filter status")).toHaveValue("Semua status");
    await expect(page.getByRole("heading", { name: "Daftar Pengguna" })).toBeVisible();
    await expect(page.getByText("Nadia Paramita").nth(isMobile ? 1 : 0)).toBeVisible();
    await expect(page.getByText("Perlu Data").nth(isMobile ? 1 : 0)).toBeVisible();
    await expect(page.getByRole("button", { name: "Ekspor CSV" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tambah Pengguna" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `super-admin-users-${isMobile ? "mobile" : "desktop"}`);
  });
});
