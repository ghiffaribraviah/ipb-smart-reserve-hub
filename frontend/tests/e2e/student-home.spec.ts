import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

test.describe("student home page", () => {
  test("matches the student home reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await page.goto("/student");

    await expect(
      page.getByRole("heading", { name: "IPB Smart Reserve Hub" }),
    ).toBeVisible();
    if (isMobile) {
      await expect(page.getByRole("button", { name: "Buka navigasi mahasiswa" })).toBeVisible();
    } else {
      await expect(page.getByRole("navigation", { name: "Navigasi mahasiswa" })).toContainText(
        "Beranda",
      );
    }
    await expect(page.getByRole("heading", { name: "Tipe Fasilitas" })).toBeVisible();
    await expect(page.locator('a[href="/student/facilities?category=olahraga"]')).toContainText(
      "Olahraga",
    );
    await expect(page.locator('a[href="/student/facilities?category=olahraga"]')).toHaveAttribute(
      "href",
      "/student/facilities?category=olahraga",
    );
    await expect(page.getByRole("link", { name: /Grand Auditorium/ })).toHaveAttribute(
      "href",
      "/student/facilities/grand-auditorium",
    );
    await expect(page.getByText("Kapasitas: 1,200")).toBeVisible();
    await expect(page.getByText("Tipe: Seminar").first()).toBeVisible();
    await expect(page.getByRole("contentinfo")).toContainText(
      "© 2026 IPB Smart Reserve Hub. Hak cipta dilindungi.",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `student-home-${isMobile ? "mobile" : "desktop"}`);
  });
});
