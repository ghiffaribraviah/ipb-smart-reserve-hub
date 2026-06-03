import { expect, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

async function mockStudentHomeDiscovery(page: import("@playwright/test").Page) {
  await page.route("http://localhost:8000/facility-categories", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: [
        { facility_count: 12, icon_hint: "dumbbell", id: "cat-olahraga", name: "Olahraga", slug: "olahraga" },
        { facility_count: 18, icon_hint: "school", id: "cat-kelas", name: "Kelas", slug: "kelas" },
        { facility_count: 8, icon_hint: "presentation", id: "cat-seminar", name: "Seminar", slug: "seminar" },
        { facility_count: 5, icon_hint: "outdoor", id: "cat-landskap", name: "Landskap", slug: "landskap" },
        { facility_count: 4, icon_hint: "equipment", id: "cat-peralatan", name: "Peralatan", slug: "peralatan" },
      ],
    });
  });

  await page.route("http://localhost:8000/facilities?featured=true&limit=8", async (route) => {
    await route.fulfill({
      contentType: "application/json",
      json: {
        items: [
          {
            capacity: 1200,
            category: "Seminar",
            cover_image_url: null,
            id: "grand-auditorium",
            location: "Kampus Timur",
            name: "Grand Auditorium",
            open_hours_summary: "Senin-Jumat 08:00-18:00",
            price_summary: "Rp 100k / sesi",
            rating_average: 4.8,
            review_count: 128,
          },
          {
            capacity: 45,
            category: "Kelas",
            cover_image_url: null,
            id: "smart-classroom-a1",
            location: "Gedung A",
            name: "Smart Classroom A1",
            open_hours_summary: "Senin-Jumat 08:00-17:00",
            price_summary: "Gratis",
            rating_average: 4.7,
            review_count: 42,
          },
          {
            capacity: 500,
            category: "Olahraga",
            cover_image_url: null,
            id: "gymnasium-utama",
            location: "Pusat Olahraga",
            name: "Gymnasium Utama",
            open_hours_summary: "Setiap hari 07:00-21:00",
            price_summary: "Rp 50k / sesi",
            rating_average: 4.6,
            review_count: 75,
          },
          {
            capacity: 2000,
            category: "Landskap",
            cover_image_url: null,
            id: "plaza-rektorat",
            location: "Kampus Tengah",
            name: "Plaza Rektorat",
            open_hours_summary: "Setiap hari",
            price_summary: "Rp 200k / hari",
            rating_average: 4.9,
            review_count: 96,
          },
        ],
        page: 1,
        page_size: 8,
        total_items: 4,
        total_pages: 1,
      },
    });
  });
}

async function authenticateStudent(page: import("@playwright/test").Page) {
  await page.route("http://localhost:8000/auth/me", async (route) => {
    await route.fulfill({
      json: {
        email: "student@apps.ipb.ac.id",
        full_name: "Student Aktif",
        id: "student-1",
        is_active: true,
        role: "student",
      },
    });
  });
  await page.addInitScript(() => {
    window.sessionStorage.setItem("ipb-srh-token", "e2e-student-token");
  });
}

test.describe("student home page", () => {
  test("matches the student home reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await authenticateStudent(page);
    await mockStudentHomeDiscovery(page);
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
    await expect(page.getByText("Rp 100k / sesi")).toBeVisible();
    await expect(page.getByPlaceholder("Kapasitas")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Filter" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Jelajah Katalog" })).toHaveAttribute(
      "href",
      "/student/facilities",
    );
    await expect(page.getByRole("link", { name: /Grand Auditorium/ })).toContainText("(128 ulasan)");
    await expect(page.getByRole("contentinfo")).toContainText(
      "© 2026 IPB Smart Reserve Hub. Hak cipta dilindungi.",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `student-home-${isMobile ? "mobile" : "desktop"}`);
  });
});
