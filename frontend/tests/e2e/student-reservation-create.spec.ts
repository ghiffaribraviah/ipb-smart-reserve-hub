import { expect, type Page, test } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const facilityImageFixture =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 480'%3E%3Crect width='1200' height='480' fill='%23e8f5e9'/%3E%3Cpath d='M0 360 260 150 480 310 760 95 1200 365v115H0z' fill='%230f9d58' opacity='.55'/%3E%3Cpath d='M0 420 220 280 410 375 620 245 1200 430v50H0z' fill='%231d7667' opacity='.25'/%3E%3C/svg%3E";

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

async function authenticateStudent(page: Page) {
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

  await page.route("http://localhost:8000/notifications", async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route("http://localhost:8000/notifications?**", async (route) => {
    await route.fulfill({ json: [] });
  });
  await page.route("http://localhost:8000/notifications/unread-count", async (route) => {
    await route.fulfill({ json: { unread_count: 0 } });
  });
  await page.route("http://localhost:8000/notifications/*/read", async (route) => {
    await route.fulfill({ json: { id: "notification-1", read_at: "2026-05-26T00:00:00Z" } });
  });
  await page.route("http://localhost:8000/notifications/read-all", async (route) => {
    await route.fulfill({ json: [] });
  });
}

async function mockReservationTimeApi(page: Page) {
  await page.route("http://localhost:8000/facilities/grand-auditorium/calendar?**", async (route) => {
    await route.fulfill({ json: calendarResponse });
  });

  await page.route("http://localhost:8000/facilities/grand-auditorium/reservation-time-selection", async (route) => {
    await route.fulfill({ json: { available: true, errors: [] } });
  });
}

async function mockReservationDetailApi(page: Page) {
  await page.route("http://localhost:8000/facilities/grand-auditorium", async (route) => {
    await route.fulfill({
      json: {
        capacity: 300,
        id: "grand-auditorium",
        images: [
          {
            alt_text: "Foto utama Grand Auditorium",
            id: "image-1",
            is_cover: true,
            url: facilityImageFixture,
          },
        ],
        name: "Grand Auditorium",
        price: {
          amount_rupiah: 250000,
          is_free: false,
          summary: "Rp250.000",
        },
      },
    });
  });

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
    await authenticateStudent(page);
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
    await authenticateStudent(page);
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
    await expect(page.getByRole("img", { name: "Foto utama Grand Auditorium" })).toBeVisible();
    await expect(page.getByText("Total Biaya", { exact: true })).toBeVisible();
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
