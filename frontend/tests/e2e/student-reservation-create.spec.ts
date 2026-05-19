import { expect, type Page, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const calendarResponse = [
  {
    ends_at: "2026-06-24T05:00:00Z",
    starts_at: "2026-06-24T02:00:00Z",
    status: "reserved",
  },
  {
    ends_at: "2026-06-24T08:00:00Z",
    starts_at: "2026-06-24T06:00:00Z",
    status: "reserved",
  },
  {
    ends_at: "2026-06-24T11:00:00Z",
    starts_at: "2026-06-24T09:00:00Z",
    status: "reserved",
  },
];

async function mockReservationTimeApi(page: Page) {
  await page.route("http://localhost:8000/facilities/grand-auditorium/calendar?**", async (route) => {
    await route.fulfill({ json: calendarResponse });
  });

  await page.route("http://localhost:8000/facilities/grand-auditorium/reservation-time-selection", async (route) => {
    await route.fulfill({ json: { available: true, errors: [] } });
  });
}

async function mockReservationDetailApi(page: Page) {
  await page.route("http://localhost:8000/organization-units", async (route) => {
    await route.fulfill({
      json: [
        { code: "BEM-KM", id: "org-1", name: "BEM KM IPB", type: "student_organization" },
        { code: "HIMALKOM", id: "org-2", name: "Himalkom", type: "student_organization" },
      ],
    });
  });
}

test.describe("student reservation creation pages", () => {
  test("matches the reservation time form reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockReservationTimeApi(page);
    await page.goto("/student/facilities/grand-auditorium/reserve/time");

    await expect(page.getByRole("link", { name: "Kembali" })).toHaveAttribute(
      "href",
      "/student/facilities/grand-auditorium",
    );
    await expect(page.getByRole("navigation", { name: "Tahapan reservasi" })).toContainText(
      "Pilih Waktu",
    );
    await expect(page.getByRole("heading", { name: "Juni 2026" })).toBeVisible();
    await expect(page.getByText("Jadwal pada 24 Juni 2026")).toBeVisible();
    await expect(page.getByLabel("Waktu Mulai")).toHaveValue("09:00");
    await expect(page.getByLabel("Waktu Selesai")).toHaveValue("13:00");
    await expect(page.getByText("Total Durasi: 4 Jam")).toBeVisible();
    await expect(page.getByText("Detail kegiatan tidak ditampilkan pada kalender publik.").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Lanjutkan" })).toHaveAttribute("aria-disabled", "true");
    await page.getByRole("button", { name: "Cek Ketersediaan" }).click();
    await expect(page.getByText("Waktu tersedia. Anda dapat melanjutkan reservasi.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Lanjutkan" })).toHaveAttribute(
      "href",
      "/student/facilities/grand-auditorium/reserve/details?starts_at=2026-06-24T09%3A00%3A00%2B07%3A00&ends_at=2026-06-24T13%3A00%3A00%2B07%3A00",
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
    await mockReservationDetailApi(page);
    await page.goto("/student/facilities/grand-auditorium/reserve/details");

    await expect(page.getByRole("link", { name: "← Kembali" })).toHaveAttribute(
      "href",
      "/student/facilities/grand-auditorium/reserve/time",
    );
    await expect(page.getByRole("heading", { name: "Detail Reservasi" })).toBeVisible();
    await expect(page.getByLabel("Nama Kegiatan")).toBeVisible();
    await expect(page.getByLabel("Estimasi Jumlah Peserta")).toBeVisible();
    await expect(page.getByLabel("Organisasi")).toBeVisible();
    await expect(page.getByLabel("Nomor Kontak")).toBeVisible();
    await expect(page.getByLabel("Dukungan AV & mikrofon")).toBeVisible();
    await expect(page.getByLabel("Catatan Tambahan")).toBeVisible();
    await expect(page.getByText("Total Biaya")).toBeVisible();
    await expect(page.getByRole("button", { name: "Lanjutkan" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(
      page,
      `student-reservation-detail-${isMobile ? "mobile" : "desktop"}`,
    );
  });
});
