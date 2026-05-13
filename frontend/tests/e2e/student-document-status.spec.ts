import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("student document workflow pages", () => {
  test("matches the approval letter upload reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/reservations/RSV-FIXTURE-001/letter");

    await expect(page.getByRole("link", { name: "← Kembali" })).toHaveAttribute(
      "href",
      "/student/facilities/grand-auditorium/reserve/details",
    );
    await expect(page.getByRole("navigation", { name: "Tahapan reservasi" })).toContainText(
      "Surat",
    );
    await expect(page.getByRole("heading", { name: "Template Surat" })).toBeVisible();
    await expect(page.getByText("template-surat-permohonan-reservasi.pdf")).toBeVisible();
    await expect(page.getByRole("button", { name: "Unduh Template" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Unggah Dokumen" })).toBeVisible();
    await expect(page.getByLabel("Pilih file surat persetujuan")).toBeVisible();
    await expect(page.getByText("surat-reservasi.pdf")).toBeVisible();
    await expect(page.getByText("PDF · 1,2 MB · siap dikirim")).toBeVisible();
    await expect(page.getByRole("link", { name: "Kirim Reservasi" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001/verification/waiting",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-document-letter-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the document verification waiting reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/reservations/RSV-FIXTURE-001/verification/waiting");

    await expect(page.getByRole("navigation", { name: "Tahapan reservasi" })).toContainText(
      "Aktif",
    );
    await expect(page.getByRole("heading", { name: "Rangkuman Reservasi" })).toBeVisible();
    await expect(page.getByText("Grand Auditorium")).toBeVisible();
    await expect(page.getByText("24 Oktober 2024")).toBeVisible();
    await expect(page.getByText("09:00 - 13:00")).toBeVisible();
    await expect(page.getByText("Menunggu Verifikasi Dokumen")).toHaveCount(2);
    await expect(page.getByText("Tim fasilitas sedang meninjau surat permohonan yang Anda unggah.")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-document-waiting-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the document verification declined reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/reservations/RSV-FIXTURE-001/verification/declined");

    await expect(page.getByRole("heading", { name: "Rangkuman Reservasi" })).toBeVisible();
    await expect(page.getByText("Ditolak")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dokumen Perlu Diperbaiki" })).toBeVisible();
    await expect(page.getByText("Reservasi belum dapat diterima karena dokumen perlu diperbaiki.")).toBeVisible();
    await expect(page.getByText("Tanda tangan pembina belum terlihat jelas.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Kembali ke Daftar Reservasi" })).toHaveAttribute(
      "href",
      "/student/reservations",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-document-declined-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});
