import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

async function authenticateSuperAdmin(page: Page) {
  await page.route("http://localhost:8000/auth/me", async (route) => {
    await route.fulfill({
      json: {
        email: "super-admin@ipb.ac.id",
        full_name: "Super Admin",
        id: "admin-1",
        is_active: true,
        role: "super_admin",
      },
    });
  });
  await page.addInitScript(() => {
    window.sessionStorage.setItem("ipb-srh-token", "e2e-super-admin-token");
  });
}

const facilityGovernance = [
  {
    active_assigned_staff_count: 1,
    assigned_staff: [
      {
        email: "staff@ipb.ac.id",
        full_name: "Staff Fasilitas",
        id: "staff-1",
        is_active: true,
      },
    ],
    assigned_staff_count: 1,
    assignment_coverage: "covered",
    capacity: 300,
    category: "Auditorium",
    id: "facility-1",
    is_active: true,
    issue_flags: [],
    location: "Kampus Dramaga",
    name: "Grand Auditorium",
  },
  {
    active_assigned_staff_count: 0,
    assigned_staff: [
      {
        email: "inactive-staff@ipb.ac.id",
        full_name: "Staff Nonaktif",
        id: "staff-old",
        is_active: false,
      },
    ],
    assigned_staff_count: 1,
    assignment_coverage: "needs_staff",
    capacity: 40,
    category: "Laboratorium",
    id: "facility-2",
    is_active: false,
    issue_flags: ["needs_staff"],
    location: "Kampus Barat",
    name: "Lab Arsip",
  },
];

const reportAggregate = {
  kpis: {
    approved_reservations: 8,
    completed_reservations: 6,
    paid_reservation_total_rupiah: 12800000,
    rejected_reservations: 2,
    total_reservations: 20,
  },
  status_counts: {
    approved: 8,
    completed: 6,
    rejected: 2,
  },
  trend: [
    { date: "2026-05-01", paid_total_rupiah: 4000000, reservation_count: 5 },
    { date: "2026-05-02", paid_total_rupiah: 8800000, reservation_count: 15 },
  ],
};

const auditLogs = Array.from({ length: 12 }, (_, index) => ({
    action_type: "review.admin_deleted",
    actor_email: "admin@ipb.ac.id",
    actor_id: "admin-1",
    created_at: `2026-05-${String(index + 1).padStart(2, "0")}T04:30:00Z`,
    facility_id: "facility-1",
    id: `audit-${index + 1}`,
    reservation_id: "reservation-1",
    student_id: "student-1",
    target_id: `review-${index + 1}`,
    target_type: "review",
}));

const adminReviews = [
  {
    admin_removal_reason: null,
    comment: "Ruang bersih dan nyaman.",
    created_at: "2026-05-01T03:00:00Z",
    deleted_at: null,
    deleted_by: null,
    facility_id: "facility-1",
    facility_name: "Grand Auditorium",
    id: "review-1",
    is_deleted: false,
    rating: 5,
    reservation_id: "reservation-1",
    student_id: "student-1",
    student_name: "Student Aktif",
  },
  {
    admin_removal_reason: "Bahasa tidak pantas",
    comment: "Review kasar",
    created_at: "2026-05-02T03:00:00Z",
    deleted_at: "2026-05-02T04:30:00Z",
    deleted_by: "admin",
    facility_id: "facility-2",
    facility_name: "Lab Arsip",
    id: "review-2",
    is_deleted: true,
    rating: 1,
    reservation_id: "reservation-2",
    student_id: "student-2",
    student_name: "Student Nonaktif",
  },
];

async function mockFacilityGovernance(page: Page) {
  await page.route("http://localhost:8000/admin/facilities/governance", async (route) => {
    await route.fulfill({ json: facilityGovernance });
  });
  await page.route("http://localhost:8000/facility-categories", async (route) => {
    await route.fulfill({
      json: [
        { facility_count: 1, icon_hint: "presentation", id: "category-1", name: "Auditorium", slug: "auditorium" },
      ],
    });
  });
}

async function mockReports(page: Page) {
  await page.route("http://localhost:8000/admin/reports/aggregate**", async (route) => {
    await route.fulfill({ json: reportAggregate });
  });
  await page.route("http://localhost:8000/admin/audit-logs**", async (route) => {
    await route.fulfill({ json: auditLogs });
  });
  await page.route("http://localhost:8000/admin/reviews", async (route) => {
    await route.fulfill({ json: adminReviews });
  });
}

test.describe("super admin facilities and reports pages", () => {
  test("matches the super admin fasilitas reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await authenticateSuperAdmin(page);
    await mockFacilityGovernance(page);
    await page.goto("/super-admin/facilities");

    await expect(page.getByRole("heading", { exact: true, name: "Fasilitas" })).toBeVisible();
    if (!isMobile) {
      await expect(page.getByRole("link", { name: "Fasilitas" }).first()).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
    await expect(page.getByText("Fasilitas Aktif")).toBeVisible();
    await expect(page.getByText("Tanpa Staff")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Daftar Fasilitas" })).toBeVisible();
    await expect(page.getByText("Grand Auditorium").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Lab Arsip").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Butuh Staff").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(/Ditugaskan: Staff Fasilitas/).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText(/Staff Nonaktif/).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Ekspor CSV" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tambah Fasilitas" })).toBeVisible();

    await page.getByRole("button", { name: "Kelola staff Lab Arsip" }).click();
    await expect(page.getByRole("heading", { name: "Kelola Staff Fasilitas" })).toBeVisible();
    await expect(page.getByLabel("Pilih staff untuk Lab Arsip")).toBeVisible();
    await page.getByRole("button", { name: "Tutup" }).click();
    await expect(page.getByRole("heading", { name: "Kelola Staff Fasilitas" })).toBeHidden();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `super-admin-facilities-${isMobile ? "mobile" : "desktop"}`);
  });

  test("matches the super admin laporan reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await authenticateSuperAdmin(page);
    await mockReports(page);
    await page.goto("/super-admin/reports");

    await expect(page.getByRole("heading", { exact: true, name: "Laporan" })).toBeVisible();
    if (!isMobile) {
      await expect(page.getByRole("link", { name: "Laporan" }).first()).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
    await expect(page.getByText("Reservasi Bulan Ini")).toBeVisible();
    await expect(page.locator("article").filter({ hasText: "Reservasi Bulan Ini" }).getByText("20")).toBeVisible();
    await expect(page.getByText("Rp12.800.000").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tren Reservasi Mingguan" })).toBeVisible();
    await expect(page.getByLabel("Grafik tren reservasi")).toBeVisible();
    await expect(page.getByLabel("1 Mei 2026: 5 reservasi, Rp4.000.000")).toBeVisible();
    await expect(page.getByLabel("2 Mei 2026: 15 reservasi, Rp8.800.000")).toBeVisible();
    await expect(page.getByRole("button", { name: "Mingguan" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Bulanan" }).click();
    await expect(page.getByRole("heading", { name: "Tren Reservasi Bulanan" })).toBeVisible();
    await expect(page.getByLabel("Minggu 27 April 2026: 20 reservasi, Rp12.800.000")).toBeVisible();
    await page.getByRole("button", { name: "Tahunan" }).click();
    await expect(page.getByRole("heading", { name: "Tren Reservasi Tahunan" })).toBeVisible();
    await expect(page.getByLabel("Mei 2026: 20 reservasi, Rp12.800.000")).toBeVisible();
    await page.getByRole("button", { name: "Mingguan" }).click();
    await expect(page.getByText("Disetujui: 8")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Log Audit Terbaru" })).toBeVisible();
    await expect(page.getByText("admin@ipb.ac.id - review admin deleted")).toHaveCount(10);
    await expect(page.getByRole("link", { name: "Lihat semua log" })).toHaveAttribute(
      "href",
      "/super-admin/reports/logs",
    );
    await expect(page.getByRole("heading", { name: "Moderasi Ulasan" })).toBeVisible();
    await expect(page.getByText("Review kasar").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Disembunyikan").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Rentang Waktu")).toBeVisible();
    await expect(page.getByRole("button", { name: "Ekspor Laporan" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `super-admin-reports-${isMobile ? "mobile" : "desktop"}`);
  });

  test("opens the super admin full audit log page", async ({ page }) => {
    await authenticateSuperAdmin(page);
    await mockReports(page);
    await page.goto("/super-admin/reports/logs");

    await expect(page.getByRole("heading", { exact: true, name: "Log Audit" })).toBeVisible();
    await expect(page.getByText("12 log")).toBeVisible();
    await expect(page.getByText("admin@ipb.ac.id - review admin deleted")).toHaveCount(12);
    await expect(page.getByText(/review-12/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Kembali ke Laporan" })).toHaveAttribute(
      "href",
      "/super-admin/reports",
    );
  });
});
