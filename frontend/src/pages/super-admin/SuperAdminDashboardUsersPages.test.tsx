import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route, Routes } from "react-router-dom";
import { renderWithProviders } from "../../test/render";
import {
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

function renderReports() {
  return renderWithProviders(
    <Routes>
      <Route element={<SuperAdminReportsPage />} path="/super-admin/reports" />
    </Routes>,
    { initialEntries: ["/super-admin/reports"] },
  );
}

const systemStatusResponse = {
  application: { name: "IPB SRH", version: "1.0.0" },
  backend: { status: "ok" },
  database: { status: "ok" },
  storage: { status: "degraded" },
  worker: { status: "ok" },
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
    expect(screen.getAllByText("Degraded")[0]).toBeVisible();
    expect(screen.getAllByText("Admin IPB")[0]).toBeVisible();
    expect(screen.getAllByText("Admin Nonaktif")[0]).toBeVisible();
    expect(screen.getAllByText("Grand Auditorium")[0]).toBeVisible();
    expect(screen.getAllByText("Butuh Staff")[0]).toBeVisible();
    expect(screen.getByText("admin@ipb.ac.id melakukan staff_assignment.created")).toBeVisible();
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

  it("marks unsupported dashboard actions as deferred", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/dashboard") {
        return jsonResponse(dashboardResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderDashboard();

    expect(await screen.findByRole("button", { name: "Ekspor Laporan ditunda" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: "Tambah Admin ditunda" })).toHaveAttribute("aria-disabled", "true");
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
    expect(screen.getAllByRole("button", { name: /^Ubah status / }).length).toBeGreaterThanOrEqual(2);
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

  it("creates supported admin-managed users and handles API errors", async () => {
    const user = userEvent.setup();
    let createCalls = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url.startsWith("http://localhost:8000/admin/users") && !init?.method) {
        return jsonResponse(usersResponse);
      }

      if (url === "http://localhost:8000/admin/users" && init?.method === "POST") {
        createCalls += 1;
        expect(init.body).toBe(
          JSON.stringify({
            email: "new-staff@ipb.ac.id",
            full_name: "Staff Baru",
            is_active: true,
            password: "secret123",
            role: "staff",
          }),
        );
        return createCalls === 1
          ? jsonResponse({ id: "new-staff" }, 201)
          : jsonResponse({ detail: "Email sudah terdaftar." }, 409);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderUsers();

    await user.type(await screen.findByLabelText("Email pengguna baru"), "new-staff@ipb.ac.id");
    await user.type(screen.getByLabelText("Nama pengguna baru"), "Staff Baru");
    await user.type(screen.getByLabelText("Password pengguna baru"), "secret123");
    await user.click(screen.getByRole("button", { name: "Buat Pengguna" }));
    expect(await screen.findByText("Pengguna baru dibuat.")).toBeVisible();

    await user.type(screen.getByLabelText("Email pengguna baru"), "new-staff@ipb.ac.id");
    await user.type(screen.getByLabelText("Nama pengguna baru"), "Staff Baru");
    await user.type(screen.getByLabelText("Password pengguna baru"), "secret123");
    await user.click(screen.getByRole("button", { name: "Buat Pengguna" }));
    expect(await screen.findByText("Email sudah terdaftar.")).toBeVisible();
  });

  it("activates and deactivates users, and shows empty/error recovery states", async () => {
    const user = userEvent.setup();
    let listCalls = 0;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
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
    await user.click((await screen.findAllByRole("button", { name: "Ubah status Staff Fasilitas" }))[0]);
    await user.click(screen.getAllByRole("button", { name: "Ubah status Student Aktif" })[0]);

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
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/facilities/governance") {
        return jsonResponse(facilityGovernanceResponse);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilities();

    expect((await screen.findAllByText("Grand Auditorium"))[0]).toBeVisible();
    expect(screen.getAllByText("Kampus Dramaga - Auditorium")[0]).toBeVisible();
    expect(screen.getAllByText("300 kursi")[0]).toBeVisible();
    expect(screen.getAllByText("1/1 aktif")[0]).toBeVisible();
    expect(screen.getAllByText("Lab Arsip")[0]).toBeVisible();
    expect(screen.getAllByText("Butuh Staff")[0]).toBeVisible();
    expect(screen.getAllByText("Nonaktif")[0]).toBeVisible();
    expect(screen.getAllByRole("link", { name: "Edit detail Grand Auditorium" })[0]).toHaveAttribute(
      "href",
      "/super-admin/facilities/facility-1/edit",
    );
    expect(screen.getAllByRole("button", { name: "Arsipkan Grand Auditorium" })[0]).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByRole("button", { name: "Impor Data ditunda" })).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: "Tambah Fasilitas ditunda" })).toHaveAttribute("aria-disabled", "true");

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/facilities/governance",
        expect.any(Object),
      );
    });
  });

  it("assigns and unassigns staff with backend facility and staff IDs", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url === "http://localhost:8000/admin/facilities/governance" && !init?.method) {
        return jsonResponse(facilityGovernanceResponse);
      }

      if (url === "http://localhost:8000/admin/facilities/facility-2/staff-assignments/staff-9") {
        return init?.method === "PUT"
          ? jsonResponse({ facility_id: "facility-2", staff_id: "staff-9" })
          : jsonResponse(null, 204);
      }

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderFacilities();

    await user.type(await screen.findByLabelText("Staff ID untuk Lab Arsip"), "staff-9");
    await user.click(screen.getByRole("button", { name: "Tugaskan staff ke Lab Arsip" }));
    expect(await screen.findByText("Penugasan staff diperbarui.")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Hapus staff dari Lab Arsip" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/facilities/facility-2/staff-assignments/staff-9",
        expect.objectContaining({ method: "PUT" }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/facilities/facility-2/staff-assignments/staff-9",
        expect.objectContaining({ method: "DELETE" }),
      );
    });
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

    expect(await screen.findByText("20")).toBeVisible();
    expect(screen.getByText("Rp12.800.000")).toBeVisible();
    expect(screen.getByText("approved: 8")).toBeVisible();
    expect(screen.getByLabelText("2026-05-02: 15 reservasi, Rp8.800.000")).toBeVisible();
    expect(screen.getByText("admin@ipb.ac.id melakukan review.admin_deleted")).toBeVisible();
    expect(screen.getAllByText(/2 Mei 2026/)[0]).toBeVisible();
    expect(screen.getAllByText("Ruang bersih dan nyaman.")[0]).toBeVisible();
    expect(screen.getAllByText("Review kasar")[0]).toBeVisible();
    expect(screen.getAllByText("Dihapus")[0]).toBeVisible();
    expect(screen.getByRole("button", { name: "Ekspor Laporan ditunda" })).toHaveAttribute("aria-disabled", "true");

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

  it("deletes and restores moderated reviews", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
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

      return jsonResponse({ detail: `Unhandled ${url}` }, 404);
    });

    renderReports();

    await user.click((await screen.findAllByRole("button", { name: "Hapus review review-1" }))[0]);
    expect(await screen.findByText("Moderasi ulasan diperbarui.")).toBeVisible();
    await user.click(screen.getAllByRole("button", { name: "Pulihkan review review-2" })[0]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/reviews/review-1/delete",
        expect.objectContaining({ method: "POST" }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "http://localhost:8000/admin/reviews/review-2/restore",
        expect.objectContaining({ method: "POST" }),
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
    expect(screen.getAllByText("Degraded")[0]).toBeVisible();
    expect(screen.getByLabelText("Minimum lead time jam")).toHaveValue(336);
    expect(screen.getByLabelText("Domain email mahasiswa")).toHaveValue("apps.ipb.ac.id");
    expect(screen.getByRole("button", { name: "Lihat Riwayat ditunda" })).toHaveAttribute("aria-disabled", "true");
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
