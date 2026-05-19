import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  expectNoHorizontalOverflow,
  expectPageScreenshot,
  screenshotViewports,
} from "./utils/visual";

const dashboardAggregate = {
  administrators: [
    {
      email: "admin@ipb.ac.id",
      full_name: "Admin IPB",
      id: "admin-1",
      is_active: true,
      role: "super_admin",
    },
    {
      email: "inactive-admin@ipb.ac.id",
      full_name: "Admin Nonaktif",
      id: "admin-2",
      is_active: false,
      role: "super_admin",
    },
  ],
  facility_governance: [
    {
      active_assigned_staff_count: 1,
      assigned_staff_count: 1,
      assignment_coverage: "covered",
      capacity: 300,
      category: "Auditorium",
      id: "grand-auditorium",
      is_active: true,
      issue_flags: [],
      location: "Kampus Dramaga",
      name: "Grand Auditorium",
    },
    {
      active_assigned_staff_count: 0,
      assigned_staff_count: 0,
      assignment_coverage: "needs_staff",
      capacity: 40,
      category: "Laboratorium",
      id: "lab-arsip",
      is_active: true,
      issue_flags: ["needs_staff"],
      location: "Kampus Barat",
      name: "Lab Arsip",
    },
  ],
  kpis: {
    active_facilities: 8,
    system_health: "degraded",
    total_reservations: 42,
    total_users: 128,
  },
  recent_activity: [
    {
      action_type: "staff_assignment.created",
      actor_email: "admin@ipb.ac.id",
      actor_id: "admin-1",
      created_at: "2026-05-01T03:00:00Z",
      facility_id: "grand-auditorium",
      id: "audit-1",
      reservation_id: null,
      student_id: null,
      target_id: "grand-auditorium",
      target_type: "facility_staff_assignment",
    },
  ],
  system_status: {
    application: { name: "IPB SRH", version: "1.0.0" },
    backend: { status: "ok" },
    database: { status: "ok" },
    storage: { status: "degraded" },
    worker: { status: "ok" },
  },
};

const usersAggregate = {
  items: [
    {
      academic_profile: {
        degree: "S1",
        entry_year: 2019,
        faculty: "FMIPA",
        program_studi: "Ilmu Komputer",
      },
      email: "student@apps.ipb.ac.id",
      full_name: "Student Aktif",
      id: "student-1",
      is_active: true,
      nim: "G64190001",
      phone: "08123456789",
      role: "student",
    },
    {
      academic_profile: null,
      email: "staff@ipb.ac.id",
      full_name: "Staff Fasilitas",
      id: "staff-1",
      is_active: false,
      nim: null,
      phone: null,
      role: "staff",
    },
  ],
  page: 1,
  page_size: 10,
  total: 2,
};

async function mockDashboard(page: Page) {
  await page.route("http://localhost:8000/admin/dashboard", async (route) => {
    await route.fulfill({ json: dashboardAggregate });
  });
}

async function mockUsers(page: Page) {
  await page.route("http://localhost:8000/admin/users**", async (route) => {
    await route.fulfill({ json: usersAggregate });
  });
}

test.describe("super admin dashboard and users pages", () => {
  test("matches the super admin dashboard reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockDashboard(page);
    await page.goto("/super-admin");

    await expect(page.getByRole("heading", { name: "Dashboard Super Admin" })).toBeVisible();
    if (!isMobile) {
      await expect(page.getByRole("link", { name: "Dashboard" }).first()).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
    await expect(page.getByText("Total Pengguna")).toBeVisible();
    await expect(page.getByText("128")).toBeVisible();
    await expect(page.getByText("Degraded")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Administrator Departemen" })).toBeVisible();
    await expect(page.getByText("Admin IPB").nth(isMobile ? 1 : 0)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Log Aktivitas Sistem" })).toBeVisible();
    await expect(page.getByText("admin@ipb.ac.id melakukan staff_assignment.created")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tata Kelola Fasilitas" })).toBeVisible();
    await expect(page.getByText("Grand Auditorium").nth(isMobile ? 1 : 0)).toBeVisible();
    await expect(page.getByRole("button", { name: "Ekspor Laporan ditunda" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Tambah Admin ditunda" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `super-admin-dashboard-${isMobile ? "mobile" : "desktop"}`);
  });

  test("matches the super admin pengguna reference", async ({ page }, testInfo) => {
    const isMobile = testInfo.project.name.includes("mobile");
    await page.setViewportSize(isMobile ? screenshotViewports.mobile : screenshotViewports.desktop);
    await mockUsers(page);
    await page.goto("/super-admin/users");

    await expect(page.getByRole("heading", { exact: true, name: "Pengguna" })).toBeVisible();
    if (!isMobile) {
      await expect(page.getByRole("link", { name: "Pengguna" }).first()).toHaveAttribute(
        "aria-current",
        "page",
      );
    }
    await expect(page.getByText("Total Akun")).toBeVisible();
    await expect(page.locator("article").filter({ hasText: "Total Akun" }).getByText("2", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Cari pengguna")).toHaveAttribute("placeholder", "Cari nama, email, atau NIM");
    await expect(page.getByLabel("Filter role")).toHaveValue("all");
    await expect(page.getByLabel("Filter status")).toHaveValue("all");
    await expect(page.getByRole("button", { name: "Tambah Pengguna" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Buat Pengguna" })).toBeDisabled();
    await expect(page.getByLabel("Email pengguna baru")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Daftar Pengguna" })).toBeVisible();
    await expect(page.getByText("Student Aktif").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Ilmu Komputer").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText("Staff Fasilitas").filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Ubah status Student Aktif" }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: "Ekspor CSV ditunda" })).toBeVisible();

    if (isMobile) {
      await expectNoHorizontalOverflow(page);
    }

    await expectPageScreenshot(page, `super-admin-users-${isMobile ? "mobile" : "desktop"}`);
  });
});
