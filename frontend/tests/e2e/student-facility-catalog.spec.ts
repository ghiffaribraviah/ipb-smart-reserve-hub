import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("student facility catalog page", () => {
  test("matches the facility catalog reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student/facilities");

    await expect(page.getByRole("heading", { name: "Katalog Fasilitas" })).toBeVisible();
    await expect(page.getByLabel("Pencarian")).toBeVisible();
    await expect(page.getByLabel("Organisasi / Fakultas")).toBeVisible();
    await expect(page.getByLabel("Tipe Fasilitas")).toBeVisible();
    await expect(page.getByLabel("Min. Kapasitas")).toBeVisible();
    await expect(page.getByText("Menampilkan 12 dari 48 fasilitas")).toBeVisible();
    await expect(page.getByRole("link", { name: /Grand Auditorium/ })).toHaveAttribute(
      "href",
      "/student/facilities/grand-auditorium",
    );
    await expect(page.getByText("Rp 100k / sesi")).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Halaman katalog" })).toContainText("8");

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-facility-catalog-${isMobile ? "mobile" : "desktop"}`,
    );
  });

  test("renders deterministic query-like catalog states without an API", async ({ page }) => {
    await page.setViewportSize(screenshotViewports.desktop);
    await page.goto(
      "/student/facilities?q=studio&category=peralatan&min_capacity=10&sort=rating&page=1",
    );

    await expect(page.getByLabel("Pencarian")).toHaveValue("studio");
    await expect(page.getByLabel("Tipe Fasilitas")).toHaveValue("peralatan");
    await expect(page.getByLabel("Min. Kapasitas")).toHaveValue("10");
    await expect(page.getByLabel("Urutkan berdasarkan")).toHaveValue("rating");
    await expect(page.getByText("Menampilkan 1 dari 48 fasilitas")).toBeVisible();
    await expect(page.getByRole("link", { name: /Multimedia Studio/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Grand Auditorium/ })).toHaveCount(0);
  });
});
