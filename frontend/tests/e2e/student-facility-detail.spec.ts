import { expect, type Page, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const facilityDetail = {
  capacity: 1200,
  category: "Auditorium",
  contact: {
    email: "facility@example.test",
    name: "TU Fasilitas",
    phone: "0251-8620000",
  },
  description:
    "Grand Auditorium dirancang untuk seminar nasional, kuliah umum, pertunjukan akademik, dan acara institusi berskala besar.",
  id: "grand-auditorium",
  images: [
    { alt_text: "Foto utama Grand Auditorium", is_cover: true, url: "https://cdn.example.test/main.jpg" },
    { alt_text: "Foto panggung Grand Auditorium", is_cover: false, url: "https://cdn.example.test/stage.jpg" },
    { alt_text: "Foto kursi Grand Auditorium", is_cover: false, url: "https://cdn.example.test/seats.jpg" },
    { alt_text: "Foto tirai Grand Auditorium", is_cover: false, url: "https://cdn.example.test/curtain.jpg" },
  ],
  location: "Kampus Timur, Plaza Tengah",
  name: "Grand Auditorium",
  open_hours_summary: "Senin-Jumat 08:00-18:00",
  price: {
    amount_rupiah: 100000,
    is_free: false,
    summary: "Rp100.000 / sesi",
  },
  review_summary: {
    rating_average: 4.9,
    review_count: 124,
  },
  reviews: [
    {
      author_name: "Laras Indah",
      comment:
        "Ruangannya luas, tata suara jelas, dan proses masuk peserta cukup tertib. Cocok untuk seminar dengan jumlah peserta besar.",
      created_at: "2026-05-01T00:00:00Z",
      id: "review-1",
      rating: 5,
    },
    {
      author_name: "Laras Indah",
      comment:
        "Tim fasilitas membantu pengecekan panggung sebelum acara. Area registrasi juga mudah diatur untuk alur kedatangan peserta.",
      created_at: "2026-05-02T00:00:00Z",
      id: "review-2",
      rating: 5,
    },
  ],
};

const calendarResponse = [
  {
    ends_at: "2026-05-19T04:00:00Z",
    starts_at: "2026-05-19T02:00:00Z",
    status: "reserved",
  },
  {
    ends_at: "2026-05-19T07:00:00Z",
    starts_at: "2026-05-19T05:00:00Z",
    status: "reserved",
  },
];

async function mockFacilityDetailApi(page: Page) {
  await page.route("http://localhost:8000/facilities/grand-auditorium", async (route) => {
    await route.fulfill({ json: facilityDetail });
  });

  await page.route("http://localhost:8000/facilities/grand-auditorium/calendar?**", async (route) => {
    await route.fulfill({ json: calendarResponse });
  });
}

test.describe("student facility detail page", () => {
  test("matches the facility detail reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockFacilityDetailApi(page);
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
    const calendarBox = await page.getByRole("heading", { name: "Kalender Publik" }).boundingBox();
    const reviewsBox = await page.getByRole("heading", { name: "Ulasan Peminjam" }).boundingBox();
    expect(calendarBox?.y).toBeLessThan(reviewsBox?.y ?? 0);
    await expect(page.getByText("Waktu sudah dipesan").first()).toBeVisible();
    await expect(page.getByText("Detail kegiatan tidak ditampilkan pada kalender publik.").first()).toBeVisible();
    await expect(page.getByText("Simposium Etika AI 2024")).toHaveCount(0);
    await expect(page.getByText("BEM KM IPB")).toHaveCount(0);

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-facility-detail-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});
