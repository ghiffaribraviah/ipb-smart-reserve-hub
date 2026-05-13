import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("staff reservation detail and decision surfaces", () => {
  test("matches the staff reservation detail reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/staff/reservations/RSV-STF-001");

    await expect(page.getByRole("link", { name: "Kembali ke Daftar Reservasi" })).toHaveAttribute(
      "href",
      "/staff/reservations",
    );
    await expect(page.getByRole("heading", { name: "Informasi Pemohon" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Johnathan Doe" })).toBeVisible();
    await expect(page.getByText("AI Ethics Symposium 2024")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Verifikasi Dokumen" })).toBeVisible();
    await expect(page.getByText("proposal-kegiatan.pdf")).toBeVisible();
    await expect(page.getByText("surat-dekan.pdf")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    await expect(page.getByText("Menunggu Peninjauan")).toBeVisible();
    await expect(page.getByLabel("Catatan administrator")).toBeVisible();
    await expect(page.getByRole("button", { name: "Setujui Reservasi" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tolak Pengajuan" })).toHaveAttribute(
      "href",
      "/staff/reservations/RSV-STF-001/review-decision",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `staff-reservation-detail-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the review decision dialog reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/staff/reservations/RSV-STF-001/review-decision");

    await expect(page.getByRole("heading", { name: "Dialog Keputusan Review" })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Tolak Dokumen Reservasi" })).toBeVisible();
    await expect(page.getByText("surat-persetujuan-himalkom.pdf")).toBeVisible();
    await expect(page.getByText("Review Dokumen")).toBeVisible();
    await expect(page.getByLabel("Alasan penolakan")).toHaveValue(
      "Surat persetujuan belum memuat tanda tangan pembina organisasi. Mohon unggah ulang dokumen yang sudah ditandatangani.",
    );
    await expect(page.getByText("Menolak dokumen akan mengubah reservasi menjadi ditolak")).toBeVisible();
    await expect(page.getByRole("button", { name: "Kembali" })).toBeVisible();
    await expect(
      page
        .getByRole("dialog", { name: "Tolak Dokumen Reservasi" })
        .getByRole("button", { name: "Tolak Dokumen" }),
    ).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `staff-review-decision-dialog-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});
