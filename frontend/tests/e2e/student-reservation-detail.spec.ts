import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("student reservation detail pages", () => {
  test("matches the accepted reservation detail reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/reservations/RSV-FIXTURE-001");

    await expect(page.getByRole("link", { name: "← Kembali" })).toHaveAttribute(
      "href",
      "/student/reservations",
    );
    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    await expect(page.getByText("4.9 (124 ulasan)")).toBeVisible();
    await expect(page.getByText("Gedung Graha Widya Wisuda, Lantai 1")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ajukan Pembatalan" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001/cancellation",
    );
    await expect(page.getByRole("heading", { name: "Dokumen Reservasi" })).toBeVisible();
    await expect(page.getByText("surat-persetujuan-ditandatangani.pdf")).toBeVisible();
    await expect(page.getByText("bukti-pembayaran.pdf")).toBeVisible();
    await expect(page.getByText("Terverifikasi")).toHaveCount(2);
    await expect(page.getByText("Reservasi ini sudah disetujui.")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-reservation-detail-accepted-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the completed reservation detail reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/reservations/RSV-FIXTURE-010");

    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tulis Ulasan" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-010/review",
    );
    await expect(page.getByRole("link", { name: "Ajukan Pembatalan" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Dokumen Reservasi" })).toBeVisible();
    await expect(page.getByText("Terverifikasi")).toHaveCount(2);
    await expect(page.getByText("Reservasi telah selesai.")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-reservation-detail-completed-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});
