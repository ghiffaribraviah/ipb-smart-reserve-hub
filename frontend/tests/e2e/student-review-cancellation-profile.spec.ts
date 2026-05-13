import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("student review, cancellation, and profile pages", () => {
  test("matches the reservation review form reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/reservations/RSV-FIXTURE-010/review");

    await expect(page.getByRole("link", { name: "← Kembali ke Detail Reservasi" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-010",
    );
    await expect(page.getByRole("heading", { name: "Tulis Ulasan" })).toBeVisible();
    await expect(page.getByRole("radiogroup", { name: "Penilaian Fasilitas" })).toBeVisible();
    await expect(page.getByRole("radio", { name: "5 dari 5" })).toBeVisible();
    await expect(page.getByLabel("Komentar")).toBeVisible();
    await expect(page.getByRole("button", { name: "Kirim Ulasan" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-review-form-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the cancellation request reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/reservations/RSV-FIXTURE-001/cancellation");

    await expect(page.getByRole("link", { name: "← Kembali ke Detail Reservasi" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001",
    );
    await expect(page.getByRole("heading", { name: "Ajukan Pembatalan" })).toBeVisible();
    await expect(page.getByLabel("Alasan Pembatalan")).toBeVisible();
    await expect(page.getByLabel("Detail Alasan")).toBeVisible();
    await expect(page.getByRole("button", { name: "Kirim Pengajuan" })).toBeVisible();
    await expect(page.getByText("Pembatalan Menunggu Review")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pembatalan Ditolak" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-cancellation-request-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the student profile reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/profile");

    await expect(page.getByRole("heading", { name: "Profil Mahasiswa" })).toBeVisible();
    await expect(page.getByText("Ari Rahman")).toBeVisible();
    await expect(page.getByText("Mahasiswa Aktif")).toBeVisible();
    await expect(page.getByRole("button", { name: "Keluar" })).toBeVisible();
    await expect(page.getByText("Nomor Induk Mahasiswa (NIM)")).toBeVisible();
    await expect(page.getByRole("definition").filter({ hasText: "G64190001" })).toBeVisible();
    await expect(page.getByText("Ilmu Komputer")).toBeVisible();
    await expect(page.getByText("Sarjana (S1)")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-profile-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});
