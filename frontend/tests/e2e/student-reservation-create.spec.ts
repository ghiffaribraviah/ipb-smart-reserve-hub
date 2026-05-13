import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("student reservation creation pages", () => {
  test("matches the reservation time form reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/facilities/grand-auditorium/reserve/time");

    await expect(page.getByRole("link", { name: "Kembali" })).toHaveAttribute(
      "href",
      "/student/facilities/grand-auditorium",
    );
    await expect(page.getByRole("navigation", { name: "Tahapan reservasi" })).toContainText(
      "Pilih Waktu",
    );
    await expect(page.getByRole("heading", { name: "Oktober 2024" })).toBeVisible();
    await expect(page.getByText("Jadwal pada 24 Oktober 2024")).toBeVisible();
    await expect(page.getByLabel("Waktu Mulai")).toHaveValue("09:00");
    await expect(page.getByLabel("Waktu Selesai")).toHaveValue("13:00");
    await expect(page.getByText("Total Durasi: 4 Jam")).toBeVisible();
    await expect(page.getByRole("link", { name: "Lanjutkan" })).toHaveAttribute(
      "href",
      "/student/facilities/grand-auditorium/reserve/details",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-reservation-time-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("matches the reservation detail form reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/facilities/grand-auditorium/reserve/details");

    await expect(page.getByRole("link", { name: "← Kembali" })).toHaveAttribute(
      "href",
      "/student/facilities/grand-auditorium/reserve/time",
    );
    await expect(page.getByRole("heading", { name: "Detail Reservasi" })).toBeVisible();
    await expect(page.getByLabel("Nama Kegiatan")).toBeVisible();
    await expect(page.getByLabel("Estimasi Jumlah Peserta")).toBeVisible();
    await expect(page.getByLabel("Organisasi")).toBeVisible();
    await expect(page.getByLabel("Dukungan AV & mikrofon")).toBeVisible();
    await expect(page.getByText("Total Biaya")).toBeVisible();
    await expect(page.getByRole("link", { name: "Lanjut ke Surat" })).toHaveAttribute(
      "href",
      "/student/reservations/RSV-FIXTURE-001/letter",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-reservation-detail-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});
