import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import {
  SuperAdminAuditLogsPage,
  SuperAdminDashboardPage,
  SuperAdminFacilitiesPage,
  SuperAdminReportsPage,
  SuperAdminSystemPage,
  SuperAdminUsersPage,
} from "./SuperAdminDashboardUsersPages";

function jsonResponse(body: unknown, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      headers: { "Content-Type": "application/json" },
      status,
    }),
  );
}

function mockCsvDownload() {
  if (!URL.createObjectURL) {
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: vi.fn() });
  }
  if (!URL.revokeObjectURL) {
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
  }
  const createObjectUrl = vi
    .spyOn(URL, "createObjectURL")
    .mockReturnValue("blob:super-admin-export");
  const revokeObjectUrl = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
  return { click, createObjectUrl, revokeObjectUrl };
}

const dashboardResponse = {
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
      is_active: true,
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
      id: "facility-1",
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
      id: "facility-2",
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
      facility_id: "facility-1",
      id: "audit-1",
      reservation_id: null,
      student_id: null,
      target_id: "facility-1",
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

function renderDashboard() {
  return renderWithProviders(
    <Routes>
      <Route element={<SuperAdminDashboardPage />} path="/super-admin" />
    </Routes>,
    { initialEntries: ["/super-admin"] },
  );
}

const usersResponse = {
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

function renderUsers() {
  return renderWithProviders(
    <Routes>
      <Route element={<SuperAdminUsersPage />} path="/super-admin/users" />
    </Routes>,
    { initialEntries: ["/super-admin/users"] },
  );
}

const facilityGovernanceResponse = [
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

function renderFacilities() {
  return renderWithProviders(
    <Routes>
      <Route element={<SuperAdminFacilitiesPage />} path="/super-admin/facilities" />
    </Routes>,
    { initialEntries: ["/super-admin/facilities"] },
  );
}

const reportAggregateResponse = {
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

const auditLogResponse = [
  ...Array.from({ length: 12 }, (_, index) => ({
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
  })),
];

const auditLogPaginationResponse = Array.from({ length: 25 }, (_, index) => ({
  action_type: "review.admin_deleted",
  actor_email: "admin@ipb.ac.id",
  actor_id: "admin-1",
  created_at: `2026-05-${String(Math.min(index + 1, 30)).padStart(2, "0")}T04:30:00Z`,
  facility_id: "facility-1",
  id: `audit-page-${index + 1}`,
  reservation_id: "reservation-1",
  student_id: "student-1",
  target_id: `review-page-${index + 1}`,
  target_type: "review",
}));

const auditLogRequestResponse = [
  {
    action_type: "request.200",
    actor_email: "admin@ipb.ac.id",
    actor_id: "admin-1",
    created_at: "2026-05-12T04:30:00Z",
    facility_id: null,
    id: "audit-endpoint-1",
    reservation_id: null,
    student_id: null,
    target_id: "GET /admin/system-status",
    target_type: "endpoint",
  },
  {
    action_type: "request.200",
    actor_email: "admin@ipb.ac.id",
    actor_id: "admin-1",
    created_at: "2026-05-12T04:35:00Z",
    facility_id: null,
    id: "audit-endpoint-2",
    reservation_id: null,
    student_id: null,
    target_id: "GET /admin/system-status",
    target_type: "endpoint",
  },
  {
    action_type: "auth.login",
    actor_email: "admin@ipb.ac.id",
    actor_id: "admin-1",
    created_at: "2026-05-12T04:00:00Z",
    facility_id: null,
    id: "audit-endpoint-3",
    reservation_id: null,
    student_id: null,
    target_id: "POST /auth/login",
    target_type: "endpoint",
  },
];

const adminReviewResponse = [
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

function renderReports(initialEntry = "/super-admin/reports") {
  return renderWithProviders(
    <Routes>
      <Route element={<SuperAdminReportsPage />} path="/super-admin/reports" />
      <Route element={<SuperAdminAuditLogsPage />} path="/super-admin/reports/logs" />
    </Routes>,
    { initialEntries: [initialEntry] },
  );
}

const systemStatusResponse = {
  application: { name: "IPB SRH", version: "1.0.0" },
  backend: { status: "ok" },
  database: { status: "ok" },
  storage: { status: "ok" },
  worker: { status: "not_used" },
};

const bookingSettingsResponse = {
  allowed_student_email_domains: ["apps.ipb.ac.id"],
  document_upload_due_hours: 24,
  document_verification_due_hours: 48,
  final_approval_cutoff_hours: 168,
  max_booking_advance_hours: 1440,
  min_booking_lead_hours: 336,
  overdue_final_approval_cutoff_hours: 96,
  payment_upload_due_hours: 24,
  payment_verification_due_hours: 48,
};

function renderSystem() {
  return renderWithProviders(
    <Routes>
      <Route element={<SuperAdminSystemPage />} path="/super-admin/system" />
    </Routes>,
    { initialEntries: ["/super-admin/system"] },
  );
}

describe("SuperAdminDashboardPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it("loads dashboard aggregate data and renders normalized sections", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/dashboard") {
        return jsonResponse(dashboardResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDashboard();

    expect(await screen.findByText("128")).toBeVisible();
    expect(screen.getByText("8")).toBeVisible();
    expect(screen.getByText("42")).toBeVisible();
    expect(screen.getByRole("complementary", { name: "Navigasi super admin utama" })).toBeVisible();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
    expect(screen.getAllByText("Degraded")[0]).toBeVisible();
    expect(screen.getAllByText("Admin IPB")[0]).toBeVisible();
    expect(screen.getAllByText("Admin Nonaktif")[0]).toBeVisible();
    expect(screen.getAllByText("Grand Auditorium")[0]).toBeVisible();
    expect(screen.getAllByText("Butuh Staff")[0]).toBeVisible();
    expect(screen.getByText("admin@ipb.ac.id menambahkan penugasan staff")).toBeVisible();
    expect(screen.queryByText(/↑/)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/admin/dashboard", expect.any(Object));
    });
  });

  it("renders empty states for missing aggregate sections", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/dashboard") {
        return jsonResponse({
          ...dashboardResponse,
          administrators: [],
          facility_governance: [],
          recent_activity: [],
        });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDashboard();

    expect(await screen.findByText("Belum ada administrator untuk ditampilkan.")).toBeVisible();
    expect(screen.getByText("Belum ada data tata kelola fasilitas.")).toBeVisible();
    expect(screen.getByText("Belum ada aktivitas sistem terbaru.")).toBeVisible();
  });

  it("caps dashboard previews at five items and links to the full pages", async () => {
    const administrators = Array.from({ length: 6 }, (_, index) => ({
      email: `admin-${index + 1}@ipb.ac.id`,
      full_name: `Admin ${index + 1}`,
      id: `admin-${index + 1}`,
      is_active: index % 2 === 0,
      role: "super_admin",
    }));
    const facilityGovernance = Array.from({ length: 6 }, (_, index) => ({
      active_assigned_staff_count: index,
      assigned_staff_count: index + 1,
      assignment_coverage: "covered",
      capacity: 100 + index,
      category: "Auditorium",
      id: `facility-${index + 1}`,
      is_active: true,
      issue_flags: [],
      location: `Lokasi ${index + 1}`,
      name: `Fasilitas ${index + 1}`,
    }));
    const recentActivity = Array.from({ length: 6 }, (_, index) => ({
      action_type: "staff_assignment.created",
      actor_email: "admin@ipb.ac.id",
      actor_id: "admin-1",
      created_at: `2026-05-${String(index + 1).padStart(2, "0")}T03:00:00Z`,
      facility_id: `facility-${index + 1}`,
      id: `activity-${index + 1}`,
      reservation_id: null,
      student_id: null,
      target_id: `facility-${index + 1}`,
      target_type: "facility_staff_assignment",
    }));

    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/dashboard") {
        return jsonResponse({
          ...dashboardResponse,
          administrators,
          facility_governance: facilityGovernance,
          recent_activity: recentActivity,
        });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDashboard();

    expect(await screen.findAllByText("Admin 1")).toHaveLength(2);
    expect(screen.getAllByText("Fasilitas 1")).toHaveLength(2);
    expect(screen.getAllByText("Admin 5")).toHaveLength(2);
    expect(screen.getAllByText("Fasilitas 5")).toHaveLength(2);
    expect(screen.queryByText("Admin 6")).not.toBeInTheDocument();
    expect(screen.queryByText("Fasilitas 6")).not.toBeInTheDocument();
    expect(screen.getAllByText(/menambahkan penugasan staff/)).toHaveLength(5);
    expect(screen.getAllByRole("link", { name: "Lihat Semua" })).toHaveLength(3);
    expect(
      Array.from(screen.getAllByRole("link", { name: "Lihat Semua" })).map((link) => link.getAttribute("href")),
    ).toEqual(["/super-admin/users", "/super-admin/reports/logs", "/super-admin/facilities"]);
  });

  it("shows recoverable dashboard errors", async () => {
    const user = userEvent.setup();
    let calls = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/dashboard") {
        calls += 1;
        return calls === 1 ? jsonResponse({ detail: "temporary outage" }, 503) : jsonResponse(dashboardResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDashboard();

    await user.click(await screen.findByRole("button", { name: "Muat ulang dashboard" }));
    expect((await screen.findAllByText("Admin IPB"))[0]).toBeVisible();
  });

  it("exports dashboard data and routes admin creation through the users page", async () => {
    const user = userEvent.setup();
    const csv = mockCsvDownload();
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/dashboard") {
        return jsonResponse(dashboardResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDashboard();

    await user.click(await screen.findByRole("button", { name: "Ekspor Laporan" }));
    expect(csv.createObjectUrl).toHaveBeenCalledOnce();
    expect(csv.click).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Tambah Pengguna" })).toHaveAttribute("href", "/super-admin/users");
  });

  it("renders the super admin shell as a sidebar layout without a footer", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/dashboard") {
        return jsonResponse(dashboardResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDashboard();

    expect(await screen.findByRole("complementary", { name: "Navigasi super admin utama" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Pengguna" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Fasilitas" })).toBeVisible();
    expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument();
  });

  it("loads users, renders academic profile fields, and sends supported filters", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/admin/users")) {
        return jsonResponse(usersResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderUsers();

    expect((await screen.findAllByText("Student Aktif"))[0]).toBeVisible();
    expect(screen.getAllByText(/Ilmu Komputer/)[0]).toBeVisible();
    expect(screen.getAllByText("G64190001")[0]).toBeVisible();
    expect(screen.getAllByText("Staff Fasilitas")[0]).toBeVisible();
    expect(screen.getAllByText("Nonaktif")[0]).toBeVisible();
    expect(screen.queryByRole("button", { name: "Tambah Pengguna" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Kelola akun / }).length).toBeGreaterThanOrEqual(2);
    expect(
      screen.getByLabelText("Email pengguna baru").compareDocumentPosition(screen.getByLabelText("Cari pengguna")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    await user.clear(screen.getByLabelText("Cari pengguna"));
    await user.type(screen.getByLabelText("Cari pengguna"), "staff");
    await user.selectOptions(screen.getByLabelText("Filter role"), "staff");
    await user.selectOptions(screen.getByLabelText("Filter status"), "false");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/users?role=staff&is_active=false&search=staff&page=1&page_size=10",
        expect.any(Object),
      );
    });
  });

  it("creates users for every role including student identity fields and handles API errors", async () => {
    const user = userEvent.setup();
    let createCalls = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/admin/users") && !init?.method) {
        return jsonResponse(usersResponse);
      }

      if (url === "http://localhost:8000/admin/users" && init?.method === "POST") {
        createCalls += 1;
        expect(JSON.parse(String(init.body))).toEqual({
          email: "new-student@apps.ipb.ac.id",
          full_name: "Student Baru",
          is_active: true,
          nim: "G64190002",
          password: "secret123",
          phone: "08123456780",
          role: "student",
        });
        return createCalls === 1
          ? jsonResponse({ id: "new-student" }, 201)
          : jsonResponse({ detail: "Email sudah terdaftar." }, 409);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderUsers();

    await user.selectOptions(await screen.findByLabelText("Role pengguna baru"), "student");
    await user.type(screen.getByLabelText("Email pengguna baru"), "new-student@apps.ipb.ac.id");
    await user.type(screen.getByLabelText("Nama pengguna baru"), "Student Baru");
    await user.type(screen.getByLabelText("Password pengguna baru"), "secret123");
    await user.type(screen.getByLabelText("NIM pengguna baru"), "G64190002");
    await user.type(screen.getByLabelText("Telepon pengguna baru"), "08123456780");
    await user.click(screen.getByRole("button", { name: "Buat Pengguna" }));
    expect(await screen.findByText("Pengguna baru dibuat.")).toBeVisible();

    await user.selectOptions(screen.getByLabelText("Role pengguna baru"), "student");
    await user.type(screen.getByLabelText("Email pengguna baru"), "new-student@apps.ipb.ac.id");
    await user.type(screen.getByLabelText("Nama pengguna baru"), "Student Baru");
    await user.type(screen.getByLabelText("Password pengguna baru"), "secret123");
    await user.type(screen.getByLabelText("NIM pengguna baru"), "G64190002");
    await user.type(screen.getByLabelText("Telepon pengguna baru"), "08123456780");
    await user.click(screen.getByRole("button", { name: "Buat Pengguna" }));
    expect(await screen.findByText("Email sudah terdaftar.")).toBeVisible();
  });

  it("updates managed user profile data and resets password from the account modal", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/admin/users") && !init?.method) {
        return jsonResponse(usersResponse);
      }

      if (url === "http://localhost:8000/admin/users/staff-1" && init?.method === "PATCH") {
        expect(init.body).toBe(
          JSON.stringify({
            email: "staff.updated@ipb.ac.id",
            full_name: "Staff Fasilitas Baru",
          }),
        );
        return jsonResponse({
          ...usersResponse.items[1],
          email: "staff.updated@ipb.ac.id",
          full_name: "Staff Fasilitas Baru",
        });
      }

      if (url === "http://localhost:8000/admin/users/staff-1/reset-password" && init?.method === "POST") {
        expect(init.body).toBe(JSON.stringify({ password: "password-baru-123" }));
        return jsonResponse(usersResponse.items[1]);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderUsers();

    await user.click((await screen.findAllByRole("button", { name: "Kelola akun Staff Fasilitas" }))[0]);
    await user.clear(screen.getByDisplayValue("staff@ipb.ac.id"));
    await user.type(screen.getByLabelText("Email"), "staff.updated@ipb.ac.id");
    await user.clear(screen.getByDisplayValue("Staff Fasilitas"));
    await user.type(screen.getByLabelText("Nama lengkap"), "Staff Fasilitas Baru");
    await user.type(screen.getByLabelText("Password baru"), "password-baru-123");
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/users/staff-1",
        expect.objectContaining({ method: "PATCH" }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/users/staff-1/reset-password",
        expect.objectContaining({ method: "POST" }),
      );
    });
    expect(await screen.findByText("Password pengguna diperbarui.")).toBeVisible();
  });

  it("activates and deactivates users, and shows empty/error recovery states", async () => {
    const user = userEvent.setup();
    let listCalls = 0;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/admin/users") && !init?.method) {
        listCalls += 1;
        if (listCalls === 1) {
          return jsonResponse({ detail: "temporary outage" }, 503);
        }
        if (listCalls === 2) {
          return jsonResponse({ ...usersResponse, items: [], total: 0 });
        }
        return jsonResponse(usersResponse);
      }

      if (url === "http://localhost:8000/admin/users/staff-1/activate" && init?.method === "POST") {
        return jsonResponse({ ...usersResponse.items[1], is_active: true });
      }

      if (url === "http://localhost:8000/admin/users/student-1/deactivate" && init?.method === "POST") {
        return jsonResponse({ ...usersResponse.items[0], is_active: false });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderUsers();

    await user.click(await screen.findByRole("button", { name: "Muat ulang pengguna" }));
    expect(await screen.findByText("Tidak ada pengguna untuk filter ini.")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Muat ulang pengguna" }));
    await user.click((await screen.findAllByRole("button", { name: "Kelola akun Staff Fasilitas" }))[0]);
    await user.click(await screen.findByRole("button", { name: "Set aktif" }));
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await user.click((await screen.findAllByRole("button", { name: "Kelola akun Student Aktif" }))[0]);
    await user.click(await screen.findByRole("button", { name: "Set nonaktif" }));
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/users/staff-1/activate",
        expect.objectContaining({ method: "POST" }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/users/student-1/deactivate",
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  it("loads facility governance rows with counts, active state, and issue flags", async () => {
    const user = userEvent.setup();
    const csv = mockCsvDownload();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/facilities/governance") {
        return jsonResponse(facilityGovernanceResponse);
      }
      if (url === "http://localhost:8000/facility-categories") {
        return jsonResponse([
          { facility_count: 1, icon_hint: "presentation", id: "category-1", name: "Auditorium", slug: "auditorium" },
        ]);
      }
      if (url === "http://localhost:8000/admin/users?role=staff&is_active=true&page=1&page_size=100") {
        return jsonResponse({ ...usersResponse, items: [usersResponse.items[1]], total: 1 });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilities();

    expect((await screen.findAllByText("Grand Auditorium"))[0]).toBeVisible();
    expect(screen.getAllByText("Kampus Dramaga - Auditorium")[0]).toBeVisible();
    expect(screen.getAllByText("300 kursi")[0]).toBeVisible();
    expect(screen.getAllByText("1/1 aktif")[0]).toBeVisible();
    expect(screen.getAllByText(/Ditugaskan: Staff Fasilitas/)[0]).toBeVisible();
    expect(screen.getAllByText(/Staff Nonaktif/)[0]).toBeVisible();
    expect(screen.getAllByText("Lab Arsip")[0]).toBeVisible();
    expect(screen.getAllByText("Butuh Staff")[0]).toBeVisible();
    expect(screen.getAllByText("Nonaktif")[0]).toBeVisible();
    expect(screen.getAllByRole("button", { name: "Kelola staff Grand Auditorium" })[0]).toBeEnabled();
    expect(screen.getAllByRole("button", { name: "Kelola staff Lab Arsip" })[0]).toBeEnabled();
    await user.click(screen.getByRole("button", { name: "Ekspor CSV" }));
    expect(csv.createObjectUrl).toHaveBeenCalledOnce();
    expect(csv.click).toHaveBeenCalledOnce();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/facilities/governance",
        expect.any(Object),
      );
    });
  });

  it("creates a facility from the super admin facilities page", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/facilities/governance" && !init?.method) {
        return jsonResponse(facilityGovernanceResponse);
      }
      if (url === "http://localhost:8000/facility-categories") {
        return jsonResponse([
          { facility_count: 1, icon_hint: "presentation", id: "category-1", name: "Auditorium", slug: "auditorium" },
        ]);
      }
      if (url === "http://localhost:8000/admin/users?role=staff&is_active=true&page=1&page_size=100") {
        return jsonResponse({ ...usersResponse, items: [usersResponse.items[1]], total: 1 });
      }
      if (url === "http://localhost:8000/admin/facilities" && init?.method === "POST") {
        expect(init.body).toBe(
          JSON.stringify({
            capacity: 80,
            category_id: "category-1",
            contact_email: "tu.rektorat@ipb.ac.id",
            contact_name: "TU Rektorat",
            contact_phone: "0251-8621111",
            description: "Ruang rapat lintas unit",
            is_active: true,
            location: "Gedung Rektorat",
            name: "Ruang Sidang Baru",
            open_hours_summary: "Senin-Jumat 08.00-16.00",
            payment_instructions: null,
            price_rupiah: 0,
          }),
        );
        return jsonResponse({ id: "facility-new", name: "Ruang Sidang Baru" }, 201);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilities();

    await user.click(await screen.findByRole("button", { name: "Tambah Fasilitas" }));
    await user.type(screen.getByLabelText("Nama fasilitas"), "Ruang Sidang Baru");
    await user.type(screen.getByLabelText("Lokasi fasilitas"), "Gedung Rektorat");
    await user.type(screen.getByLabelText("Deskripsi fasilitas"), "Ruang rapat lintas unit");
    await user.type(screen.getByLabelText("Nama kontak"), "TU Rektorat");
    await user.type(screen.getByLabelText("Telepon kontak"), "0251-8621111");
    await user.type(screen.getByLabelText("Email kontak"), "tu.rektorat@ipb.ac.id");
    await user.clear(screen.getByLabelText("Kapasitas fasilitas"));
    await user.type(screen.getByLabelText("Kapasitas fasilitas"), "80");
    await user.click(screen.getByRole("button", { name: "Simpan Fasilitas" }));

    expect(await screen.findByText("Fasilitas baru dibuat.")).toBeVisible();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8000/admin/facilities",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("assigns and unassigns staff with backend facility and staff IDs", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/facilities/governance" && !init?.method) {
        return jsonResponse(facilityGovernanceResponse);
      }
      if (url === "http://localhost:8000/admin/users?role=staff&is_active=true&page=1&page_size=100") {
        return jsonResponse({
          ...usersResponse,
          items: [
            { ...usersResponse.items[1], id: "staff-9", full_name: "Staff Arsip", email: "staff-arsip@ipb.ac.id" },
            { ...usersResponse.items[1], id: "staff-old", full_name: "Staff Nonaktif", email: "inactive-staff@ipb.ac.id" },
          ],
          total: 2,
        });
      }

      if (url === "http://localhost:8000/admin/facilities/facility-2/staff-assignments/staff-9") {
        return jsonResponse({ facility_id: "facility-2", staff_id: "staff-9" });
      }

      if (url === "http://localhost:8000/admin/facilities/facility-2/staff-assignments/staff-old") {
        return jsonResponse(null, 204);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilities();

    await user.click((await screen.findAllByRole("button", { name: "Kelola staff Lab Arsip" }))[0]);
    await user.selectOptions(await screen.findByLabelText("Pilih staff untuk Lab Arsip"), "staff-9");
    expect(await screen.findByText("Staff Arsip belum ditugaskan ke fasilitas ini.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Hapus staff dari Lab Arsip" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Tugaskan staff ke Lab Arsip" }));
    expect(await screen.findByText("Penugasan staff diperbarui.")).toBeVisible();

    await user.selectOptions(screen.getByLabelText("Pilih staff untuk Lab Arsip"), "staff-old");
    expect(await screen.findByText("Staff Nonaktif sudah ditugaskan ke fasilitas ini.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Tugaskan staff ke Lab Arsip" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Hapus staff dari Lab Arsip" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/facilities/facility-2/staff-assignments/staff-9",
        expect.objectContaining({ method: "PUT" }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/facilities/facility-2/staff-assignments/staff-old",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("filters facility governance rows by search, status, and coverage", async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/facilities/governance") {
        return jsonResponse(facilityGovernanceResponse);
      }
      if (url === "http://localhost:8000/admin/users?role=staff&is_active=true&page=1&page_size=100") {
        return jsonResponse({ ...usersResponse, items: [usersResponse.items[1]], total: 1 });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilities();

    expect((await screen.findAllByText("Grand Auditorium"))[0]).toBeVisible();
    await user.type(screen.getByLabelText("Cari fasilitas super admin"), "arsip");
    expect(screen.getAllByText("Lab Arsip")[0]).toBeVisible();
    expect(screen.queryByText("Grand Auditorium")).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filter status fasilitas super admin"), "active");
    expect(await screen.findByText("Tidak ada fasilitas yang cocok dengan pencarian atau filter.")).toBeVisible();

    await user.clear(screen.getByLabelText("Cari fasilitas super admin"));
    await user.selectOptions(screen.getByLabelText("Filter status fasilitas super admin"), "all");
    await user.selectOptions(screen.getByLabelText("Filter cakupan staff fasilitas super admin"), "covered");
    expect((await screen.findAllByText("Grand Auditorium"))[0]).toBeVisible();
    expect(screen.queryByText("Lab Arsip")).not.toBeInTheDocument();
  });

  it("shows facility governance empty and error recovery states", async () => {
    const user = userEvent.setup();
    let calls = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/facilities/governance" && !init?.method) {
        calls += 1;
        if (calls === 1) {
          return jsonResponse({ detail: "temporary outage" }, 503);
        }
        if (calls === 2) {
          return jsonResponse([]);
        }
        return jsonResponse(facilityGovernanceResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilities();

    await user.click(await screen.findByRole("button", { name: "Muat ulang fasilitas" }));
    expect(await screen.findByText("Belum ada data tata kelola fasilitas.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Muat ulang fasilitas" }));
    expect((await screen.findAllByText("Grand Auditorium"))[0]).toBeVisible();
  });

  it("loads report aggregates, audit logs, reviews, and sends date range params", async () => {
    const user = userEvent.setup();
    const csv = mockCsvDownload();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/admin/reports/aggregate")) {
        return jsonResponse(reportAggregateResponse);
      }
      if (url.startsWith("http://localhost:8000/admin/audit-logs")) {
        return jsonResponse(auditLogResponse);
      }
      if (url === "http://localhost:8000/admin/reviews") {
        return jsonResponse(adminReviewResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderReports();

    expect((await screen.findAllByText("20"))[0]).toBeVisible();
    expect(screen.getAllByText("Rp12.800.000")[0]).toBeVisible();
    expect(screen.getByText("Disetujui: 8")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Tren Reservasi Mingguan" })).toBeVisible();
    expect(screen.getByLabelText("1 Mei 2026: 5 reservasi, Rp4.000.000")).toBeVisible();
    expect(screen.getByLabelText("2 Mei 2026: 15 reservasi, Rp8.800.000")).toBeVisible();
    expect(screen.getByRole("button", { name: "Mingguan" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Bulanan" }));
    expect(screen.getByRole("heading", { name: "Tren Reservasi Bulanan" })).toBeVisible();
    expect(screen.getByLabelText("Minggu 27 April 2026: 20 reservasi, Rp12.800.000")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Tahunan" }));
    expect(screen.getByRole("heading", { name: "Tren Reservasi Tahunan" })).toBeVisible();
    expect(screen.getByLabelText("Mei 2026: 20 reservasi, Rp12.800.000")).toBeVisible();
    expect(screen.getAllByText("admin@ipb.ac.id - review admin deleted")).toHaveLength(10);
    expect(screen.getByRole("link", { name: "Lihat semua log" })).toHaveAttribute(
      "href",
      "/super-admin/reports/logs",
    );
    expect(screen.getAllByText(/2 Mei 2026/)[0]).toBeVisible();
    expect(screen.getAllByText("Ruang bersih dan nyaman.")[0]).toBeVisible();
    expect(screen.getAllByText("Review kasar")[0]).toBeVisible();
    expect(screen.getAllByText("Disembunyikan")[0]).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Ekspor Laporan" }));
    expect(csv.createObjectUrl).toHaveBeenCalledOnce();
    expect(csv.click).toHaveBeenCalledOnce();

    await user.clear(screen.getByLabelText("Tanggal mulai laporan"));
    await user.type(screen.getByLabelText("Tanggal mulai laporan"), "2026-05-03");
    await user.clear(screen.getByLabelText("Tanggal akhir laporan"));
    await user.type(screen.getByLabelText("Tanggal akhir laporan"), "2026-05-04");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/reports/aggregate?start=2026-05-03T00%3A00%3A00.000Z&end=2026-05-04T23%3A59%3A59.999Z",
        expect.any(Object),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/audit-logs?created_from=2026-05-03T00%3A00%3A00.000Z&created_to=2026-05-04T23%3A59%3A59.999Z",
        expect.any(Object),
      );
    });
  });

  it("opens a dedicated full audit log page from reports", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/audit-logs?limit=20") {
        return jsonResponse(auditLogResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderReports("/super-admin/reports/logs");

    expect(await screen.findByRole("heading", { name: "Log Audit" })).toBeVisible();
    expect(await screen.findByText("12 log")).toBeVisible();
    expect(screen.getAllByText("review admin deleted")).toHaveLength(24);
    expect(screen.getAllByText(/review-12/)[0]).toBeVisible();
    expect(screen.getByRole("link", { name: "Kembali ke Laporan" })).toHaveAttribute(
      "href",
      "/super-admin/reports",
    );

    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/admin/audit-logs?limit=20", expect.any(Object));
  });

  it("loads more audit logs from the dedicated page when available", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/admin/audit-logs")) {
        const parsed = new URL(url);
        const limit = Number(parsed.searchParams.get("limit") ?? "20");
        return jsonResponse(auditLogPaginationResponse.slice(0, limit));
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderReports("/super-admin/reports/logs");

    expect(await screen.findByRole("heading", { name: "Log Audit" })).toBeVisible();
    expect(await screen.findByText("20 log")).toBeVisible();
    expect(screen.getAllByText("review admin deleted")).toHaveLength(40);
    expect(screen.getByRole("button", { name: "Muat lebih banyak" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Muat lebih banyak" }));

    expect(await screen.findByText("25 log")).toBeVisible();
    expect(screen.getAllByText("review admin deleted")).toHaveLength(50);
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/admin/audit-logs?limit=20", expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:8000/admin/audit-logs?limit=40", expect.any(Object));
  });

  it("shows endpoint access summaries on the dedicated audit page", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/audit-logs?limit=20") {
        return jsonResponse(auditLogRequestResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderReports("/super-admin/reports/logs");

    expect((await screen.findAllByText("GET /admin/system-status"))[0]).toBeVisible();
    expect(screen.getAllByText("admin@ipb.ac.id")[0]).toBeVisible();
    expect(screen.getByText("2 akses")).toBeVisible();
    expect(screen.getByText("3 log")).toBeVisible();
    expect(screen.getAllByText("Login berhasil")[0]).toBeVisible();
  });

  it("deletes, restores, and permanently removes moderated reviews", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/admin/reports/aggregate")) {
        return jsonResponse(reportAggregateResponse);
      }
      if (url.startsWith("http://localhost:8000/admin/audit-logs")) {
        return jsonResponse(auditLogResponse);
      }
      if (url === "http://localhost:8000/admin/reviews" && !init?.method) {
        return jsonResponse(adminReviewResponse);
      }
      if (url === "http://localhost:8000/admin/reviews/review-1/delete" && init?.method === "POST") {
        expect(init.body).toBe(JSON.stringify({ reason: "Moderasi Super Admin" }));
        return jsonResponse({ ...adminReviewResponse[0], is_deleted: true });
      }
      if (url === "http://localhost:8000/admin/reviews/review-2/restore" && init?.method === "POST") {
        return jsonResponse({ ...adminReviewResponse[1], is_deleted: false });
      }
      if (url === "http://localhost:8000/admin/reviews/review-2" && init?.method === "DELETE") {
        return new Response(null, { status: 204 });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderReports();

    await user.click((await screen.findAllByRole("button", { name: "Sembunyikan review review-1" }))[0]);
    expect(await screen.findByText("Moderasi ulasan diperbarui.")).toBeVisible();
    await user.click(screen.getAllByRole("button", { name: "Pulihkan review review-2" })[0]);
    await user.click(screen.getAllByRole("button", { name: "Hapus permanen review review-2" })[0]);
    expect(await screen.findByText("Ulasan dihapus permanen.")).toBeVisible();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/reviews/review-1/delete",
        expect.objectContaining({ method: "POST" }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/reviews/review-2/restore",
        expect.objectContaining({ method: "POST" }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/reviews/review-2",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  it("shows report empty and error recovery states", async () => {
    const user = userEvent.setup();
    let aggregateCalls = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/admin/reports/aggregate")) {
        aggregateCalls += 1;
        return aggregateCalls === 1
          ? jsonResponse({ detail: "temporary outage" }, 503)
          : jsonResponse({ ...reportAggregateResponse, trend: [] });
      }
      if (url.startsWith("http://localhost:8000/admin/audit-logs")) {
        return jsonResponse([]);
      }
      if (url === "http://localhost:8000/admin/reviews") {
        return jsonResponse([]);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderReports();

    await user.click(await screen.findByRole("button", { name: "Muat ulang laporan" }));
    expect(await screen.findByText("Belum ada tren reservasi untuk rentang ini.")).toBeVisible();
    expect(screen.getByText("Belum ada log audit untuk rentang ini.")).toBeVisible();
    expect(screen.getByText("Belum ada ulasan untuk dimoderasi.")).toBeVisible();
  });

  it("loads system status and booking settings, then saves a full settings payload", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/system-status") {
        return jsonResponse(systemStatusResponse);
      }
      if (url === "http://localhost:8000/admin/settings" && !init?.method) {
        return jsonResponse(bookingSettingsResponse);
      }
      if (url === "http://localhost:8000/admin/settings" && init?.method === "PATCH") {
        expect(init.body).toBe(
          JSON.stringify({
            ...bookingSettingsResponse,
            min_booking_lead_hours: 72,
          }),
        );
        return jsonResponse({ ...bookingSettingsResponse, min_booking_lead_hours: 72 });
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderSystem();

    expect(await screen.findByText("IPB SRH 1.0.0")).toBeVisible();
    expect(screen.getAllByText("Storage")[0]).toBeVisible();
    expect(screen.getAllByText("OK")[0]).toBeVisible();
    expect(screen.getAllByText("Tidak Digunakan")[0]).toBeVisible();
    expect(screen.getByLabelText("Minimum lead time jam")).toHaveValue(336);
    expect(screen.getByLabelText("Domain email mahasiswa")).toHaveValue("apps.ipb.ac.id");
    expect(screen.queryByRole("button", { name: "Unduh Snapshot" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan Pengaturan" })).toBeDisabled();

    await user.clear(screen.getByLabelText("Minimum lead time jam"));
    await user.type(screen.getByLabelText("Minimum lead time jam"), "72");
    await user.click(screen.getByRole("button", { name: "Simpan Pengaturan" }));

    expect(await screen.findByText("Pengaturan booking disimpan.")).toBeVisible();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/settings",
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  it("shows invalid booking settings feedback and recovers status load failures", async () => {
    const user = userEvent.setup();
    let statusCalls = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/system-status") {
        statusCalls += 1;
        return statusCalls === 1 ? jsonResponse({ detail: "temporary outage" }, 503) : jsonResponse(systemStatusResponse);
      }
      if (url === "http://localhost:8000/admin/settings" && !init?.method) {
        return jsonResponse(bookingSettingsResponse);
      }
      if (url === "http://localhost:8000/admin/settings" && init?.method === "PATCH") {
        return jsonResponse({ detail: ["min_booking_lead_hours must be positive"] }, 400);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderSystem();

    await user.click(await screen.findByRole("button", { name: "Muat ulang status sistem" }));
    expect(await screen.findByText("IPB SRH 1.0.0")).toBeVisible();

    await user.clear(screen.getByLabelText("Minimum lead time jam"));
    await user.type(screen.getByLabelText("Minimum lead time jam"), "1");
    await user.click(screen.getByRole("button", { name: "Simpan Pengaturan" }));
    expect(await screen.findByText("min_booking_lead_hours must be positive")).toBeVisible();
  });
});
