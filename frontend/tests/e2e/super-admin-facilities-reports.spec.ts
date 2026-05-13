import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const facilityGovernance = [
  {
    active_assigned_staff_count: 1,
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

const auditLogs = [
  {
    action_type: "review.admin_deleted",
    actor_email: "admin@ipb.ac.id",
    actor_id: "admin-1",
    created_at: "2026-05-02T04:30:00Z",
    facility_id: "facility-1",
    id: "audit-1",
    reservation_id: "reservation-1",
    student_id: "student-1",
    target_id: "review-1",
    target_type: "review",
  },
];

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
    await expect(page.getByText("needs_staff").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Penugasan Terbaru" })).toBeVisible();
    await expect(page.getByLabel("Staff ID untuk Lab Arsip")).toBeVisible();
    await expect(page.getByRole("button", { name: "Impor Data ditunda" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tambah Fasilitas ditunda" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `super-admin-facilities-${isMobile ? "mobile" : "desktop"}`);
  });

  test("matches the super admin laporan reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
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
    await expect(page.getByText("Rp12.800.000")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tren Reservasi Mingguan" })).toBeVisible();
    await expect(page.getByLabel("Grafik tren reservasi")).toBeVisible();
    await expect(page.getByText("approved: 8")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Log Audit Terbaru" })).toBeVisible();
    await expect(page.getByText("admin@ipb.ac.id melakukan review.admin_deleted")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Moderasi Ulasan" })).toBeVisible();
    await expect(page.getByText("Review kasar").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Dihapus").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Rentang Waktu" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Ekspor Laporan ditunda" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `super-admin-reports-${isMobile ? "mobile" : "desktop"}`);
  });
});
