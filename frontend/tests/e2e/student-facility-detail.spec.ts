import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("student facility detail page", () => {
  test("matches the facility detail reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/facilities/grand-auditorium");

    await expect(page.getByRole("link", { name: "Kembali" })).toHaveAttribute(
      "href",
      "/student/facilities",
    );
    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    await expect(page.getByText("4.9 (124 ulasan)")).toBeVisible();
    await expect(page.getByText("Kampus Timur, Plaza Tengah")).toBeVisible();
    await expect(page.getByRole("img", { name: "Foto utama Grand Auditorium" })).toBeVisible();
    await expect(page.getByText("Biaya peminjaman")).toBeVisible();
    await expect(page.getByText("Rp100.000 / sesi")).toBeVisible();
    await expect(page.getByRole("link", { name: "Reservasi Sekarang" })).toHaveAttribute(
      "href",
      "/student/facilities/grand-auditorium/reserve/time",
    );
    await expect(page.getByRole("heading", { name: "Ulasan Peminjam" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Kalender Publik" })).toBeVisible();
    await expect(page.getByText("Simposium Etika AI 2024")).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-facility-detail-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});
