import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("student payment status pages", () => {
  test("matches the payment upload reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/reservations/RSV-FIXTURE-001/payment");

    await expect(page.getByRole("link", { name: "← Kembali" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Unggah Bukti Pembayaran" })).toBeVisible();
    await expect(page.getByText("PDF/JPG/PNG maksimal 5 MB")).toBeVisible();
    await expect(page.getByText("bukti-pembayaran.pdf")).toBeVisible();
    await expect(page.getByText("PDF · 840 KB · siap dikirim")).toBeVisible();
    await expect(page.getByText("Total Pembayaran")).toBeVisible();
    await expect(page.getByText("Rp1.500.000")).toBeVisible();
    await expect(page.getByRole("link", { name: "Unggah Bukti" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001/payment/waiting",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-payment-upload-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the payment waiting reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/reservations/RSV-FIXTURE-001/payment/waiting");

    await expect(page.getByRole("heading", { name: "Rangkuman Reservasi" })).toBeVisible();
    await expect(page.getByText("Menunggu Verifikasi Pembayaran")).toHaveCount(2);
    await expect(page.getByText("Tim fasilitas sedang meninjau bukti pembayaran yang Anda unggah.")).toBeVisible();
    await expect(page.getByText("Total Pembayaran")).toBeVisible();
    await expect(page.getByText("Rp1.500.000")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-payment-waiting-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the payment declined reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/reservations/RSV-FIXTURE-001/payment/declined");

    await expect(page.getByRole("heading", { name: "Bukti Pembayaran Ditolak" })).toBeVisible();
    await expect(page.getByText("Pembayaran Ditolak", { exact: true })).toBeVisible();
    await expect(page.getByText("Bukti pembayaran belum dapat diverifikasi.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Unggah Ulang Bukti Pembayaran" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001/payment",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-payment-declined-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the accepted reservation reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/reservations/RSV-FIXTURE-001/accepted");

    await expect(page.getByRole("heading", { name: "Reservasi Disetujui" })).toBeVisible();
    await expect(page.getByText("Kode Reservasi")).toBeVisible();
    await expect(page.getByText("RSV-2026-00024")).toBeVisible();
    await expect(page.getByText("Disetujui", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Lihat Detail Reservasi" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-reservation-accepted-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});
