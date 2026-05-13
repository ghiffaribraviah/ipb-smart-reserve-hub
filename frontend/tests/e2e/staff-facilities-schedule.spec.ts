import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const assignedFacilities = [
  {
    capacity: 300,
    category: "Auditorium / Seminar",
    contact_email: "auditorium@apps.ipb.ac.id",
    contact_name: "Staff Auditorium",
    contact_phone: "08123456789",
    description: "Auditorium utama untuk seminar besar dan pertemuan fakultas.",
    id: "grand-auditorium",
    is_active: true,
    location: "Kampus Dramaga",
    name: "Grand Auditorium",
    open_hours_summary: "Senin-Jumat, 08:00-18:00",
    payment_instructions: null,
    price_rupiah: 100000,
    price_summary: "Rp100.000 / jam",
  },
  {
    capacity: 40,
    category: "Laboratorium",
    contact_email: "bio@apps.ipb.ac.id",
    contact_name: "Staff Lab",
    contact_phone: "08123456780",
    description: "Laboratorium riset mikrobiologi dan praktikum mahasiswa dengan peralatan lengkap.",
    id: "bio-labs-complex-a",
    is_active: true,
    location: "Kampus Dramaga",
    name: "Bio-Labs Complex A",
    open_hours_summary: "Senin-Jumat, 08:00-17:00",
    payment_instructions: null,
    price_rupiah: 0,
    price_summary: "Gratis",
  },
  {
    capacity: 60,
    category: "Ruang Kelas",
    contact_email: "seminar@apps.ipb.ac.id",
    contact_name: "Staff Seminar",
    contact_phone: "08123456781",
    description: "Ruang seminar dengan proyektor, papan interaktif, dan sistem suara.",
    id: "seminar-room-101",
    is_active: true,
    location: "Kampus Dramaga",
    name: "Seminar Room 101",
    open_hours_summary: "Senin-Jumat, 07:00-18:00",
    payment_instructions: null,
    price_rupiah: 50000,
    price_summary: "Rp50.000 / sesi",
  },
  {
    capacity: 25,
    category: "Lanskap / Outdoor",
    contact_email: null,
    contact_name: "Staff Greenhouse",
    contact_phone: "08123456782",
    description: "Fasilitas pertanian lingkungan terkendali untuk praktikum dan riset tanaman.",
    id: "agri-tech-greenhouses",
    is_active: false,
    location: "Kampus Barat",
    name: "Agri-Tech Greenhouses",
    open_hours_summary: "Senin-Jumat, 08:00-16:00",
    payment_instructions: null,
    price_rupiah: 0,
    price_summary: "Gratis",
  },
];

const facilitySchedule = [
  {
    activity_title: "Simposium Etika AI 2024",
    detail_url: "/staff/reservations/RSV-SCH-001",
    ends_at: "2024-10-24T12:00:00+07:00",
    organization_unit: { id: "org-1", name: "Departemen Ilmu Komputer" },
    reservation_code: "RSV-SCH-001",
    reservation_id: "RSV-SCH-001",
    review_status: "not_actionable",
    starts_at: "2024-10-24T09:00:00+07:00",
    status: "approved",
    workflow_type: "reservation",
  },
  {
    activity_title: "Kuliah Tamu: Adaptasi Perubahan Iklim",
    detail_url: "/staff/reservations/RSV-SCH-002",
    ends_at: "2024-10-24T15:00:00+07:00",
    organization_unit: { id: "org-2", name: "Fakultas Kehutanan" },
    reservation_code: "RSV-SCH-002",
    reservation_id: "RSV-SCH-002",
    review_status: "not_actionable",
    starts_at: "2024-10-24T13:00:00+07:00",
    status: "approved",
    workflow_type: "reservation",
  },
  {
    activity_title: "Kejuaraan Tahunan Klub Debat",
    detail_url: "/staff/reservations/RSV-SCH-003",
    ends_at: "2024-10-24T18:00:00+07:00",
    organization_unit: { id: "org-3", name: "BEM Mahasiswa" },
    reservation_code: "RSV-SCH-003",
    reservation_id: "RSV-SCH-003",
    review_status: "pending_review",
    starts_at: "2024-10-24T16:00:00+07:00",
    status: "pending_document_review",
    workflow_type: "document_review",
  },
];

async function mockStaffFacilityEndpoints(page: Page) {
  await page.route("http://localhost:8000/staff/facilities", async (route) => {
    await route.fulfill({ json: assignedFacilities });
  });
  await page.route("http://localhost:8000/staff/facilities/grand-auditorium/schedule**", async (route) => {
    await route.fulfill({ json: facilitySchedule });
  });
}

test.describe("staff facility pages", () => {
  test("matches the assigned facility list reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockStaffFacilityEndpoints(page);
    await page.goto("/staff/facilities");

    await expect(page.getByRole("heading", { name: "Fasilitas Terkelola" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Aksi tambah ditunda" })).toBeVisible();
    await expect(page.getByLabel("Filter by facility type")).toHaveValue("");
    await expect(page.getByLabel("Filter by facility status")).toHaveValue("");
    await expect(page.getByText("Menampilkan 4 fasilitas")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Grand Auditorium" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Agri-Tech Greenhouses" })).toBeVisible();
    await expect(page.locator("span").filter({ hasText: /^Nonaktif$/ })).toBeVisible();
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
    await mockStaffFacilityEndpoints(page);
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
    await expect(page.getByRole("table").getByText("Menunggu Verifikasi Dokumen")).toBeVisible();
    await expect(
      page.getByRole("row", { name: /Kejuaraan Tahunan Klub Debat/ }).getByRole("link", {
        name: "Tinjau Pengajuan BEM Mahasiswa",
      }),
    ).toHaveAttribute("href", "/staff/reservations/RSV-SCH-003");

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `staff-facility-schedule-${isMobile ? "mobile" : "desktop"}`);
  });
});
