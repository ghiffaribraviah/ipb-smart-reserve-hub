import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const facilityImageFixture =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' fill='%23e8f5e9'/%3E%3Cpath d='M0 280 180 120 320 230 460 80 640 260v100H0z' fill='%230f9d58' opacity='.55'/%3E%3Ctext x='40' y='72' font-family='Arial' font-size='38' fill='%23111827'%3EIPB SRH%3C/text%3E%3C/svg%3E";

const assignedFacilities = [
  {
    capacity: 1200,
    category: "Auditorium / Seminar",
    category_id: "category-auditorium",
    contact_email: "auditorium@apps.ipb.ac.id",
    contact_name: "TU Auditorium",
    contact_phone: "081200000000",
    description:
      "Auditorium utama untuk seminar, kuliah umum, dan kegiatan institusi berskala besar dengan tata suara dan panggung terintegrasi.",
    id: "grand-auditorium",
    images: [
      {
        alt_text: "Cover auditorium",
        display_order: 0,
        id: "image-cover",
        is_active: true,
        is_cover: true,
        url: facilityImageFixture,
      },
      {
        alt_text: "Tampak samping auditorium",
        display_order: 1,
        id: "image-side",
        is_active: true,
        is_cover: false,
        url: facilityImageFixture,
      },
    ],
    is_active: true,
    location: "Kampus Timur, Plaza Tengah",
    name: "Grand Auditorium",
    open_hours: [
      { id: "open-hour-1", day_of_week: 0, opens_at: "08:00", closes_at: "18:00" },
      { id: "open-hour-2", day_of_week: 1, opens_at: "08:00", closes_at: "18:00" },
    ],
    open_hours_summary: "Senin-Jumat, 08:00 - 18:00",
    payment_instructions: "Transfer ke rekening resmi IPB.",
    price_rupiah: 100000,
    price_summary: "Rp100.000 / jam",
  },
];

const facilityCategories = [
  {
    facility_count: 1,
    icon_hint: "presentation",
    id: "category-auditorium",
    name: "Auditorium / Seminar",
    slug: "auditorium",
  },
  {
    facility_count: 0,
    icon_hint: "book",
    id: "category-classroom",
    name: "Ruang Kelas",
    slug: "kelas",
  },
];

async function mockStaffFacilityEditEndpoints(page: Page) {
  await page.route("http://localhost:8000/auth/me", async (route) => {
    await route.fulfill({
      json: {
        email: "staff@apps.ipb.ac.id",
        full_name: "Staf Fasilitas",
        id: "staff-1",
        is_active: true,
        role: "staff",
      },
    });
  });
  await page.addInitScript(() => {
    window.sessionStorage.setItem("ipb-srh-token", "e2e-staff-token");
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
  await page.route("http://localhost:8000/staff/facilities", async (route) => {
    await route.fulfill({ json: assignedFacilities });
  });
  await page.route("http://localhost:8000/facility-categories", async (route) => {
    await route.fulfill({ json: facilityCategories });
  });
  await page.route("http://localhost:8000/staff/facilities/grand-auditorium**", async (route) => {
    await route.fulfill({ json: assignedFacilities[0] });
  });
}

test.describe("staff edit facility page", () => {
  test("matches the edit facility details reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockStaffFacilityEditEndpoints(page);
    await page.goto("/staff/facilities/grand-auditorium/edit");

    await expect(page.getByRole("link", { name: "Kembali" })).toHaveAttribute(
      "href",
      "/staff/facilities",
    );
    await expect(page.getByRole("heading", { name: "Edit Detail Fasilitas" })).toBeVisible();
    await expect(page.getByLabel("Nama", { exact: true })).toHaveValue("Grand Auditorium");
    await expect(page.getByLabel("Lokasi")).toHaveValue("Kampus Timur, Plaza Tengah");
    await expect(page.getByLabel("Kategori Fasilitas")).toHaveValue("category-auditorium");
    await expect(page.getByLabel("Kapasitas (Orang)")).toHaveValue("1200");
    await expect(page.getByLabel("Harga sewa (Rupiah)")).toHaveValue("100000");
    await expect(page.getByLabel("Nama Kontak")).toHaveValue("TU Auditorium");
    await expect(page.getByLabel("Nomor Kontak")).toHaveValue("081200000000");
    await expect(page.getByLabel("Email Kontak")).toHaveValue("auditorium@apps.ipb.ac.id");
    await expect(page.getByRole("heading", { name: "Jadwal Operasional" })).toBeVisible();
    await expect(page.getByText("Ringkasan saat ini: Senin-Jumat, 08:00 - 18:00")).toBeVisible();
    await expect(page.getByLabel("Hari buka 1")).toHaveValue("0");
    await expect(page.getByLabel("Jam buka mulai 1")).toHaveValue("08:00");
    await expect(page.getByLabel("Jam buka selesai 1")).toHaveValue("18:00");
    await expect(page.getByLabel("Jam buka mulai 1")).toHaveAttribute("type", "text");
    await expect(page.getByLabel("Jam buka selesai 1")).toHaveAttribute("type", "text");
    await expect(page.getByRole("button", { name: "Tambah Baris Jam Buka" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Hapus Jam Buka 1" })).toBeVisible();
    await expect(page.getByLabel("Instruksi Pembayaran")).toHaveValue("Transfer ke rekening resmi IPB.");
    await expect(page.getByRole("heading", { name: "Galeri Media" })).toBeVisible();
    await expect(page.getByRole("img", { name: "Cover auditorium" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Pilih Tampak samping auditorium sebagai cover" })).toBeVisible();
    await expect(page.getByLabel("URL Gambar")).toBeVisible();
    await expect(page.getByRole("button", { name: "Tambah Gambar" })).toBeDisabled();
    await expect(page.getByLabel("Tanggal blackout mulai")).toHaveAttribute("type", "date");
    await expect(page.getByLabel("Tanggal blackout mulai")).toHaveValue("2026-06-01");
    await expect(page.getByLabel("Jam blackout mulai")).toHaveValue("03:00");
    await expect(page.getByLabel("Tanggal blackout selesai")).toHaveAttribute("type", "date");
    await expect(page.getByLabel("Tanggal blackout selesai")).toHaveValue("2026-06-01");
    await expect(page.getByLabel("Jam blackout selesai")).toHaveValue("04:00");
    await expect(page.getByRole("button", { name: "Tambah Blackout" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Simpan Perubahan" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Nonaktifkan" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null));
    await expectPageScreenshot(page, `staff-edit-facility-${isMobile ? "mobile" : "desktop"}`);
  });
});
