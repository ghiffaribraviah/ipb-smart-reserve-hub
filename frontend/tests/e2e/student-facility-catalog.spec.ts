import { expect, type Page, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const categoriesResponse = [
  { facility_count: 24, icon_hint: "auditorium", id: "cat-seminar", name: "Seminar", slug: "seminar" },
  { facility_count: 8, icon_hint: "equipment", id: "cat-peralatan", name: "Peralatan", slug: "peralatan" },
];

const catalogItems = [
  {
    capacity: 500,
    category: "Seminar",
    cover_image_url: null,
    id: "grand-auditorium",
    location: "Gedung Andi Hakim",
    name: "Grand Auditorium",
    open_hours_summary: "Senin-Jumat 08:00-21:00",
    price_summary: "Rp 100k / sesi",
    rating_average: 4.9,
    review_count: 248,
  },
  ...Array.from({ length: 11 }).map((_, index) => ({
    capacity: 80 + index * 10,
    category: index % 2 === 0 ? "Seminar" : "Peralatan",
    cover_image_url: null,
    id: `facility-${index + 2}`,
    location: `Gedung ${index + 2}`,
    name: `Fasilitas Kampus ${index + 2}`,
    open_hours_summary: "Senin-Jumat 08:00-17:00",
    price_summary: index % 2 === 0 ? "Gratis" : "Rp 75k / sesi",
    rating_average: 4.5,
    review_count: 20 + index,
  })),
];

async function mockCatalogApi(page: Page) {
  await page.route("http://localhost:8000/facility-categories", async (route) => {
    await route.fulfill({ json: categoriesResponse });
  });

  await page.route("http://localhost:8000/facilities?**", async (route) => {
    const url = new URL(route.request().url());
    const query = url.searchParams.get("q");
    const category = url.searchParams.get("category");

    if (query === "studio" && category === "peralatan") {
      await route.fulfill({
        json: {
          items: [
            {
              capacity: 15,
              category: "Peralatan",
              cover_image_url: null,
              id: "multimedia-studio",
              location: "Gedung Media",
              name: "Multimedia Studio",
              open_hours_summary: "Senin-Jumat 09:00-17:00",
              price_summary: "Rp 75k / sesi",
              rating_average: 4.8,
              review_count: 77,
            },
          ],
          page: 1,
          page_size: 12,
          total_items: 48,
          total_pages: 8,
        },
      });
      return;
    }

    await route.fulfill({
      json: {
        items: catalogItems,
        page: Number(url.searchParams.get("page") ?? "1"),
        page_size: 12,
        total_items: 48,
        total_pages: 8,
      },
    });
  });
}

test.describe("student facility catalog page", () => {
  test("matches the facility catalog reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockCatalogApi(page);
    await page.goto("/student/facilities");

    await expect(page.getByRole("heading", { name: "Katalog Fasilitas" })).toBeVisible();
    await expect(page.getByLabel("Pencarian")).toBeVisible();
    await expect(page.getByLabel("Kategori Fasilitas")).toBeVisible();
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

  test("renders backend query catalog state", async ({ page }) => {
    await page.setViewportSize(screenshotViewports.desktop);
    await mockCatalogApi(page);
    await page.goto(
      "/student/facilities?q=studio&category=peralatan&min_capacity=10&sort=rating_desc&page=1",
    );

    await expect(page.getByLabel("Pencarian")).toHaveValue("studio");
    await expect(page.getByLabel("Kategori Fasilitas")).toHaveValue("peralatan");
    await expect(page.getByLabel("Min. Kapasitas")).toHaveValue("10");
    await expect(page.getByLabel("Urutkan berdasarkan")).toHaveValue("rating_desc");
    await expect(page.getByText("Menampilkan 1 dari 48 fasilitas")).toBeVisible();
    await expect(page.getByRole("link", { name: /Multimedia Studio/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Grand Auditorium/ })).toHaveCount(0);
  });
});
