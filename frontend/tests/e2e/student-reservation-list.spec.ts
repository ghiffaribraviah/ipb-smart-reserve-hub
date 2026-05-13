import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("student reservation list page", () => {
  test("matches the ongoing reservation list reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/reservations");

    await expect(page.getByRole("heading", { name: "Reservasi Saya" })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Sedang Berlangsung/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("tab", { name: "Riwayat" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    await expect(page.getByText("Disetujui", { exact: true })).toBeVisible();
    await expect(page.getByText("Menunggu Pembayaran")).toBeVisible();
    await expect(page.getByText("Menunggu Verifikasi Dokumen")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ajukan Pembatalan" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001/cancellation",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-reservation-list-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("shows terminal history reservations without cancellation actions", async ({ page }) => {
    await page.goto("/student/reservations");
    await page.getByRole("tab", { name: "Riwayat" }).click();

    await expect(page.getByRole("tab", { name: "Riwayat" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByRole("heading", { name: "Studio Kreatif Cendana" })).toBeVisible();
    await expect(page.getByText("Selesai", { exact: true })).toBeVisible();
    await expect(page.getByText("Ditolak", { exact: true })).toBeVisible();
    await expect(page.getByText("Dibatalkan", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ajukan Pembatalan" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Batalkan" })).toHaveCount(0);
  });
});
