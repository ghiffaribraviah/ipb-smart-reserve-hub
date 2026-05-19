import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("auth pages", () => {
  test("matches the login reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Masuk" })).toBeVisible();
    await expect(page.getByLabel("Email Kampus")).toBeVisible();
    await expect(page.getByLabel("Kata Sandi")).toBeVisible();
    await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
    await expect(page.getByText("Belum punya akun?")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `login-${isMobile ? "mobile" : "desktop"}`);
  });

  test("matches the register reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/register");

    await expect(page.getByRole("heading", { name: "Daftar Akun" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Data Identitas" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Buat Kata Sandi" })).toBeVisible();
    await expect(page.getByLabel("Nama Lengkap")).toBeVisible();
    await expect(page.getByLabel("NIM")).toBeVisible();
    await expect(page.getByLabel("Email Kampus")).toBeVisible();
    await expect(page.getByLabel("Konfirmasi Kata Sandi")).toBeVisible();
    await expect(page.getByRole("button", { name: "Buat Akun" })).toBeVisible();
    await expect(page.getByText("Sudah punya akun?")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `register-${isMobile ? "mobile" : "desktop"}`);
  });

  test("renders deterministic auth success and error surfaces", async ({ page }) => {
    await page.setViewportSize(screenshotViewports.desktop);

    await page.goto("/login?registered=1");
    await expect(page.getByText("Akun berhasil dibuat.")).toBeVisible();

    await page.goto("/register?fixture=error");
    await expect(page.getByText("Email kampus sudah terdaftar")).toBeVisible();
    await expect(
      page.getByText("Gunakan email aktif dengan domain @apps.ipb.ac.id."),
    ).toBeVisible();
  });
});
