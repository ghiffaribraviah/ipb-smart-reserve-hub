import {
  AlertTriangle,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  LogOut,
  Menu,
  Plus,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../api/http";
import { useAuth } from "../../auth/session";
import { NotificationSurface } from "../../components/NotificationSurface";
import {
  superAdminNav,
} from "../../fixtures/superAdminDashboardUsers";
import { cn } from "../../utils/cn";
import logo from "../../assets/logo.png";

type SuperAdminActive = (typeof superAdminNav)[number]["key"];

const superAdminShellNavIcons: Record<SuperAdminActive, typeof Users> = {
  dashboard: Users,
  facilities: Building2,
  reports: Briefcase,
  system: Settings,
  users: GraduationCap,
};

type SuperAdminDashboardResponse = {
  administrators?: SuperAdminDashboardAdministratorResponse[];
  facility_governance?: SuperAdminFacilityGovernanceResponse[];
  kpis: {
    active_facilities: number;
    system_health: string;
    total_reservations: number;
    total_users: number;
  };
  recent_activity?: SuperAdminAuditLogResponse[];
  system_status: {
    application: { name: string; version: string };
    backend: { status: string };
    database: { status: string };
    storage: { status: string };
    worker: { status: string };
  };
};

type SuperAdminDashboardAdministratorResponse = {
  email: string;
  full_name: string;
  id: string;
  is_active: boolean;
  role: string;
};

type SuperAdminFacilityGovernanceResponse = {
  active_assigned_staff_count: number;
  assigned_staff?: {
    email: string;
    full_name: string;
    id: string;
    is_active: boolean;
  }[];
  assigned_staff_count: number;
  assignment_coverage: string;
  capacity: number;
  category: string;
  id: string;
  is_active: boolean;
  issue_flags: string[];
  location: string;
  name: string;
};

type FacilityCategoryResponse = {
  facility_count: number;
  icon_hint: string | null;
  id: string;
  name: string;
  slug: string;
};

type FacilityCreatePayload = {
  capacity: number;
  category_id: string;
  contact_email: string | null;
  contact_name: string;
  contact_phone: string;
  description: string;
  is_active: boolean;
  location: string;
  name: string;
  open_hours_summary: string;
  payment_instructions: string | null;
  price_rupiah: number;
};

type SuperAdminAuditLogResponse = {
  action_type: string;
  actor_email: string | null;
  created_at: string;
  id: string;
  target_id: string;
  target_type: string;
};

function fetchSuperAdminDashboard() {
  return apiRequest<SuperAdminDashboardResponse>("/admin/dashboard");
}

function fetchFacilityGovernance() {
  return apiRequest<SuperAdminFacilityGovernanceResponse[]>("/admin/facilities/governance");
}

function fetchFacilityCategories() {
  return apiRequest<FacilityCategoryResponse[]>("/facility-categories");
}

function createFacility(body: FacilityCreatePayload) {
  return apiRequest<SuperAdminFacilityGovernanceResponse>("/admin/facilities", { body, method: "POST" });
}

function assignFacilityStaff(facilityId: string, staffId: string) {
  return apiRequest<{ facility_id: string; staff_id: string }>(
    `/admin/facilities/${facilityId}/staff-assignments/${staffId}`,
    { method: "PUT" },
  ).then(() => undefined);
}

function unassignFacilityStaff(facilityId: string, staffId: string) {
  return apiRequest<void>(`/admin/facilities/${facilityId}/staff-assignments/${staffId}`, {
    method: "DELETE",
  });
}

type ReportDateRange = {
  end: string;
  start: string;
};

type ReportTrendMode = "weekly" | "monthly" | "yearly";

type TrendChartPoint = {
  date: string;
  label: string;
  paid_total_rupiah: number;
  reservation_count: number;
  shortLabel: string;
};

const reportTrendModeLabels: Record<ReportTrendMode, string> = {
  monthly: "Bulanan",
  weekly: "Mingguan",
  yearly: "Tahunan",
};

type SuperAdminReportAggregateResponse = {
  kpis: {
    approved_reservations: number;
    completed_reservations: number;
    paid_reservation_total_rupiah: number;
    rejected_reservations: number;
    total_reservations: number;
  };
  status_counts: Record<string, number>;
  trend: SuperAdminReportTrendPointResponse[];
};

type SuperAdminReportTrendPointResponse = {
  date: string;
  paid_total_rupiah: number;
  reservation_count: number;
};

type AdminAuditLogResponse = {
  action_type: string;
  actor_email: string | null;
  actor_id: string | null;
  created_at: string;
  facility_id: string | null;
  id: string;
  reservation_id: string | null;
  student_id: string | null;
  target_id: string;
  target_type: string;
};

type AdminReviewResponse = {
  admin_removal_reason: string | null;
  comment: string | null;
  created_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
  facility_id: string;
  facility_name: string;
  id: string;
  is_deleted: boolean;
  rating: number;
  reservation_id: string;
  student_id: string;
  student_name: string;
};

function reportRangeParams(range: ReportDateRange) {
  return {
    end: `${range.end}T23:59:59.999Z`,
    start: `${range.start}T00:00:00.000Z`,
  };
}

function auditLogsPath(range?: ReportDateRange, limit?: number) {
  if (!range) {
    const params = new URLSearchParams();
    if (limit !== undefined) {
      params.set("limit", String(limit));
    }
    const query = params.toString();
    return query ? `/admin/audit-logs?${query}` : "/admin/audit-logs";
  }
  const rangeParams = reportRangeParams(range);
  const params = new URLSearchParams({ created_from: rangeParams.start, created_to: rangeParams.end });
  if (limit !== undefined) {
    params.set("limit", String(limit));
  }
  return `/admin/audit-logs?${params.toString()}`;
}

function fetchReportAggregate(range: ReportDateRange) {
  const rangeParams = reportRangeParams(range);
  const params = new URLSearchParams({ start: rangeParams.start, end: rangeParams.end });
  return apiRequest<SuperAdminReportAggregateResponse>(`/admin/reports/aggregate?${params.toString()}`);
}

function fetchAdminAuditLogs(range?: ReportDateRange, limit?: number) {
  return apiRequest<AdminAuditLogResponse[]>(auditLogsPath(range, limit));
}

type AuditLogFilters = {
  actionType: string;
  actorEmail: string;
  from: string;
  statusCode: string;
  targetSearch: string;
  to: string;
};

function fullAuditLogsPath(filters: AuditLogFilters, limit: number) {
  const params = new URLSearchParams();
  if (filters.actionType !== "all") params.set("action_type", filters.actionType);
  if (filters.actorEmail.trim()) params.set("actor_email", filters.actorEmail.trim());
  if (filters.targetSearch.trim()) params.set("target_search", filters.targetSearch.trim());
  if (filters.statusCode !== "all") params.set("status_code", filters.statusCode);
  if (filters.from) params.set("created_from", `${filters.from}T00:00:00.000Z`);
  if (filters.to) params.set("created_to", `${filters.to}T23:59:59.999Z`);
  params.set("limit", String(limit));
  return `/admin/audit-logs?${params.toString()}`;
}

function fetchFullAdminAuditLogs(filters: AuditLogFilters, limit: number) {
  return apiRequest<AdminAuditLogResponse[]>(fullAuditLogsPath(filters, limit));
}

function fetchAdminReviews() {
  return apiRequest<AdminReviewResponse[]>("/admin/reviews");
}

function deleteAdminReview(reviewId: string) {
  return apiRequest<AdminReviewResponse>(`/admin/reviews/${reviewId}/delete`, {
    body: { reason: "Moderasi Super Admin" },
    method: "POST",
  }).then(() => undefined);
}

function restoreAdminReview(reviewId: string) {
  return apiRequest<AdminReviewResponse>(`/admin/reviews/${reviewId}/restore`, {
    method: "POST",
  }).then(() => undefined);
}

function permanentlyDeleteAdminReview(reviewId: string) {
  return apiRequest<void>(`/admin/reviews/${reviewId}`, {
    method: "DELETE",
  });
}

type SystemStatusResponse = {
  application: { name: string; version: string };
  backend: { status: string };
  database: { status: string };
  storage: { status: string };
  worker: { status: string };
};

type BookingSettingsResponse = {
  allowed_student_email_domains: string[];
  document_upload_due_hours: number;
  document_verification_due_hours: number;
  final_approval_cutoff_hours: number;
  max_booking_advance_hours: number;
  min_booking_lead_hours: number;
  overdue_final_approval_cutoff_hours: number;
  payment_upload_due_hours: number;
  payment_verification_due_hours: number;
};

function fetchSystemStatus() {
  return apiRequest<SystemStatusResponse>("/admin/system-status");
}

function fetchBookingSettings() {
  return apiRequest<BookingSettingsResponse>("/admin/settings");
}

function updateBookingSettings(body: BookingSettingsResponse) {
  return apiRequest<BookingSettingsResponse>("/admin/settings", { body, method: "PATCH" });
}

type UserRoleValue = "staff" | "student" | "super_admin";

type AdminUserResponse = {
  academic_profile: {
    degree: string | null;
    entry_year: number | null;
    faculty: string | null;
    program_studi: string | null;
  } | null;
  email: string;
  full_name: string;
  id: string;
  is_active: boolean;
  nim: string | null;
  phone: string | null;
  role: UserRoleValue;
};

type AdminUsersResponse = {
  items: AdminUserResponse[];
  page: number;
  page_size: number;
  total: number;
};

type UserFilters = {
  isActive: string;
  page: number;
  pageSize: number;
  role: string;
  search: string;
};

function adminUsersPath(filters: UserFilters) {
  const params = new URLSearchParams();
  if (filters.role !== "all") params.set("role", filters.role);
  if (filters.isActive !== "all") params.set("is_active", filters.isActive);
  if (filters.search.trim()) params.set("search", filters.search.trim());
  params.set("page", String(filters.page));
  params.set("page_size", String(filters.pageSize));
  return `/admin/users?${params.toString()}`;
}

function fetchAdminUsers(filters: UserFilters) {
  return apiRequest<AdminUsersResponse>(adminUsersPath(filters));
}

function fetchActiveStaffUsers() {
  return fetchAdminUsers({ isActive: "true", page: 1, pageSize: 100, role: "staff", search: "" });
}

function createAdminUser(body: {
  email: string;
  full_name: string;
  is_active: boolean;
  nim?: string;
  password: string;
  phone?: string;
  role: string;
}) {
  return apiRequest<AdminUserResponse>("/admin/users", { body, method: "POST" });
}

function updateAdminUser(userId: string, body: { email: string; full_name: string }) {
  return apiRequest<AdminUserResponse>(`/admin/users/${userId}`, { body, method: "PATCH" });
}

function resetAdminUserPassword(userId: string, body: { password: string }) {
  return apiRequest<AdminUserResponse>(`/admin/users/${userId}/reset-password`, { body, method: "POST" });
}

function deleteAdminUser(userId: string) {
  return apiRequest<void>(`/admin/users/${userId}`, { method: "DELETE" });
}

function setAdminUserStatus(userId: string, active: boolean) {
  return apiRequest<AdminUserResponse>(`/admin/users/${userId}/${active ? "activate" : "deactivate"}`, {
    method: "POST",
  });
}

const kpiTone = {
  alert: "bg-[#e8f5e9] text-[#0f9d58]",
  blue: "bg-[#dff4ff] text-[#0ea5e9]",
  green: "bg-[#e8f5e9] text-[#0f9d58]",
  orange: "bg-[#ffedd5] text-[#f97316]",
};

function SuperIcon({ name, size = 18 }: { name: string; size?: number }) {
  const props = { "aria-hidden": true, size };
  switch (name) {
    case "alert":
      return <AlertTriangle {...props} />;
    case "briefcase":
      return <Briefcase {...props} />;
    case "building":
      return <Building2 {...props} />;
    case "calendar":
      return <CalendarDays {...props} />;
    case "graduation":
      return <GraduationCap {...props} />;
    case "file":
      return <Briefcase {...props} />;
    case "settings":
      return <Settings {...props} />;
    case "user":
      return <User {...props} />;
    case "x":
      return <X {...props} />;
    default:
      return <Users {...props} />;
  }
}

export function SuperAdminShell({
  active,
  children,
  profileActive = false,
}: {
  active: SuperAdminActive;
  children: ReactNode;
  profileActive?: boolean;
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const auth = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f8fafc] text-[#111827]">
      <header className="fixed inset-x-0 top-0 z-50 flex h-[72px] justify-center border-b border-[#e5e7eb] bg-white max-md:h-16">
        <div className="flex h-full w-[1200px] max-w-[95%] items-center justify-between gap-[22px] max-md:max-w-full max-md:px-3.5">
          <div className="flex min-w-0 items-center gap-[22px] max-md:gap-3.5">
            <button
              aria-label="Buka navigasi super admin"
              className="hidden text-[#6b7280] max-md:inline-flex"
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
            >
              <Menu aria-hidden="true" size={24} />
            </button>
            <a
              aria-label="IPB Smart Reserve Hub"
              className="flex shrink-0 items-center no-underline"
              href="/student"
            >
              <img
                src={logo}
                alt="IPB Smart Reserve Hub"
                className="h-10 w-auto max-md:h-9"
              />
            </a>
          </div>

          <div className="flex items-center gap-[22px] max-md:gap-3.5">
            <NotificationSurface className="text-[#6b7280]" role="super_admin" />
            <a
              aria-label="Profil Super Admin"
              aria-current={profileActive ? "page" : undefined}
              className={cn(
                "flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white no-underline",
                profileActive ? "bg-[#0b7340] ring-2 ring-[#bbf7d0] ring-offset-2" : "bg-[#0f9d58]",
              )}
              href="/super-admin/profile"
            >
              SA
            </a>
          </div>
        </div>
      </header>

      <aside
        aria-label="Navigasi super admin utama"
        className="group fixed left-0 top-[72px] z-40 hidden h-[calc(100vh-72px)] w-[78px] overflow-hidden border-r border-[#e5e7eb] bg-white/95 shadow-none backdrop-blur transition-[width,box-shadow] duration-200 hover:w-[244px] hover:shadow-[8px_0_28px_rgba(15,23,42,0.08)] max-md:hidden md:flex"
      >
        <div className="flex h-full w-full flex-col px-2 py-4">
          <div className="mb-4 flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9ca3af]">
            <span className="whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              Menu admin
            </span>
            <ChevronRight
              aria-hidden="true"
              className="shrink-0 text-[#9ca3af] transition-transform duration-200 group-hover:rotate-180"
              size={16}
            />
          </div>

          <nav aria-label="Menu utama super admin" className="flex flex-col gap-1.5">
            {superAdminNav.map((item) => {
              const Icon = superAdminShellNavIcons[item.key];
              const isActive = item.key === active;

              return (
                <a
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-center gap-0 rounded-[12px] px-3 py-3 text-sm font-bold text-[#6b7280] no-underline transition-colors hover:bg-[#f8fafc] hover:text-[#111827] group-hover:justify-start group-hover:gap-3",
                    isActive && "bg-[#e8f5e9] text-[#0f9d58]",
                  )}
                  href={item.href}
                  key={item.key}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8fafc] transition-colors group-hover:bg-[#eef7f1]",
                      isActive && "bg-white",
                    )}
                  >
                    <Icon aria-hidden="true" size={18} />
                  </span>
                  <span className="w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:w-auto group-hover:translate-x-0 group-hover:opacity-100">
                    {item.label}
                  </span>
                </a>
              );
            })}
          </nav>
          <button
            aria-label="Keluar"
            className="mt-auto flex w-full items-center justify-center gap-0 rounded-[12px] px-3 py-3 text-sm font-bold text-[#b91c1c] transition-colors hover:bg-[#fef2f2] group-hover:justify-start group-hover:gap-3"
            onClick={() => auth.logout()}
            type="button"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fee2e2]">
              <LogOut aria-hidden="true" size={18} />
            </span>
            <span className="w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:w-auto group-hover:translate-x-0 group-hover:opacity-100">
              Keluar
            </span>
          </button>
        </div>
      </aside>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-[60] bg-slate-950/35 md:hidden" onClick={() => setIsMobileNavOpen(false)}>
          <aside
            aria-label="Navigasi super admin mobile"
            className="flex h-full w-[304px] max-w-[84%] flex-col bg-white px-[18px] py-4 shadow-[0_10px_30px_rgba(15,23,42,0.16)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-[18px] flex items-center justify-between">
              <div className="flex items-center gap-3 rounded-xl border border-[#e5e7eb] p-3.5">
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#0f9d58] text-[13px] font-bold text-white">
                  SA
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[#111827]">Super Admin</div>
                  <div className="truncate text-xs text-[#6b7280]">super_admin@apps.ipb.ac.id</div>
                </div>
              </div>
              <button
                aria-label="Tutup navigasi super admin"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e5e7eb] text-[#6b7280]"
                type="button"
                onClick={() => setIsMobileNavOpen(false)}
              >
                <X aria-hidden="true" size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-1.5" aria-label="Navigasi super admin utama">
              {superAdminNav.map((item) => {
                const Icon = superAdminShellNavIcons[item.key];
                const isActive = item.key === active;

                return (
                  <a
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-[10px] px-2.5 py-3 text-sm font-bold text-[#6b7280] no-underline",
                      isActive && "bg-[#e8f5e9] text-[#0f9d58]",
                    )}
                    href={item.href}
                    key={item.key}
                  >
                    <span className="flex w-6 justify-center">
                      <Icon aria-hidden="true" size={18} />
                    </span>
                    {item.label}
                  </a>
                );
              })}
            </nav>
            <button
              aria-label="Keluar"
              className="mt-auto flex items-center gap-3 rounded-[10px] px-2.5 py-3 text-sm font-bold text-[#b91c1c]"
              onClick={() => auth.logout()}
              type="button"
            >
              <span className="flex w-6 justify-center">
                <LogOut aria-hidden="true" size={18} />
              </span>
              Keluar
            </button>
          </aside>
        </div>
      ) : null}

      <div className="pb-20 md:pl-[78px] max-md:pb-14">{children}</div>
    </div>
  );
}

function PageHeader({
  children,
  description,
  mobileStackActions,
  title,
}: {
  children: ReactNode;
  description: string;
  mobileStackActions?: boolean;
  title: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 max-md:grid max-md:gap-4">
      <div>
        <h1 className="m-0 text-[32px] font-bold leading-tight text-[#111827] max-md:text-[28px]">
          {title}
        </h1>
        <p className="m-0 mt-3 max-w-[680px] text-sm leading-6 text-[#6b7280]">{description}</p>
      </div>
      <div
        className={cn(
          "flex gap-3 max-md:grid",
          mobileStackActions ? "max-md:grid-cols-1" : "max-md:grid-cols-2",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function SuperButton({
  children,
  deferred,
  onClick,
  primary,
}: {
  children: ReactNode;
  deferred?: boolean;
  onClick?: () => void;
  primary?: boolean;
}) {
  return (
    <button
      aria-disabled={deferred ? "true" : undefined}
      className={cn(
        "inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg border px-5 text-sm font-bold max-md:min-h-11 max-md:w-full max-md:gap-1.5 max-md:px-3 max-md:text-[13px]",
        deferred
          ? "cursor-not-allowed border-[#e5e7eb] bg-[#f8fafc] text-[#6b7280]"
          : primary
          ? "border-[#0f9d58] bg-[#0f9d58] text-white"
          : "border-[#e5e7eb] bg-white text-[#111827]",
      )}
      disabled={deferred}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function tableActionButtonClass(tone: "danger" | "primary" | "secondary" = "primary") {
  return cn(
    "inline-flex min-h-9 items-center justify-center rounded-md border px-3 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-[#0f9d58] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
    tone === "primary" && "border-[#bbf7d0] bg-[#f0fdf4] text-[#047857] hover:bg-[#dcfce7]",
    tone === "secondary" && "border-[#e5e7eb] bg-[#f8fafc] text-[#6b7280] hover:bg-[#f3f4f6]",
    tone === "danger" && "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c] hover:bg-[#fee2e2]",
  );
}

function KpiCard({
  icon,
  label,
  tone = "green",
  trend,
  value,
}: {
  icon: string;
  label: string;
  tone?: keyof typeof kpiTone;
  trend?: string;
  value: string;
}) {
  return (
    <article className="flex min-h-[88px] items-center gap-4 rounded-xl border border-[#e5e7eb] bg-white p-5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:min-h-[112px] max-md:px-6">
      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", kpiTone[tone])}>
        <SuperIcon name={icon} />
      </div>
      <div className="min-w-0">
        <p className="m-0 text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
          {label}
        </p>
        <p className="m-0 mt-1 text-[28px] font-bold leading-none text-[#111827]">{value}</p>
        {trend ? (
          <p className={cn("m-0 mt-2 text-xs font-bold", trend.startsWith("↑") ? "text-[#10b981]" : "text-[#6b7280]")}>
            {trend}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
        status === "Aktif" && "bg-[#d1fae5] text-[#047857]",
        status === "Nonaktif" && "bg-[#fee2e2] text-[#b91c1c]",
        status === "Disembunyikan" && "bg-[#fee2e2] text-[#b91c1c]",
        (status === "Butuh Staff" || status === "Perlu Aksi" || status === "Perlu Tinjauan") &&
          "bg-[#fef3c7] text-[#b45309]",
        status === "Baru" && "bg-[#dff4ff] text-[#0284c7]",
        status === "Dipulihkan" && "bg-[#d1fae5] text-[#047857]",
        status === "Semua Aktif" && "bg-[#d1fae5] text-[#047857]",
        status === "Pantau" && "bg-[#fef3c7] text-[#b45309]",
      )}
    >
      {status}
    </span>
  );
}

function healthLabel(status: string) {
  if (status === "not_used") {
    return "Tidak Digunakan";
  }
  return status === "ok" ? "OK" : status.charAt(0).toUpperCase() + status.slice(1).replaceAll("_", " ");
}

function activeLabel(isActive: boolean) {
  return isActive ? "Aktif" : "Nonaktif";
}

function coverageLabel(value: string) {
  if (value === "covered") {
    return "Semua Aktif";
  }
  if (value === "needs_staff") {
    return "Butuh Staff";
  }
  return value.replaceAll("_", " ");
}

function assignedStaffLabel(staff: NonNullable<SuperAdminFacilityGovernanceResponse["assigned_staff"]>) {
  if (staff.length === 0) {
    return "Belum ada staff ditugaskan";
  }
  return staff
    .map((member) => `${member.full_name}${member.is_active ? "" : " (nonaktif)"}`)
    .join(", ");
}

function formatAuditTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  })
    .format(new Date(value))
    .replace(".", ":");
}

function dashboardActivityText(item: SuperAdminAuditLogResponse) {
  const actor = item.actor_email ?? "Sistem";
  return `${actor} ${auditActionLabel(item.action_type).toLowerCase()}`;
}

function auditActionLabel(actionType: string) {
  if (actionType === "auth.login") {
    return "Login berhasil";
  }
  if (actionType.startsWith("request.")) {
    return `Akses endpoint (${actionType.replace("request.", "")})`;
  }
  const labels: Record<string, string> = {
    "review.deleted": "Menyembunyikan ulasan",
    "review.restored": "Memulihkan ulasan",
    "staff_assignment.created": "Menambahkan penugasan staff",
    "staff_assignment.removed": "Menghapus penugasan staff",
    "user.activated": "Mengaktifkan pengguna",
    "user.created": "Membuat pengguna",
    "user.deactivated": "Menonaktifkan pengguna",
  };
  return labels[actionType] ?? actionType.replaceAll("_", " ").replaceAll(".", " ");
}

function auditStatusCode(actionType: string) {
  if (!actionType.startsWith("request.")) {
    return "-";
  }
  return actionType.replace("request.", "");
}

function auditTargetLabel(item: AdminAuditLogResponse) {
  return item.target_type === "endpoint" ? item.target_id : `${item.target_type} - ${item.target_id}`;
}

function topEndpointSummary(auditLogs: AdminAuditLogResponse[]) {
  const counts = new Map<string, number>();
  for (const entry of auditLogs) {
    if (entry.target_type !== "endpoint") {
      continue;
    }
    counts.set(entry.target_id, (counts.get(entry.target_id) ?? 0) + 1);
  }
  let winner = "-";
  let winnerCount = 0;
  for (const [endpoint, count] of counts.entries()) {
    if (count > winnerCount) {
      winner = endpoint;
      winnerCount = count;
    }
  }
  return { endpoint: winner, count: winnerCount };
}

function topActorSummary(auditLogs: AdminAuditLogResponse[]) {
  const counts = new Map<string, number>();
  for (const entry of auditLogs) {
    const actor = entry.actor_email ?? "Sistem";
    counts.set(actor, (counts.get(actor) ?? 0) + 1);
  }
  let winner = "-";
  let winnerCount = 0;
  for (const [actor, count] of counts.entries()) {
    if (count > winnerCount) {
      winner = actor;
      winnerCount = count;
    }
  }
  return { actor: winner, count: winnerCount };
}

function reportStatusLabel(status: string) {
  const labels: Record<string, string> = {
    approved: "Disetujui",
    cancelled: "Dibatalkan",
    completed: "Selesai",
    expired: "Kedaluwarsa",
    pending_document_review: "Review Dokumen",
    pending_document_upload: "Unggah Dokumen",
    pending_payment: "Pembayaran",
    rejected: "Ditolak",
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

function formatTrendDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function parseTrendDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function weekStartDate(value: string) {
  const date = parseTrendDate(value);
  const day = date.getUTCDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + offset);
  return isoDate(date);
}

function formatLongTrendDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

function formatMonthYear(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    timeZone: "Asia/Jakarta",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

function trendGroupKey(value: string, mode: ReportTrendMode) {
  if (mode === "monthly") {
    return weekStartDate(value);
  }
  if (mode === "yearly") {
    return `${value.slice(0, 7)}-01`;
  }
  return value;
}

function trendLabel(value: string, mode: ReportTrendMode) {
  if (mode === "monthly") {
    return `Minggu ${formatLongTrendDate(value)}`;
  }
  if (mode === "yearly") {
    return formatMonthYear(value);
  }
  return formatLongTrendDate(value);
}

function trendShortLabel(value: string, mode: ReportTrendMode) {
  if (mode === "monthly") {
    return formatTrendDate(value);
  }
  if (mode === "yearly") {
    return new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "Asia/Jakarta" })
      .format(new Date(`${value}T00:00:00+07:00`));
  }
  return formatTrendDate(value);
}

function aggregateTrendPoints(points: SuperAdminReportTrendPointResponse[], mode: ReportTrendMode): TrendChartPoint[] {
  const groups = new Map<string, TrendChartPoint>();

  points.forEach((point) => {
    const key = trendGroupKey(point.date, mode);
    const existing = groups.get(key);

    if (existing) {
      existing.paid_total_rupiah += point.paid_total_rupiah;
      existing.reservation_count += point.reservation_count;
      return;
    }

    groups.set(key, {
      date: key,
      label: trendLabel(key, mode),
      paid_total_rupiah: point.paid_total_rupiah,
      reservation_count: point.reservation_count,
      shortLabel: trendShortLabel(key, mode),
    });
  });

  return Array.from(groups.values()).sort((first, second) => first.date.localeCompare(second.date));
}

function roleLabel(role: string) {
  if (role === "super_admin") return "Super Admin";
  if (role === "staff") return "Staff";
  if (role === "student") return "Mahasiswa";
  return role;
}

function displayValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Belum tersedia" : String(value);
}

function userProfileText(user: AdminUserResponse) {
  if (user.role === "student") {
    return [
      displayValue(user.nim),
      displayValue(user.phone),
      displayValue(user.academic_profile?.program_studi),
      displayValue(user.academic_profile?.faculty),
      displayValue(user.academic_profile?.entry_year),
      displayValue(user.academic_profile?.degree),
    ].join(" - ");
  }
  return "Profil staff/admin dikelola internal";
}

function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return fallback;
}

function downloadCsv(filename: string, rows: Array<Record<string, string | number | boolean | null | undefined>>) {
  if (rows.length === 0) {
    return false;
  }
  const headers = Object.keys(rows[0]);
  const escapeCell = (value: string | number | boolean | null | undefined) => {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replaceAll('"', '""')}"`;
  };
  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(","))]
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

function DashboardStateMessage({
  actionLabel,
  children,
  onRetry,
}: {
  actionLabel?: string;
  children: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white px-5 py-6 text-sm font-semibold text-[#6b7280]">
      <p className="m-0">{children}</p>
      {onRetry ? (
        <button
          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-[#0f9d58] px-4 text-sm font-bold text-white"
          onClick={onRetry}
          type="button"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function SuperAdminSystemPage() {
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const statusQuery = useQuery({
    queryFn: fetchSystemStatus,
    queryKey: ["super-admin", "system-status"],
  });
  const settingsQuery = useQuery({
    queryFn: fetchBookingSettings,
    queryKey: ["super-admin", "booking-settings"],
  });
  const settingsMutation = useMutation({
    mutationFn: updateBookingSettings,
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Pengaturan booking belum dapat disimpan."));
    },
    onSuccess: (settings) => {
      setFormError("");
      setMessage("Pengaturan booking disimpan.");
      settingsQuery.refetch();
      return settings;
    },
  });
  const status = statusQuery.data;
  const services = status
    ? [
        { meta: `${status.application.name} ${status.application.version}`, name: "Application", status: "Aktif" },
        { meta: "API", name: "Backend", status: healthLabel(status.backend.status) },
        { meta: "Database", name: "Database", status: healthLabel(status.database.status) },
        { meta: "Private file storage", name: "Storage", status: healthLabel(status.storage.status) },
        { meta: "Deadline automation", name: "Worker", status: healthLabel(status.worker.status) },
      ]
    : [];

  const serviceHealthIsHealthy = status
    ? status.backend.status === "ok"
      && status.database.status === "ok"
      && status.storage.status === "ok"
      && (status.worker.status === "ok" || status.worker.status === "not_used")
    : false;

  return (
    <SuperAdminShell active="system">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Pantau kesehatan layanan dan kelola aturan booking yang berlaku untuk seluruh platform."
          mobileStackActions
          title="Sistem"
        >
          <span className="text-sm font-semibold text-[#6b7280]">Snapshot belum tersedia</span>
        </PageHeader>

        <section className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          <PlainKpiCard label="Backend" value={status ? healthLabel(status.backend.status) : "-"} />
          <PlainKpiCard label="Database" value={status ? healthLabel(status.database.status) : "-"} />
          <PlainKpiCard label="Storage" value={status ? healthLabel(status.storage.status) : "-"} />
          <PlainKpiCard label="Worker" value={status ? healthLabel(status.worker.status) : "-"} />
        </section>

        {message ? (
          <div className="mt-4 rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#0b7340]">
            {message}
          </div>
        ) : null}
        {formError ? (
          <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm font-semibold text-[#dc2626]">
            {formError}
          </div>
        ) : null}
        {statusQuery.isError ? (
          <DashboardStateMessage actionLabel="Muat ulang status sistem" onRetry={() => void statusQuery.refetch()}>
            Status sistem belum dapat dimuat.
          </DashboardStateMessage>
        ) : null}
        {settingsQuery.isError ? (
          <DashboardStateMessage actionLabel="Muat ulang pengaturan" onRetry={() => void settingsQuery.refetch()}>
            Pengaturan booking belum dapat dimuat.
          </DashboardStateMessage>
        ) : null}

        <div className="mt-7 grid grid-cols-2 gap-7 max-lg:grid-cols-1">
          <SectionCard link="" title="Status Layanan">
            <div className="absolute right-6 top-5 max-md:right-5">
              <StatusBadge status={serviceHealthIsHealthy ? "Semua Aktif" : "Pantau"} />
            </div>
            <div className="grid">
              {services.map((service) => (
                <article
                  className="flex items-center justify-between gap-4 border-t border-[#e5e7eb] px-6 py-5 first:border-t-0 max-md:px-4"
                  key={service.name}
                >
                  <div className="min-w-0">
                    <p className="m-0 break-words text-sm font-bold">{service.name}</p>
                    <p className="m-0 mt-1 break-words text-xs text-[#6b7280]">{service.meta}</p>
                  </div>
                  <StatusBadge status={service.status} />
                </article>
              ))}
            </div>
            {statusQuery.isLoading ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                Memuat status sistem...
              </div>
            ) : null}
          </SectionCard>

          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-5">
            <h2 className="m-0 text-lg font-bold">Aturan Booking</h2>
            {settingsQuery.data ? (
              <BookingSettingsForm
                isSaving={settingsMutation.isPending}
                key={JSON.stringify(settingsQuery.data)}
                onSave={(payload) => settingsMutation.mutate(payload)}
                settings={settingsQuery.data}
              />
            ) : null}
            {settingsQuery.isLoading ? (
              <div className="mt-4 text-sm font-semibold text-[#6b7280]">Memuat pengaturan booking...</div>
            ) : null}
          </section>
        </div>
      </main>
    </SuperAdminShell>
  );
}

function BookingSettingsForm({
  isSaving,
  onSave,
  settings,
}: {
  isSaving: boolean;
  onSave: (payload: BookingSettingsResponse) => void;
  settings: BookingSettingsResponse;
}) {
  const [form, setForm] = useState({
    ...settings,
    allowed_student_email_domains: settings.allowed_student_email_domains.join(", "),
  });
  const setNumberField = (field: keyof Omit<BookingSettingsResponse, "allowed_student_email_domains">, value: string) => {
    setForm((current) => ({ ...current, [field]: Number(value) }));
  };
  const payload: BookingSettingsResponse = {
    ...form,
    allowed_student_email_domains: form.allowed_student_email_domains
      .split(",")
      .map((domain) => domain.trim())
      .filter(Boolean),
  };
  const unchanged = JSON.stringify(payload) === JSON.stringify(settings);
  const invalid =
    Object.entries(payload).some(([key, value]) => key !== "allowed_student_email_domains" && Number(value) <= 0) ||
    payload.allowed_student_email_domains.length === 0;

  return (
    <form
      className="mt-4 grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(payload);
      }}
    >
      <SystemNumberField
        label="Minimum lead time jam"
        onChange={(value) => setNumberField("min_booking_lead_hours", value)}
        value={form.min_booking_lead_hours}
      />
      <SystemNumberField
        label="Maximum advance booking jam"
        onChange={(value) => setNumberField("max_booking_advance_hours", value)}
        value={form.max_booking_advance_hours}
      />
      <SystemNumberField
        label="Batas unggah surat jam"
        onChange={(value) => setNumberField("document_upload_due_hours", value)}
        value={form.document_upload_due_hours}
      />
      <SystemNumberField
        label="Batas review surat jam"
        onChange={(value) => setNumberField("document_verification_due_hours", value)}
        value={form.document_verification_due_hours}
      />
      <SystemNumberField
        label="Batas unggah pembayaran jam"
        onChange={(value) => setNumberField("payment_upload_due_hours", value)}
        value={form.payment_upload_due_hours}
      />
      <SystemNumberField
        label="Batas review pembayaran jam"
        onChange={(value) => setNumberField("payment_verification_due_hours", value)}
        value={form.payment_verification_due_hours}
      />
      <SystemNumberField
        label="Cutoff persetujuan final jam"
        onChange={(value) => setNumberField("final_approval_cutoff_hours", value)}
        value={form.final_approval_cutoff_hours}
      />
      <SystemNumberField
        label="Cutoff terlambat final jam"
        onChange={(value) => setNumberField("overdue_final_approval_cutoff_hours", value)}
        value={form.overdue_final_approval_cutoff_hours}
      />
      <label className="grid gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
          Domain email mahasiswa
        </span>
        <input
          aria-label="Domain email mahasiswa"
          className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
          onChange={(event) =>
            setForm((current) => ({ ...current, allowed_student_email_domains: event.target.value }))
          }
          value={form.allowed_student_email_domains}
        />
      </label>
      <button
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0f9d58] px-5 text-sm font-bold text-white disabled:opacity-60"
        disabled={unchanged || invalid || isSaving}
        type="submit"
      >
        Simpan Pengaturan
      </button>
    </form>
  );
}

function SystemNumberField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: number;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
        {label}
      </span>
      <input
        aria-label={label}
        className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
        min="1"
        onChange={(event) => onChange(event.target.value)}
        type="number"
        value={value}
      />
    </label>
  );
}

function PlainKpiCard({ label, sub, value }: { label: string; sub?: string; value: string }) {
  return (
    <article className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:min-h-[116px]">
      <p className="m-0 text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
        {label}
      </p>
      <p className="m-0 mt-2 text-[28px] font-bold leading-none text-[#111827]">{value}</p>
      {sub ? <p className="m-0 mt-2 text-sm text-[#6b7280]">{sub}</p> : null}
    </article>
  );
}

function FacilityThumb({ label }: { label: string }) {
  return (
    <div className="flex h-[72px] w-24 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#d1fae5] to-[#fef3c7] text-base font-bold text-[#0f766e] max-md:h-[140px] max-md:w-full">
      {label}
    </div>
  );
}

function PaginationControls({
  className,
  currentPage,
  onNext,
  onPageSizeChange,
  onPrevious,
  pageSize,
  pageSizeOptions,
  summary,
  totalPages,
}: {
  className?: string;
  currentPage: number;
  onNext: () => void;
  onPageSizeChange: (value: number) => void;
  onPrevious: () => void;
  pageSize: number;
  pageSizeOptions: number[];
  summary: string;
  totalPages: number;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3", className)}>
      <p className="m-0 text-sm font-semibold text-[#6b7280]">{summary}</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-[#111827]">
          <span>Tampil</span>
          <select
            className="min-h-10 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            value={pageSize}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <span className="text-sm font-semibold text-[#6b7280]">
          Halaman {currentPage} / {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button
            className={tableActionButtonClass("secondary")}
            disabled={currentPage <= 1}
            onClick={onPrevious}
            type="button"
          >
            Sebelumnya
          </button>
          <button
            className={tableActionButtonClass("secondary")}
            disabled={currentPage >= totalPages}
            onClick={onNext}
            type="button"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}

export function SuperAdminFacilitiesPage() {
  const queryClient = useQueryClient();
  const [createFacilityOpen, setCreateFacilityOpen] = useState(false);
  const [facilityPage, setFacilityPage] = useState(1);
  const [facilityPageSize, setFacilityPageSize] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [coverageFilter, setCoverageFilter] = useState("all");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [staffInputs, setStaffInputs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const governanceQuery = useQuery({
    queryFn: fetchFacilityGovernance,
    queryKey: ["super-admin", "facility-governance"],
  });
  const categoriesQuery = useQuery({
    queryFn: fetchFacilityCategories,
    queryKey: ["facility-categories"],
  });
  const staffUsersQuery = useQuery({
    queryFn: fetchActiveStaffUsers,
    queryKey: ["super-admin", "staff-options"],
  });
  const facilities = governanceQuery.data ?? [];
  const filteredFacilities = facilities.filter((facility) => {
    const searchHaystack = `${facility.name} ${facility.location} ${facility.category} ${(facility.issue_flags ?? []).join(" ")}`.toLowerCase();
    const matchesSearch = searchQuery.trim().length === 0 || searchHaystack.includes(searchQuery.trim().toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && facility.is_active) ||
      (statusFilter === "inactive" && !facility.is_active);
    const matchesCoverage = coverageFilter === "all" || facility.assignment_coverage === coverageFilter;
    return matchesSearch && matchesStatus && matchesCoverage;
  });
  const facilityTotalPages = Math.max(1, Math.ceil(filteredFacilities.length / facilityPageSize));
  const currentFacilityPage = Math.min(facilityPage, facilityTotalPages);
  const pagedFacilities = filteredFacilities.slice(
    (currentFacilityPage - 1) * facilityPageSize,
    currentFacilityPage * facilityPageSize,
  );
  const selectedFacility = facilities.find((facility) => facility.id === selectedFacilityId) ?? null;
  const staffOptions = staffUsersQuery.data?.items ?? [];
  const activeFacilities = facilities.filter((facility) => facility.is_active).length;
  const needsStaff = facilities.filter((facility) => facility.assignment_coverage === "needs_staff").length;
  const activeAssignedStaff = facilities.reduce(
    (total, facility) => total + facility.active_assigned_staff_count,
    0,
  );
  const assignmentMutation = useMutation({
    mutationFn: ({
      action,
      facilityId,
      staffId,
    }: {
      action: "assign" | "unassign";
      facilityId: string;
      staffId: string;
    }) =>
      action === "assign"
        ? assignFacilityStaff(facilityId, staffId)
        : unassignFacilityStaff(facilityId, staffId),
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Penugasan staff belum dapat diperbarui."));
    },
    onSuccess: async () => {
      setFormError("");
      setMessage("Penugasan staff diperbarui.");
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "facility-governance"] });
    },
  });
  const createFacilityMutation = useMutation({
    mutationFn: createFacility,
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Fasilitas belum dapat dibuat."));
    },
    onSuccess: async () => {
      setCreateFacilityOpen(false);
      setFormError("");
      setMessage("Fasilitas baru dibuat.");
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "facility-governance"] });
    },
  });

  return (
    <SuperAdminShell active="facilities">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Pantau fasilitas lintas unit, status publikasi, dan penugasan staff pengelola."
          title="Fasilitas"
        >
          <SuperButton
            onClick={() => {
              const exported = downloadCsv(
                "super-admin-fasilitas.csv",
                facilities.map((facility) => ({
                  active_assigned_staff_count: facility.active_assigned_staff_count,
                  assigned_staff_count: facility.assigned_staff_count,
                  assignment_coverage: coverageLabel(facility.assignment_coverage),
                  capacity: facility.capacity,
                  category: facility.category,
                  is_active: facility.is_active,
                  location: facility.location,
                  name: facility.name,
                })),
              );
              setFormError(exported ? "" : "Tidak ada data fasilitas untuk diekspor.");
              setMessage(exported ? "CSV fasilitas diunduh." : "");
            }}
          >
            Ekspor CSV
          </SuperButton>
          <SuperButton primary onClick={() => setCreateFacilityOpen(true)}>
            <Plus aria-hidden="true" size={15} />
            Tambah Fasilitas
          </SuperButton>
        </PageHeader>

        <section className="grid grid-cols-3 gap-5 max-md:grid-cols-1">
          <PlainKpiCard
            label="Fasilitas Aktif"
            sub={`${facilities.length} total fasilitas`}
            value={governanceQuery.data ? String(activeFacilities) : "-"}
          />
          <PlainKpiCard
            label="Tanpa Staff"
            sub="Butuh penugasan aktif"
            value={governanceQuery.data ? String(needsStaff) : "-"}
          />
          <PlainKpiCard
            label="Staff Aktif"
            sub="Penugasan aktif"
            value={governanceQuery.data ? String(activeAssignedStaff) : "-"}
          />
        </section>

        {message ? (
          <div className="mt-4 rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#0b7340]">
            {message}
          </div>
        ) : null}
        {formError ? (
          <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm font-semibold text-[#dc2626]">
            {formError}
          </div>
        ) : null}
        {governanceQuery.isError ? (
          <DashboardStateMessage actionLabel="Muat ulang fasilitas" onRetry={() => void governanceQuery.refetch()}>
            Tata kelola fasilitas belum dapat dimuat.
          </DashboardStateMessage>
        ) : null}

        <section className="mt-6 grid grid-cols-[1fr_220px_220px] gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:grid-cols-1">
          <input
            aria-label="Cari fasilitas super admin"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            onChange={(event) => {
              setFacilityPage(1);
              setSearchQuery(event.target.value);
            }}
            placeholder="Cari nama, lokasi, atau kategori"
            value={searchQuery}
          />
          <select
            aria-label="Filter status fasilitas super admin"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            onChange={(event) => {
              setFacilityPage(1);
              setStatusFilter(event.target.value);
            }}
            value={statusFilter}
          >
            <option value="all">Semua status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <select
            aria-label="Filter cakupan staff fasilitas super admin"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            onChange={(event) => {
              setFacilityPage(1);
              setCoverageFilter(event.target.value);
            }}
            value={coverageFilter}
          >
            <option value="all">Semua cakupan</option>
            <option value="covered">Sudah tercakup</option>
            <option value="needs_staff">Butuh staff</option>
          </select>
        </section>

        <div className="mt-7 grid gap-7">
          <SectionCard link="Lihat Semua" linkHref="/super-admin/facilities" title="Daftar Fasilitas">
            <table className="w-full border-collapse max-md:hidden">
              <thead className="bg-[#f9fafb] text-left text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                <tr>
                  <th className="w-[34%] px-5 py-3">Fasilitas</th>
                  <th className="w-[14%] px-5 py-3">Kapasitas</th>
                  <th className="w-[18%] px-5 py-3">Staff</th>
                  <th className="w-[18%] px-5 py-3">Status</th>
                  <th className="w-[16%] px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pagedFacilities.map((facility) => (
                  <tr className="border-t border-[#e5e7eb]" key={facility.id}>
                    <td className="px-5 py-4">
                      <p className="m-0 text-sm font-bold">{facility.name}</p>
                      <p className="m-0 mt-1 text-xs text-[#6b7280]">
                        {facility.location} - {facility.category}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {facility.issue_flags.length > 0 ? (
                          facility.issue_flags.map((flag) => <StatusBadge key={flag} status={coverageLabel(flag)} />)
                        ) : (
                          <span className="text-xs font-semibold text-[#6b7280]">Tidak ada issue</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#6b7280]">{facility.capacity} kursi</td>
                    <td className="px-5 py-4 text-sm text-[#6b7280]">
                      <span className="font-semibold text-[#111827]">
                        {facility.active_assigned_staff_count}/{facility.assigned_staff_count} aktif
                      </span>
                      <span className="mt-1 block break-words text-xs">
                        Ditugaskan: {assignedStaffLabel(facility.assigned_staff ?? [])}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge status={facility.is_active ? "Aktif" : "Nonaktif"} />
                        <StatusBadge status={coverageLabel(facility.assignment_coverage)} />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="grid gap-2">
                        <button
                          aria-label={`Kelola staff ${facility.name}`}
                          className={tableActionButtonClass("primary")}
                          onClick={() => setSelectedFacilityId(facility.id)}
                          type="button"
                        >
                          Kelola staff
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="hidden gap-4 max-md:grid">
              {pagedFacilities.map((facility) => (
                <article className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]" key={facility.id}>
                  <UserField label="Fasilitas">
                    <strong>{facility.name}</strong>
                    <span className="block break-words text-xs text-[#6b7280]">
                      {facility.location} - {facility.category}
                    </span>
                  </UserField>
                  <UserField label="Kapasitas">{facility.capacity} kursi</UserField>
                  <UserField label="Staff">
                    <strong>{facility.active_assigned_staff_count}/{facility.assigned_staff_count} aktif</strong>
                    <span className="mt-1 block break-words text-xs text-[#6b7280]">
                      Ditugaskan: {assignedStaffLabel(facility.assigned_staff ?? [])}
                    </span>
                  </UserField>
                  <UserField label="Status">
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={facility.is_active ? "Aktif" : "Nonaktif"} />
                      <StatusBadge status={coverageLabel(facility.assignment_coverage)} />
                      {facility.issue_flags.map((flag) => <StatusBadge key={flag} status={coverageLabel(flag)} />)}
                    </div>
                  </UserField>
                  <UserField label="Aksi">
                    <div className="grid gap-2">
                      <button
                        aria-label={`Kelola staff ${facility.name}`}
                        className={tableActionButtonClass("primary")}
                        onClick={() => setSelectedFacilityId(facility.id)}
                        type="button"
                      >
                        Kelola staff
                      </button>
                    </div>
                  </UserField>
                </article>
              ))}
            </div>
            {filteredFacilities.length > facilityPageSize ? (
              <PaginationControls
                className="border-t border-[#e5e7eb] px-5 py-4"
                currentPage={currentFacilityPage}
                onNext={() => setFacilityPage((current) => Math.min(current + 1, facilityTotalPages))}
                onPageSizeChange={(value) => {
                  setFacilityPage(1);
                  setFacilityPageSize(value);
                }}
                onPrevious={() => setFacilityPage((current) => Math.max(current - 1, 1))}
                pageSize={facilityPageSize}
                pageSizeOptions={[5, 10, 20]}
                summary={`Menampilkan ${pagedFacilities.length} dari ${filteredFacilities.length} fasilitas`}
                totalPages={facilityTotalPages}
              />
            ) : null}
            {governanceQuery.isLoading ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                Memuat tata kelola fasilitas...
              </div>
            ) : null}
            {governanceQuery.isSuccess && facilities.length === 0 ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                <p className="m-0">Belum ada data tata kelola fasilitas.</p>
                <button
                  className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-[#0f9d58] px-4 text-sm font-bold text-white"
                  onClick={() => void governanceQuery.refetch()}
                  type="button"
                >
                  Muat ulang fasilitas
                </button>
              </div>
            ) : null}
            {governanceQuery.isSuccess && facilities.length > 0 && filteredFacilities.length === 0 ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                Tidak ada fasilitas yang cocok dengan pencarian atau filter.
              </div>
            ) : null}
          </SectionCard>

        </div>
        {selectedFacility ? (
          <FacilityAssignmentModal
            assignmentBusy={assignmentMutation.isPending}
            facility={selectedFacility}
            onAssign={(staffId) =>
              assignmentMutation.mutate({ action: "assign", facilityId: selectedFacility.id, staffId })
            }
            onClose={() => setSelectedFacilityId(null)}
            onSelectStaff={(staffId) => setStaffInputs((current) => ({ ...current, [selectedFacility.id]: staffId }))}
            onUnassign={(staffId) =>
              assignmentMutation.mutate({ action: "unassign", facilityId: selectedFacility.id, staffId })
            }
            selectedStaffId={staffInputs[selectedFacility.id] ?? ""}
            staffOptions={staffOptions}
          />
        ) : null}
        {createFacilityOpen ? (
          <CreateFacilityModal
            categories={categoriesQuery.data ?? []}
            isSaving={createFacilityMutation.isPending}
            onClose={() => setCreateFacilityOpen(false)}
            onSave={(payload) => createFacilityMutation.mutate(payload)}
          />
        ) : null}
      </main>
    </SuperAdminShell>
  );
}

function CreateFacilityModal({
  categories,
  isSaving,
  onClose,
  onSave,
}: {
  categories: FacilityCategoryResponse[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: FacilityCreatePayload) => void;
}) {
  const [form, setForm] = useState({
    capacity: 40,
    categoryId: categories[0]?.id ?? "",
    contactEmail: "",
    contactName: "",
    contactPhone: "",
    description: "",
    location: "",
    name: "",
    openHoursSummary: "Senin-Jumat 08.00-16.00",
    paymentInstructions: "",
    priceRupiah: 0,
  });
  const categoryId = form.categoryId || categories[0]?.id || "";
  const invalid =
    !form.name.trim() ||
    !form.location.trim() ||
    !form.description.trim() ||
    !form.contactName.trim() ||
    !form.contactPhone.trim() ||
    !form.openHoursSummary.trim() ||
    !categoryId ||
    form.capacity < 1 ||
    form.priceRupiah < 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 px-4" onClick={onClose}>
      <section
        aria-label="Tambah fasilitas"
        className="max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_24px_48px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] pb-4">
          <div>
            <h2 className="m-0 text-xl font-bold text-[#111827]">Tambah Fasilitas</h2>
            <p className="m-0 mt-2 text-sm text-[#6b7280]">Buat fasilitas baru lalu kelola staff dari daftar fasilitas.</p>
          </div>
          <button className={tableActionButtonClass("secondary")} onClick={onClose} type="button">
            Tutup
          </button>
        </div>
        <form
          className="mt-5 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave({
              capacity: form.capacity,
              category_id: categoryId,
              contact_email: form.contactEmail.trim() || null,
              contact_name: form.contactName.trim(),
              contact_phone: form.contactPhone.trim(),
              description: form.description.trim(),
              is_active: true,
              location: form.location.trim(),
              name: form.name.trim(),
              open_hours_summary: form.openHoursSummary.trim(),
              payment_instructions: form.paymentInstructions.trim() || null,
              price_rupiah: form.priceRupiah,
            });
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Nama fasilitas" onChange={(name) => setForm((current) => ({ ...current, name }))} value={form.name} />
            <TextField label="Lokasi fasilitas" onChange={(location) => setForm((current) => ({ ...current, location }))} value={form.location} />
            <label className="grid gap-2 text-sm font-semibold text-[#111827]">
              Kategori
              <select
                aria-label="Kategori fasilitas"
                className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
                onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
                value={categoryId}
              >
                <option value="">Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#111827]">
              Kapasitas
              <input
                aria-label="Kapasitas fasilitas"
                className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
                min="1"
                onChange={(event) => setForm((current) => ({ ...current, capacity: Number(event.target.value) }))}
                type="number"
                value={form.capacity}
              />
            </label>
          </div>
          <TextField label="Deskripsi fasilitas" onChange={(description) => setForm((current) => ({ ...current, description }))} value={form.description} />
          <div className="grid gap-4 md:grid-cols-3">
            <TextField label="Nama kontak" onChange={(contactName) => setForm((current) => ({ ...current, contactName }))} value={form.contactName} />
            <TextField label="Telepon kontak" onChange={(contactPhone) => setForm((current) => ({ ...current, contactPhone }))} value={form.contactPhone} />
            <TextField label="Email kontak" onChange={(contactEmail) => setForm((current) => ({ ...current, contactEmail }))} type="email" value={form.contactEmail} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Ringkasan jam buka" onChange={(openHoursSummary) => setForm((current) => ({ ...current, openHoursSummary }))} value={form.openHoursSummary} />
            <label className="grid gap-2 text-sm font-semibold text-[#111827]">
              Harga rupiah
              <input
                aria-label="Harga rupiah fasilitas"
                className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
                min="0"
                onChange={(event) => setForm((current) => ({ ...current, priceRupiah: Number(event.target.value) }))}
                type="number"
                value={form.priceRupiah}
              />
            </label>
          </div>
          <TextField label="Instruksi pembayaran" onChange={(paymentInstructions) => setForm((current) => ({ ...current, paymentInstructions }))} value={form.paymentInstructions} />
          <div className="flex flex-wrap justify-end gap-3">
            <button className={tableActionButtonClass("secondary")} disabled={isSaving} onClick={onClose} type="button">
              Batal
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0f9d58] px-4 text-sm font-bold text-white disabled:opacity-60"
              disabled={invalid || isSaving}
              type="submit"
            >
              Simpan Fasilitas
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function TextField({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-[#111827]">
      {label}
      <input
        aria-label={label}
        className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function FacilityAssignmentModal({
  assignmentBusy,
  facility,
  onAssign,
  onClose,
  onSelectStaff,
  onUnassign,
  selectedStaffId,
  staffOptions,
}: {
  assignmentBusy: boolean;
  facility: SuperAdminFacilityGovernanceResponse;
  onAssign: (staffId: string) => void;
  onClose: () => void;
  onSelectStaff: (staffId: string) => void;
  onUnassign: (staffId: string) => void;
  selectedStaffId: string;
  staffOptions: AdminUserResponse[];
}) {
  const assignedStaff = facility.assigned_staff ?? [];
  const selectableStaff = [
    ...staffOptions,
    ...assignedStaff
      .filter((staff) => !staffOptions.some((option) => option.id === staff.id))
      .map((staff) => ({
        ...staff,
        academic_profile: null,
        nim: null,
        phone: null,
        role: "staff" as const,
      })),
  ];
  const selectedStaff = selectableStaff.find((staff) => staff.id === selectedStaffId) ?? null;
  const alreadyAssigned = assignedStaff.some((staff) => staff.id === selectedStaffId);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 px-4" onClick={onClose}>
      <section
        aria-label={`Kelola staff ${facility.name}`}
        className="w-full max-w-[640px] rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_24px_48px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] pb-4">
          <div className="min-w-0">
            <h2 className="m-0 text-xl font-bold text-[#111827]">Kelola Staff Fasilitas</h2>
            <p className="m-0 mt-2 break-words text-sm text-[#6b7280]">
              {facility.name} - {facility.location}
            </p>
          </div>
          <button className={tableActionButtonClass("secondary")} onClick={onClose} type="button">
            Tutup
          </button>
        </div>

        <div className="mt-5 grid gap-5">
          <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
            <p className="m-0 text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Staff Ditugaskan</p>
            {assignedStaff.length > 0 ? (
              <ul className="m-0 mt-3 grid list-none gap-2 p-0">
                {assignedStaff.map((staff) => (
                  <li className="break-words text-sm font-semibold text-[#111827]" key={staff.id}>
                    {staff.full_name} - {staff.email}
                    {!staff.is_active ? <span className="text-[#b91c1c]"> (nonaktif)</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 mt-3 text-sm font-semibold text-[#6b7280]">Belum ada staff ditugaskan.</p>
            )}
          </div>

          <label className="grid gap-2 text-sm font-semibold text-[#111827]">
            Pilih staff
            <select
              aria-label={`Pilih staff untuk ${facility.name}`}
              className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
              onChange={(event) => onSelectStaff(event.target.value)}
              value={selectedStaffId}
            >
              <option value="">Pilih staff aktif</option>
              {selectableStaff.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.full_name} - {staff.email}{staff.is_active ? "" : " (nonaktif)"}
                </option>
              ))}
            </select>
          </label>

          <p className="m-0 text-xs font-semibold text-[#6b7280]">
            {selectedStaff
              ? alreadyAssigned
                ? `${selectedStaff.full_name} sudah ditugaskan ke fasilitas ini.`
                : `${selectedStaff.full_name} belum ditugaskan ke fasilitas ini.`
              : "Pilih staff untuk menambah atau menghapus penugasan."}
          </p>

          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <button
              aria-label={`Tugaskan staff ke ${facility.name}`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0f9d58] px-4 text-sm font-bold text-white disabled:opacity-60"
              disabled={!selectedStaffId || alreadyAssigned || assignmentBusy}
              onClick={() => onAssign(selectedStaffId)}
              type="button"
            >
              Tugaskan
            </button>
            <button
              aria-label={`Hapus staff dari ${facility.name}`}
              className={cn(tableActionButtonClass("danger"), "min-h-11 text-sm")}
              disabled={!selectedStaffId || !alreadyAssigned || assignmentBusy}
              onClick={() => onUnassign(selectedStaffId)}
              type="button"
            >
              Hapus penugasan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  })
    .format(value)
    .replace(/\s/g, "");
}

function TrendChart({ mode, points }: { mode: ReportTrendMode; points: TrendChartPoint[] }) {
  const maxCount = Math.max(...points.map((point) => point.reservation_count), 1);
  const totalCount = points.reduce((total, point) => total + point.reservation_count, 0);
  const totalPaid = points.reduce((total, point) => total + point.paid_total_rupiah, 0);
  const peak = points.reduce(
    (currentPeak, point) => point.reservation_count > currentPeak.reservation_count ? point : currentPeak,
    points[0],
  );
  const chartWidth = 860;
  const chartHeight = 260;
  const padding = { bottom: 38, left: 46, right: 24, top: 18 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  const chartPoints = points.map((point, index) => {
    const x = points.length === 1
      ? padding.left + plotWidth / 2
      : padding.left + (index / (points.length - 1)) * plotWidth;
    const y = padding.top + plotHeight - (point.reservation_count / maxCount) * plotHeight;
    return { ...point, x, y };
  });
  const linePath = chartPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const baselineY = padding.top + plotHeight;
  const areaPath = `${linePath} L ${chartPoints.at(-1)?.x ?? padding.left} ${baselineY} L ${chartPoints[0]?.x ?? padding.left} ${baselineY} Z`;
  const labelStep = Math.max(1, Math.ceil(points.length / 6));
  const yTicks = [maxCount, Math.round(maxCount / 2), 0];

  return (
    <div className="p-6 max-md:p-4">
      <div className="mb-5 grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3">
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Total Tren</p>
          <p className="m-0 mt-1 text-xl font-bold text-[#111827]">{totalCount}</p>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3">
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Puncak</p>
          <p className="m-0 mt-1 text-xl font-bold text-[#111827]">
            {peak.reservation_count} <span className="text-xs text-[#6b7280]">{peak.shortLabel}</span>
          </p>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] p-3">
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Pembayaran</p>
          <p className="m-0 mt-1 text-xl font-bold text-[#111827]">{formatRupiah(totalPaid)}</p>
        </div>
      </div>
      <div
        aria-label="Grafik tren reservasi"
        className="relative overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f8fafc]"
        role="img"
      >
        <svg className="block h-[280px] w-full max-md:h-[240px]" preserveAspectRatio="none" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <defs>
            <linearGradient id={`reservation-trend-fill-${mode}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {yTicks.map((tick) => {
            const y = padding.top + plotHeight - (tick / maxCount) * plotHeight;
            return (
              <g key={tick}>
                <line stroke="#e5e7eb" strokeDasharray="4 6" x1={padding.left} x2={chartWidth - padding.right} y1={y} y2={y} />
                <text fill="#64748b" fontSize="10" fontWeight="700" x="12" y={y + 4}>
                  {tick}
                </text>
              </g>
            );
          })}
          <path d={areaPath} fill={`url(#reservation-trend-fill-${mode})`} />
          <path d={linePath} fill="none" stroke="#059669" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
          {chartPoints.map((point, index) =>
            index % labelStep === 0 || index === chartPoints.length - 1 ? (
              <text
                fill="#64748b"
                fontSize="10"
                fontWeight="700"
                key={point.date}
                textAnchor="middle"
                x={point.x}
                y={chartHeight - 12}
              >
                {point.shortLabel}
              </text>
            ) : null,
          )}
        </svg>
        {chartPoints.map((point) => {
          const label = `${point.label}: ${point.reservation_count} reservasi, ${formatRupiah(point.paid_total_rupiah)}`;
          return (
            <button
              aria-label={label}
              className="group absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#059669] shadow-[0_2px_8px_rgba(5,150,105,0.35)] outline-none focus-visible:ring-2 focus-visible:ring-[#0f9d58] focus-visible:ring-offset-2"
              key={point.date}
              style={{
                left: `${(point.x / chartWidth) * 100}%`,
                top: `${(point.y / chartHeight) * 100}%`,
              }}
              title={label}
              type="button"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-6 left-1/2 z-20 hidden min-w-[190px] -translate-x-1/2 rounded-lg bg-[#0f172a] px-3 py-2 text-center text-xs font-semibold leading-5 text-white shadow-lg group-hover:block group-focus:block"
              >
                {point.label}
                <br />
                {point.reservation_count} reservasi
                <br />
                {formatRupiah(point.paid_total_rupiah)}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between gap-4 text-xs font-semibold text-[#6b7280] max-md:grid">
        <span>Granularitas: {reportTrendModeLabels[mode]}</span>
        <span>Hover titik grafik untuk melihat detail.</span>
      </div>
    </div>
  );
}

function TrendModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`min-h-10 rounded-lg px-4 text-xs font-bold transition ${
        active
          ? "bg-[#0f9d58] text-white"
          : "border border-[#e5e7eb] bg-white text-[#475569] hover:bg-[#f8fafc]"
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ReportRangeControls({
  mode,
  range,
  setMode,
  setRange,
}: {
  mode: ReportTrendMode;
  range: ReportDateRange;
  setMode: (mode: ReportTrendMode) => void;
  setRange: (range: ReportDateRange) => void;
}) {
  return (
    <section className="mb-6 grid grid-cols-[auto_180px_180px] gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-lg:grid-cols-1">
      <div aria-label="Granularitas tren laporan" className="flex flex-wrap gap-2">
        {(["weekly", "monthly", "yearly"] as const).map((nextMode) => (
          <TrendModeButton
            active={mode === nextMode}
            key={nextMode}
            onClick={() => setMode(nextMode)}
          >
            {reportTrendModeLabels[nextMode]}
          </TrendModeButton>
        ))}
      </div>
      <input
        aria-label="Tanggal mulai laporan"
        className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
        onChange={(event) => setRange({ ...range, start: event.target.value })}
        type="date"
        value={range.start}
      />
      <input
        aria-label="Tanggal akhir laporan"
        className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
        onChange={(event) => setRange({ ...range, end: event.target.value })}
        type="date"
        value={range.end}
      />
    </section>
  );
}

export function SuperAdminReportsPage() {
  const queryClient = useQueryClient();
  const [range, setRange] = useState<ReportDateRange>({ end: "2026-05-31", start: "2026-05-01" });
  const [trendMode, setTrendMode] = useState<ReportTrendMode>("weekly");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const rangeError = range.start && range.end && range.start > range.end
    ? "Tanggal mulai tidak boleh setelah tanggal akhir."
    : "";
  const aggregateQuery = useQuery({
    enabled: !rangeError,
    queryFn: () => fetchReportAggregate(range),
    queryKey: ["super-admin", "reports", "aggregate", range],
  });
  const auditQuery = useQuery({
    enabled: !rangeError,
    queryFn: () => fetchAdminAuditLogs(range),
    queryKey: ["super-admin", "reports", "audit", range],
  });
  const reviewsQuery = useQuery({
    queryFn: fetchAdminReviews,
    queryKey: ["super-admin", "reports", "reviews"],
  });
  const aggregate = aggregateQuery.data;
  const trendPoints = aggregate ? aggregateTrendPoints(aggregate.trend, trendMode) : [];
  const auditLogs = auditQuery.data ?? [];
  const previewAuditLogs = auditLogs.filter((item) => item.target_type !== "endpoint").slice(0, 10);
  const hasMoreAuditLogs = auditLogs.filter((item) => item.target_type !== "endpoint").length > previewAuditLogs.length;
  const reviews = reviewsQuery.data ?? [];
  const reviewMutation = useMutation({
    mutationFn: ({ action, reviewId }: { action: "delete" | "restore" | "permanent-delete"; reviewId: string }) => {
      if (action === "delete") {
        return deleteAdminReview(reviewId);
      }
      if (action === "restore") {
        return restoreAdminReview(reviewId);
      }
      return permanentlyDeleteAdminReview(reviewId);
    },
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Moderasi ulasan belum dapat diperbarui."));
    },
    onSuccess: async (_, variables) => {
      setFormError("");
      setMessage(variables.action === "permanent-delete" ? "Ulasan dihapus permanen." : "Moderasi ulasan diperbarui.");
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "reports", "reviews"] });
    },
  });
  const reportError = aggregateQuery.isError || auditQuery.isError || reviewsQuery.isError;

  return (
    <SuperAdminShell active="reports">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Ringkasan reservasi, log audit, dan moderasi ulasan untuk pengawasan lintas platform."
          title="Laporan"
        >
          <span className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-5 text-sm font-bold text-[#111827] max-md:min-h-11 max-md:w-full max-md:px-3 max-md:text-[13px]">
            Rentang Waktu
          </span>
          <SuperButton
            onClick={() => {
              const rows = [
                ...(aggregate
                  ? [
                      { item: "total_reservations", section: "kpi", value: aggregate.kpis.total_reservations },
                      { item: "approved_reservations", section: "kpi", value: aggregate.kpis.approved_reservations },
                      { item: "completed_reservations", section: "kpi", value: aggregate.kpis.completed_reservations },
                      { item: "paid_total", section: "kpi", value: aggregate.kpis.paid_reservation_total_rupiah },
                    ]
                  : []),
                ...auditLogs.map((log) => ({
                  item: `${log.actor_email ?? "Sistem"} - ${auditActionLabel(log.action_type)}`,
                  section: "audit",
                  value: log.created_at,
                })),
                ...reviews.map((review) => ({
                  item: `${review.student_name} - ${review.facility_name}`,
                  section: "review",
                  value: review.comment ?? "",
                })),
              ];
              const exported = downloadCsv("super-admin-laporan.csv", rows);
              setFormError(exported ? "" : "Tidak ada data laporan untuk diekspor.");
              setMessage(exported ? "CSV laporan diunduh." : "");
            }}
          >
            Ekspor Laporan
          </SuperButton>
        </PageHeader>

        <ReportRangeControls mode={trendMode} range={range} setMode={setTrendMode} setRange={setRange} />
        {rangeError ? (
          <p className="mb-6 mt-[-14px] rounded-lg border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm font-semibold text-[#b91c1c]">
            {rangeError}
          </p>
        ) : null}

        <section className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          <PlainKpiCard label="Reservasi Bulan Ini" value={aggregate ? String(aggregate.kpis.total_reservations) : "-"} />
          <PlainKpiCard label="Disetujui" value={aggregate ? String(aggregate.kpis.approved_reservations) : "-"} />
          <PlainKpiCard label="Selesai" value={aggregate ? String(aggregate.kpis.completed_reservations) : "-"} />
          <PlainKpiCard
            label="Total Pembayaran"
            value={aggregate ? formatRupiah(aggregate.kpis.paid_reservation_total_rupiah) : "-"}
          />
        </section>

        {message ? (
          <div className="mt-4 rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#0b7340]">
            {message}
          </div>
        ) : null}
        {formError ? (
          <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm font-semibold text-[#dc2626]">
            {formError}
          </div>
        ) : null}
        {reportError ? (
          <DashboardStateMessage
            actionLabel="Muat ulang laporan"
            onRetry={() => {
              void aggregateQuery.refetch();
              void auditQuery.refetch();
              void reviewsQuery.refetch();
            }}
          >
            Laporan belum dapat dimuat.
          </DashboardStateMessage>
        ) : null}

        <div className="mt-7 grid grid-cols-[1.4fr_1fr] gap-7 max-lg:grid-cols-1">
          <SectionCard link="" title={`Tren Reservasi ${reportTrendModeLabels[trendMode]}`}>
            {trendPoints.length ? <TrendChart mode={trendMode} points={trendPoints} /> : null}
            {aggregateQuery.isLoading ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                Memuat tren reservasi...
              </div>
            ) : null}
            {aggregateQuery.isSuccess && aggregate && !aggregate.trend.length ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                Belum ada tren reservasi untuk rentang ini.
              </div>
            ) : null}
            {aggregate ? (
              <div className="flex flex-wrap gap-2 border-t border-[#e5e7eb] p-4 text-xs font-bold text-[#475569]">
                {Object.entries(aggregate.status_counts).map(([status, count]) => (
                  <span className="rounded-full bg-[#f8fafc] px-3 py-1.5" key={status}>
                    {reportStatusLabel(status)}: {count}
                  </span>
                ))}
              </div>
            ) : null}
          </SectionCard>

          <section className="rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="m-0 text-lg font-bold">Log Audit Terbaru</h2>
                <p className="m-0 mt-1 text-xs font-semibold text-[#6b7280]">
                  Menampilkan maksimal 10 log terakhir.
                </p>
              </div>
              <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-bold text-[#6b7280]">
                {Math.min(auditLogs.length, 10)}/10
              </span>
            </div>
            <div className="mt-4 grid max-h-[460px] overflow-y-auto pr-1">
              {previewAuditLogs.map((item) => (
                <article className="flex gap-4 border-t border-[#e5e7eb] py-4 first:border-t-0" key={item.id}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f5e9] text-[#0f9d58]">
                    <SuperIcon name="settings" size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 break-words text-sm font-bold">
                      {item.actor_email ?? "Sistem"} - {auditActionLabel(item.action_type)}
                    </p>
                    <p className="m-0 mt-1 break-words text-xs text-[#6b7280]">{formatAuditTime(item.created_at)}</p>
                  </div>
                </article>
              ))}
            </div>
            {hasMoreAuditLogs ? (
              <a
                className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#d1fae5] bg-[#f0fdf4] px-4 text-sm font-bold text-[#047857] no-underline"
                href="/super-admin/reports/logs"
              >
                Lihat semua log
              </a>
            ) : null}
            {auditQuery.isSuccess && auditLogs.length === 0 ? (
              <div className="mt-4 text-sm font-semibold text-[#6b7280]">
                Belum ada log audit untuk rentang ini.
              </div>
            ) : null}
          </section>
        </div>

        <section className="mt-7 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:border-0 max-md:bg-transparent max-md:shadow-none">
          <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[#e5e7eb] px-6 max-md:min-h-12 max-md:border-0 max-md:px-0">
            <h2 className="m-0 text-lg font-bold text-[#111827]">Moderasi Ulasan</h2>
            <span className="text-sm font-bold text-[#6b7280]">Semua ulasan termuat</span>
          </div>
          <table className="w-full border-collapse max-md:hidden">
            <thead className="bg-[#f9fafb] text-left text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
              <tr>
                <th className="px-5 py-3">Ulasan</th>
                <th className="px-5 py-3">Fasilitas</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((row) => (
                <tr className="border-t border-[#e5e7eb]" key={row.id}>
                  <td className="px-5 py-4">
                    <p className="m-0 text-sm font-bold">{row.comment ?? "Tanpa komentar"}</p>
                    <p className="m-0 mt-1 text-xs text-[#6b7280]">
                      {row.student_name} - {row.rating}/5 - {formatAuditTime(row.created_at)}
                    </p>
                  </td>
                  <td className="px-5 py-4">{row.facility_name}</td>
                  <td className="px-5 py-4"><StatusBadge status={row.is_deleted ? "Disembunyikan" : "Aktif"} /></td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        aria-label={`${row.is_deleted ? "Pulihkan" : "Sembunyikan"} review ${row.id}`}
                        className={tableActionButtonClass(row.is_deleted ? "primary" : "danger")}
                        disabled={reviewMutation.isPending}
                        onClick={() =>
                          reviewMutation.mutate({ action: row.is_deleted ? "restore" : "delete", reviewId: row.id })
                        }
                        type="button"
                      >
                        {row.is_deleted ? "Pulihkan" : "Sembunyikan"}
                      </button>
                      {row.is_deleted ? (
                        <button
                          aria-label={`Hapus permanen review ${row.id}`}
                          className={tableActionButtonClass("danger")}
                          disabled={reviewMutation.isPending}
                          onClick={() => reviewMutation.mutate({ action: "permanent-delete", reviewId: row.id })}
                          type="button"
                        >
                          Hapus Permanen
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="hidden gap-4 max-md:grid">
            {reviews.map((row) => (
              <article className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]" key={row.id}>
                <UserField label="Ulasan">
                  <strong>{row.comment ?? "Tanpa komentar"}</strong>
                  <span className="block text-xs text-[#6b7280]">
                    {row.student_name} - {row.rating}/5 - {formatAuditTime(row.created_at)}
                  </span>
                </UserField>
                <UserField label="Fasilitas">{row.facility_name}</UserField>
                <UserField label="Status"><StatusBadge status={row.is_deleted ? "Disembunyikan" : "Aktif"} /></UserField>
                <UserField label="Aksi">
                  <div className="flex flex-wrap gap-2">
                    <button
                      aria-label={`${row.is_deleted ? "Pulihkan" : "Sembunyikan"} review ${row.id}`}
                      className={tableActionButtonClass(row.is_deleted ? "primary" : "danger")}
                      disabled={reviewMutation.isPending}
                      onClick={() =>
                        reviewMutation.mutate({ action: row.is_deleted ? "restore" : "delete", reviewId: row.id })
                      }
                      type="button"
                    >
                      {row.is_deleted ? "Pulihkan" : "Sembunyikan"}
                    </button>
                    {row.is_deleted ? (
                      <button
                        aria-label={`Hapus permanen review ${row.id}`}
                        className={tableActionButtonClass("danger")}
                        disabled={reviewMutation.isPending}
                        onClick={() => reviewMutation.mutate({ action: "permanent-delete", reviewId: row.id })}
                        type="button"
                      >
                        Hapus Permanen
                      </button>
                    ) : null}
                  </div>
                </UserField>
              </article>
            ))}
          </div>
          {reviewsQuery.isLoading ? (
            <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
              Memuat ulasan...
            </div>
          ) : null}
          {reviewsQuery.isSuccess && reviews.length === 0 ? (
            <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
              Belum ada ulasan untuk dimoderasi.
            </div>
          ) : null}
        </section>
      </main>
    </SuperAdminShell>
  );
}

export function SuperAdminAuditLogsPage() {
  const [auditLimit, setAuditLimit] = useState(20);
  const [filters, setFilters] = useState<AuditLogFilters>({
    actionType: "all",
    actorEmail: "",
    from: "",
    statusCode: "all",
    targetSearch: "",
    to: "",
  });
  const auditQuery = useQuery({
    queryFn: () => fetchFullAdminAuditLogs(filters, auditLimit),
    queryKey: ["super-admin", "reports", "audit", "all", filters, auditLimit],
  });
  const auditLogs = auditQuery.data ?? [];
  const hasMoreAuditLogs = auditLogs.length === auditLimit;
  const topEndpoint = topEndpointSummary(auditLogs);
  const topActor = topActorSummary(auditLogs);

  return (
    <SuperAdminShell active="reports">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Telusuri log audit administratif lengkap dari sistem."
          title="Log Audit"
        >
          <a
            className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-5 text-sm font-bold text-[#111827] no-underline max-md:min-h-11 max-md:w-full"
            href="/super-admin/reports"
          >
            Kembali ke Laporan
          </a>
        </PageHeader>

        {auditQuery.isError ? (
          <DashboardStateMessage actionLabel="Muat ulang log" onRetry={() => void auditQuery.refetch()}>
            Log audit belum dapat dimuat.
          </DashboardStateMessage>
        ) : null}

        <section className="mt-7 rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:p-5">
          <div className="grid grid-cols-6 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
            <label className="grid gap-2 text-sm font-bold text-[#374151]">
              Aktivitas
              <select
                className="min-h-11 rounded-lg border border-[#d1d5db] px-3 text-sm font-medium text-[#111827]"
                onChange={(event) => {
                  setAuditLimit(20);
                  setFilters((current) => ({ ...current, actionType: event.target.value }));
                }}
                value={filters.actionType}
              >
                <option value="all">Semua</option>
                <option value="auth.login">Login berhasil</option>
                <option value="auth.logout">Logout</option>
                <option value="request.200">Akses endpoint 200</option>
                <option value="request.201">Akses endpoint 201</option>
                <option value="request.204">Akses endpoint 204</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#374151]">
              Aktor
              <input
                className="min-h-11 rounded-lg border border-[#d1d5db] px-3 text-sm font-medium text-[#111827]"
                onChange={(event) => {
                  setAuditLimit(20);
                  setFilters((current) => ({ ...current, actorEmail: event.target.value }));
                }}
                placeholder="admin@ipb.ac.id"
                value={filters.actorEmail}
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#374151]">
              Target
              <input
                className="min-h-11 rounded-lg border border-[#d1d5db] px-3 text-sm font-medium text-[#111827]"
                onChange={(event) => {
                  setAuditLimit(20);
                  setFilters((current) => ({ ...current, targetSearch: event.target.value }));
                }}
                placeholder="/admin/system-status"
                value={filters.targetSearch}
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#374151]">
              Status
              <select
                className="min-h-11 rounded-lg border border-[#d1d5db] px-3 text-sm font-medium text-[#111827]"
                onChange={(event) => {
                  setAuditLimit(20);
                  setFilters((current) => ({ ...current, statusCode: event.target.value }));
                }}
                value={filters.statusCode}
              >
                <option value="all">Semua</option>
                <option value="200">200</option>
                <option value="201">201</option>
                <option value="204">204</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#374151]">
              Dari
              <input
                className="min-h-11 rounded-lg border border-[#d1d5db] px-3 text-sm font-medium text-[#111827]"
                onChange={(event) => {
                  setAuditLimit(20);
                  setFilters((current) => ({ ...current, from: event.target.value }));
                }}
                type="date"
                value={filters.from}
              />
            </label>
            <label className="grid gap-2 text-sm font-bold text-[#374151]">
              Sampai
              <input
                className="min-h-11 rounded-lg border border-[#d1d5db] px-3 text-sm font-medium text-[#111827]"
                onChange={(event) => {
                  setAuditLimit(20);
                  setFilters((current) => ({ ...current, to: event.target.value }));
                }}
                type="date"
                value={filters.to}
              />
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-bold text-[#111827]"
              onClick={() => {
                setAuditLimit(20);
                setFilters({ actionType: "all", actorEmail: "", from: "", statusCode: "all", targetSearch: "", to: "" });
              }}
              type="button"
            >
              Reset Filter
            </button>
          </div>
        </section>

        <section className="mt-7 grid grid-cols-3 gap-5 max-lg:grid-cols-1">
          <PlainKpiCard label="Total Log" value={String(auditLogs.length)} />
          <PlainKpiCard
            label="Top Endpoint"
            value={topEndpoint.endpoint}
            sub={topEndpoint.count > 0 ? `${topEndpoint.count} akses` : "Belum ada akses endpoint"}
          />
          <PlainKpiCard
            label="Aktor Teraktif"
            value={topActor.actor}
            sub={topActor.count > 0 ? `${topActor.count} aktivitas` : "Belum ada aktor"}
          />
        </section>

        <section className="mt-7 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
          <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[#e5e7eb] px-6 max-md:px-5">
            <h2 className="m-0 text-lg font-bold text-[#111827]">Semua Log Audit</h2>
            <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs font-bold text-[#6b7280]">
              {auditLogs.length} log
            </span>
          </div>
          <table className="w-full border-collapse max-md:hidden">
            <thead className="bg-[#f9fafb] text-left text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
              <tr>
                <th className="px-5 py-3">Waktu</th>
                <th className="px-5 py-3">Aktor</th>
                <th className="px-5 py-3">Aktivitas</th>
                <th className="px-5 py-3">Target</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((item) => (
                <tr className="border-t border-[#e5e7eb]" key={item.id}>
                  <td className="px-5 py-4 text-xs font-semibold text-[#6b7280]">{formatAuditTime(item.created_at)}</td>
                  <td className="px-5 py-4 text-sm font-bold">{item.actor_email ?? "Sistem"}</td>
                  <td className="px-5 py-4 text-sm font-semibold">{auditActionLabel(item.action_type)}</td>
                  <td className="px-5 py-4 text-sm text-[#374151]">{auditTargetLabel(item)}</td>
                  <td className="px-5 py-4"><StatusBadge status={auditStatusCode(item.action_type)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="hidden gap-4 p-4 max-md:grid">
            {auditLogs.map((item) => (
              <article className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]" key={item.id}>
                <UserField label="Waktu">{formatAuditTime(item.created_at)}</UserField>
                <UserField label="Aktor">{item.actor_email ?? "Sistem"}</UserField>
                <UserField label="Aktivitas">{auditActionLabel(item.action_type)}</UserField>
                <UserField label="Target">{auditTargetLabel(item)}</UserField>
                <UserField label="Status"><StatusBadge status={auditStatusCode(item.action_type)} /></UserField>
              </article>
            ))}
          </div>
          {hasMoreAuditLogs ? (
            <div className="border-t border-[#e5e7eb] px-6 py-4 max-md:px-5">
              <button
                className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#d1fae5] bg-[#f0fdf4] px-4 text-sm font-bold text-[#047857] no-underline"
                onClick={() => setAuditLimit((current) => current + 20)}
                type="button"
              >
                {auditQuery.isFetching ? "Memuat..." : "Muat lebih banyak"}
              </button>
            </div>
          ) : null}
          {auditQuery.isLoading ? (
            <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
              Memuat log audit...
            </div>
          ) : null}
          {auditQuery.isSuccess && auditLogs.length === 0 ? (
            <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
              Belum ada log audit.
            </div>
          ) : null}
        </section>
      </main>
    </SuperAdminShell>
  );
}

function SectionCard({
  children,
  link,
  linkHref,
  title,
}: {
  children: ReactNode;
  link: string;
  linkHref?: string;
  title: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
      <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[#e5e7eb] px-6 max-md:px-5">
        <h2 className="m-0 text-lg font-bold text-[#111827] max-md:max-w-[180px]">{title}</h2>
        {link && linkHref ? (
          <a className="text-sm font-bold text-[#0f9d58] no-underline" href={linkHref}>
            {link}
          </a>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function SuperAdminDashboardPage() {
  const dashboardQuery = useQuery({
    queryFn: fetchSuperAdminDashboard,
    queryKey: ["super-admin", "dashboard"],
  });
  const dashboard = dashboardQuery.data;
  const administrators = dashboard?.administrators ?? [];
  const administratorsPreview = administrators.slice(0, 5);
  const facilities = dashboard?.facility_governance ?? [];
  const facilitiesPreview = facilities.slice(0, 5);
  const activity = dashboard?.recent_activity ?? [];
  const activityPreview = activity.slice(0, 5);
  const kpis = dashboard
    ? [
        {
          icon: "users",
          label: "Total Pengguna",
          tone: "green" as const,
          value: String(dashboard.kpis.total_users),
        },
        {
          icon: "building",
          label: "Fasilitas Aktif",
          tone: "green" as const,
          value: String(dashboard.kpis.active_facilities),
        },
        {
          icon: "calendar",
          label: "Total Reservasi",
          tone: "blue" as const,
          value: String(dashboard.kpis.total_reservations),
        },
        {
          icon: "settings",
          label: "Kesehatan Sistem",
          tone: dashboard.kpis.system_health === "ok" ? ("green" as const) : ("orange" as const),
          value: healthLabel(dashboard.kpis.system_health),
        },
      ]
    : [];

  return (
    <SuperAdminShell active="dashboard">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Pantau kesehatan sistem, pengguna, fasilitas, dan aktivitas administratif lintas platform."
          title="Dashboard Super Admin"
        >
          <SuperButton
            onClick={() => {
              if (!dashboard) return;
              const exported = downloadCsv(
                "super-admin-dashboard.csv",
                [
                  {
                    email: "",
                    full_name: "Ringkasan KPI",
                    is_active: "",
                    metric: "total_users",
                    role: "",
                    value: dashboard.kpis.total_users,
                  },
                  {
                    email: "",
                    full_name: "Ringkasan KPI",
                    is_active: "",
                    metric: "active_facilities",
                    role: "",
                    value: dashboard.kpis.active_facilities,
                  },
                  {
                    email: "",
                    full_name: "Ringkasan KPI",
                    is_active: "",
                    metric: "total_reservations",
                    role: "",
                    value: dashboard.kpis.total_reservations,
                  },
                  {
                    email: "",
                    full_name: "Ringkasan KPI",
                    is_active: "",
                    metric: "system_health",
                    role: "",
                    value: dashboard.kpis.system_health,
                  },
                  ...administrators.map((admin) => ({
                    email: admin.email,
                    full_name: admin.full_name,
                    is_active: admin.is_active,
                    metric: "administrator",
                    role: admin.role,
                    value: "",
                  })),
                ],
              );
              if (!exported) return;
            }}
          >
            Ekspor Laporan
          </SuperButton>
          <a
            className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg border border-[#0f9d58] bg-[#0f9d58] px-5 text-sm font-bold text-white no-underline max-md:min-h-11 max-md:w-full max-md:gap-1.5 max-md:px-3 max-md:text-[13px]"
            href="/super-admin/users"
          >
            <Plus aria-hidden="true" size={15} />
            Tambah Pengguna
          </a>
        </PageHeader>

        {dashboardQuery.isLoading ? <DashboardStateMessage>Memuat dashboard super admin...</DashboardStateMessage> : null}
        {dashboardQuery.isError ? (
          <DashboardStateMessage actionLabel="Muat ulang dashboard" onRetry={() => void dashboardQuery.refetch()}>
            Dashboard super admin belum dapat dimuat.
          </DashboardStateMessage>
        ) : null}

        {dashboard ? (
        <>
        <section className="grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-6">
          {kpis.map((kpi) => (
            <KpiCard
              icon={kpi.icon}
              key={kpi.label}
              label={kpi.label}
              tone={kpi.tone}
              value={kpi.value}
            />
          ))}
        </section>

        <div className="mt-8 grid grid-cols-[2fr_1fr] gap-8 max-lg:grid-cols-1 max-md:gap-6">
          <SectionCard link="Lihat Semua" linkHref="/super-admin/users" title="Administrator Departemen">
            <table className="w-full border-collapse max-md:hidden">
              <thead className="bg-[#f9fafb] text-left text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
                <tr>
                  <th className="px-6 py-3">Administrator</th>
                  <th className="px-6 py-3">Departemen</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Catatan Akses</th>
                </tr>
              </thead>
              <tbody>
                {administratorsPreview.map((admin) => (
                  <tr className="border-t border-[#e5e7eb]" key={admin.id}>
                    <td className="px-6 py-4">
                      <p className="m-0 text-sm font-bold">{admin.full_name}</p>
                      <p className="m-0 mt-1 text-xs text-[#6b7280]">{admin.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="m-0 text-sm font-bold">Super Admin</p>
                      <p className="m-0 mt-1 text-xs text-[#6b7280]">{admin.role}</p>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={activeLabel(admin.is_active)} /></td>
                    <td className="px-6 py-4 text-sm text-[#6b7280]">
                      {admin.is_active ? "Akses aktif" : "Akses nonaktif"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="hidden max-md:grid">
              {administratorsPreview.map((admin) => (
                <article className="grid grid-cols-[1fr_auto] gap-4 border-t border-[#e5e7eb] p-4" key={admin.id}>
                  <div className="min-w-0">
                    <h3 className="m-0 break-words text-sm font-bold">{admin.full_name}</h3>
                    <p className="m-0 mt-1 break-words text-xs text-[#6b7280]">{admin.email}</p>
                    <p className="m-0 mt-5 break-words text-sm font-bold">Super Admin</p>
                    <p className="m-0 mt-1 text-xs text-[#6b7280]">{admin.role}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-6">
                    <StatusBadge status={activeLabel(admin.is_active)} />
                    <p className="m-0 text-xs text-[#6b7280]">
                      {admin.is_active ? "Akses aktif" : "Akses nonaktif"}
                    </p>
                  </div>
                </article>
              ))}
            </div>
            {administrators.length === 0 ? (
              <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
                Belum ada administrator untuk ditampilkan.
              </div>
            ) : null}
          </SectionCard>

          <section className="relative overflow-hidden rounded-xl border border-[#dbeafe] bg-[#f8fafc] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
            <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[#dbeafe] px-6 max-md:px-5">
              <h2 className="m-0 text-lg font-bold text-[#111827] max-md:max-w-[180px]">Log Aktivitas Sistem</h2>
              <a className="text-sm font-bold text-[#0f9d58] no-underline" href="/super-admin/reports/logs">
                Lihat Semua
              </a>
            </div>
            <ul className="m-0 list-none p-0">
              {activityPreview.map((item) => (
                <li className="flex gap-4 border-t border-[#dbeafe] px-6 py-4 first:border-t-0 max-md:px-5" key={item.id}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#0f766e]">
                    <SuperIcon name="settings" size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 break-words text-sm leading-5 text-[#111827]">
                      {dashboardActivityText(item)}
                    </p>
                    <p className="m-0 mt-2 text-xs text-[#6b7280]">{formatAuditTime(item.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
            {activity.length === 0 ? (
              <div className="border-t border-[#dbeafe] p-6 text-sm font-semibold text-[#6b7280]">
                Belum ada aktivitas sistem terbaru.
              </div>
            ) : null}
          </section>
        </div>

        <div className="mt-8">
        <SectionCard link="Lihat Semua" linkHref="/super-admin/facilities" title="Tata Kelola Fasilitas">
          <table className="w-full border-collapse max-md:hidden">
            <thead className="bg-[#f9fafb] text-left text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
              <tr>
                <th className="px-6 py-3">Fasilitas</th>
                <th className="px-6 py-3">Kapasitas</th>
                <th className="px-6 py-3">Staff</th>
                <th className="px-6 py-3">Status</th>
              </tr>
              </thead>
              <tbody>
              {facilitiesPreview.map((facility) => (
                <tr className="border-t border-[#e5e7eb]" key={facility.id}>
                  <td className="px-6 py-4">
                    <p className="m-0 text-sm font-bold">{facility.name}</p>
                    <p className="m-0 mt-1 text-xs text-[#6b7280]">
                      {facility.category} - {facility.location}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6b7280]">{facility.capacity}</td>
                  <td className="px-6 py-4 text-sm text-[#6b7280]">
                    {facility.active_assigned_staff_count}/{facility.assigned_staff_count} aktif
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={facility.is_active ? coverageLabel(facility.assignment_coverage) : "Nonaktif"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="hidden max-md:grid">
            {facilitiesPreview.map((facility) => (
              <article className="grid grid-cols-[1fr_auto] gap-4 border-t border-[#e5e7eb] p-4" key={facility.id}>
                <div className="min-w-0">
                  <h3 className="m-0 break-words text-sm font-bold">{facility.name}</h3>
                  <p className="m-0 mt-1 text-xs text-[#6b7280]">
                    {facility.category} - {facility.location}
                  </p>
                  <p className="m-0 mt-4 text-xs text-[#6b7280]">
                    {facility.active_assigned_staff_count}/{facility.assigned_staff_count} staff aktif
                  </p>
                </div>
                <StatusBadge status={facility.is_active ? coverageLabel(facility.assignment_coverage) : "Nonaktif"} />
              </article>
            ))}
          </div>
          {facilities.length === 0 ? (
            <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
              Belum ada data tata kelola fasilitas.
            </div>
          ) : null}
        </SectionCard>
        </div>
        </>
        ) : null}
      </main>
    </SuperAdminShell>
  );
}

export function SuperAdminUsersPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<UserFilters>({
    isActive: "all",
    page: 1,
    pageSize: 10,
    role: "all",
    search: "",
  });
  const [createForm, setCreateForm] = useState({
    email: "",
    fullName: "",
    nim: "",
    password: "",
    phone: "",
    role: "staff",
  });
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);
  const [userForm, setUserForm] = useState({ email: "", fullName: "", password: "" });
  const [userDeleteConfirm, setUserDeleteConfirm] = useState(false);
  const [userStatusDraft, setUserStatusDraft] = useState(true);
  const usersQuery = useQuery({
    queryFn: () => fetchAdminUsers(filters),
    queryKey: ["super-admin", "users", filters],
  });
  const users = usersQuery.data?.items ?? [];
  const totalUserPages = Math.max(1, Math.ceil((usersQuery.data?.total ?? 0) / filters.pageSize));
  const activeCount = users.filter((user) => user.is_active).length;
  const studentCount = users.filter((user) => user.role === "student").length;
  const staffCount = users.filter((user) => user.role === "staff").length;

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminUser({
        email: createForm.email.trim(),
        full_name: createForm.fullName.trim(),
        is_active: true,
        ...(createForm.role === "student"
          ? { nim: createForm.nim.trim(), phone: createForm.phone.trim() }
          : {}),
        password: createForm.password,
        role: createForm.role,
      }),
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Pengguna belum dapat dibuat."));
    },
    onSuccess: async () => {
      setCreateForm({ email: "", fullName: "", nim: "", password: "", phone: "", role: "staff" });
      setFormError("");
      setMessage("Pengguna baru dibuat.");
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "users"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ active, userId }: { active: boolean; userId: string }) => setAdminUserStatus(userId, active),
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Status pengguna belum dapat diperbarui."));
    },
    onSuccess: async () => {
      setFormError("");
      setMessage("Status pengguna diperbarui.");
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "users"] });
    },
  });
  const updateUserMutation = useMutation({
    mutationFn: ({ email, fullName, userId }: { email: string; fullName: string; userId: string }) =>
      updateAdminUser(userId, { email, full_name: fullName }),
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Data pengguna belum dapat diperbarui."));
    },
    onSuccess: async () => {
      setFormError("");
      setMessage("Data pengguna diperbarui.");
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "users"] });
    },
  });
  const resetPasswordMutation = useMutation({
    mutationFn: ({ password, userId }: { password: string; userId: string }) =>
      resetAdminUserPassword(userId, { password }),
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Password belum dapat diperbarui."));
    },
    onSuccess: async () => {
      setFormError("");
      setMessage("Password pengguna diperbarui.");
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "users"] });
    },
  });
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => deleteAdminUser(userId),
    onError: (error) => {
      setMessage("");
      setFormError(errorMessage(error, "Pengguna belum dapat dihapus."));
    },
    onSuccess: async () => {
      setFormError("");
      setMessage("Pengguna dihapus.");
      setSelectedUser(null);
      await queryClient.invalidateQueries({ queryKey: ["super-admin", "users"] });
    },
  });
  const busy =
    createMutation.isPending ||
    statusMutation.isPending ||
    updateUserMutation.isPending ||
    resetPasswordMutation.isPending ||
    deleteUserMutation.isPending;

  return (
    <SuperAdminShell active="users">
      <main className="mx-auto mt-30 w-[1200px] max-w-[95%] pt-[50px] max-md:mt-16 max-md:max-w-full max-md:px-4 max-md:pt-8">
        <PageHeader
          description="Kelola akun mahasiswa, staff fasilitas, dan Super Admin dengan status akses yang jelas."
          title="Pengguna"
        >
          <SuperButton
            onClick={() => {
              const exported = downloadCsv(
                "super-admin-pengguna.csv",
                users.map((user) => ({
                  email: user.email,
                  full_name: user.full_name,
                  is_active: user.is_active,
                  nim: user.nim,
                  phone: user.phone,
                  role: user.role,
                  unit: userProfileText(user),
                })),
              );
              setFormError(exported ? "" : "Tidak ada pengguna untuk diekspor.");
              setMessage(exported ? "CSV pengguna diunduh." : "");
            }}
          >
            Ekspor CSV
          </SuperButton>
        </PageHeader>

        <section className="grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-5">
          {[
            { icon: "users", label: "Total Akun", value: String(usersQuery.data?.total ?? "-") },
            { icon: "user", label: "Akun Aktif", value: String(activeCount) },
            { icon: "graduation", label: "Mahasiswa", value: String(studentCount) },
            { icon: "briefcase", label: "Staff", value: String(staffCount) },
          ].map((kpi) => (
            <KpiCard icon={kpi.icon} key={kpi.label} label={kpi.label} value={kpi.value} />
          ))}
        </section>

        <form
          className="mt-7 grid grid-cols-[1fr_1fr_160px_160px_auto] gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-lg:grid-cols-2 max-md:grid-cols-1"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <input
            aria-label="Email pengguna baru"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm"
            onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="email@ipb.ac.id"
            type="email"
            value={createForm.email}
          />
          <input
            aria-label="Nama pengguna baru"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm"
            onChange={(event) => setCreateForm((current) => ({ ...current, fullName: event.target.value }))}
            placeholder="Nama lengkap"
            value={createForm.fullName}
          />
          <input
            aria-label="Password pengguna baru"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm"
            onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Password"
            type="password"
            value={createForm.password}
          />
          <select
            aria-label="Role pengguna baru"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm"
            onChange={(event) => setCreateForm((current) => ({ ...current, role: event.target.value }))}
            value={createForm.role}
          >
            <option value="student">Mahasiswa</option>
            <option value="staff">Staff</option>
            <option value="super_admin">Super Admin</option>
          </select>
          {createForm.role === "student" ? (
            <>
              <input
                aria-label="NIM pengguna baru"
                className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm"
                onChange={(event) => setCreateForm((current) => ({ ...current, nim: event.target.value }))}
                placeholder="NIM"
                value={createForm.nim}
              />
              <input
                aria-label="Telepon pengguna baru"
                className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm"
                onChange={(event) => setCreateForm((current) => ({ ...current, phone: event.target.value }))}
                placeholder="Nomor telepon"
                value={createForm.phone}
              />
            </>
          ) : null}
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0f9d58] px-5 text-sm font-bold text-white disabled:opacity-60"
            disabled={
              busy ||
              !createForm.email ||
              !createForm.fullName ||
              !createForm.password ||
              (createForm.role === "student" && (!createForm.nim || !createForm.phone))
            }
            type="submit"
          >
            Buat Pengguna
          </button>
        </form>

        <section className="mt-6 grid grid-cols-[1fr_180px_180px] gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:grid-cols-1">
          <input
            aria-label="Cari pengguna"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            onChange={(event) => setFilters((current) => ({ ...current, page: 1, search: event.target.value }))}
            placeholder="Cari nama, email, atau NIM"
            value={filters.search}
          />
          <select
            aria-label="Filter role"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            onChange={(event) => setFilters((current) => ({ ...current, page: 1, role: event.target.value }))}
            value={filters.role}
          >
            <option value="all">Semua role</option>
            <option value="student">Mahasiswa</option>
            <option value="staff">Staff</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <select
            aria-label="Filter status"
            className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
            onChange={(event) => setFilters((current) => ({ ...current, isActive: event.target.value, page: 1 }))}
            value={filters.isActive}
          >
            <option value="all">Semua status</option>
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </section>

        {message ? (
          <div className="mt-4 rounded-lg border border-[#dcfce7] bg-[#f0fdf4] px-4 py-3 text-sm font-semibold text-[#0b7340]">
            {message}
          </div>
        ) : null}
        {formError ? (
          <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fee2e2] px-4 py-3 text-sm font-semibold text-[#dc2626]">
            {formError}
          </div>
        ) : null}
        {usersQuery.isError ? (
          <DashboardStateMessage actionLabel="Muat ulang pengguna" onRetry={() => void usersQuery.refetch()}>
            Daftar pengguna belum dapat dimuat.
          </DashboardStateMessage>
        ) : null}

        <section className="mt-6 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] max-md:border-0 max-md:bg-transparent max-md:shadow-none">
          <div className="flex min-h-[88px] items-center justify-between gap-4 border-b border-[#e5e7eb] px-6 max-md:min-h-12 max-md:border-0 max-md:px-0">
            <h2 className="m-0 text-lg font-bold text-[#111827]">Daftar Pengguna</h2>
            <span className="text-sm font-bold text-[#6b7280]">Filter standar aktif</span>
          </div>
          <table className="w-full border-collapse max-md:hidden">
            <thead className="bg-[#f9fafb] text-left text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
              <tr>
                <th className="px-5 py-3">Pengguna</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Unit</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr className="border-t border-[#e5e7eb]" key={user.id}>
                  <td className="px-5 py-4">
                    <p className="m-0 text-sm font-bold">{user.full_name}</p>
                    <p className="m-0 mt-1 text-xs text-[#6b7280]">{user.email}</p>
                    {user.nim ? <p className="m-0 mt-1 text-xs text-[#6b7280]">{user.nim}</p> : null}
                  </td>
                  <td className="px-5 py-4">{roleLabel(user.role)}</td>
                  <td className="px-5 py-4 text-sm text-[#6b7280]">{userProfileText(user)}</td>
                  <td className="px-5 py-4"><StatusBadge status={activeLabel(user.is_active)} /></td>
                  <td className="px-5 py-4">
                    <button
                      aria-label={`Kelola akun ${user.full_name}`}
                      className={tableActionButtonClass("secondary")}
                      disabled={busy}
                      onClick={() => {
                        setSelectedUser(user);
                        setUserForm({ email: user.email, fullName: user.full_name, password: "" });
                        setUserStatusDraft(user.is_active);
                        setUserDeleteConfirm(false);
                      }}
                      type="button"
                    >
                      Kelola akun
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="hidden gap-4 max-md:grid">
            {users.map((user) => (
              <article className="rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]" key={user.id}>
                <UserField label="Pengguna">
                  <strong>{user.full_name}</strong>
                  <span className="block break-words text-xs text-[#6b7280]">{user.email}</span>
                  {user.nim ? <span className="block break-words text-xs text-[#6b7280]">{user.nim}</span> : null}
                </UserField>
                <UserField label="Role">{roleLabel(user.role)}</UserField>
                <UserField label="Unit">{userProfileText(user)}</UserField>
                <UserField label="Status"><StatusBadge status={activeLabel(user.is_active)} /></UserField>
                <UserField label="Aksi">
                  <button
                    aria-label={`Kelola akun ${user.full_name}`}
                    className={tableActionButtonClass("secondary")}
                    disabled={busy}
                    onClick={() => {
                      setSelectedUser(user);
                      setUserForm({ email: user.email, fullName: user.full_name, password: "" });
                      setUserStatusDraft(user.is_active);
                      setUserDeleteConfirm(false);
                    }}
                    type="button"
                  >
                    Kelola akun
                  </button>
                </UserField>
              </article>
            ))}
          </div>
          {usersQuery.isSuccess && users.length > 0 ? (
            <PaginationControls
              className="border-t border-[#e5e7eb] px-5 py-4 max-md:mt-4 max-md:rounded-xl max-md:border max-md:bg-white"
              currentPage={filters.page}
              onNext={() => setFilters((current) => ({ ...current, page: Math.min(current.page + 1, totalUserPages) }))}
              onPageSizeChange={(value) => setFilters((current) => ({ ...current, page: 1, pageSize: value }))}
              onPrevious={() => setFilters((current) => ({ ...current, page: Math.max(current.page - 1, 1) }))}
              pageSize={filters.pageSize}
              pageSizeOptions={[10, 20, 50]}
              summary={`Menampilkan ${users.length} dari ${usersQuery.data?.total ?? 0} pengguna`}
              totalPages={totalUserPages}
            />
          ) : null}
          {usersQuery.isLoading ? (
            <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
              Memuat pengguna...
            </div>
          ) : null}
          {usersQuery.isSuccess && users.length === 0 ? (
            <div className="border-t border-[#e5e7eb] p-6 text-sm font-semibold text-[#6b7280]">
              <p className="m-0">Tidak ada pengguna untuk filter ini.</p>
              <button
                className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-[#0f9d58] px-4 text-sm font-bold text-white"
                onClick={() => void usersQuery.refetch()}
                type="button"
              >
                Muat ulang pengguna
              </button>
            </div>
          ) : null}
        </section>
        {selectedUser ? (
          <UserManagementModal
            busy={busy}
            onClose={() => setSelectedUser(null)}
            onDelete={() => deleteUserMutation.mutate(selectedUser.id)}
            onResetPassword={() => {
              if (!userForm.password.trim()) {
                setFormError("Isi password baru sebelum menyimpan.");
                return;
              }
              resetPasswordMutation.mutate({ password: userForm.password.trim(), userId: selectedUser.id });
            }}
            onSave={async () => {
              if (!userForm.email.trim() || !userForm.fullName.trim()) {
                setFormError("Email dan nama lengkap wajib diisi.");
                return;
              }
              if (userForm.email.trim() !== selectedUser.email || userForm.fullName.trim() !== selectedUser.full_name) {
                await updateUserMutation.mutateAsync({
                  email: userForm.email.trim(),
                  fullName: userForm.fullName.trim(),
                  userId: selectedUser.id,
                });
              }
              if (userStatusDraft !== selectedUser.is_active) {
                await statusMutation.mutateAsync({ active: userStatusDraft, userId: selectedUser.id });
              }
              if (userForm.password.trim()) {
                await resetPasswordMutation.mutateAsync({ password: userForm.password.trim(), userId: selectedUser.id });
              }
              setSelectedUser(null);
            }}
            onStatusChange={setUserStatusDraft}
            onToggleDeleteConfirm={() => setUserDeleteConfirm((current) => !current)}
            roleDisplay={roleLabel(selectedUser.role)}
            statusDraft={userStatusDraft}
            user={selectedUser}
            userDeleteConfirm={userDeleteConfirm}
            userForm={userForm}
            setUserForm={setUserForm}
          />
        ) : null}
      </main>
    </SuperAdminShell>
  );
}

function UserManagementModal({
  busy,
  onClose,
  onDelete,
  onResetPassword,
  onSave,
  onStatusChange,
  onToggleDeleteConfirm,
  roleDisplay,
  statusDraft,
  user,
  userDeleteConfirm,
  userForm,
  setUserForm,
}: {
  busy: boolean;
  onClose: () => void;
  onDelete: () => void;
  onResetPassword: () => void;
  onSave: () => Promise<void>;
  onStatusChange: (value: boolean) => void;
  onToggleDeleteConfirm: () => void;
  roleDisplay: string;
  statusDraft: boolean;
  user: AdminUserResponse;
  userDeleteConfirm: boolean;
  userForm: { email: string; fullName: string; password: string };
  setUserForm: React.Dispatch<React.SetStateAction<{ email: string; fullName: string; password: string }>>;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 px-4" onClick={onClose}>
      <section
        aria-label={`Kelola akun ${user.full_name}`}
        className="w-full max-w-[680px] rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-[0_24px_48px_rgba(15,23,42,0.18)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e5e7eb] pb-4">
          <div className="min-w-0">
            <h2 className="m-0 text-xl font-bold text-[#111827]">Kelola Akun</h2>
            <p className="m-0 mt-2 break-words text-sm text-[#6b7280]">
              {user.full_name} - {roleDisplay}
            </p>
          </div>
          <button className={tableActionButtonClass("secondary")} onClick={onClose} type="button">
            Tutup
          </button>
        </div>

        <div className="mt-5 grid gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-[#111827]">
              Email
              <input
                className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
                onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                type="email"
                value={userForm.email}
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-[#111827]">
              Nama lengkap
              <input
                className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
                onChange={(event) => setUserForm((current) => ({ ...current, fullName: event.target.value }))}
                value={userForm.fullName}
              />
            </label>
          </div>

          <div className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
            <p className="m-0 text-[11px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">Status Akses</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={activeLabel(statusDraft)} />
              <button
                className={tableActionButtonClass(statusDraft ? "danger" : "primary")}
                disabled={busy}
                onClick={() => onStatusChange(!statusDraft)}
                type="button"
              >
                {statusDraft ? "Set nonaktif" : "Set aktif"}
              </button>
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
            <label className="grid gap-2 text-sm font-semibold text-[#111827]">
              Password baru
              <input
                className="min-h-11 rounded-lg border border-[#dbe2ea] bg-white px-3 text-sm text-[#111827]"
                onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Kosongkan jika tidak diganti"
                type="password"
                value={userForm.password}
              />
            </label>
            <button
              className={tableActionButtonClass("secondary")}
              disabled={busy || !userForm.password.trim()}
              onClick={onResetPassword}
              type="button"
            >
              Simpan password saja
            </button>
          </div>

          <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4">
            <label className="flex items-start gap-3 text-sm font-semibold text-[#991b1b]">
              <input checked={userDeleteConfirm} onChange={onToggleDeleteConfirm} type="checkbox" />
              <span>Saya paham penghapusan akun hanya bisa dilakukan jika akun belum dipakai data lain.</span>
            </label>
            <button
              className={cn(tableActionButtonClass("danger"), "mt-4")}
              disabled={busy || !userDeleteConfirm}
              onClick={onDelete}
              type="button"
            >
              Hapus akun
            </button>
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <button className={tableActionButtonClass("secondary")} disabled={busy} onClick={onClose} type="button">
              Batal
            </button>
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0f9d58] px-4 text-sm font-bold text-white disabled:opacity-60"
              disabled={busy}
              onClick={() => void onSave()}
              type="button"
            >
              Simpan perubahan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function UserField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="m-0 mb-1 text-[10px] font-bold uppercase tracking-[0.05em] text-[#6b7280]">
        {label}
      </p>
      <div className="break-words text-base text-[#111827]">{children}</div>
    </div>
  );
}
