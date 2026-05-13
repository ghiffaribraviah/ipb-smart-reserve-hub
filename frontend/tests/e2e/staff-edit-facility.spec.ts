import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const assignedFacilities = [
  {
    capacity: 1200,
    category: "Auditorium / Seminar",
    contact_email: "auditorium@apps.ipb.ac.id",
    contact_name: "TU Auditorium",
    contact_phone: "081200000000",
    description:
      "Auditorium utama untuk seminar, kuliah umum, dan kegiatan institusi berskala besar dengan tata suara dan panggung terintegrasi.",
    id: "grand-auditorium",
    is_active: true,
    location: "Kampus Timur, Plaza Tengah",
    name: "Grand Auditorium",
    open_hours_summary: "Senin-Jumat, 08:00 - 18:00",
    payment_instructions: "Transfer ke rekening resmi IPB.",
    price_rupiah: 100000,
    price_summary: "Rp100.000 / jam",
  },
];

async function mockStaffFacilityEditEndpoints(page: Page) {
  await page.route("http://localhost:8000/staff/facilities", async (route) => {
    await route.fulfill({ json: assignedFacilities });
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
    await expect(page.getByLabel("Kapasitas (Orang)")).toHaveValue("1200");
    await expect(page.getByLabel("Harga sewa (Rupiah)")).toHaveValue("100000");
    await expect(page.getByLabel("Nama Kontak")).toHaveValue("TU Auditorium");
    await expect(page.getByLabel("Nomor Kontak")).toHaveValue("081200000000");
    await expect(page.getByLabel("Email Kontak")).toHaveValue("auditorium@apps.ipb.ac.id");
    await expect(page.getByRole("heading", { name: "Jadwal Operasional" })).toBeVisible();
    await expect(page.getByLabel("Ringkasan Jam Buka")).toHaveValue("Senin-Jumat, 08:00 - 18:00");
    await expect(page.getByLabel("Instruksi Pembayaran")).toHaveValue("Transfer ke rekening resmi IPB.");
    await expect(page.getByRole("heading", { name: "Galeri Media" })).toBeVisible();
    await expect(page.getByLabel("URL Gambar")).toBeVisible();
    await expect(page.getByRole("button", { name: "Tambah Gambar" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Tambah Jam Buka" })).toBeVisible();
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
