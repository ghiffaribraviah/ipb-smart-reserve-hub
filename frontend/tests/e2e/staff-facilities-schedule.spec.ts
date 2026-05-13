import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("staff facility pages", () => {
  test("matches the assigned facility list reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/staff/facilities");

    await expect(page.getByRole("heading", { name: "Fasilitas Terkelola" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tambah Fasilitas" })).toBeVisible();
    await expect(page.getByLabel("Filter by facility type")).toHaveValue("");
    await expect(page.getByLabel("Filter by facility status")).toHaveValue("");
    await expect(page.getByText("Menampilkan 4 fasilitas")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Agri-Tech Greenhouses" })).toBeVisible();
    await expect(page.locator("span").filter({ hasText: /^Perawatan$/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Lihat Jadwal Grand Auditorium" })).toHaveAttribute(
      "href",
      "/staff/facilities/grand-auditorium/schedule",
    );
    await expect(page.getByRole("link", { name: "Edit Detail Grand Auditorium" })).toHaveAttribute(
      "href",
      "/staff/facilities/grand-auditorium/edit",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `staff-facility-list-${isMobile ? "mobile" : "desktop"}`);
  });

  test("matches the facility schedule reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/staff/facilities/grand-auditorium/schedule");

    await expect(page.getByRole("link", { name: "Kembali ke Daftar Fasilitas" })).toHaveAttribute(
      "href",
      "/staff/facilities",
    );
    await expect(page.getByRole("heading", { name: "Jadwal Grand Auditorium" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Oktober 2024" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Agenda" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Simposium Etika AI 2024" }).first()).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Kejuaraan Tahunan Klub Debat" }).first(),
    ).toBeVisible();
    await expect(page.getByRole("table").getByText("Menunggu Verifikasi")).toBeVisible();
    await expect(
      page.getByRole("row", { name: /Kejuaraan Tahunan Klub Debat/ }).getByRole("link", {
        name: "Tinjau Pengajuan Ahmed Syah",
      }),
    ).toHaveAttribute("href", "/staff/reservations/RSV-SCH-003");

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `staff-facility-schedule-${isMobile ? "mobile" : "desktop"}`);
  });
});
